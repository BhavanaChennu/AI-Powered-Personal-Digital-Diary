package com.diary.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

// Catches anything not already handled by a controller's own @ExceptionHandler.
// Always logs the full stack trace server-side AND returns the message to the client,
// so "no errors visible" stops being possible - it'll show up in one place or the other.
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAny(Exception ex) {
        log.error("Unhandled exception in request", ex);
        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getClass().getSimpleName());
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Unknown error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
