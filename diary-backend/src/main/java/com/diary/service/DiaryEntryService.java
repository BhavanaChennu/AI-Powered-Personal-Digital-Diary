package com.diary.service;

import com.diary.dto.DiaryEntryDTO;
import com.diary.entity.DiaryEntry;
import com.diary.entity.User;
import com.diary.repository.DiaryEntryRepository;
import com.diary.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class DiaryEntryService {

    private final DiaryEntryRepository repository;
    private final UserRepository userRepository;

    public DiaryEntryService(DiaryEntryRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found: " + username));
    }

    public List<DiaryEntryDTO> getAllEntries() {
        Long userId = getCurrentUser().getId();
        return repository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DiaryEntryDTO getEntryById(Long id) {
        return toDTO(findOwnedEntry(id));
    }

    public DiaryEntryDTO createEntry(DiaryEntryDTO dto) {
        User user = getCurrentUser();
        DiaryEntry entry = new DiaryEntry(dto.getTitle(), dto.getContent());
        entry.setMood(dto.getMood());
        entry.setTags(dto.getTags());
        entry.setFavorite(dto.isFavorite());
        entry.setBackgroundTheme(dto.getBackgroundTheme());
        entry.setSensitive(dto.isSensitive());
        entry.setUser(user);
        return toDTO(repository.save(entry));
    }

    public DiaryEntryDTO updateEntry(Long id, DiaryEntryDTO dto) {
        DiaryEntry entry = findOwnedEntry(id);
        entry.setTitle(dto.getTitle());
        entry.setContent(dto.getContent());
        entry.setMood(dto.getMood());
        entry.setTags(dto.getTags());
        entry.setFavorite(dto.isFavorite());
        entry.setBackgroundTheme(dto.getBackgroundTheme());
        entry.setSensitive(dto.isSensitive());
        return toDTO(repository.save(entry));
    }

    // Soft delete: moves the entry to the trash instead of destroying it.
    public void deleteEntry(Long id) {
        DiaryEntry entry = findOwnedEntry(id);
        entry.setDeleted(true);
        entry.setDeletedAt(LocalDateTime.now());
        repository.save(entry);
    }

    public List<DiaryEntryDTO> getTrash() {
        Long userId = getCurrentUser().getId();
        return repository.findByUserIdAndDeletedTrueOrderByDeletedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DiaryEntryDTO restoreEntry(Long id) {
        DiaryEntry entry = findOwnedTrashedEntry(id);
        entry.setDeleted(false);
        entry.setDeletedAt(null);
        return toDTO(repository.save(entry));
    }

    // Permanently removes an entry - only callable on something already in the trash.
    public void permanentlyDelete(Long id) {
        DiaryEntry entry = findOwnedTrashedEntry(id);
        repository.delete(entry);
    }

    public List<DiaryEntryDTO> searchEntries(String keyword) {
        Long userId = getCurrentUser().getId();
        return repository.searchByKeyword(userId, keyword)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DiaryEntryDTO> getFavorites() {
        Long userId = getCurrentUser().getId();
        return repository.findByUserIdAndDeletedFalseAndFavoriteTrueOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DiaryEntryDTO> getByMood(String mood) {
        Long userId = getCurrentUser().getId();
        return repository.findByUserIdAndDeletedFalseAndMoodIgnoreCaseOrderByCreatedAtDesc(userId, mood)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DiaryEntryDTO> getByTag(String tag) {
        Long userId = getCurrentUser().getId();
        return repository.findByUserIdAndDeletedFalseAndTagsContainingIgnoreCaseOrderByCreatedAtDesc(userId, tag)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long countActive() {
        return repository.countByUserIdAndDeletedFalse(getCurrentUser().getId());
    }

    public long countTrash() {
        return repository.findByUserIdAndDeletedTrueOrderByDeletedAtDesc(getCurrentUser().getId()).size();
    }

    private DiaryEntry findOwnedEntry(Long id) {
        Long userId = getCurrentUser().getId();
        DiaryEntry entry = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Diary entry not found with id: " + id));
        if (!entry.getUser().getId().equals(userId) || entry.isDeleted()) {
            throw new NoSuchElementException("Diary entry not found with id: " + id);
        }
        return entry;
    }

    private DiaryEntry findOwnedTrashedEntry(Long id) {
        Long userId = getCurrentUser().getId();
        DiaryEntry entry = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Diary entry not found with id: " + id));
        if (!entry.getUser().getId().equals(userId) || !entry.isDeleted()) {
            throw new NoSuchElementException("Diary entry not found in trash with id: " + id);
        }
        return entry;
    }

    private DiaryEntryDTO toDTO(DiaryEntry entry) {
        return new DiaryEntryDTO(
                entry.getId(),
                entry.getTitle(),
                entry.getContent(),
                entry.getMood(),
                entry.getTags(),
                entry.isFavorite(),
                entry.getBackgroundTheme(),
                entry.isSensitive(),
                entry.getDeletedAt(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
