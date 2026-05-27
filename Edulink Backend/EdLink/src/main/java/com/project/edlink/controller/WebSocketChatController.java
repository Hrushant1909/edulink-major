package com.project.edlink.controller;

import com.project.edlink.dto.ChatMessageDto;
import com.project.edlink.dto.PresenceUpdateDto;
import com.project.edlink.dto.PresenceUpdateRequest;
import com.project.edlink.dto.WebSocketMessageRequest;
import com.project.edlink.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket Controller for Real-time Chat
 * 
 * Handles WebSocket messages for chat functionality:
 * - Sending messages in real-time
 * - Broadcasting messages to all participants
 * - Presence updates (online/offline status)
 * 
 * Message Endpoints:
 * - /app/chat.send: Send a chat message
 * - /app/presence.update: Update user presence
 * 
 * Subscription Topics:
 * - /topic/chat.{subjectId}: Receive messages for a subject
 * - /topic/presence.{subjectId}: Receive presence updates for a subject
 */
@Controller
public class WebSocketChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming chat messages via WebSocket
     * 
     * Client sends to: /app/chat.send
     * Message is broadcast to: /topic/chat.{subjectId}
     * 
     * @param request The message request containing subjectId and content
     * @param principal The authenticated user (injected by Spring Security)
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload WebSocketMessageRequest request, Principal principal) {
        // Get the authenticated user's email
        String email = principal.getName();
        
        // Save message to database
        ChatMessageDto messageDto = chatService.sendMessageViaWebSocket(
            email, 
            request.getSubjectId(), 
            request.getContent()
        );
        
        // Broadcast to all subscribers of this subject's chat
        messagingTemplate.convertAndSend(
            "/topic/chat." + request.getSubjectId(), 
            messageDto
        );
    }

    /**
     * Handle presence updates (when user is typing, online, etc.)
     * 
     * Client sends to: /app/presence.update
     * Updates are broadcast to: /topic/presence.{subjectId}
     * 
     * @param request The presence update request containing subjectId
     * @param principal The authenticated user
     */
    @MessageMapping("/presence.update")
    public void updatePresence(@Payload PresenceUpdateRequest request, Principal principal) {
        String email = principal.getName();
        Long subjectId = request.getSubjectId();
        
        // Update presence in database
        chatService.updatePresence(email, subjectId);
        
        // Get updated presence info and broadcast
        PresenceUpdateDto presenceUpdate = chatService.getPresenceUpdate(email, subjectId);
        
        if (presenceUpdate != null) {
            // Broadcast presence update to all subscribers
            messagingTemplate.convertAndSend(
                "/topic/presence." + subjectId, 
                presenceUpdate
            );
        }
    }
}
