-- Migration: adiciona coluna level na tabela users
-- Execute este script no banco de dados de produção

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' AFTER goal;
