package com.diary.repository;

import com.diary.entity.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {

    // "Active" = not in the trash. Every normal listing query excludes deleted=true.
    List<DiaryEntry> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    List<DiaryEntry> findByUserIdAndDeletedFalseAndFavoriteTrueOrderByCreatedAtDesc(Long userId);

    List<DiaryEntry> findByUserIdAndDeletedFalseAndMoodIgnoreCaseOrderByCreatedAtDesc(Long userId, String mood);

    List<DiaryEntry> findByUserIdAndDeletedFalseAndTagsContainingIgnoreCaseOrderByCreatedAtDesc(Long userId, String tag);

    List<DiaryEntry> findByUserIdAndDeletedTrueOrderByDeletedAtDesc(Long userId);

    long countByUserIdAndDeletedFalse(Long userId);

    List<DiaryEntry> findByUserIdAndDeletedFalseAndCreatedAtAfterOrderByCreatedAtAsc(Long userId, java.time.LocalDateTime since);

    @Query("SELECT e FROM DiaryEntry e WHERE e.user.id = :userId AND e.deleted = false " +
           "AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(e.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY e.createdAt DESC")
    List<DiaryEntry> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}
