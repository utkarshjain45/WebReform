package com.webreform.webopt.repository;

import com.webreform.webopt.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByWebsiteId(Long websiteId);

    Optional<UserSession> findByWebsiteIdAndSessionIdentifier(Long websiteId, String sessionIdentifier);

    long countByWebsiteId(Long websiteId);
}
