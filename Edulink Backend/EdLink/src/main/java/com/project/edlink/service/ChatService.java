package com.project.edlink.service;

import com.project.edlink.dto.ChatMessageDto;
import com.project.edlink.dto.ChatParticipantDto;
import com.project.edlink.dto.ChatParticipantsResponse;
import com.project.edlink.dto.PresenceUpdateDto;
import com.project.edlink.entities.ChatMessage;
import com.project.edlink.entities.ChatMessageUpvote;
import com.project.edlink.entities.ChatPresence;
import com.project.edlink.entities.Enrollment;
import com.project.edlink.entities.Subject;
import com.project.edlink.entities.User;
import com.project.edlink.repository.ChatMessageRepository;
import com.project.edlink.repository.ChatMessageUpvoteRepository;
import com.project.edlink.repository.ChatPresenceRepository;
import com.project.edlink.repository.EnrollmentRepository;
import com.project.edlink.repository.SubjectRepository;
import com.project.edlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final long ONLINE_THRESHOLD_SECONDS = 60;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatPresenceRepository chatPresenceRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ChatMessageUpvoteRepository chatMessageUpvoteRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Subject getSubjectOrThrow(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    private boolean isTeacherOfSubject(User user, Subject subject) {
        return "TEACHER".equalsIgnoreCase(user.getRole()) &&
                subject.getTeacherId() != null &&
                subject.getTeacherId().equals(user.getId());
    }

    private boolean isStudentEnrolledInSubject(User user, Long subjectId) {
        if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
            return false;
        }
        return enrollmentRepository.existsByStudentIdAndSubjectId(user.getId(), subjectId);
    }

    private void assertUserCanAccessSubjectChat(User user, Subject subject) {
        boolean teacher = isTeacherOfSubject(user, subject);
        boolean student = isStudentEnrolledInSubject(user, subject.getId());

        if (!teacher && !student) {
            throw new RuntimeException("You do not have access to this subject chat");
        }
    }

    public List<ChatMessageDto> getMessagesForSubject(String email, Long subjectId, Long afterId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        List<ChatMessage> messages;
        if (afterId != null) {
            messages = chatMessageRepository.findBySubjectIdAndIdGreaterThanOrderByIdAsc(subjectId, afterId);
        } else {
            messages = chatMessageRepository.findBySubjectIdOrderByIdAsc(subjectId);
        }

        if (messages.isEmpty()) {
            return new ArrayList<>();
        }

        // Preload all senders for this subject's messages
        List<Long> senderIds = messages.stream()
                .map(ChatMessage::getSenderId)
                .distinct()
                .toList();

        Map<Long, User> userMap = userRepository.findAllById(senderIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Preload all upvoted message IDs by current user in one query
        List<Long> msgIds = messages.stream().map(ChatMessage::getId).toList();
        List<Long> upvotedMessageIds = chatMessageUpvoteRepository.findMessageIdsByUserIdAndMessageIdIn(currentUser.getId(), msgIds);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

        return messages.stream()
                .map(msg -> {
                    User sender = userMap.get(msg.getSenderId());
                    String senderName = sender != null ? sender.getName() : "Unknown";
                    String senderRole = sender != null ? sender.getRole() : "";
                    boolean own = sender != null && sender.getId().equals(currentUser.getId());
                    String createdAt = msg.getCreatedAt() != null ? formatter.format(msg.getCreatedAt()) : null;
                    boolean upvoted = upvotedMessageIds.contains(msg.getId());

                    return new ChatMessageDto(
                            msg.getId(),
                            msg.getSubjectId(),
                            msg.getSenderId(),
                            senderName,
                            senderRole,
                            msg.getContent(),
                            createdAt,
                            own,
                            msg.getIsDoubt(),
                            msg.getVoteCount(),
                            msg.getResolved(),
                            upvoted
                    );
                })
                .collect(Collectors.toList());
    }

    public List<String> getMessageContentsForSubject(String email, Long subjectId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        return chatMessageRepository.findBySubjectIdOrderByIdAsc(subjectId)
                .stream()
                .map(ChatMessage::getContent)
                .filter(content -> content != null && !content.trim().isEmpty())
                .map(String::trim)
                .collect(Collectors.toList());
    }

    private boolean containsDoubtKeywords(String content) {
        if (content == null) return false;
        String lower = content.toLowerCase();
        return lower.contains("doubt") || 
               lower.contains("not understanding") || 
               lower.contains("confusion") || 
               lower.contains("issue") || 
               lower.contains("problem") || 
               lower.contains("help") || 
               lower.contains("error") || 
               lower.contains("explain");
    }

    private ChatMessageDto convertToDto(ChatMessage msg, User currentUser, boolean upvoted) {
        User sender = userRepository.findById(msg.getSenderId()).orElse(null);
        String senderName = sender != null ? sender.getName() : "Unknown";
        String senderRole = sender != null ? sender.getRole() : "";
        boolean own = sender != null && sender.getId().equals(currentUser.getId());
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);
        String createdAt = msg.getCreatedAt() != null ? formatter.format(msg.getCreatedAt()) : null;

        return new ChatMessageDto(
                msg.getId(),
                msg.getSubjectId(),
                msg.getSenderId(),
                senderName,
                senderRole,
                msg.getContent(),
                createdAt,
                own,
                msg.getIsDoubt(),
                msg.getVoteCount(),
                msg.getResolved(),
                upvoted
        );
    }

    public ChatMessageDto sendMessage(String email, Long subjectId, String content, Boolean isDoubtExplicit) {
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        ChatMessage message = new ChatMessage();
        message.setSubjectId(subjectId);
        message.setSenderId(currentUser.getId());
        message.setContent(content.trim());
        message.setCreatedAt(Instant.now());

        // Check auto-detection keywords or explicit UI doubts flag
        boolean isDoubt = containsDoubtKeywords(content) || (isDoubtExplicit != null && isDoubtExplicit);
        message.setIsDoubt(isDoubt);
        message.setVoteCount(0);
        message.setResolved(false);

        ChatMessage saved = chatMessageRepository.save(message);
        return convertToDto(saved, currentUser, false);
    }

    // Retain classic signature for compatibility
    public ChatMessageDto sendMessage(String email, Long subjectId, String content) {
        return sendMessage(email, subjectId, content, false);
    }

    @Transactional
    public ChatMessageDto toggleUpvote(String email, Long messageId) {
        User currentUser = getCurrentUser(email);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Subject subject = getSubjectOrThrow(message.getSubjectId());
        assertUserCanAccessSubjectChat(currentUser, subject);

        Optional<ChatMessageUpvote> existing = chatMessageUpvoteRepository.findByMessageIdAndUserId(messageId, currentUser.getId());
        boolean upvoted;
        if (existing.isPresent()) {
            chatMessageUpvoteRepository.delete(existing.get());
            message.setVoteCount(Math.max(0, message.getVoteCount() - 1));
            upvoted = false;
        } else {
            ChatMessageUpvote upvote = new ChatMessageUpvote(messageId, currentUser.getId());
            chatMessageUpvoteRepository.save(upvote);
            message.setVoteCount(message.getVoteCount() + 1);
            upvoted = true;
        }
        ChatMessage saved = chatMessageRepository.save(message);

        ChatMessageDto dto = convertToDto(saved, currentUser, upvoted);
        
        // Broadcast upvote update live to all subject WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/chat." + saved.getSubjectId(), dto);

        return dto;
    }

    @Transactional
    public ChatMessageDto toggleDoubt(String email, Long messageId) {
        User currentUser = getCurrentUser(email);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Subject subject = getSubjectOrThrow(message.getSubjectId());
        
        // Only teacher of the subject can flag/unflag doubts manually
        if (!isTeacherOfSubject(currentUser, subject)) {
            throw new RuntimeException("Only the teacher of this subject can flag doubts");
        }

        message.setIsDoubt(!message.getIsDoubt());
        if (!message.getIsDoubt()) {
            message.setResolved(false); // Reset resolve state if unflagged
        }
        ChatMessage saved = chatMessageRepository.save(message);

        boolean upvoted = chatMessageUpvoteRepository.existsByMessageIdAndUserId(messageId, currentUser.getId());
        ChatMessageDto dto = convertToDto(saved, currentUser, upvoted);

        messagingTemplate.convertAndSend("/topic/chat." + saved.getSubjectId(), dto);
        return dto;
    }

    @Transactional
    public ChatMessageDto toggleResolve(String email, Long messageId) {
        User currentUser = getCurrentUser(email);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Subject subject = getSubjectOrThrow(message.getSubjectId());
        
        // Only teacher of the subject can resolve doubts
        if (!isTeacherOfSubject(currentUser, subject)) {
            throw new RuntimeException("Only the teacher of this subject can resolve doubts");
        }

        if (!message.getIsDoubt()) {
            throw new RuntimeException("This message is not marked as a doubt");
        }

        message.setResolved(!message.getResolved());
        ChatMessage saved = chatMessageRepository.save(message);

        boolean upvoted = chatMessageUpvoteRepository.existsByMessageIdAndUserId(messageId, currentUser.getId());
        ChatMessageDto dto = convertToDto(saved, currentUser, upvoted);

        messagingTemplate.convertAndSend("/topic/chat." + saved.getSubjectId(), dto);
        return dto;
    }

    public List<ChatMessageDto> getRankedDoubtsForSubject(String email, Long subjectId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        // Fetch all subject doubt messages sorted descending by voteCount
        List<ChatMessage> messages = chatMessageRepository.findBySubjectIdAndIsDoubtTrueOrderByVoteCountDescIdDesc(subjectId);

        if (messages.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> senderIds = messages.stream().map(ChatMessage::getSenderId).distinct().toList();
        Map<Long, User> userMap = userRepository.findAllById(senderIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<Long> msgIds = messages.stream().map(ChatMessage::getId).toList();
        List<Long> upvotedMessageIds = chatMessageUpvoteRepository.findMessageIdsByUserIdAndMessageIdIn(currentUser.getId(), msgIds);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

        return messages.stream()
                .map(msg -> {
                    User sender = userMap.get(msg.getSenderId());
                    String senderName = sender != null ? sender.getName() : "Unknown";
                    String senderRole = sender != null ? sender.getRole() : "";
                    boolean own = sender != null && sender.getId().equals(currentUser.getId());
                    String createdAt = msg.getCreatedAt() != null ? formatter.format(msg.getCreatedAt()) : null;
                    boolean upvoted = upvotedMessageIds.contains(msg.getId());

                    return new ChatMessageDto(
                            msg.getId(),
                            msg.getSubjectId(),
                            msg.getSenderId(),
                            senderName,
                            senderRole,
                            msg.getContent(),
                            createdAt,
                            own,
                            msg.getIsDoubt(),
                            msg.getVoteCount(),
                            msg.getResolved(),
                            upvoted
                    );
                })
                .collect(Collectors.toList());
    }

    public void updatePresence(String email, Long subjectId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        Instant now = Instant.now();
        Optional<ChatPresence> existing = chatPresenceRepository.findBySubjectIdAndUserId(subjectId, currentUser.getId());

        ChatPresence presence = existing.orElseGet(ChatPresence::new);
        presence.setSubjectId(subjectId);
        presence.setUserId(currentUser.getId());
        presence.setLastSeen(now);

        chatPresenceRepository.save(presence);
    }

    public ChatParticipantsResponse getParticipants(String email, Long subjectId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        // All enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findBySubjectId(subjectId);
        List<Long> studentIds = enrollments.stream()
                .map(Enrollment::getStudentId)
                .toList();

        int totalStudents = studentIds.size();

        // Teacher + students
        List<Long> allUserIds = new ArrayList<>(studentIds);
        if (subject.getTeacherId() != null) {
            allUserIds.add(subject.getTeacherId());
        }

        Map<Long, User> userMap = userRepository.findAllById(allUserIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Online presence
        Instant activeAfter = Instant.now().minusSeconds(ONLINE_THRESHOLD_SECONDS);
        List<ChatPresence> activePresence = chatPresenceRepository.findBySubjectIdAndLastSeenAfter(subjectId, activeAfter);
        Map<Long, ChatPresence> presenceMap = activePresence.stream()
                .collect(Collectors.toMap(ChatPresence::getUserId, p -> p));

        List<ChatParticipantDto> participants = new ArrayList<>();
        int onlineStudents = 0;

        for (Long userId : allUserIds) {
            User user = userMap.get(userId);
            if (user == null) {
                continue;
            }
            boolean online = presenceMap.containsKey(userId);

            if ("STUDENT".equalsIgnoreCase(user.getRole()) && online) {
                onlineStudents++;
            }

            participants.add(new ChatParticipantDto(
                    user.getId(),
                    user.getName(),
                    user.getRole(),
                    online
            ));
        }

        return new ChatParticipantsResponse(totalStudents, onlineStudents, participants);
    }

    public ChatMessageDto sendMessageViaWebSocket(String email, Long subjectId, String content, Boolean isDoubtExplicit) {
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        ChatMessage message = new ChatMessage();
        message.setSubjectId(subjectId);
        message.setSenderId(currentUser.getId());
        message.setContent(content.trim());
        message.setCreatedAt(Instant.now());

        // Scan doubt triggers
        boolean isDoubt = containsDoubtKeywords(content) || (isDoubtExplicit != null && isDoubtExplicit);
        message.setIsDoubt(isDoubt);
        message.setVoteCount(0);
        message.setResolved(false);

        ChatMessage saved = chatMessageRepository.save(message);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);
        String createdAt = saved.getCreatedAt() != null ? formatter.format(saved.getCreatedAt()) : null;

        return new ChatMessageDto(
                saved.getId(),
                saved.getSubjectId(),
                saved.getSenderId(),
                currentUser.getName(),
                currentUser.getRole(),
                saved.getContent(),
                createdAt,
                false, // Set by client session
                saved.getIsDoubt(),
                saved.getVoteCount(),
                saved.getResolved(),
                false
        );
    }

    // Classic socket signature
    public ChatMessageDto sendMessageViaWebSocket(String email, Long subjectId, String content) {
        return sendMessageViaWebSocket(email, subjectId, content, false);
    }

    public PresenceUpdateDto getPresenceUpdate(String email, Long subjectId) {
        User currentUser = getCurrentUser(email);
        Subject subject = getSubjectOrThrow(subjectId);
        assertUserCanAccessSubjectChat(currentUser, subject);

        Instant activeAfter = Instant.now().minusSeconds(ONLINE_THRESHOLD_SECONDS);
        Optional<ChatPresence> presence = chatPresenceRepository.findBySubjectIdAndUserId(subjectId, currentUser.getId());
        
        boolean isOnline = presence.isPresent() && 
                          presence.get().getLastSeen() != null && 
                          presence.get().getLastSeen().isAfter(activeAfter);

        return new PresenceUpdateDto(
                currentUser.getId(),
                subjectId,
                currentUser.getName(),
                currentUser.getRole(),
                isOnline
        );
    }
}


