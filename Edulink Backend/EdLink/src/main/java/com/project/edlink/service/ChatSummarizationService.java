package com.project.edlink.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.edlink.dto.SummarizationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class ChatSummarizationService {

    private static final Logger LOGGER = Logger.getLogger(ChatSummarizationService.class.getName());

    private final ChatService chatService;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String pythonSummarizerUrl;

    @Autowired
    public ChatSummarizationService(
            ChatService chatService,
            ObjectMapper objectMapper,
            @Value("${python.summarizer.url:http://localhost:8000/summarize}") String pythonSummarizerUrl
    ) {
        this.chatService = chatService;
        this.objectMapper = objectMapper;
        this.pythonSummarizerUrl = pythonSummarizerUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public SummarizationResponse summarizeSubjectChat(String email, Long subjectId, List<String> clientFallbackMessages) {
        List<String> databaseMessages = chatService.getMessageContentsForSubject(email, subjectId);
        LOGGER.info("Summarization requested for subjectId=" + subjectId + ", dbMessageCount=" + databaseMessages.size());

        List<String> messages = databaseMessages;
        if (databaseMessages.isEmpty() && clientFallbackMessages != null && !clientFallbackMessages.isEmpty()) {
            messages = clientFallbackMessages.stream()
                    .filter(message -> message != null && !message.trim().isEmpty())
                    .map(String::trim)
                    .toList();
            LOGGER.info("DB message lookup returned empty; using client chat fallback messageCount=" + messages.size());
        }

        if (!messages.isEmpty()) {
            LOGGER.info("First message preview: " + truncate(messages.get(0), 120));
        }

        try {
            Map<String, List<String>> payload = Map.of("messages", messages);
            String jsonPayload = objectMapper.writeValueAsString(payload);
            byte[] payloadBytes = jsonPayload.getBytes(StandardCharsets.UTF_8);
            String fallbackPayload = Base64.getEncoder().encodeToString(payloadBytes);
            LOGGER.info("Outgoing Python request URL=" + pythonSummarizerUrl
                    + ", messageCount=" + messages.size()
                    + ", contentLength=" + payloadBytes.length
                    + ", fallbackHeaderLength=" + fallbackPayload.length()
                    + ", payloadPreview=" + truncate(jsonPayload, 500));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(pythonSummarizerUrl))
                    .timeout(Duration.ofSeconds(180))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("X-Edulink-Messages-Base64", fallbackPayload)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(payloadBytes))
                    .build();

            HttpResponse<String> responseEntity = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            LOGGER.info(() -> "Python response status=" + responseEntity.statusCode());
            LOGGER.info(() -> "Python raw response body=" + truncate(responseEntity.body(), 700));

            if (responseEntity.statusCode() < 200 || responseEntity.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Python summarization service rejected the request: " + responseEntity.body()
                );
            }

            SummarizationResponse response = objectMapper.readValue(responseEntity.body(), SummarizationResponse.class);
            logSummaryResponse(response);

            if (response == null || response.getSummary() == null || response.getSummary().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Summarizer returned an empty response");
            }

            return response;
        } catch (JsonProcessingException ex) {
            LOGGER.warning("Failed to serialize/parse summarization JSON: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid summarization service JSON", ex);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            LOGGER.warning("Python summarizer call failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Python summarization service is unavailable", ex);
        }
    }

    private void logSummaryResponse(@Nullable SummarizationResponse response) {
        if (response == null) {
            LOGGER.warning("Python response body was null");
            return;
        }

        int topicCount = response.getTopics() != null ? response.getTopics().size() : 0;
        int insightCount = response.getInsights() != null ? response.getInsights().size() : 0;
        int weakAreaCount = response.getWeakAreas() != null ? response.getWeakAreas().size() : 0;
        LOGGER.info(() -> "Python response summaryPreview=" + truncate(response.getSummary(), 140)
                + ", topics=" + topicCount
                + ", insights=" + insightCount
                + ", weakAreas=" + weakAreaCount);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength) + "...";
    }
}
