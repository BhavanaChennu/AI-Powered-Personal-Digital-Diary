package com.diary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateUsernameRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
