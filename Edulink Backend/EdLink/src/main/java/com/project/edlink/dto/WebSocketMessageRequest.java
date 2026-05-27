package com.project.edlink.dto;

/**
 * DTO for incoming WebSocket chat messages
 * Used when client sends a message via WebSocket
 */
public class WebSocketMessageRequest {
    
    private Long subjectId;
    private String content;
    private Boolean isDoubt = false;

    public WebSocketMessageRequest() {
    }

    public WebSocketMessageRequest(Long subjectId, String content) {
        this.subjectId = subjectId;
        this.content = content;
        this.isDoubt = false;
    }

    public WebSocketMessageRequest(Long subjectId, String content, Boolean isDoubt) {
        this.subjectId = subjectId;
        this.content = content;
        this.isDoubt = isDoubt;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsDoubt() {
        return isDoubt != null ? isDoubt : false;
    }

    public void setIsDoubt(Boolean isDoubt) {
        this.isDoubt = isDoubt;
    }
}
