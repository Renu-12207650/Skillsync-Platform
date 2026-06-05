package in.skillsync.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    /** The assistant's reply text. */
    private String reply;

    /** Model name that produced the reply (or "demo" when no API key is configured). */
    private String model;

    /** True when no real LLM was called (graceful fallback). */
    private boolean demoMode;
}
