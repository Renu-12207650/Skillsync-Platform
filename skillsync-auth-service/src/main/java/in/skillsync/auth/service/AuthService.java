package in.skillsync.auth.service;

import in.skillsync.auth.dto.AuthResponse;
import in.skillsync.auth.dto.ForgotPasswordRequest;
import in.skillsync.auth.dto.ForgotPasswordResponse;
import in.skillsync.auth.dto.LoginRequest;
import in.skillsync.auth.dto.RegisterRequest;
import in.skillsync.auth.dto.ResetPasswordRequest;
import in.skillsync.auth.dto.VerifyOtpRequest;
import in.skillsync.auth.entity.AuthUser;
import in.skillsync.auth.entity.LoginOtp;
import in.skillsync.auth.entity.PasswordResetToken;
import in.skillsync.auth.repository.AuthUserRepository;
import in.skillsync.auth.repository.LoginOtpRepository;
import in.skillsync.auth.repository.PasswordResetTokenRepository;
import in.skillsync.common.exception.DuplicateEmailException;
import in.skillsync.common.exception.ResourceNotFoundException;
import in.skillsync.common.exception.UnauthorizedActionException;
import in.skillsync.auth.entity.Role;
import in.skillsync.common.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class AuthService {

    private static final int RESET_TOKEN_EXPIRY_MINUTES = 30;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom RNG = new SecureRandom();
    private static final Pattern SIX_DIGIT_CODE = Pattern.compile("^\\d{6}$");

    private final AuthUserRepository authUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LoginOtpRepository loginOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    private final AuthEmailService emailService;

    private final String developerEmail;

    private final String appBaseUrl;

    public AuthService(AuthUserRepository authUserRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       LoginOtpRepository loginOtpRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       @Autowired(required = false) AuthEmailService emailService,
                       @Value("${skillsync.developer-email:renudhankhar8559@gmail.com}") String developerEmail,
                       @Value("${skillsync.app-base-url:http://localhost:8080}") String appBaseUrl) {
        this.authUserRepository = authUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.loginOtpRepository = loginOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.developerEmail = developerEmail == null ? "" : developerEmail.trim().toLowerCase();
        this.appBaseUrl = appBaseUrl == null ? "http://localhost:8080" : appBaseUrl.trim().replaceAll("/+$", "");
    }

    public boolean isDeveloperEmail(String email) {
        return email != null && !developerEmail.isEmpty()
                && developerEmail.equalsIgnoreCase(email.trim());
    }

    public String getUserEmailById(Long userId) {
        return authUserRepository.findById(userId)
                .map(AuthUser::getEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        if (authUserRepository.existsByEmail(email)) {
            throw new DuplicateEmailException(
                    "Email is already registered: " + email);
        }

        Role finalRole;
        if (isDeveloperEmail(email)) {
            finalRole = Role.ROLE_ADMIN;
            log.info("Developer email {} detected — auto-promoting to ROLE_ADMIN", email);
        } else if (request.getRole() == Role.ROLE_ADMIN) {
            throw new UnauthorizedActionException(
                    "Admin accounts cannot be created through public registration. " +
                    "Ask an existing admin to invite you.");
        } else {
            finalRole = request.getRole();
        }

        AuthUser user = AuthUser.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(finalRole)
                .enabled(true)
                .build();

        AuthUser savedUser = authUserRepository.save(user);
        log.info("New user registered: {} with role: {}", savedUser.getEmail(), savedUser.getRole());

        return buildAuthResponse(savedUser);
    }

        /**
         * Admin-only: delete a user account by id.
         * Refuses to delete the configured developer email (super-admin) and
         * refuses self-deletion.
         */
        @Transactional
        public void adminDeleteUser(Long userId, String callerEmail) {
                AuthUser target = authUserRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                if (isDeveloperEmail(target.getEmail())) {
                        throw new UnauthorizedActionException(
                                        "The developer / super-admin account cannot be deleted.");
                }
                if (callerEmail != null && target.getEmail().equalsIgnoreCase(callerEmail.trim())) {
                        throw new UnauthorizedActionException("You cannot delete your own admin account.");
                }
                target.setEnabled(false);
                authUserRepository.save(target);
                log.info("Admin deactivated user {} (id {})", target.getEmail(), userId);
        }

        @Transactional(readOnly = true)
        public List<AuthUser> adminListUsers() {
                return authUserRepository.findAll();
        }

        @Transactional(readOnly = true)
        public AuthUser getUserById(Long userId) {
                return authUserRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        }

    /**
     * Admin-only: create a user with any role (including ROLE_ADMIN).
     * Caller must already be authenticated as an admin (enforced by controller).
     */
    @Transactional
    public AuthResponse adminCreateUser(RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        if (authUserRepository.existsByEmail(email)) {
            throw new DuplicateEmailException(
                    "Email is already registered: " + email);
        }

        AuthUser user = AuthUser.builder()
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        AuthUser saved = authUserRepository.save(user);
        log.info("Admin-created user: {} with role: {}", saved.getEmail(), saved.getRole());
        return buildAuthResponse(saved);
    }

    /**
     * Authenticates user credentials.
     * For ordinary users: returns JWT tokens immediately.
     * For the developer email: validates the password, then generates an
     * email OTP and returns {otpRequired:true} — the client must follow up
     * with /auth/verify-otp to receive the actual tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + request.getEmail()));

        if (isDeveloperEmail(user.getEmail())) {
            issueLoginOtp(user.getEmail());
            log.info("Developer login attempt — OTP sent to {}", user.getEmail());
            return AuthResponse.builder()
                    .otpRequired(true)
                    .email(user.getEmail())
                    .build();
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    private void issueLoginOtp(String email) {
        loginOtpRepository.deleteAllByEmail(email);
        String code = generateSixDigitCode();
        loginOtpRepository.save(LoginOtp.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build());

        String body = String.format(
                "Hi,%n%nYour SkillSync sign-in code is: %s%n%nIt expires in %d minutes. " +
                        "If you didn't try to sign in, ignore this email and consider rotating your password.%n%n" +
                        "— SkillSync%n",
                code, OTP_EXPIRY_MINUTES);

        log.debug("[OTP] Generated code for {} (expires in {} min)", email, OTP_EXPIRY_MINUTES);
        boolean sent = false;
        if (emailService != null) {
            try {
                sent = emailService.sendBlocking(email, "Your SkillSync sign-in code", body);
            } catch (Exception e) {
                log.warn("Exception while sending OTP to {}: {}", email, e.getMessage());
                sent = false;
            }
        } else {
            log.warn("AuthEmailService not available — cannot send OTP via SMTP");
        }

        if (sent) {
            log.info("Developer login OTP emailed to {}", email);
        } else {
            log.info("[OTP] Login code for {} is {} (expires in {} min)", email, code, OTP_EXPIRY_MINUTES);
            log.warn("OTP email delivery failed; developer should check service logs or fix SMTP settings.");
        }
    }

    /**
     * Completes a developer login by checking the OTP and issuing tokens.
     */
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest req) {
        String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();
        LoginOtp otp = loginOtpRepository
                .findFirstByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(email, req.getCode())
                .orElseThrow(() -> new UnauthorizedActionException("Invalid or expired code."));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedActionException("This code has expired. Please log in again.");
        }
        otp.setUsed(true);
        loginOtpRepository.save(otp);

        AuthUser user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));

        log.info("OTP verified for {} — issuing tokens", email);
        return buildAuthResponse(user);
    }

    /**
        * Initiates a password reset flow.
        * Generates a one-time verification code, persists it, and emails the
        * code plus a reset link to the user.
     */
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        AuthUser user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));

        // Invalidate any previous reset tokens for this user.
        passwordResetTokenRepository.deleteAllByUserId(user.getId());

        String token = generateSixDigitCode();
        if (!SIX_DIGIT_CODE.matcher(token).matches()) {
            throw new IllegalStateException("Reset code generator produced an invalid code");
        }
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

                log.info("Password reset code issued for user {}", user.getEmail());

                String body = String.format(
                        "Hi %s,%n%n" +
                                "Use this verification code to reset your SkillSync password. It expires in %d minutes:%n%n" +
                                "    %s%n%n" +
                                "If you didn't request this, you can ignore this email.%n%n" +
                                "— SkillSync%n",
                        user.getFullName() == null ? "there" : user.getFullName(),
                        RESET_TOKEN_EXPIRY_MINUTES,
                    token);

                boolean emailed = false;
                if (emailService != null) {
                    try {
                        emailed = emailService.sendBlocking(user.getEmail(), "Reset your SkillSync password", body);
                    } catch (Exception e) {
                        log.warn("Exception while emailing reset code to {}: {}", user.getEmail(), e.getMessage());
                        emailed = false;
                    }
                } else {
                    log.warn("AuthEmailService not available — reset email could not be sent");
                }

                if (!emailed) {
                    throw new UnauthorizedActionException(
                            "Reset email could not be delivered. Please try again or contact support.");
                }

                return ForgotPasswordResponse.builder()
                        .message("Password reset code sent to " + user.getEmail()
                                + ". It expires in " + RESET_TOKEN_EXPIRY_MINUTES + " minutes.")
                        .build();
    }

    /**
     * Completes a password reset using email + verification code.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String submitted = request.getToken() == null ? "" : request.getToken().trim();
        if (!submitted.contains(":")) {
            throw new UnauthorizedActionException("Please submit email:code to reset your password.");
        }

        String[] parts = submitted.split(":", 2);
        String email = parts[0].trim().toLowerCase();
        String code = parts[1].trim();
        if (!SIX_DIGIT_CODE.matcher(code).matches()) {
            throw new UnauthorizedActionException("Reset code must be exactly 6 digits");
        }

        AuthUser user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        PasswordResetToken token = passwordResetTokenRepository
                .findFirstByUserIdAndTokenAndUsedFalseOrderByCreatedAtDesc(user.getId(), code)
                .orElseThrow(() -> new UnauthorizedActionException(
                        "Invalid or expired reset code"));

        if (token.isUsed()) {
            throw new UnauthorizedActionException("Reset token has already been used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedActionException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        authUserRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        log.info("Password reset completed for user {}", user.getEmail());
    }

    private String generateSixDigitCode() {
        return String.format("%06d", RNG.nextInt(1_000_000));
    }

    /**
     * Builds AuthResponse with access and refresh tokens.
     */
    private AuthResponse buildAuthResponse(AuthUser user) {
        String accessToken  = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
