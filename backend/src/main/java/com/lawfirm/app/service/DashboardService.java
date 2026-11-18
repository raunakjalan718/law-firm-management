package com.lawfirm.app.service;

import com.lawfirm.app.dto.ActivityLogDto;
import com.lawfirm.app.dto.DashboardDto;
import com.lawfirm.app.dto.LegalCaseDto;
import com.lawfirm.app.dto.MonthlyCaseDto;
import com.lawfirm.app.entity.ActivityLog;
import com.lawfirm.app.entity.CaseStatus;
import com.lawfirm.app.entity.LegalCase;
import com.lawfirm.app.repository.ActivityLogRepository;
import com.lawfirm.app.repository.AppointmentRepository;
import com.lawfirm.app.repository.ClientRepository;
import com.lawfirm.app.repository.LawyerRepository;
import com.lawfirm.app.repository.LegalCaseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final ClientRepository clientRepository;
    private final LawyerRepository lawyerRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final AppointmentRepository appointmentRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardService(ClientRepository clientRepository, LawyerRepository lawyerRepository,
                           LegalCaseRepository legalCaseRepository, AppointmentRepository appointmentRepository,
                           ActivityLogRepository activityLogRepository) {
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.appointmentRepository = appointmentRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public DashboardDto buildDashboard() {
        DashboardDto dto = new DashboardDto();
        dto.setTotalClients(clientRepository.count());
        dto.setTotalLawyers(lawyerRepository.count());
        dto.setTotalActiveCases(legalCaseRepository.findByStatus(CaseStatus.ACTIVE).size());
        dto.setTotalClosedCases(legalCaseRepository.findByStatus(CaseStatus.CLOSED).size());
        dto.setUpcomingHearings(legalCaseRepository.findAll().stream()
            .filter(c -> c.getNextHearingDate() != null && c.getNextHearingDate().isAfter(LocalDate.now()))
            .count());
        dto.setTodaysAppointments(appointmentRepository.findAll().stream()
            .filter(a -> a.getDate() != null && a.getDate().equals(LocalDate.now()))
            .count());

        List<LegalCase> recentCases = legalCaseRepository.findAll().stream()
            .sorted((a, b) -> {
                if (a.getFilingDate() == null && b.getFilingDate() == null) return 0;
                if (a.getFilingDate() == null) return 1;
                if (b.getFilingDate() == null) return -1;
                return b.getFilingDate().compareTo(a.getFilingDate());
            })
            .limit(5)
            .collect(Collectors.toList());
        dto.setRecentCases(recentCases.stream().map(this::toCaseDto).collect(Collectors.toList()));

        dto.setRecentActivities(activityLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
            .map(this::toActivityDto)
            .collect(Collectors.toList()));

        Map<String, Long> distribution = new LinkedHashMap<>();
        for (CaseStatus status : CaseStatus.values()) {
            long count = legalCaseRepository.findAll().stream().filter(c -> c.getStatus() == status).count();
            distribution.put(status.name(), count);
        }
        dto.setCaseStatusDistribution(distribution);

        List<MonthlyCaseDto> monthly = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            LocalDate month = LocalDate.now().minusMonths(i);
            long count = legalCaseRepository.findAll().stream()
                .filter(c -> c.getFilingDate() != null &&
                             c.getFilingDate().getMonthValue() == month.getMonthValue() &&
                             c.getFilingDate().getYear() == month.getYear())
                .count();
            MonthlyCaseDto item = new MonthlyCaseDto();
            item.setMonth(month.getMonth().name().substring(0, 3));
            item.setCount(count);
            monthly.add(0, item);
        }
        dto.setMonthlyCaseRegistrations(monthly);
        return dto;
    }

    private LegalCaseDto toCaseDto(LegalCase legalCase) {
        LegalCaseDto dto = new LegalCaseDto();
        dto.setId(legalCase.getId());
        dto.setCaseNumber(legalCase.getCaseNumber());
        dto.setTitle(legalCase.getTitle());
        dto.setCaseType(legalCase.getCaseType());
        dto.setClientName(legalCase.getClient() != null ? legalCase.getClient().getFullName() : null);
        dto.setStatus(legalCase.getStatus() != null ? legalCase.getStatus().name() : "PENDING");
        return dto;
    }

    private ActivityLogDto toActivityDto(ActivityLog activity) {
        ActivityLogDto dto = new ActivityLogDto();
        dto.setId(activity.getId());
        dto.setActor(activity.getActor());
        dto.setAction(activity.getAction());
        dto.setDetails(activity.getDetails());
        dto.setCreatedAt(activity.getCreatedAt());
        return dto;
    }
}
