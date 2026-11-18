package com.lawfirm.app.service;

import com.lawfirm.app.dto.DocumentDto;
import com.lawfirm.app.entity.Client;
import com.lawfirm.app.entity.DocumentRecord;
import com.lawfirm.app.entity.LegalCase;
import com.lawfirm.app.repository.ClientRepository;
import com.lawfirm.app.repository.DocumentRepository;
import com.lawfirm.app.repository.LegalCaseRepository;
import com.lawfirm.app.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final StorageService storageService;
    private final ActivityService activityService;

    public DocumentService(DocumentRepository documentRepository,
                           ClientRepository clientRepository,
                           LegalCaseRepository legalCaseRepository,
                           StorageService storageService,
                           ActivityService activityService) {
        this.documentRepository = documentRepository;
        this.clientRepository = clientRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.storageService = storageService;
        this.activityService = activityService;
    }

    public List<DocumentDto> findAll() {
        return documentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public DocumentRecord findEntityById(Long id) {
        return documentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + id));
    }

    public DocumentDto upload(MultipartFile file, Long clientId, Long caseId, String uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file selected");
        }
        String mimeType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        if (!isAllowedMime(mimeType, file.getOriginalFilename())) {
            throw new IllegalArgumentException("Unsupported document type: " + mimeType);
        }
        Client client = clientRepository.findById(clientId).orElseThrow(() -> new IllegalArgumentException("Client not found"));
        LegalCase legalCase = (caseId != null && caseId > 0)
            ? legalCaseRepository.findById(caseId).orElse(null)
            : null;

        String storedPath = storageService.store(file, "documents");
        DocumentRecord record = new DocumentRecord();
        record.setFileName(file.getOriginalFilename());
        record.setOriginalName(file.getOriginalFilename());
        record.setMimeType(mimeType);
        record.setFileSize(file.getSize());
        record.setStoredPath(storedPath);
        record.setClient(client);
        record.setLegalCase(legalCase);
        record.setUploadedBy(uploadedBy != null && !uploadedBy.isBlank() ? uploadedBy : "admin@lawfirm.com");

        DocumentRecord saved = documentRepository.save(record);
        activityService.log(
            record.getUploadedBy(),
            "Upload Document",
            "Uploaded " + saved.getOriginalName() + " for " + client.getFullName()
        );
        return toDto(saved);
    }

    public Resource loadAsResource(Long id) {
        DocumentRecord document = findEntityById(id);
        Path path = storageService.resolve(document.getStoredPath());
        try {
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalStateException("Could not read document file: " + document.getOriginalName());
            }
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Malformed file path: " + document.getStoredPath(), e);
        }
    }

    public void delete(Long id) {
        DocumentRecord document = findEntityById(id);
        String name = document.getOriginalName();
        storageService.deleteFile(document.getStoredPath());
        documentRepository.delete(document);
        activityService.log("System", "Delete Document", "Deleted document: " + name);
    }

    private boolean isAllowedMime(String mimeType, String filename) {
        if (mimeType == null) return false;
        if (mimeType.equals("application/pdf")
            || mimeType.equals("application/msword")
            || mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            || mimeType.startsWith("image/")
            || mimeType.startsWith("text/")
            || mimeType.equals("application/vnd.ms-excel")
            || mimeType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            || mimeType.equals("application/octet-stream")) {
            return true;
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            return lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx")
                || lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".txt")
                || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg");
        }
        return false;
    }

    private DocumentDto toDto(DocumentRecord record) {
        DocumentDto dto = new DocumentDto();
        dto.setId(record.getId());
        dto.setFileName(record.getFileName());
        dto.setOriginalName(record.getOriginalName());
        dto.setMimeType(record.getMimeType());
        dto.setFileSize(record.getFileSize());
        dto.setUploadedAt(record.getUploadedAt());
        dto.setUploadedBy(record.getUploadedBy());
        dto.setCaseId(record.getLegalCase() != null ? record.getLegalCase().getId() : null);
        dto.setClientId(record.getClient() != null ? record.getClient().getId() : null);
        return dto;
    }
}
