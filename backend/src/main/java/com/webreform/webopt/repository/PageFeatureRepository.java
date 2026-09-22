package com.webreform.webopt.repository;

import com.webreform.webopt.model.PageFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageFeatureRepository extends JpaRepository<PageFeature, Long> {

    Optional<PageFeature> findByPageId(Long pageId);

    boolean existsByPageId(Long pageId);
}
