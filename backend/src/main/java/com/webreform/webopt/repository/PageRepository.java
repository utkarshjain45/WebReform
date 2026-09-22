package com.webreform.webopt.repository;

import com.webreform.webopt.model.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    List<Page> findByWebsiteId(Long websiteId);

    List<Page> findByWebsiteIdOrderByDepthAsc(Long websiteId);

    Optional<Page> findByWebsiteIdAndUrl(Long websiteId, String url);

    long countByWebsiteId(Long websiteId);

    boolean existsByWebsiteIdAndUrl(Long websiteId, String url);
}
