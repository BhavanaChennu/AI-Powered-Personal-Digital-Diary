package com.diary.repository;

import com.diary.entity.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
