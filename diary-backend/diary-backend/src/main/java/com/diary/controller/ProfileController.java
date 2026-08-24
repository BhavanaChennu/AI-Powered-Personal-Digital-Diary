package com.diary.controller;

import com.diary.dto.PinRequest;
import com.diary.dto.ProfileDTO;
import com.diary.dto.UpdateUsernameRequest;
import com.diary.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final UserProfileService service;

    public ProfileController(UserProfileService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ProfileDTO> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateUsernameRequest request) {
        try {
            String newToken = service.updateUsername(request.getUsername());
            return ResponseEntity.ok(Map.of("token", newToken, "username", request.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.diary.dto.ChangePasswordRequest request) {
        try {
            service.changePassword(request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/pin")
    public ResponseEntity<Void> setPin(@Valid @RequestBody PinRequest request) {
        service.setPin(request.getPin());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/pin")
    public ResponseEntity<Void> removePin() {
        service.removePin();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pin/verify")
    public ResponseEntity<Map<String, Boolean>> verifyPin(@Valid @RequestBody PinRequest request) {
        boolean valid = service.verifyPin(request.getPin());
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
