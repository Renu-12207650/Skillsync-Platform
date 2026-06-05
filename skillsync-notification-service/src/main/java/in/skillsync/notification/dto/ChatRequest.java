package in.skillsync.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {

    /** The user's latest question / message. */
    @NotBlank
    @Size(max = 4000)
    private String message;

    /** Optional prior turns (oldest first) so the bot has context. */
    private List<ChatTurn> history;

    @Data
    public static class ChatTurn {
        @NotNull
        private String role; // "user" or "assistant"
        @NotBlank
        @Size(max = 4000)
        private String content;
    }
}
