-- ============================================================
-- Migration: workout_templates + workout_cycles
-- Substitui workout_plans por templates reutilizáveis
-- ============================================================

-- Templates de treino (reutilizáveis, sem user_id)
CREATE TABLE IF NOT EXISTS workout_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trainer_id  INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  goal        VARCHAR(100),
  level       VARCHAR(50) DEFAULT 'Iniciante',
  gender      ENUM('masculino','feminino') NOT NULL DEFAULT 'masculino',
  active      TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dias dentro de um template
CREATE TABLE IF NOT EXISTS workout_template_days (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id  INT UNSIGNED NOT NULL,
  day_of_week  VARCHAR(3),              -- SEG, TER, QUA, QUI, SEX, SAB, DOM
  name         VARCHAR(100) NOT NULL,
  duration_min SMALLINT DEFAULT 60,
  is_rest      TINYINT(1) DEFAULT 0,
  sort_order   TINYINT DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

-- Exercícios de um dia de template
-- (reutiliza a tabela exercises existente via day_id → workout_template_days.id)
-- Garante que exercises pode referenciar template_days além de workout_days
ALTER TABLE exercises
  MODIFY COLUMN day_id INT UNSIGNED NOT NULL;

-- Ciclos bimestrais: vincula um aluno a um template num período
CREATE TABLE IF NOT EXISTS workout_cycles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  template_id INT UNSIGNED NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,
  notes       TEXT,
  active      TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

-- View para o endpoint GET /aluno/workouts/plan
-- Retorna o plano ativo do aluno via ciclo → template → dias
CREATE OR REPLACE VIEW v_aluno_workout_plan AS
SELECT
  wc.id          AS cycle_id,
  wc.user_id,
  wt.id          AS template_id,
  wt.name        AS plan_name,
  wc.start_date  AS week_start,
  wtd.id         AS day_id,
  wtd.day_of_week,
  wtd.name       AS day_name,
  wtd.duration_min,
  wtd.is_rest,
  wtd.sort_order,
  (SELECT COUNT(*) FROM exercises e WHERE e.day_id = wtd.id) AS exercises_count
FROM workout_cycles wc
JOIN workout_templates wt ON wt.id = wc.template_id
JOIN workout_template_days wtd ON wtd.template_id = wt.id
WHERE wc.active = 1;
