-- Migração: adiciona campos da Área do Aluno na tabela users existente
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS goal      ENUM('Hipertrofia','Emagrecimento','Condicionamento','Saúde Geral','Performance') DEFAULT 'Hipertrofia' AFTER phone,
  ADD COLUMN IF NOT EXISTS plan      ENUM('BRONZE','PRATA','OURO','DIAMANTE') DEFAULT 'BRONZE' AFTER goal,
  ADD COLUMN IF NOT EXISTS plan_start    DATE NULL AFTER plan,
  ADD COLUMN IF NOT EXISTS plan_renewal  DATE NULL AFTER plan_start,
  ADD COLUMN IF NOT EXISTS avatar_url    VARCHAR(500) NULL AFTER plan_renewal,
  ADD COLUMN IF NOT EXISTS role      ENUM('student','admin','nutritionist','trainer') DEFAULT 'student' AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS active    TINYINT(1) DEFAULT 1 AFTER role;

-- Tabela de refresh tokens (autenticação)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(500) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabela de métricas corporais
CREATE TABLE IF NOT EXISTS body_metrics (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  weight      DECIMAL(5,2),
  height      DECIMAL(5,1),
  body_fat    DECIMAL(4,1),
  waist       DECIMAL(5,1),
  arm         DECIMAL(5,1),
  leg         DECIMAL(5,1),
  chest       DECIMAL(5,1),
  recorded_at DATE NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabela de planos de treino
CREATE TABLE IF NOT EXISTS workout_plans (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT,
  trainer_id   INT,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  goal         VARCHAR(100),
  week_start   DATE,
  active       TINYINT(1) DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dias de treino
CREATE TABLE IF NOT EXISTS workout_days (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id      INT UNSIGNED NOT NULL,
  day_of_week  VARCHAR(3),
  week_day     TINYINT,
  name         VARCHAR(100) NOT NULL,
  duration_min SMALLINT DEFAULT 60,
  is_rest      TINYINT(1) DEFAULT 0,
  sort_order   TINYINT DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_id       INT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  muscle_group VARCHAR(50),
  sets         TINYINT,
  reps         VARCHAR(20),
  rest_seconds SMALLINT,
  video_url    VARCHAR(500),
  notes        TEXT,
  sort_order   TINYINT DEFAULT 0,
  FOREIGN KEY (day_id) REFERENCES workout_days(id) ON DELETE CASCADE
);

-- Tabela de planos nutricionais
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT,
  nutritionist_id  INT,
  name             VARCHAR(100) NOT NULL,
  goal_calories    SMALLINT,
  goal_protein_g   SMALLINT,
  goal_carbs_g     SMALLINT,
  goal_fat_g       SMALLINT,
  water_goal_ml    SMALLINT DEFAULT 3000,
  active           TINYINT(1) DEFAULT 1,
  valid_from       DATE,
  valid_until      DATE,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de refeições
CREATE TABLE IF NOT EXISTS meals (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id      INT UNSIGNED NOT NULL,
  name         VARCHAR(100),
  meal_type    VARCHAR(50),
  time_label   VARCHAR(10),
  meal_time    TIME,
  icon         VARCHAR(10),
  is_highlight TINYINT(1) DEFAULT 0,
  sort_order   TINYINT DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES nutrition_plans(id) ON DELETE CASCADE
);

-- Tabela de itens de refeição
CREATE TABLE IF NOT EXISTS meal_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meal_id     INT UNSIGNED NOT NULL,
  food_name   VARCHAR(150),
  name        VARCHAR(150),
  quantity    VARCHAR(50),
  quantity_g  DECIMAL(7,2),
  calories    SMALLINT,
  protein_g   DECIMAL(5,1),
  carbs_g     DECIMAL(5,1),
  fat_g       DECIMAL(5,1),
  sort_order  TINYINT DEFAULT 0,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(150) NOT NULL,
  body       TEXT,
  read_at    DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);
