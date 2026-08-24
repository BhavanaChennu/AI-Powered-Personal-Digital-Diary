package com.diary.controller;

import com.diary.dto.DiaryEntryDTO;
import com.diary.service.DiaryEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/diary")
@CrossOrigin(origins = "http://localhost:3000") // allow the React dev server to call this API
public class DiaryEntryController {

    private final DiaryEntryService service;

    public DiaryEntryController(DiaryEntryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DiaryEntryDTO>> getAllEntries() {
        return ResponseEntity.ok(service.getAllEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryEntryDTO> getEntryById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getEntryById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DiaryEntryDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchEntries(keyword));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<DiaryEntryDTO>> getFavorites() {
        return ResponseEntity.ok(service.getFavorites());
    }

    @GetMapping("/mood/{mood}")
    public ResponseEntity<List<DiaryEntryDTO>> getByMood(@PathVariable String mood) {
        return ResponseEntity.ok(service.getByMood(mood));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<DiaryEntryDTO>> getByTag(@PathVariable String tag) {
        return ResponseEntity.ok(service.getByTag(tag));
    }

    @PostMapping
    public ResponseEntity<DiaryEntryDTO> createEntry(@Valid @RequestBody DiaryEntryDTO dto) {
        DiaryEntryDTO created = service.createEntry(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiaryEntryDTO> updateEntry(@PathVariable Long id, @Valid @RequestBody DiaryEntryDTO dto) {
        return ResponseEntity.ok(service.updateEntry(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        service.deleteEntry(id); // soft delete - moves to trash
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trash")
    public ResponseEntity<List<DiaryEntryDTO>> getTrash() {
        return ResponseEntity.ok(service.getTrash());
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<DiaryEntryDTO> restoreEntry(@PathVariable Long id) {
        return ResponseEntity.ok(service.restoreEntry(id));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDelete(@PathVariable Long id) {
        service.permanentlyDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Basic exception handling: turns a "not found" into a proper 404 instead of a 500 crash
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
