-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  roles TEXT[] DEFAULT '{"user"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create databases table if it doesn't exist
CREATE TABLE IF NOT EXISTS databases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  host VARCHAR(255) NOT NULL DEFAULT 'localhost',
  port INTEGER NOT NULL DEFAULT 5432,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  source VARCHAR(50) DEFAULT 'local',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create session tokens table for authentication
CREATE TABLE IF NOT EXISTS auth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on tokens for faster verification
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);

-- Create a simple demo user for testing (password: testpassword)
INSERT INTO users (email, password_hash, first_name, last_name, company_name, roles)
VALUES 
('demo@example.com', '$2b$10$8tGmGxMENPIYMdXbI1VyYehVVSLU8E9UHdz5Q2S1Z7qyNgGNkFUoC', 'Demo', 'User', 'Neon', '{user,admin}')
ON CONFLICT (email) DO NOTHING; 