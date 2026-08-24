package com.diary.dto;

import java.util.List;

public class AiDto {

    public static class SummarizeRequest {
        private int days = 30;
        public int getDays() { return days; }
        public void setDays(int days) { this.days = days; }
    }

    public static class TextRequest {
        // Deliberately no @NotBlank here - AiAssistantService.plainAndValidated() gives a
        // friendly "write something first" message. A DTO-level @NotBlank would short-circuit
        // BEFORE that runs, surfacing a raw Spring validation error dump instead.
        private String text;
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class AiTextResponse {
        private String result;
        public AiTextResponse(String result) { this.result = result; }
        public String getResult() { return result; }
    }

    public static class AiListResponse {
        private List<String> results;
        public AiListResponse(List<String> results) { this.results = results; }
        public List<String> getResults() { return results; }
    }
}
