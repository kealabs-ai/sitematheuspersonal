-- Migration: adiciona colunas trainer_id, level e gender em workout_templates
-- Execute este script se a tabela já existir sem essas colunas

ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS trainer_id INT NOT NULL DEFAULT 1 AFTER id,
  ADD COLUMN IF NOT EXISTS level      VARCHAR(50) DEFAULT 'Iniciante' AFTER goal,
  ADD COLUMN IF NOT EXISTS gender     ENUM('masculino','feminino') NOT NULL DEFAULT 'masculino' AFTER level;
