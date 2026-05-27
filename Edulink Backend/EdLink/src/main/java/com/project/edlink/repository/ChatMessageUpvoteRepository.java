package com.project.edlink.repository;

import com.project.edlink.entities.ChatMessageUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageUpvoteRepository extends JpaRepository<ChatMessageUpvote, Long> {

    Optional<ChatMessageUpvote> findByMessageIdAndUserId(Long messageId, Long userId);

    boolean existsByMessageIdAndUserId(Long messageId, Long userId);

    void deleteByMessageIdAndUserId(Long messageId, Long userId);

    long countByMessageId(Long messageId);

    @Query("SELECT u.messageId FROM ChatMessageUpvote u WHERE u.userId = :userId AND u.messageId IN :messageIds")
    List<Long> findMessageIdsByUserIdAndMessageIdIn(@Param("userId") Long userId, @Param("messageIds") List<Long> messageIds);
}
