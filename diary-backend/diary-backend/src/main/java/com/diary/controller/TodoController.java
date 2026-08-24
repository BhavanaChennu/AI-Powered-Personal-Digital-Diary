package com.diary.controller;

import com.diary.dto.TodoItemDTO;
import com.diary.service.TodoItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoController {

    private final TodoItemService service;

    public TodoController(TodoItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TodoItemDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<TodoItemDTO> create(@Valid @RequestBody TodoItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoItemDTO> update(@PathVariable Long id, @Valid @RequestBody TodoItemDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoItemDTO> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggle(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
