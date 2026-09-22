package com.webreform.webopt.repository;

import com.webreform.webopt.model.OptimizationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationRunRepository extends JpaRepository<OptimizationRun, Long> {

    List<OptimizationRun> findAllByOrderByCreatedAtDesc();

    List<OptimizationRun> findByWebsiteIdOrderByCreatedAtDesc(Long websiteId);

    List<OptimizationRun> findByWebsiteIdAndStatus(Long websiteId, String status);

    long countByWebsiteId(Long websiteId);
}
