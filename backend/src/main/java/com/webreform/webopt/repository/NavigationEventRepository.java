package com.webreform.webopt.repository;

import com.webreform.webopt.model.NavigationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavigationEventRepository extends JpaRepository<NavigationEvent, Long> {

    List<NavigationEvent> findBySessionId(Long sessionId);

    List<NavigationEvent> findBySourcePageId(Long sourcePageId);

    List<NavigationEvent> findByTargetPageId(Long targetPageId);
}
