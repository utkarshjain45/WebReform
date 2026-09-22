-- V1__initial_schema.sql
-- WebReform Database Schema Initialization

-- 1. Websites table
CREATE TABLE websites (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_websites_base_url UNIQUE (base_url)
);

-- 2. Pages table
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(512),
    content TEXT,
    depth INT DEFAULT 0,
    load_time DOUBLE PRECISION,
    CONSTRAINT fk_pages_website FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE CASCADE,
    CONSTRAINT uk_pages_website_url UNIQUE (website_id, url)
);
CREATE INDEX idx_pages_website_id ON pages (website_id);

-- 3. Page links (directed graph edges)
CREATE TABLE page_links (
    id BIGSERIAL PRIMARY KEY,
    source_page_id BIGINT NOT NULL,
    target_page_id BIGINT NOT NULL,
    CONSTRAINT fk_page_links_source FOREIGN KEY (source_page_id) REFERENCES pages (id) ON DELETE CASCADE,
    CONSTRAINT fk_page_links_target FOREIGN KEY (target_page_id) REFERENCES pages (id) ON DELETE CASCADE,
    CONSTRAINT uk_page_links_source_target UNIQUE (source_page_id, target_page_id)
);
CREATE INDEX idx_page_links_source ON page_links (source_page_id);
CREATE INDEX idx_page_links_target ON page_links (target_page_id);

-- 4. Page features (topological and behavioral attributes)
CREATE TABLE page_features (
    id BIGSERIAL PRIMARY KEY,
    page_id BIGINT NOT NULL UNIQUE,
    access_frequency BIGINT DEFAULT 0,
    unique_visitors BIGINT DEFAULT 0,
    average_duration DOUBLE PRECISION DEFAULT 0.0,
    backlink_count INT DEFAULT 0,
    hub_score DOUBLE PRECISION DEFAULT 0.0,
    authority_score DOUBLE PRECISION DEFAULT 0.0,
    CONSTRAINT fk_page_features_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
);

-- 5. User sessions
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    session_identifier VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user_sessions_website FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE CASCADE
);
CREATE INDEX idx_user_sessions_website ON user_sessions (website_id);
CREATE INDEX idx_user_sessions_identifier ON user_sessions (session_identifier);

-- 6. Navigation events (clickstream trajectories)
CREATE TABLE navigation_events (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    source_page_id BIGINT NOT NULL,
    target_page_id BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration BIGINT DEFAULT 0,
    CONSTRAINT fk_navigation_events_session FOREIGN KEY (session_id) REFERENCES user_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_navigation_events_source FOREIGN KEY (source_page_id) REFERENCES pages (id) ON DELETE CASCADE,
    CONSTRAINT fk_navigation_events_target FOREIGN KEY (target_page_id) REFERENCES pages (id) ON DELETE CASCADE
);
CREATE INDEX idx_navigation_events_session ON navigation_events (session_id);
CREATE INDEX idx_navigation_events_source ON navigation_events (source_page_id);
CREATE INDEX idx_navigation_events_target ON navigation_events (target_page_id);

-- 7. Optimization runs (GWO metadata and telemetry)
CREATE TABLE optimization_runs (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    algorithm VARCHAR(64) NOT NULL DEFAULT 'GWO',
    population_size INT NOT NULL,
    iterations INT NOT NULL,
    initial_fitness DOUBLE PRECISION,
    final_fitness DOUBLE PRECISION,
    execution_time BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_optimization_runs_website FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE CASCADE
);
CREATE INDEX idx_optimization_runs_website ON optimization_runs (website_id);

-- 8. Optimized structures (output navigation hierarchy tree)
CREATE TABLE optimized_structures (
    id BIGSERIAL PRIMARY KEY,
    optimization_run_id BIGINT NOT NULL,
    page_id BIGINT NOT NULL,
    parent_page_id BIGINT,
    position INT DEFAULT 0,
    CONSTRAINT fk_optimized_structures_run FOREIGN KEY (optimization_run_id) REFERENCES optimization_runs (id) ON DELETE CASCADE,
    CONSTRAINT fk_optimized_structures_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
    CONSTRAINT fk_optimized_structures_parent FOREIGN KEY (parent_page_id) REFERENCES pages (id) ON DELETE SET NULL,
    CONSTRAINT uk_optimized_structures_run_page UNIQUE (optimization_run_id, page_id)
);
CREATE INDEX idx_optimized_structures_run ON optimized_structures (optimization_run_id);
