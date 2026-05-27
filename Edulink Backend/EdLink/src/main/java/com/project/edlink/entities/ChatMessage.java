package com.project.edlink.entities;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long subjectId;

    private Long senderId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant createdAt;

    private Boolean isDoubt = false;

    private Integer voteCount = 0;

    private Boolean resolved = false;

    public ChatMessage() {
    }

    public ChatMessage(Long id, Long subjectId, Long senderId, String content, Instant createdAt) {
        this.id = id;
        this.subjectId = subjectId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
        this.isDoubt = false;
        this.voteCount = 0;
        this.resolved = false;
    }

    public ChatMessage(Long id, Long subjectId, Long senderId, String content, Instant createdAt, Boolean isDoubt, Integer voteCount, Boolean resolved) {
        this.id = id;
        this.subjectId = subjectId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
        this.isDoubt = isDoubt;
        this.voteCount = voteCount;
        this.resolved = resolved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsDoubt() {
        return isDoubt != null ? isDoubt : false;
    }

    public void setIsDoubt(Boolean isDoubt) {
        this.isDoubt = isDoubt;
    }

    public Integer getVoteCount() {
        return voteCount != null ? voteCount : 0;
    }

    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }

    public Boolean getResolved() {
        return resolved != null ? resolved : false;
    }

    public void setResolved(Boolean resolved) {
        this.resolved = resolved;
    }
}


