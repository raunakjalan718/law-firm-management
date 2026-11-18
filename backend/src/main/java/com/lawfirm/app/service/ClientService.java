package com.lawfirm.app.service;

import com.lawfirm.app.dto.ClientDto;
import com.lawfirm.app.entity.Client;
import com.lawfirm.app.repository.AppointmentRepository;
import com.lawfirm.app.repository.ClientRepository;
import com.lawfirm.app.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DocumentRepository documentRepository;
    private final ActivityService activityService;

    public ClientService(ClientRepository clientRepository,
                         AppointmentRepository appointmentRepository,
                         DocumentRepository documentRepository,
                         ActivityService activityService) {
        this.clientRepository = clientRepository;
        this.appointmentRepository = appointmentRepository;
        this.documentRepository = documentRepository;
        this.activityService = activityService;
    }

    public List<ClientDto> findAll() {
        return clientRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ClientDto save(ClientDto dto) {
        boolean isNew = (dto.getId() == null);
        Client client = !isNew ? clientRepository.findById(dto.getId()).orElse(new Client()) : new Client();
        client.setFullName(dto.getFullName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setAddress(dto.getAddress());
        client.setClientType(dto.getClientType());
        client.setNotes(dto.getNotes() != null ? dto.getNotes() : "");
        if (dto.getDateOfRegistration() != null) {
            client.setDateOfRegistration(dto.getDateOfRegistration());
        }
        Client saved = clientRepository.save(client);
        activityService.log(
            "System",
            isNew ? "Register Client" : "Update Client",
            (isNew ? "Registered new client: " : "Updated client: ") + saved.getFullName()
        );
        return toDto(saved);
    }

    public ClientDto findById(Long id) {
        return toDto(clientRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Client not found")));
    }

    @Transactional
    public void delete(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Client not found"));
        String name = client.getFullName();
        // Remove referencing appointments and documents
        appointmentRepository.findAll().stream()
            .filter(a -> a.getClient() != null && a.getClient().getId().equals(id))
            .forEach(appointmentRepository::delete);
        documentRepository.findAll().stream()
            .filter(d -> d.getClient() != null && d.getClient().getId().equals(id))
            .forEach(documentRepository::delete);
        clientRepository.delete(client);
        activityService.log("System", "Delete Client", "Deleted client: " + name);
    }

    private ClientDto toDto(Client client) {
        ClientDto dto = new ClientDto();
        dto.setId(client.getId());
        dto.setFullName(client.getFullName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setAddress(client.getAddress());
        dto.setDateOfRegistration(client.getDateOfRegistration());
        dto.setClientType(client.getClientType());
        dto.setNotes(client.getNotes());
        return dto;
    }
}
