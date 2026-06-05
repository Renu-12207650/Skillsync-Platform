package in.skillsync.notification.controller;

import in.skillsync.notification.dto.ChatRequest;
import in.skillsync.notification.dto.ChatResponse;
import in.skillsync.notification.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * "Elaichi" — the general AI assistant. Proxies prompts to OpenAI.
 * Base path: /chatbot
 */
@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "Elaichi — general-purpose AI assistant")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final ChatbotService chatbot;

    @PostMapping("/ask")
    @Operation(summary = "Ask Elaichi a question. Returns the model's reply.")
    public ResponseEntity<ChatResponse> ask(@Valid @RequestBody ChatRequest req) {
        return ResponseEntity.ok(chatbot.ask(req));
    }
}
