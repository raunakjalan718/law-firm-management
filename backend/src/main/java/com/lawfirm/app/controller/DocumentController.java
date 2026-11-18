package com.lawfirm.app.controller;

import com.lawfirm.app.dto.DocumentDto;
import com.lawfirm.app.entity.DocumentRecord;
import com.lawfirm.app.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> all() {
        return ResponseEntity.ok(documentService.findAll());
    }

    @PostMapping
    public ResponseEntity<DocumentDto> upload(@RequestParam("file") MultipartFile file,
                                              @RequestParam("clientId") Long clientId,
                                              @RequestParam(value = "caseId", required = false) String caseIdStr,
                                              @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {
        Long caseId = null;
        if (caseIdStr != null && !caseIdStr.trim().isEmpty() && !caseIdStr.equals("0") && !caseIdStr.equals("null")) {
            try {
                caseId = Long.parseLong(caseIdStr.trim());
            } catch (NumberFormatException ignored) {}
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.upload(file, clientId, caseId, uploadedBy));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        DocumentRecord document = documentService.findEntityById(id);
        Resource resource = documentService.loadAsResource(id);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(document.getMimeType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getOriginalName() + "\"")
            .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
