package com.diary.controller;

import com.diary.dto.AiDto;
import com.diary.service.AiAssistantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiAssistantService aiAssistantService;

    public AiController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/summarize")
    public ResponseEntity<AiDto.AiTextResponse> summarize(@RequestBody AiDto.SummarizeRequest request) {
        return ResponseEntity.ok(new AiDto.AiTextResponse(aiAssistantService.summarizeLastNDays(request.getDays())));
    }

    @PostMapping("/summarize-entry")
    public ResponseEntity<AiDto.AiTextResponse> summarizeEntry(@Valid @RequestBody AiDto.TextRequest request) {
        return ResponseEntity.ok(new AiDto.AiTextResponse(aiAssistantService.summarizeSingleEntry(request.getText())));
    }

    @PostMapping("/polish")
    public ResponseEntity<AiDto.AiListResponse> polish(@Valid @RequestBody AiDto.TextRequest request) {
        return ResponseEntity.ok(new AiDto.AiListResponse(aiAssistantService.polishDraft(request.getText())));
    }

    @PostMapping("/extend")
    public ResponseEntity<AiDto.AiTextResponse> extend(@Valid @RequestBody AiDto.TextRequest request) {
        return ResponseEntity.ok(new AiDto.AiTextResponse(aiAssistantService.extendDraft(request.getText())));
    }

    @PostMapping("/shorten")
    public ResponseEntity<AiDto.AiTextResponse> shorten(@Valid @RequestBody AiDto.TextRequest request) {
        return ResponseEntity.ok(new AiDto.AiTextResponse(aiAssistantService.shortenDraft(request.getText())));
    }

    @PostMapping("/layout")
    public ResponseEntity<AiDto.AiTextResponse> layout(@Valid @RequestBody AiDto.TextRequest request) {
        return ResponseEntity.ok(new AiDto.AiTextResponse(aiAssistantService.smartLayoutDraft(request.getText())));
    }
}
