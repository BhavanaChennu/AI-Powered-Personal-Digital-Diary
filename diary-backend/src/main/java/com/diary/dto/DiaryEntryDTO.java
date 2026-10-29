package com.diary.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class DiaryEntryDTO {

    private Long id;

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Content cannot be empty")
    private String content;

    private String mood;
    private String tags;
    private boolean favorite;
    private String backgroundTheme;
    private boolean sensitive;
    private LocalDateTime deletedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DiaryEntryDTO() {
    }

    public DiaryEntryDTO(Long id, String title, String content, String mood, String tags,
                          boolean favorite, String backgroundTheme, boolean sensitive, LocalDateTime deletedAt,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.tags = tags;
        this.favorite = favorite;
        this.backgroundTheme = backgroundTheme;
        this.sensitive = sensitive;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }

    public String getBackgroundTheme() { return backgroundTheme; }
    public void setBackgroundTheme(String backgroundTheme) { this.backgroundTheme = backgroundTheme; }

    public boolean isSensitive() { return sensitive; }
    public void setSensitive(boolean sensitive) { this.sensitive = sensitive; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
