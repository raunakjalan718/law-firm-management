package com.lawfirm.app.service;

import com.lawfirm.app.dto.LawyerDto;
import com.lawfirm.app.entity.Lawyer;
import com.lawfirm.app.repository.AppointmentRepository;
import com.lawfirm.app.repository.LawyerRepository;
import com.lawfirm.app.repository.LegalCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LawyerService {
    private final LawyerRepository lawyerRepository;
    private final AppointmentRepository appointmentRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final ActivityService activityService;

    public LawyerService(LawyerRepository lawyerRepository,
                         AppointmentRepository appointmentRepository,
                         LegalCaseRepository legalCaseRepository,
                         ActivityService activityService) {
        this.lawyerRepository = lawyerRepository;
        this.appointmentRepository = appointmentRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.activityService = activityService;
    }

    public List<LawyerDto> findAll() {
        return lawyerRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public LawyerDto save(LawyerDto dto) {
        boolean isNew = (dto.getId() == null);
        Lawyer lawyer = !isNew ? lawyerRepository.findById(dto.getId()).orElse(new Lawyer()) : new Lawyer();
        lawyer.setFullName(dto.getFullName());
        lawyer.setEmail(dto.getEmail());
        lawyer.setPhone(dto.getPhone());
        lawyer.setSpecialization(dto.getSpecialization());
        lawyer.setYearsOfExperience(dto.getYearsOfExperience());
        lawyer.setBarRegistrationNumber(dto.getBarRegistrationNumber());
        lawyer.setAvailabilityStatus(dto.getAvailabilityStatus() != null ? dto.getAvailabilityStatus() : "Available");
        Lawyer saved = lawyerRepository.save(lawyer);
        activityService.log(
            "System",
            isNew ? "Add Lawyer" : "Update Lawyer",
            (isNew ? "Added lawyer: " : "Updated lawyer profile: ") + saved.getFullName() + " (" + saved.getSpecialization() + ")"
        );
        return toDto(saved);
    }

    public LawyerDto findById(Long id) {
        return toDto(lawyerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Lawyer not found")));
    }

    @Transactional
    public void delete(Long id) {
        Lawyer lawyer = lawyerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));
        String name = lawyer.getFullName();

        // Disassociate from legal cases
        legalCaseRepository.findAll().forEach(c -> {
            if (c.getLawyers() != null && c.getLawyers().removeIf(l -> l.getId().equals(id))) {
                legalCaseRepository.save(c);
            }
        });

        // Delete appointments referencing this lawyer
        appointmentRepository.findAll().stream()
            .filter(a -> a.getLawyer() != null && a.getLawyer().getId().equals(id))
            .forEach(appointmentRepository::delete);

        lawyerRepository.delete(lawyer);
        activityService.log("System", "Remove Lawyer", "Removed lawyer: " + name);
    }

    public Lawyer findEntityById(Long id) {
        return lawyerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));
    }

    private LawyerDto toDto(Lawyer lawyer) {
        LawyerDto dto = new LawyerDto();
        dto.setId(lawyer.getId());
        dto.setFullName(lawyer.getFullName());
        dto.setEmail(lawyer.getEmail());
        dto.setPhone(lawyer.getPhone());
        dto.setSpecialization(lawyer.getSpecialization());
        dto.setYearsOfExperience(lawyer.getYearsOfExperience());
        dto.setBarRegistrationNumber(lawyer.getBarRegistrationNumber());
        dto.setAvailabilityStatus(lawyer.getAvailabilityStatus());
        return dto;
    }
}
