package com.project.edlink.dto;

public class SendMessageRequest {

    private String content;
    private Boolean isDoubt = false;

    public SendMessageRequest() {
    }

    public SendMessageRequest(String content) {
        this.content = content;
        this.isDoubt = false;
    }

    public SendMessageRequest(String content, Boolean isDoubt) {
        this.content = content;
        this.isDoubt = isDoubt;
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


