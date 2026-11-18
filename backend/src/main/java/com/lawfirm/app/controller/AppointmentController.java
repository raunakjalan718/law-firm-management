package com.lawfirm.app.controller;

import com.lawfirm.app.dto.AppointmentDto;
import com.lawfirm.app.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDto>> all() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> create(@RequestBody AppointmentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDto> update(@PathVariable Long id, @RequestBody AppointmentDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(appointmentService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
