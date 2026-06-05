package in.skillsync.notification.controller;

import in.skillsync.notification.client.AuthClient;
import in.skillsync.notification.dto.ResolveSupportRequest;
import in.skillsync.notification.dto.SupportMessageRequest;
import in.skillsync.notification.dto.SupportMessageResponse;
import in.skillsync.notification.service.SupportMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user-submitted support messages (Nikki bot's "Contact admins" form).
 * Base path: /support
 */
@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Support", description = "User-to-admin help tickets")
@SecurityRequirement(name = "bearerAuth")
public class SupportController {

    private final SupportMessageService service;
    private final AuthClient authClient;

    @PostMapping("/messages")
    @Operation(summary = "Submit a support message (any logged-in user)")
    public ResponseEntity<SupportMessageResponse> submit(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-FullName", required = false) String fullName,
            @Valid @RequestBody SupportMessageRequest req) {

        // X-User-Email isn't always populated by the gateway, fall back to a lookup.
        String resolvedEmail = email;
        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            try {
                resolvedEmail = authClient.getUserEmail(userId);
            } catch (Exception ex) {
                log.warn("Could not resolve email for user {}: {}", userId, ex.getMessage());
            }
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.submit(userId, resolvedEmail, fullName, req));
    }

    @GetMapping("/messages/mine")
    @Operation(summary = "List my own support messages")
    public ResponseEntity<List<SupportMessageResponse>> mine(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.listMine(userId));
    }

    @GetMapping("/messages")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "List all support messages (ROLE_ADMIN only)")
    public ResponseEntity<List<SupportMessageResponse>> all(
            @RequestParam(value = "status", required = false) String status) {
        if ("OPEN".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(service.listOpen());
        }
        return ResponseEntity.ok(service.listAll());
    }

    @PutMapping("/messages/{id}/resolve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Mark a support message as resolved (ROLE_ADMIN only)")
    public ResponseEntity<SupportMessageResponse> resolve(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ResolveSupportRequest req) {
        return ResponseEntity.ok(service.resolve(id, req));
    }
}
