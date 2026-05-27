package com.project.edlink.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_message_upvotes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"messageId", "userId"})
})
public class ChatMessageUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long messageId;

    private Long userId;

    public ChatMessageUpvote() {
    }

    public ChatMessageUpvote(Long messageId, Long userId) {
        this.messageId = messageId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
