package com.diary.service;

import com.diary.dto.TodoItemDTO;
import com.diary.entity.TodoItem;
import com.diary.entity.User;
import com.diary.repository.TodoItemRepository;
import com.diary.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class TodoItemService {

    private final TodoItemRepository repository;
    private final UserRepository userRepository;

    public TodoItemService(TodoItemRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found: " + username));
    }

    public List<TodoItemDTO> getAll() {
        return repository.findByUserIdOrderByCreatedAtDesc(getCurrentUser().getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TodoItemDTO create(TodoItemDTO dto) {
        TodoItem item = new TodoItem(dto.getText());
        item.setUser(getCurrentUser());
        return toDTO(repository.save(item));
    }

    public TodoItemDTO update(Long id, TodoItemDTO dto) {
        TodoItem item = findOwned(id);
        item.setText(dto.getText());
        item.setCompleted(dto.isCompleted());
        return toDTO(repository.save(item));
    }

    public TodoItemDTO toggle(Long id) {
        TodoItem item = findOwned(id);
        item.setCompleted(!item.isCompleted());
        return toDTO(repository.save(item));
    }

    public void delete(Long id) {
        repository.delete(findOwned(id));
    }

    public long count() {
        return repository.countByUserId(getCurrentUser().getId());
    }

    private TodoItem findOwned(Long id) {
        Long userId = getCurrentUser().getId();
        TodoItem item = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Todo not found with id: " + id));
        if (!item.getUser().getId().equals(userId)) {
            throw new NoSuchElementException("Todo not found with id: " + id);
        }
        return item;
    }

    private TodoItemDTO toDTO(TodoItem item) {
        return new TodoItemDTO(item.getId(), item.getText(), item.isCompleted(), item.getCreatedAt());
    }
}
