package in.skillsync.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Lightweight email helper for the auth service.
 * Used to send login OTP codes for high-privilege accounts and password
 * reset links. Tolerates a missing JavaMailSender (e.g. in tests) by
 * logging the message instead of trying to send it.
 */
@Service
@Slf4j
public class AuthEmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public AuthEmailService(@Autowired(required = false) JavaMailSender mailSender,
                            @Value("${spring.mail.username:noreply@skillsync.local}") String from) {
        this.mailSender = mailSender;
        this.from = from;
        if (mailSender == null) {
            log.warn("JavaMailSender not available — emails will be logged only.");
        } else {
            log.info("AuthEmailService ready. From: {}", from);
        }
    }

    @Async
    public void send(String to, String subject, String body) {
        if (mailSender == null) {
            log.warn("[email-stub] would have sent to={} subject='{}' body='{}'", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Sent email to {} with subject '{}'", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Synchronous send with simple retry semantics. Returns true on success.
     */
    public boolean sendBlocking(String to, String subject, String body) {
        if (mailSender == null) {
            log.warn("[email-stub] blocking-send would have sent to={} subject='{}'", to, subject);
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        int attempts = 0;
        int maxAttempts = 3;
        while (attempts < maxAttempts) {
            try {
                attempts++;
                mailSender.send(message);
                log.info("Sent email to {} with subject '{}' (attempt {})", to, subject, attempts);
                return true;
            } catch (Exception e) {
                log.warn("Attempt {} failed to send email to {}: {}", attempts, to, e.getMessage());
                if (attempts >= maxAttempts) {
                    log.error("All {} attempts failed sending email to {}", maxAttempts, to, e);
                    return false;
                }
                try {
                    Thread.sleep(1000L * attempts);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return false;
    }
}
