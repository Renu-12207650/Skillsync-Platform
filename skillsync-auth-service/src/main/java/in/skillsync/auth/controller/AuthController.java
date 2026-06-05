package in.skillsync.auth.controller;

import in.skillsync.auth.dto.AuthResponse;
import in.skillsync.auth.dto.ForgotPasswordRequest;
import in.skillsync.auth.dto.ForgotPasswordResponse;
import in.skillsync.auth.dto.LoginRequest;
import in.skillsync.auth.dto.RegisterRequest;
import in.skillsync.auth.dto.ResetPasswordRequest;
import in.skillsync.auth.dto.VerifyOtpRequest;
import in.skillsync.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.LinkedHashMap;

/**
 * REST controller for authentication endpoints.
 * All endpoints are open — no JWT required.
 * Base path: /auth
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, Login, Forgot/Reset Password endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account. Role must be ROLE_LEARNER, ROLE_MENTOR, or ROLE_ADMIN"
    )
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(
        summary = "Login and get JWT token",
        description = "Authenticate with email and password. Returns access and refresh tokens, " +
                "OR {otpRequired:true} for high-privilege accounts that need email 2FA."
    )
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify the email OTP and complete a login that returned otpRequired:true")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/forgot-password")
    @Operation(
        summary = "Initiate password reset",
        description = "Generates a one-time 6-digit reset code for the given email and sends it by email."
    )
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(
        summary = "Reset password using code",
        description = "Consumes an email verification code and updates the user's password."
    )
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully"
        ));
    }

    @GetMapping("/internal/email/{userId}")
    @Operation(summary = "Internal: get user email by ID", hidden = true)
    public ResponseEntity<String> getEmailById(@PathVariable Long userId) {
        String email = authService.getUserEmailById(userId);
        return ResponseEntity.ok(email);
    }

    /**
     * Admin-only: create a user with any role (including ROLE_ADMIN).
     * Used by the Admin Console "Invite user" tab. The developer email
     * (renudhankhar8559@gmail.com) is the only ROLE_ADMIN account that can
     * exist initially — all other admins must be invited through here.
     */
    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin: create a user with any role")
    public ResponseEntity<AuthResponse> adminCreate(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.adminCreateUser(request));
    }

    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin: delete a user account")
    public ResponseEntity<Void> adminDelete(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String callerEmail) {
        authService.adminDeleteUser(userId, callerEmail);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin: list all auth users including active/inactive status")
    public ResponseEntity<List<LinkedHashMap<String, Object>>> adminListUsers() {
        List<LinkedHashMap<String, Object>> users = authService.adminListUsers().stream().map(user -> {
            LinkedHashMap<String, Object> row = new LinkedHashMap<>();
            row.put("userId", user.getId());
            row.put("email", user.getEmail());
            row.put("fullName", user.getFullName());
            row.put("role", user.getRole().name());
            row.put("enabled", user.isEnabled());
            return row;
        }).toList();
        return ResponseEntity.ok(users);
    }

    /**
     * Returns whether the calling user is the configured developer / super-admin.
     * Used by the frontend to show the "Developer" badge & invite-user UI.
     */
    @GetMapping("/me/is-developer")
    @Operation(summary = "Whether the caller is the configured developer / super-admin")
    public ResponseEntity<java.util.Map<String, Boolean>> isDeveloper(
            @RequestHeader(value = "X-User-Email", required = false) String email) {
        boolean dev = authService.isDeveloperEmail(email);
        return ResponseEntity.ok(java.util.Map.of("developer", dev));
    }
}
