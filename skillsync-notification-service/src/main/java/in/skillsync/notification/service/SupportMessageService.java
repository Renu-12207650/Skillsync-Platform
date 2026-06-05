package in.skillsync.notification.service;

import in.skillsync.notification.dto.ResolveSupportRequest;
import in.skillsync.notification.dto.SupportMessageRequest;
import in.skillsync.notification.dto.SupportMessageResponse;
import in.skillsync.notification.entity.SupportMessage;
import in.skillsync.notification.repository.SupportMessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class SupportMessageService {

    private final SupportMessageRepository repo;
    private final EmailService emailService;
    private final String adminEmail;

    public SupportMessageService(SupportMessageRepository repo,
                                 EmailService emailService,
                                 @Value("${skillsync.support.admin-email:renudhankhar8559@gmail.com}") String adminEmail) {
        this.repo = repo;
        this.emailService = emailService;
        this.adminEmail = adminEmail;
    }

    @Transactional
    public SupportMessageResponse submit(Long userId, String email, String fullName,
                                         SupportMessageRequest req) {
        SupportMessage saved = repo.save(SupportMessage.builder()
                .userId(userId)
                .userEmail(email != null ? email : "unknown")
                .userFullName(fullName)
                .subject(req.getSubject())
                .message(req.getMessage())
                .status(SupportMessage.Status.OPEN)
                .build());
        log.info("Support message #{} submitted by user {}", saved.getId(), userId);

        // Forward to admin inbox so the team gets a real email, not just a DB row.
        try {
            String emailSubject = "[SkillSync Support] " + saved.getSubject();
            String body = String.format(
                    "A new support ticket was submitted via Nikki.%n%n" +
                    "Ticket #: %d%n" +
                    "From   : %s <%s>%n" +
                    "User ID: %d%n" +
                    "Subject: %s%n" +
                    "Time   : %s%n%n" +
                    "----- Message -----%n%s%n-------------------%n%n" +
                    "Reply to the user directly at %s, or mark the ticket resolved in the Admin Console " +
                    "(Support inbox tab).%n",
                    saved.getId(),
                    saved.getUserFullName() == null ? "Unknown" : saved.getUserFullName(),
                    saved.getUserEmail(),
                    saved.getUserId(),
                    saved.getSubject(),
                    saved.getCreatedAt(),
                    saved.getMessage(),
                    saved.getUserEmail()
            );
            emailService.sendEmail(adminEmail, emailSubject, body);
        } catch (Exception ex) {
            log.warn("Could not email admin about ticket #{}: {}", saved.getId(), ex.getMessage());
        }

        return SupportMessageResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<SupportMessageResponse> listAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(SupportMessageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportMessageResponse> listOpen() {
        return repo.findByStatusOrderByCreatedAtDesc(SupportMessage.Status.OPEN).stream()
                .map(SupportMessageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportMessageResponse> listMine(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(SupportMessageResponse::from)
                .toList();
    }

    @Transactional
    public SupportMessageResponse resolve(Long id, ResolveSupportRequest req) {
        SupportMessage msg = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Support message #" + id + " not found"));
        msg.setStatus(SupportMessage.Status.RESOLVED);
        msg.setResolvedAt(LocalDateTime.now());
        if (req != null && req.getAdminNote() != null) {
            msg.setAdminNote(req.getAdminNote());
        }
        return SupportMessageResponse.from(repo.save(msg));
    }
}
