package com.project.edlink.dto;

import java.util.List;

public class SummarizationRequest {
    private List<String> messages;

    public SummarizationRequest() {
    }

    public SummarizationRequest(List<String> messages) {
        this.messages = messages;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }
}
