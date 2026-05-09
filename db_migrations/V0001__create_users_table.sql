CREATE TABLE t_p91242628_chat_sfera_18plus.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p91242628_chat_sfera_18plus.users (username, password_hash, role)
VALUES ('admin', md5('admin123'), 'admin');
