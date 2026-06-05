package in.skillsync.notification.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResolveSupportRequest {
    @Size(max = 1000)
    private String adminNote;
}
