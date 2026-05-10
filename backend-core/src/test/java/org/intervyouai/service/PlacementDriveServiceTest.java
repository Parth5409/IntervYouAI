package org.intervyouai.service;

import org.intervyouai.dto.event.DriveAssignedEvent;
import org.intervyouai.model.*;
import org.intervyouai.repository.PlacementDriveRepository;
import org.intervyouai.repository.StudentProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlacementDriveServiceTest {

    @Mock
    private PlacementDriveRepository placementDriveRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private org.intervyouai.repository.UserRepository userRepository;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private PlacementDriveService placementDriveService;

    @Test
    public void testAssignDriveToStudents_Success() {
        UUID tpoId = UUID.randomUUID();
        UUID driveId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        Organization org = new Organization();
        org.setId(orgId);

        User tpo = User.builder().id(tpoId).organization(org).build();

        PlacementDrive drive = PlacementDrive.builder()
                .id(driveId)
                .tpo(tpo)
                .companyName("Test Corp")
                .minCgpa(java.math.BigDecimal.valueOf(7.5))
                .build();

        // Student 1: Eligible
        User s1User = User.builder().id(UUID.randomUUID()).organization(org).build();
        StudentProfile s1 = StudentProfile.builder().user(s1User).currentCgpa(java.math.BigDecimal.valueOf(8.0)).build();

        // Student 2: Not Eligible (Low CGPA)
        User s2User = User.builder().id(UUID.randomUUID()).organization(org).build();
        StudentProfile s2 = StudentProfile.builder().user(s2User).currentCgpa(java.math.BigDecimal.valueOf(6.0)).build();

        // Student 3: Different Org (Should be filtered out by logic if repository returned all, 
        // but in unit test we mock the return. Let's assume repo returns same org students)
        
        when(placementDriveRepository.findById(driveId)).thenReturn(Optional.of(drive));
        when(studentProfileRepository.findEligibleStudents(eq(orgId), any(java.math.BigDecimal.class))).thenReturn(List.of(s1));

        placementDriveService.assignDriveToStudents(tpoId, driveId, null);

        // Verify only 1 event published (for s1)
        verify(kafkaProducerService, times(1)).publishDriveAssignedEvent(any(DriveAssignedEvent.class));
        verify(kafkaProducerService).publishDriveAssignedEvent(argThat(event -> 
            event.getStudentId().equals(s1User.getId()) &&
            event.getDriveId().equals(driveId) &&
            event.getCompanyName().equals("Test Corp")
        ));
    }

    @Test
    public void testGetAvailableDrivesForStudent_FiltersByCgpa() {
        UUID studentId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        Organization org = new Organization();
        org.setId(orgId);

        User studentUser = User.builder().id(studentId).organization(org).build();
        // Student has 7.0 CGPA
        StudentProfile profile = StudentProfile.builder()
                .user(studentUser)
                .currentCgpa(java.math.BigDecimal.valueOf(7.0))
                .build();

        // Drive 1: Requires 6.5 (Eligible)
        PlacementDrive d1 = PlacementDrive.builder()
                .id(UUID.randomUUID())
                .minCgpa(java.math.BigDecimal.valueOf(6.5))
                .tpo(User.builder().fullName("TPO 1").build())
                .build();

        // Drive 2: Requires 7.5 (Not Eligible)
        PlacementDrive d2 = PlacementDrive.builder()
                .id(UUID.randomUUID())
                .minCgpa(java.math.BigDecimal.valueOf(7.5))
                .tpo(User.builder().fullName("TPO 2").build())
                .build();

        when(userRepository.findById(studentId)).thenReturn(Optional.of(studentUser));
        when(studentProfileRepository.findByUser(studentUser)).thenReturn(Optional.of(profile));
        when(placementDriveRepository.findEligibleDrives(eq(orgId), any(java.math.BigDecimal.class))).thenReturn(List.of(d1));

        List<org.intervyouai.dto.PlacementDriveResponse> result = placementDriveService.getAvailableDrivesForStudent(studentId);

        // Should only return d1
        assertEquals(1, result.size());
        assertEquals(d1.getId(), result.get(0).getId());
    }

    @Test
    public void testDeleteDrive_Success() {
        UUID tpoId = UUID.randomUUID();
        UUID driveId = UUID.randomUUID();

        User tpo = User.builder().id(tpoId).build();
        PlacementDrive drive = PlacementDrive.builder().id(driveId).tpo(tpo).build();

        when(placementDriveRepository.findById(driveId)).thenReturn(Optional.of(drive));

        placementDriveService.deleteDrive(tpoId, driveId);

        verify(placementDriveRepository, times(1)).save(drive);
        assertEquals(PlacementDrive.DriveStatus.ARCHIVED, drive.getStatus());
    }

    @Test
    public void testDeleteDrive_Unauthorized() {
        UUID tpoId = UUID.randomUUID();
        UUID otherTpoId = UUID.randomUUID();
        UUID driveId = UUID.randomUUID();

        User tpo = User.builder().id(tpoId).build();
        PlacementDrive drive = PlacementDrive.builder().id(driveId).tpo(tpo).build();

        when(placementDriveRepository.findById(driveId)).thenReturn(Optional.of(drive));

        assertThrows(RuntimeException.class, () -> {
            placementDriveService.deleteDrive(otherTpoId, driveId);
        });

        verify(placementDriveRepository, never()).delete(any());
    }

    @Test
    public void testAssignDriveToStudents_Unauthorized() {
        UUID tpoId = UUID.randomUUID();
        UUID otherTpoId = UUID.randomUUID();
        UUID driveId = UUID.randomUUID();

        User tpo = User.builder().id(tpoId).build();
        PlacementDrive drive = PlacementDrive.builder().id(driveId).tpo(tpo).build();

        when(placementDriveRepository.findById(driveId)).thenReturn(Optional.of(drive));

        assertThrows(RuntimeException.class, () -> {
            placementDriveService.assignDriveToStudents(otherTpoId, driveId, null);
        });

        verify(kafkaProducerService, never()).publishDriveAssignedEvent(any());
    }
}
