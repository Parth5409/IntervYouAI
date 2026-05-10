import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Track stopped: ${track.kind}`);
      });
      streamRef.current = null;
    }
    setStream(null);
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    console.log("Attempting to start camera...");
    // If already acquiring or active, don't restart
    if (streamRef.current && streamRef.current.active) {
      console.log("Camera already active and stream is valid.");
      setIsActive(true);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      console.log("Camera stream acquired successfully:", mediaStream.id);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      setError(null);
      setPermissionStatus('granted');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(err.name || "Unknown Error");
      setIsActive(false);
      setStream(null);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  const captureFrame = useCallback((quality = 0.5) => {
    if (!streamRef.current || !isActive) return null;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') return null;

    // We use a temporary canvas to capture the frame
    const canvas = document.createElement('canvas');
    // Set a lower resolution for analysis to save bandwidth
    canvas.width = 320;
    canvas.height = 240;
    
    const ctx = canvas.getContext('2d');
    
    // We need a dummy video element to draw from the stream if we don't have a ref
    const tempVideo = document.createElement('video');
    tempVideo.srcObject = streamRef.current;
    tempVideo.muted = true;
    
    return new Promise((resolve) => {
      tempVideo.onloadedmetadata = () => {
        tempVideo.play();
        // Draw the current frame
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Cleanup temp video
        tempVideo.pause();
        tempVideo.srcObject = null;
        
        resolve(dataUrl);
      };
    });
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { 
    isActive, 
    stream, 
    error, 
    permissionStatus, 
    startCamera, 
    stopCamera, 
    toggleVideo,
    captureFrame
  };
};
