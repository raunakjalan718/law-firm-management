package com.lawfirm.app.service;

import com.lawfirm.app.dto.AppointmentDto;
import com.lawfirm.app.entity.Appointment;
import com.lawfirm.app.entity.AppointmentStatus;
import com.lawfirm.app.entity.Client;
import com.lawfirm.app.entity.Lawyer;
import com.lawfirm.app.entity.LegalCase;
import com.lawfirm.app.repository.AppointmentRepository;
import com.lawfirm.app.repository.ClientRepository;
import com.lawfirm.app.repository.LegalCaseRepository;
import com.lawfirm.app.repository.LawyerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final LawyerRepository lawyerRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final ActivityService activityService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              ClientRepository clientRepository,
                              LawyerRepository lawyerRepository,
                              LegalCaseRepository legalCaseRepository,
                              ActivityService activityService) {
        this.appointmentRepository = appointmentRepository;
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.activityService = activityService;
    }

    public List<AppointmentDto> findAll() {
        return appointmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public AppointmentDto findById(Long id) {
        return toDto(appointmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with id: " + id)));
    }

    public AppointmentDto save(AppointmentDto dto) {
        boolean isNew = (dto.getId() == null);
        Appointment appointment = !isNew ? appointmentRepository.findById(dto.getId()).orElse(new Appointment()) : new Appointment();
        Client client = clientRepository.findById(dto.getClientId()).orElseThrow(() -> new IllegalArgumentException("Client not found"));
        Lawyer lawyer = lawyerRepository.findById(dto.getLawyerId()).orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));
        LegalCase legalCase = (dto.getCaseId() != null && dto.getCaseId() > 0)
            ? legalCaseRepository.findById(dto.getCaseId()).orElse(null)
            : null;

        appointment.setClient(client);
        appointment.setLawyer(lawyer);
        appointment.setLegalCase(legalCase);
        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        appointment.setLocation(dto.getLocation());
        appointment.setAppointmentType(dto.getAppointmentType());
        appointment.setDescription(dto.getDescription());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try {
                appointment.setStatus(AppointmentStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                appointment.setStatus(AppointmentStatus.SCHEDULED);
            }
        }

        Appointment saved = appointmentRepository.save(appointment);
        activityService.log(
            lawyer.getFullName(),
            isNew ? "Create Appointment" : "Update Appointment",
            "Appointment for " + client.getFullName() + " on " + saved.getDate() + " (" + saved.getStatus() + ")"
        );
        return toDto(saved);
    }

    public void delete(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with id: " + id));
        String clientName = appointment.getClient() != null ? appointment.getClient().getFullName() : "Unknown";
        appointmentRepository.delete(appointment);
        activityService.log("System", "Cancel Appointment", "Cancelled appointment for " + clientName);
    }

    private AppointmentDto toDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setClientId(appointment.getClient() != null ? appointment.getClient().getId() : null);
        dto.setClientName(appointment.getClient() != null ? appointment.getClient().getFullName() : null);
        dto.setLawyerId(appointment.getLawyer() != null ? appointment.getLawyer().getId() : null);
        dto.setLawyerName(appointment.getLawyer() != null ? appointment.getLawyer().getFullName() : null);
        dto.setCaseId(appointment.getLegalCase() != null ? appointment.getLegalCase().getId() : null);
        dto.setDate(appointment.getDate());
        dto.setTime(appointment.getTime());
        dto.setLocation(appointment.getLocation());
        dto.setAppointmentType(appointment.getAppointmentType());
        dto.setDescription(appointment.getDescription());
        dto.setStatus(appointment.getStatus() != null ? appointment.getStatus().name() : AppointmentStatus.SCHEDULED.name());
        return dto;
    }
}
