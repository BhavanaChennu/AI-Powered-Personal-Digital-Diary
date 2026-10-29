package com.diary.dto;

public class ProfileDTO {
    private String username;
    private long totalEntries;
    private long totalTodos;
    private long trashCount;
    private boolean pinSet;

    public ProfileDTO(String username, long totalEntries, long totalTodos, long trashCount, boolean pinSet) {
        this.username = username;
        this.totalEntries = totalEntries;
        this.totalTodos = totalTodos;
        this.trashCount = trashCount;
        this.pinSet = pinSet;
    }

    public String getUsername() { return username; }
    public long getTotalEntries() { return totalEntries; }
    public long getTotalTodos() { return totalTodos; }
    public long getTrashCount() { return trashCount; }
    public boolean isPinSet() { return pinSet; }
}
