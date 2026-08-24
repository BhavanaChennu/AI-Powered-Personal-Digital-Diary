package com.diary.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // Only these extensions are accepted - a basic allowlist against arbitrary file uploads.
    private static final String[] ALLOWED_EXT = {
            "png", "jpg", "jpeg", "gif", "webp", "mp4", "webm", "mov"
    };

    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";

        boolean allowed = false;
        for (String a : ALLOWED_EXT) {
            if (a.equals(ext)) { allowed = true; break; }
        }
        if (!allowed) {
            throw new IllegalArgumentException("File type not allowed: ." + ext);
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + "." + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        return "/uploads/" + filename;
    }
}
