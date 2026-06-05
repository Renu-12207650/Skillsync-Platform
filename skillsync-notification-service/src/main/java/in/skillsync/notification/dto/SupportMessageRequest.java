package in.skillsync.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SupportMessageRequest {

    @NotBlank(message = "Subject is required")
    @Size(min = 3, max = 200)
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 5, max = 2000)
    private String message;
}
