package com.project.edlink.controller;

import com.project.edlink.dto.ApiResponse;
import com.project.edlink.dto.SummarizationRequest;
import com.project.edlink.dto.SummarizationResponse;
import com.project.edlink.service.ChatSummarizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/chat")
public class ChatSummarizationController {

    private static final Logger LOGGER = Logger.getLogger(ChatSummarizationController.class.getName());

    @Autowired
    private ChatSummarizationService chatSummarizationService;

    @PostMapping("/subjects/{subjectId}/summary")
    public ResponseEntity<ApiResponse> summarizeSubjectChat(
            @PathVariable Long subjectId,
            @RequestBody(required = false) SummarizationRequest request
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LOGGER.info(() -> "Received chat summary request for subjectId=" + subjectId + ", user=" + email);
        SummarizationResponse response = chatSummarizationService.summarizeSubjectChat(
                email,
                subjectId,
                request != null ? request.getMessages() : null
        );
        return ResponseEntity.ok(new ApiResponse("Chat summary generated", response));
    }
}
