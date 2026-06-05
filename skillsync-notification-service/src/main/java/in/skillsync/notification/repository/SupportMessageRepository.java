package in.skillsync.notification.repository;

import in.skillsync.notification.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findAllByOrderByCreatedAtDesc();

    List<SupportMessage> findByStatusOrderByCreatedAtDesc(SupportMessage.Status status);

    List<SupportMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
}
