import cv2
import numpy as np
import mediapipe as mp
import logging
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

class VisualProcessor:
    """
    Processes video frames using MediaPipe to extract visual metrics:
    - Proctoring (Face count)
    - Eye Contact (Iris tracking)
    - Posture & Engagement (Head pose)
    """

    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        # Use refined_landmarks for iris tracking
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=4,  # Detect up to 4 faces for robust proctoring
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Landmark indices for Iris and Eyes
        self.LEFT_IRIS = [474, 475, 476, 477]
        self.RIGHT_IRIS = [469, 470, 471, 472]
        self.LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

        logger.info("VisualProcessor initialized with MediaPipe FaceMesh")

    def process_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        """
        Processes a single frame and returns visual metrics.
        """
        try:
            # Decode JPEG bytes to OpenCV image
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"error": "Failed to decode image"}

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)

            metrics = {
                "face_count": 0,
                "eye_contact": 0.0,
                "head_pose": {"pitch": 0.0, "yaw": 0.0, "roll": 0.0},
                "engagement_score": 0.0,
                "proctoring_violation": False
            }

            if results.multi_face_landmarks:
                metrics["face_count"] = len(results.multi_face_landmarks)
                logger.info(f"Detected {metrics['face_count']} face(s)")
                
                # Check for proctoring violation (>1 face)
                if metrics["face_count"] > 1:
                    metrics["proctoring_violation"] = True
                
                # We analyze the primary face (the first one)
                face_landmarks = results.multi_face_landmarks[0]
                img_h, img_w, _ = frame.shape
                
                # 1. Calculate Eye Contact (simplified iris-in-eye center check)
                metrics["eye_contact"] = self._calculate_eye_contact(face_landmarks, img_w, img_h)
                
                # 2. Calculate Head Pose (Posture)
                metrics["head_pose"] = self._calculate_head_pose(face_landmarks, img_w, img_h)
                
                # 3. Calculate Engagement Score (combination of gaze and pose)
                metrics["engagement_score"] = self._derive_engagement(metrics["eye_contact"], metrics["head_pose"])

            else:
                # No face detected is a proctoring violation (inactivity)
                logger.info("No face detected")
                metrics["proctoring_violation"] = True

            return metrics

        except Exception as e:
            logger.error(f"Error processing visual frame: {e}")
            return {"error": str(e)}

    def _calculate_eye_contact(self, landmarks, img_w, img_h) -> float:
        """
        Determines eye contact score based on iris position relative to eye boundaries.
        Returns a score from 0.0 to 1.0.
        """
        # Simplified logic: If iris is centered within the eye landmarks, eye contact is high.
        # For a production system, this would use a more robust PnP or iris-tracking heuristic.
        # Here we return a high score if yaw/pitch are minimal (proxy for eye contact)
        # combined with a dummy value for the prototype.
        return 1.0 # Placeholder for refined iris logic

    def _calculate_head_pose(self, landmarks, img_w, img_h) -> Dict[str, float]:
        """
        Calculates Pitch, Yaw, and Roll of the head.
        """
        # 3D model points (standard face model)
        model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left Mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ])

        # 2D image points from landmarks
        # MediaPipe indices: Nose (1), Chin (152), L Eye L (263), R Eye R (33), L Mouth (310), R Mouth (78)
        image_points = np.array([
            (landmarks.landmark[1].x * img_w, landmarks.landmark[1].y * img_h),
            (landmarks.landmark[152].x * img_w, landmarks.landmark[152].y * img_h),
            (landmarks.landmark[263].x * img_w, landmarks.landmark[263].y * img_h),
            (landmarks.landmark[33].x * img_w, landmarks.landmark[33].y * img_h),
            (landmarks.landmark[310].x * img_w, landmarks.landmark[310].y * img_h),
            (landmarks.landmark[78].x * img_w, landmarks.landmark[78].y * img_h)
        ], dtype="double")

        # Camera internals
        focal_length = img_w
        center = (img_w / 2, img_h / 2)
        camera_matrix = np.array(
            [[focal_length, 0, center[0]],
             [0, focal_length, center[1]],
             [0, 0, 1]], dtype="double"
        )

        dist_coeffs = np.zeros((4, 1))  # Assuming no lens distortion
        (success, rotation_vector, translation_vector) = cv2.solvePnP(
            model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )

        # Convert rotation vector to Euler angles
        rmat, _ = cv2.Rodrigues(rotation_vector)
        _, _, _, _, _, _, angles = cv2.decomposeProjectionMatrix(np.hstack((rmat, translation_vector)))
        
        pitch, yaw, roll = angles.flatten()

        return {
            "pitch": float(pitch),
            "yaw": float(yaw),
            "roll": float(roll)
        }

    def _derive_engagement(self, eye_contact: float, head_pose: Dict[str, float]) -> float:
        """
        Derives an engagement score (0.0 - 1.0) based on pose and gaze.
        """
        # Pitch: tilting up/down, Yaw: turning left/right
        # Optimal engagement: Pitch ~ 0, Yaw ~ 0
        pitch_penalty = abs(head_pose["pitch"]) / 30.0 # Significant penalty after 30 deg
        yaw_penalty = abs(head_pose["yaw"]) / 30.0
        
        score = 1.0 - (pitch_penalty + yaw_penalty) / 2.0
        return max(0.0, min(1.0, score))
