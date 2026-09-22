-- V2: Add optimization telemetry, convergence history, and parameters to optimization_runs

ALTER TABLE optimization_runs
    ADD COLUMN IF NOT EXISTS random_seed INT,
    ADD COLUMN IF NOT EXISTS max_depth INT,
    ADD COLUMN IF NOT EXISTS max_children INT,
    ADD COLUMN IF NOT EXISTS convergence_history TEXT,
    ADD COLUMN IF NOT EXISTS fitness_breakdown TEXT,
    ADD COLUMN IF NOT EXISTS error_message TEXT;
