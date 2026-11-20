-- Passkeys/WebAuthn para autenticação biométrica
CREATE TABLE IF NOT EXISTS user_passkeys (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  credential_id VARCHAR(512) NOT NULL,
  credential_id_hash CHAR(64) NOT NULL,
  public_key LONGTEXT NOT NULL,
  sign_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
  transports JSON NULL,
  device_name VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_user_passkeys_credential (credential_id_hash),
  INDEX idx_user_passkeys_user_active (user_id, is_active),
  CONSTRAINT fk_user_passkeys_user
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);
