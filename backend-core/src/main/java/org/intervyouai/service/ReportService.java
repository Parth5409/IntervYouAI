package org.intervyouai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.*;
import org.intervyouai.model.InterviewSession;
import org.intervyouai.model.PlacementDrive;
import org.intervyouai.model.StudentProfile;
import org.intervyouai.repository.InterviewSessionRepository;
import org.intervyouai.repository.PlacementDriveRepository;
import org.intervyouai.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public TpoReportResponse getTpoReport(UUID orgId) {
        List<StudentProfile> students = studentProfileRepository.findByUserOrganizationId(orgId);
        List<InterviewSession> allSessions = interviewSessionRepository.findByStudentOrganizationId(orgId);
        List<PlacementDrive> drives = placementDriveRepository.findByTpoOrganizationId(orgId);

        // Group sessions by student user ID
        Map<UUID, List<InterviewSession>> sessionsByStudent = allSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getStudent().getId()));

        // 1. Student Performance Data
        List<StudentPerformanceDTO> performanceData = calculatePerformanceData(students, sessionsByStudent);

        // 2. Drive Analytics Data
        List<DriveAnalyticsDTO> driveData = calculateDriveData(drives);

        // 3. Departmental Data
        List<DepartmentAnalyticsDTO> departmentData = calculateDepartmentData(students, allSessions);

        // 4. System Activity Data
        List<SystemActivityDTO> activityData = calculateActivityData(allSessions, drives);

        // 5. Overall Analytics
        Map<String, Integer> overallAnalytics = calculateOverallAnalytics(allSessions);

        return TpoReportResponse.builder()
                .performanceData(performanceData)
                .driveData(driveData)
                .departmentData(departmentData)
                .activityData(activityData)
                .overallAnalytics(overallAnalytics)
                .build();
    }

    private List<StudentPerformanceDTO> calculatePerformanceData(List<StudentProfile> students, Map<UUID, List<InterviewSession>> sessionsByStudent) {
        List<StudentPerformanceDTO> performanceData = new ArrayList<>();
        for (StudentProfile student : students) {
            List<InterviewSession> studentSessions = sessionsByStudent.getOrDefault(student.getUser().getId(), Collections.emptyList());
            int avgScore = 0;
            int count = 0;
            for (InterviewSession session : studentSessions) {
                if (session.getOverallScore() != null) {
                    avgScore += session.getOverallScore();
                    count++;
                }
            }
            if (count > 0) avgScore /= count;

            performanceData.add(StudentPerformanceDTO.builder()
                    .name(student.getUser().getFullName())
                    .dept(student.getBranch())
                    .score(avgScore)
                    .sessions(count)
                    .status(calculateStatus(avgScore))
                    .build());
        }
        performanceData.sort((a, b) -> b.getScore() - a.getScore());
        return performanceData;
    }

    private List<DriveAnalyticsDTO> calculateDriveData(List<PlacementDrive> drives) {
        return drives.stream().map(drive -> {
            List<InterviewSession> sessions = drive.getInterviewSessions();
            int avgScore = 0;
            if (sessions != null && !sessions.isEmpty()) {
                int count = 0;
                for (InterviewSession s : sessions) {
                    if (s.getOverallScore() != null) {
                        avgScore += s.getOverallScore();
                        count++;
                    }
                }
                if (count > 0) avgScore /= count;
            }

            return DriveAnalyticsDTO.builder()
                    .companyName(drive.getCompanyName())
                    .targetSkills(drive.getSkillsRequired())
                    .totalSessions(sessions != null ? sessions.size() : 0)
                    .averageScore(avgScore)
                    .status(drive.getStatus().name())
                    .build();
        }).collect(Collectors.toList());
    }

    private List<DepartmentAnalyticsDTO> calculateDepartmentData(List<StudentProfile> students, List<InterviewSession> allSessions) {
        Map<String, List<StudentProfile>> studentsByDept = students.stream()
                .filter(s -> s.getBranch() != null)
                .collect(Collectors.groupingBy(StudentProfile::getBranch));

        return studentsByDept.entrySet().stream().map(entry -> {
            String dept = entry.getKey();
            List<StudentProfile> deptStudents = entry.getValue();
            Set<UUID> studentIds = deptStudents.stream().map(s -> s.getUser().getId()).collect(Collectors.toSet());
            
            List<InterviewSession> deptSessions = allSessions.stream()
                    .filter(s -> studentIds.contains(s.getStudent().getId()))
                    .collect(Collectors.toList());

            int avgOverall = 0;
            int avgTech = 0;
            int avgComm = 0;
            int overallCount = 0;
            int techCount = 0;
            int commCount = 0;

            for (InterviewSession s : deptSessions) {
                if (s.getOverallScore() != null) {
                    avgOverall += s.getOverallScore();
                    overallCount++;
                }
                if ("TECHNICAL".equalsIgnoreCase(s.getSessionType()) && s.getOverallScore() != null) {
                    avgTech += s.getOverallScore();
                    techCount++;
                }
                
                // Extract comm score
                try {
                    if (s.getFeedback() != null) {
                        JsonNode feedback = objectMapper.readTree(s.getFeedback());
                        if (feedback.has("communication_score")) {
                            avgComm += feedback.get("communication_score").asInt();
                            commCount++;
                        }
                    }
                } catch (Exception e) {}
            }

            return DepartmentAnalyticsDTO.builder()
                    .branchName(dept)
                    .totalStudents(deptStudents.size())
                    .averageOverallScore(overallCount > 0 ? avgOverall / overallCount : 0)
                    .averageTechnicalScore(techCount > 0 ? avgTech / techCount : 0)
                    .averageCommunicationScore(commCount > 0 ? avgComm / commCount : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<SystemActivityDTO> calculateActivityData(List<InterviewSession> sessions, List<PlacementDrive> drives) {
        List<SystemActivityDTO> activities = new ArrayList<>();
        
        // Session activities
        sessions.stream()
            .sorted(Comparator.comparing(InterviewSession::getCreatedAt).reversed())
            .limit(10)
            .forEach(s -> {
                activities.add(SystemActivityDTO.builder()
                        .id(s.getId().toString())
                        .timestamp(s.getCreatedAt())
                        .eventType("INTERVIEW_COMPLETED")
                        .actorName(s.getStudent().getFullName())
                        .description("Completed " + s.getSessionType() + " interview for " + s.getDrive().getCompanyName())
                        .build());
            });

        // Drive activities
        drives.stream()
            .sorted(Comparator.comparing(PlacementDrive::getCreatedAt).reversed())
            .limit(5)
            .forEach(d -> {
                activities.add(SystemActivityDTO.builder()
                        .id(d.getId().toString())
                        .timestamp(d.getCreatedAt())
                        .eventType("DRIVE_CREATED")
                        .actorName(d.getTpo().getFullName())
                        .description("Initiated new drive for " + d.getCompanyName())
                        .build());
            });

        activities.sort(Comparator.comparing(SystemActivityDTO::getTimestamp).reversed());
        return activities.stream().limit(15).collect(Collectors.toList());
    }

    private Map<String, Integer> calculateOverallAnalytics(List<InterviewSession> allSessions) {
        int totalReadiness = 0;
        int totalVocal = 0;
        int totalTechnical = 0;
        int techCount = 0;
        int commCount = 0;
        int scoreCount = 0;

        for (InterviewSession s : allSessions) {
            if (s.getOverallScore() != null) {
                totalReadiness += s.getOverallScore();
                scoreCount++;

                if ("TECHNICAL".equalsIgnoreCase(s.getSessionType())) {
                    totalTechnical += s.getOverallScore();
                    techCount++;
                }

                try {
                    if (s.getFeedback() != null) {
                        JsonNode feedback = objectMapper.readTree(s.getFeedback());
                        if (feedback.has("communication_score")) {
                            totalVocal += feedback.get("communication_score").asInt();
                            commCount++;
                        }
                    }
                } catch (Exception e) {}
            }
        }

        Map<String, Integer> overallAnalytics = new HashMap<>();
        overallAnalytics.put("readiness", scoreCount > 0 ? totalReadiness / scoreCount : 0);
        overallAnalytics.put("vocal", commCount > 0 ? totalVocal / commCount : (scoreCount > 0 ? totalReadiness / scoreCount : 0));
        overallAnalytics.put("technical", techCount > 0 ? totalTechnical / techCount : 0);
        return overallAnalytics;
    }

    private String calculateStatus(int score) {
        if (score >= 85) return "EXCELLENT";
        if (score >= 70) return "NOMINAL";
        if (score >= 55) return "IMPROVING";
        return "CRITICAL";
    }
}
