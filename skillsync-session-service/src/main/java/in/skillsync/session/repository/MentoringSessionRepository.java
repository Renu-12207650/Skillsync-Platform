package in.skillsync.session.repository;

import in.skillsync.session.entity.MentoringSession;
import in.skillsync.session.entity.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentoringSessionRepository extends JpaRepository<MentoringSession, Long> {

    Page<MentoringSession> findByLearnerId(Long learnerId, Pageable pageable);

    Page<MentoringSession> findByMentorId(Long mentorId, Pageable pageable);

    List<MentoringSession> findByLearnerIdAndStatus(Long learnerId, SessionStatus status);

    List<MentoringSession> findByMentorIdAndStatus(Long mentorId, SessionStatus status);
}
