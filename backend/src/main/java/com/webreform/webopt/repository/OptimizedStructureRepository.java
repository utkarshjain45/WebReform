package com.webreform.webopt.repository;

import com.webreform.webopt.model.OptimizedStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizedStructureRepository extends JpaRepository<OptimizedStructure, Long> {

    List<OptimizedStructure> findByOptimizationRunIdOrderByPositionAsc(Long optimizationRunId);

    List<OptimizedStructure> findByOptimizationRunIdAndParentPageIdIsNull(Long optimizationRunId);

    List<OptimizedStructure> findByOptimizationRunIdAndParentPageId(Long optimizationRunId, Long parentPageId);
}
