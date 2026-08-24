package com.diary.service;

import com.diary.dto.ProfileDTO;
import com.diary.entity.User;
import com.diary.repository.UserRepository;
import com.diary.security.JwtUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DiaryEntryService diaryEntryService;
    private final TodoItemService todoItemService;
    private final JwtUtil jwtUtil;

    public UserProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                               DiaryEntryService diaryEntryService, TodoItemService todoItemService,
                               JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.diaryEntryService = diaryEntryService;
        this.todoItemService = todoItemService;
        this.jwtUtil = jwtUtil;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found: " + username));
    }

    public ProfileDTO getProfile() {
        User user = getCurrentUser();
        return new ProfileDTO(
                user.getUsername(),
                diaryEntryService.countActive(),
                todoItemService.count(),
                diaryEntryService.countTrash(),
                user.getPinHash() != null
        );
    }

    public void setPin(String rawPin) {
        User user = getCurrentUser();
        user.setPinHash(passwordEncoder.encode(rawPin));
        userRepository.save(user);
    }

    public void removePin() {
        User user = getCurrentUser();
        user.setPinHash(null);
        userRepository.save(user);
    }

    public boolean verifyPin(String rawPin) {
        User user = getCurrentUser();
        if (user.getPinHash() == null) return true; // no PIN set - nothing to check against
        return passwordEncoder.matches(rawPin, user.getPinHash());
    }

    // Renaming the display name also changes the JWT subject, so we must issue a
    // fresh token - the old one would fail authentication on the very next request.
    public String updateUsername(String newUsername) {
        User user = getCurrentUser();
        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("That name is already taken");
        }
        user.setUsername(newUsername);
        userRepository.save(user);
        return jwtUtil.generateToken(newUsername);
    }

    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
