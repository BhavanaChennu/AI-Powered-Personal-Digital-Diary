package com.diary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GroqService {

    private final RestClient restClient;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String DELIM = "@@@ALT@@@";

    public GroqService(@Value("${app.groq.api-key}") String apiKey,
                        @Value("${app.groq.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String summarizePeriod(String combinedEntryText, String periodLabel) {
        String prompt = "You are a thoughtful, warm assistant helping someone reflect on their personal diary. "
                + "Summarize the following diary entries from " + periodLabel + " in 3-5 sentences. "
                + "Focus on themes, moods, and notable events. Write in second person (\"you\"), "
                + "gently and without judgement. Do not invent details not present in the text.\n\n"
                + "DIARY ENTRIES:\n" + combinedEntryText;
        return callGroq(prompt, 500);
    }

    public String summarizeSingleEntry(String entryText) {
        String prompt = "Summarize this single diary entry in 1-2 short sentences, capturing the key point or feeling. "
                + "Return ONLY the summary, no preamble.\n\nENTRY:\n" + entryText;
        return callGroq(prompt, 150);
    }

    // Returns 3 distinct rewrite options so the user can pick the one they like best.
    public List<String> polish(String draftText) {
        String prompt = "You are a supportive writing assistant for a personal diary. "
                + "Write exactly 3 different improved versions of the following diary entry draft. "
                + "Each version should improve clarity, flow, and grammar WITHOUT changing its meaning, facts, "
                + "or personal voice, and stay in first person. Make the 3 versions genuinely different in style "
                + "(e.g. one more concise, one more descriptive, one closest to the original phrasing). "
                + "Separate the 3 versions with exactly this delimiter on its own line: " + DELIM + "\n"
                + "Return ONLY the 3 versions and the delimiters - no numbering, no preamble, no explanation.\n\n"
                + "DRAFT:\n" + draftText;
        String raw = callGroq(prompt, 900);
        List<String> parts = Arrays.stream(raw.split(DELIM))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        return parts.isEmpty() ? List.of(raw.trim()) : parts;
    }

    public String extend(String draftText) {
        String prompt = "You are a supportive diary writing assistant. Expand the following diary entry with more "
                + "descriptive detail, sensory language, and reflection, while staying true to the events and "
                + "feelings already described - do not invent new events. Keep the same first-person voice. "
                + "Return ONLY the expanded text.\n\nENTRY:\n" + draftText;
        return callGroq(prompt, 700);
    }

    public String shorten(String draftText) {
        String prompt = "You are a supportive diary writing assistant. Make the following diary entry more concise "
                + "while keeping its key events, feelings, and personal voice. Return ONLY the shortened text.\n\n"
                + "ENTRY:\n" + draftText;
        return callGroq(prompt, 400);
    }

    public String smartLayout(String draftText) {
        String prompt = "You are a supportive diary writing assistant. Reorganize the following diary entry into a "
                + "clearer structure using simple HTML: short <h3> headings for distinct topics/moments if there are "
                + "several, and <ul><li> bullet points for lists of events or feelings where that helps readability. "
                + "Keep all original content and meaning - do not add or remove information, just restructure it. "
                + "Return ONLY the restructured HTML (no markdown, no code fences, no explanation).\n\n"
                + "ENTRY:\n" + draftText;
        return callGroq(prompt, 900);
    }

    private String callGroq(String userPrompt, int maxTokens) {
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", userPrompt)),
                "temperature", 0.6,
                "max_tokens", maxTokens
        );

        String response = restClient.post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Could not parse Groq response: " + e.getMessage(), e);
        }
    }
}
