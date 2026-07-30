-- Tabela de fotos de progresso (base64)
CREATE TABLE IF NOT EXISTS progress_photos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  photo_base64 LONGTEXT NOT NULL,
  label       VARCHAR(100),
  recorded_at DATE NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);
