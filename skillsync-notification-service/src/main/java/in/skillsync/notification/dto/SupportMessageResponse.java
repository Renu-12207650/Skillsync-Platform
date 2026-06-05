package in.skillsync.notification.dto;

import in.skillsync.notification.entity.SupportMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String subject;
    private String message;
    private SupportMessage.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String adminNote;

    public static SupportMessageResponse from(SupportMessage m) {
        return SupportMessageResponse.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .userEmail(m.getUserEmail())
                .userFullName(m.getUserFullName())
                .subject(m.getSubject())
                .message(m.getMessage())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .resolvedAt(m.getResolvedAt())
                .adminNote(m.getAdminNote())
                .build();
    }
}
