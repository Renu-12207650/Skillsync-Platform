package in.skillsync.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * A message submitted by an end-user from the in-app helper bot ("Nikki").
 * Admins read these from /support/messages to triage user issues.
 */
@Entity
@Table(name = "support_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String userEmail;

    @Column(length = 200)
    private String userFullName;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @Column(length = 1000)
    private String adminNote;

    public enum Status {
        OPEN,
        RESOLVED
    }
}
