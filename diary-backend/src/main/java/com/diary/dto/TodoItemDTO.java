package com.diary.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class TodoItemDTO {
    private Long id;

    @NotBlank(message = "Todo text cannot be empty")
    private String text;

    private boolean completed;
    private LocalDateTime createdAt;

    public TodoItemDTO() {}

    public TodoItemDTO(Long id, String text, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
