package com.project.edlink.dto;

public class ChatMessageDto {

    private Long id;
    private Long subjectId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private String createdAt;
    private boolean own;
    private Boolean isDoubt = false;
    private Integer voteCount = 0;
    private Boolean resolved = false;
    private boolean upvoted = false;

    public ChatMessageDto() {
    }

    public ChatMessageDto(Long id, Long subjectId, Long senderId, String senderName, String senderRole,
                          String content, String createdAt, boolean own) {
        this.id = id;
        this.subjectId = subjectId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.content = content;
        this.createdAt = createdAt;
        this.own = own;
        this.isDoubt = false;
        this.voteCount = 0;
        this.resolved = false;
        this.upvoted = false;
    }

    public ChatMessageDto(Long id, Long subjectId, Long senderId, String senderName, String senderRole,
                          String content, String createdAt, boolean own, Boolean isDoubt, Integer voteCount, Boolean resolved, boolean upvoted) {
        this.id = id;
        this.subjectId = subjectId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.content = content;
        this.createdAt = createdAt;
        this.own = own;
        this.isDoubt = isDoubt;
        this.voteCount = voteCount;
        this.resolved = resolved;
        this.upvoted = upvoted;
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

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isOwn() {
        return own;
    }

    public void setOwn(boolean own) {
        this.own = own;
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

    public boolean isUpvoted() {
        return upvoted;
    }

    public void setUpvoted(boolean upvoted) {
        this.upvoted = upvoted;
    }
}


