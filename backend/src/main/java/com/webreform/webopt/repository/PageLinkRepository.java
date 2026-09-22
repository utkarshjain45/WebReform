package com.webreform.webopt.repository;

import com.webreform.webopt.model.PageLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageLinkRepository extends JpaRepository<PageLink, Long> {

    List<PageLink> findBySourcePageId(Long sourcePageId);

    List<PageLink> findByTargetPageId(Long targetPageId);

    boolean existsBySourcePageIdAndTargetPageId(Long sourcePageId, Long targetPageId);

    void deleteBySourcePageIdOrTargetPageId(Long sourcePageId, Long targetPageId);

    @org.springframework.data.jpa.repository.Query("SELECT pl FROM PageLink pl WHERE pl.sourcePage.website.id = :websiteId")
    List<PageLink> findAllByWebsiteId(@org.springframework.data.repository.query.Param("websiteId") Long websiteId);
}
