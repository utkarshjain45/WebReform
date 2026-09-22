package com.webreform.webopt.repository;

import com.webreform.webopt.model.Website;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebsiteRepository extends JpaRepository<Website, Long> {

    Optional<Website> findByBaseUrl(String baseUrl);

    boolean existsByBaseUrl(String baseUrl);

    List<Website> findByNameContainingIgnoreCase(String name);

    @Query("SELECT w FROM Website w LEFT JOIN FETCH w.pages WHERE w.id = :id")
    Optional<Website> findByIdWithPages(@Param("id") Long id);
}
