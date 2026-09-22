-- V3: Research Experiment System Schema

CREATE TABLE experiments (
    id BIGSERIAL PRIMARY KEY,
    suite_type VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    summary_metrics TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_experiments_website FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE SET NULL
);
CREATE INDEX idx_experiments_suite_type ON experiments (suite_type);
CREATE INDEX idx_experiments_status ON experiments (status);

CREATE TABLE experiment_runs (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT NOT NULL,
    run_label VARCHAR(128) NOT NULL,
    param_name VARCHAR(64) NOT NULL,
    param_value DOUBLE PRECISION NOT NULL,
    population_size INT NOT NULL,
    iterations INT NOT NULL,
    random_seed INT NOT NULL,
    num_pages INT NOT NULL,
    initial_fitness DOUBLE PRECISION,
    final_fitness DOUBLE PRECISION,
    improvement_percentage DOUBLE PRECISION,
    execution_time_ms BIGINT,
    avg_depth DOUBLE PRECISION,
    max_depth INT,
    convergence_history TEXT,
    fitness_breakdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_experiment_runs_experiment FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
);
CREATE INDEX idx_experiment_runs_experiment_id ON experiment_runs (experiment_id);
CREATE INDEX idx_experiment_runs_param_value ON experiment_runs (param_value);
