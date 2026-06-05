package in.skillsync.auth.repository;

import in.skillsync.auth.entity.LoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {

    Optional<LoginOtp> findFirstByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(String email, String code);

    @Modifying
    @Query("DELETE FROM LoginOtp o WHERE o.email = :email")
    void deleteAllByEmail(@Param("email") String email);
}
