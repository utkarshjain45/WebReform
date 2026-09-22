package com.webreform.webopt.repository;

import com.webreform.webopt.model.ExperimentRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentRunRepository extends JpaRepository<ExperimentRun, Long> {

    List<ExperimentRun> findByExperimentIdOrderByParamValueAsc(Long experimentId);

    List<ExperimentRun> findByExperimentIdOrderByIdAsc(Long experimentId);
}
