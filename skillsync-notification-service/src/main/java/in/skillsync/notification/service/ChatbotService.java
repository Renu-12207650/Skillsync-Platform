package in.skillsync.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.skillsync.notification.dto.ChatRequest;
import in.skillsync.notification.dto.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Elaichi - the general-purpose AI assistant.
 * Proxies prompts to OpenAI's chat completions API. Falls back to a hand-written
 * "demo mode" reply when no OPENAI_API_KEY is configured, so the UI keeps working.
 */
@Service
@Slf4j
public class ChatbotService {

    private static final String SYSTEM_PROMPT = """
            You are Elaichi, the friendly AI assistant inside the SkillSync mentor-learner platform.
            You help learners with: career advice, interview preparation (especially DSA, system design,
            and behavioural rounds), choosing what to learn next, picking a mentor, and general technical
            questions across software engineering, data, ML, mobile, devops and product.
            Be warm, concise, and concrete. Prefer short paragraphs and small numbered lists over long prose.
            Refuse politely if asked about: another organisation's private/confidential information,
            anyone's personal data, illegal activity, or anything outside general learning/career topics.
            If asked about SkillSync app navigation, tell them to ask "Nikki" instead.
            """;

    private final String apiKey;
    private final String model;
    private final String chatUrl;
    private final RestTemplate http = new RestTemplate();
    private final ObjectMapper json = new ObjectMapper();

    public ChatbotService(
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:llama-3.3-70b-versatile}") String model,
            @Value("${openai.base-url:https://api.groq.com/openai/v1}") String baseUrl) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        // Tolerate trailing slashes / accidental "/chat/completions" suffix on the base URL.
        String cleaned = baseUrl == null ? "" : baseUrl.trim().replaceAll("/+$", "");
        if (cleaned.endsWith("/chat/completions")) {
            cleaned = cleaned.substring(0, cleaned.length() - "/chat/completions".length());
        }
        this.chatUrl = cleaned + "/chat/completions";
        if (this.apiKey.isEmpty()) {
            log.warn("Elaichi: no API key set - running in DEMO mode.");
        } else {
            log.info("Elaichi configured: model={}, endpoint={}", model, this.chatUrl);
        }
    }

    public ChatResponse ask(ChatRequest request) {
        if (apiKey.isEmpty()) {
            return demoReply(request);
        }
        try {
            return callLlm(request);
        } catch (RestClientException ex) {
            log.error("LLM call failed, falling back to demo reply", ex);
            ChatResponse fallback = demoReply(request);
            fallback.setReply(
                    "I had trouble reaching my brain. Here's a basic answer instead:\n\n"
                            + fallback.getReply());
            return fallback;
        }
    }

    private ChatResponse callLlm(ChatRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        if (request.getHistory() != null) {
            for (ChatRequest.ChatTurn t : request.getHistory()) {
                if (t.getRole() == null || t.getContent() == null) continue;
                String role = t.getRole().equalsIgnoreCase("assistant") ? "assistant" : "user";
                messages.add(Map.of("role", role, "content", t.getContent()));
            }
        }
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.5);
        body.put("max_tokens", 700);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<String> raw = http.postForEntity(chatUrl, req, String.class);

        try {
            JsonNode root = json.readTree(raw.getBody());
            String content = root.path("choices").path(0).path("message").path("content").asText();
            String usedModel = root.path("model").asText(model);
            return ChatResponse.builder()
                    .reply(content == null || content.isBlank()
                            ? "I'm here, but I didn't get a useful response. Try asking again." : content)
                    .model(usedModel)
                    .demoMode(false)
                    .build();
        } catch (Exception parseEx) {
            log.error("Could not parse LLM response", parseEx);
            throw new RestClientException("Bad response from LLM", parseEx);
        }
    }

    /** Hand-crafted reply used when OPENAI_API_KEY isn't set. Keeps the UI usable. */
    private ChatResponse demoReply(ChatRequest request) {
        String q = request.getMessage() == null ? "" : request.getMessage().toLowerCase();
        String reply;
        if (q.contains("interview") || q.contains("dsa") || q.contains("algorithm")) {
            reply = """
                    Interview prep, in 4 lines:
                    1. Pick one DSA pattern a week (sliding window, two pointers, BFS/DFS, DP, heap).
                    2. Solve 5–7 problems per pattern on LeetCode, write up the *idea* in your own words.
                    3. Once a week do a mock under timer — out loud, no IDE help.
                    4. For system design: pick one classic (URL shortener, news feed, chat) and re-design it from scratch every weekend.
                    """;
        } else if (q.contains("system design") || q.contains("scal")) {
            reply = """
                    System design starter loop:
                    1. Clarify functional + non-functional requirements (read/write QPS, latency, durability).
                    2. Sketch APIs and data model first.
                    3. Pick storage based on access patterns, not on what's trendy.
                    4. Add caching, queues, sharding only when a number forces you to.
                    Pair this with the "Designing Data-Intensive Applications" book — best $40 you'll spend.
                    """;
        } else if (q.contains("mentor") || q.contains("which mentor")) {
            reply = """
                    Picking a mentor on SkillSync:
                    - Open "Find mentors" and filter by the skill you want to grow in next 90 days.
                    - Skim 3–4 profiles, look for someone who has *shipped* in that area, not just studied it.
                    - Book one short intro session before committing to a longer engagement.
                    Tip: pick someone 2–4 years ahead of you, not 15. Closer mentors give more actionable advice.
                    """;
        } else if (q.contains("learn") || q.contains("roadmap") || q.contains("path")) {
            reply = """
                    Learning roadmap, the no-bs version:
                    1. Pick ONE skill. Resist the urge to stack three.
                    2. Build something tiny end-to-end in week 1 — even if it's ugly.
                    3. Read the official docs, not blog posts, until you've shipped twice.
                    4. Teach what you learned each Friday (a tweet, a Loom, anything).
                    Repeat for 12 weeks before switching topics.
                    """;
        } else {
            reply = "I'm running in demo mode right now (no OpenAI key configured), so my answers are limited. "
                    + "Try asking me about interview prep, system design, picking a mentor, or building a learning roadmap. "
                    + "Once an admin sets OPENAI_API_KEY in the backend, I'll be able to answer anything.";
        }
        return ChatResponse.builder().reply(reply).model("demo").demoMode(true).build();
    }
}
