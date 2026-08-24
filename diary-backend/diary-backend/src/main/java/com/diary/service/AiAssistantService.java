package com.diary.service;

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
public class AiAssistantService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final UserRepository userRepository;
    private final GroqService groqService;

    public AiAssistantService(DiaryEntryRepository diaryEntryRepository, UserRepository userRepository,
                               GroqService groqService) {
        this.diaryEntryRepository = diaryEntryRepository;
        this.userRepository = userRepository;
        this.groqService = groqService;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found: " + username));
        return user.getId();
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", " ").replaceAll("&nbsp;", " ").replaceAll("\\s+", " ").trim();
    }

    private String capped(String text, int max) {
        return text.length() > max ? text.substring(0, max) : text;
    }

    public String summarizeLastNDays(int days) {
        Long userId = getCurrentUserId();
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<DiaryEntry> entries = diaryEntryRepository
                .findByUserIdAndDeletedFalseAndCreatedAtAfterOrderByCreatedAtAsc(userId, since);

        if (entries.isEmpty()) {
            return "No entries found in that period to summarize.";
        }

        String combined = entries.stream()
                .map(e -> "[" + e.getCreatedAt().toLocalDate() + "] " + e.getTitle() + ": " + stripHtml(e.getContent()))
                .collect(Collectors.joining("\n\n"));
        combined = capped(combined, 12000);

        String periodLabel = days <= 1 ? "the last day" : days <= 7 ? "the last week" : days <= 31 ? "the last month" : "the last " + days + " days";
        return groqService.summarizePeriod(combined, periodLabel);
    }

    private String plainAndValidated(String html) {
        String plain = stripHtml(html);
        if (plain.isBlank()) {
            throw new IllegalArgumentException("Nothing to work with - write something first.");
        }
        return capped(plain, 6000);
    }

    public List<String> polishDraft(String draftHtml) {
        return groqService.polish(plainAndValidated(draftHtml));
    }

    public String extendDraft(String draftHtml) {
        return groqService.extend(plainAndValidated(draftHtml));
    }

    public String shortenDraft(String draftHtml) {
        return groqService.shorten(plainAndValidated(draftHtml));
    }

    public String smartLayoutDraft(String draftHtml) {
        return groqService.smartLayout(plainAndValidated(draftHtml));
    }

    public String summarizeSingleEntry(String draftHtml) {
        return groqService.summarizeSingleEntry(plainAndValidated(draftHtml));
    }
}
