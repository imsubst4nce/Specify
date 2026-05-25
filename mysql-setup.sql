-- =========================================================================
-- Specify Application MySQL Setup Script
-- Generated: 2026-05-25
-- Description: Complete SQL command set to instantiate the database,
--              structured tables, foreign keys, indexes, and sample seeds.
-- =========================================================================

-- 1. DATABASE CREATION
CREATE DATABASE IF NOT EXISTS specify_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE specify_db;

-- 2. CLEAR EXISTING TABLES (Optional / Safety precaution)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS crc_cards;
DROP TABLE IF EXISTS use_cases;
DROP TABLE IF EXISTS project_shares;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 3. TABLE STRUCTURE DEFINITIONS
-- =========================================================================

-- USERS TABLE
-- Stores authenticated software architects and product planners.
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_email (email)
) ENGINE=InnoDB;

-- PROJECTS TABLE
-- Represents the workspace spec dossiers.
CREATE TABLE projects (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  owner_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_project_owner 
    FOREIGN KEY (owner_id) REFERENCES users (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- PROJECT SHARES TABLE
-- Many-to-many relationship tracking project collaboration sharing.
CREATE TABLE project_shares (
  project_id VARCHAR(36) NOT NULL,
  collaborating_email VARCHAR(255) NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, collaborating_email),
  CONSTRAINT fk_share_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- USE CASES TABLE
-- Model requirements with structured preconditions, actors list, flow-steps, and postconditions.
CREATE TABLE use_cases (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  actors JSON NULL,                 -- Stored as JSON array (e.g. ["Actor A", "Actor B"])
  preconditions TEXT NULL,
  main_flow JSON NOT NULL,          -- Stored as JSON array of step strings (e.g. ["Step 1", "Step 2"])
  postconditions TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_usecase_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- CRC CARDS TABLE
-- Object interactions mapping (Class Name, Description, obligations, Collaborator Classes, and linked Use Cases).
CREATE TABLE crc_cards (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  responsibilities JSON NOT NULL,   -- Stored as JSON array (e.g. ["Handle user input", "Update DB state"])
  collaborators JSON NULL,          -- Stored as JSON array (e.g. ["LocalDBStore", "Logger"])
  linked_use_case_ids JSON NULL,    -- Stored as JSON array referencing use_cases.id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_crccard_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- COMMENTS TABLE
-- Collaborative threads on specification elements.
CREATE TABLE comments (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(50) NOT NULL,  -- 'usecase' or 'crccard'
  target_id VARCHAR(36) NOT NULL,    -- References use_cases.id or crc_cards.id
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comment_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comment_user 
    FOREIGN KEY (user_id) REFERENCES users (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 4. DATABASE INDEXES FOR HIGHER QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_shares_email ON project_shares(collaborating_email);
CREATE INDEX idx_usecases_project ON use_cases(project_id);
CREATE INDEX idx_crccards_project ON crc_cards(project_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);

-- =========================================================================
-- 5. SEED DATA GENERATION
-- =========================================================================

-- Insert standard primary user (Password hash is: 'password' encoded as simple base64: 'cGFzc3dvcmQ=')
INSERT INTO users (id, name, email, password_hash, avatar_url)
VALUES (
  'user_seed_01', 
  'Alice Architect', 
  'alice@example.com', 
  'cGFzc3dvcmQ=', 
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'
);

INSERT INTO users (id, name, email, password_hash, avatar_url)
VALUES (
  'user_seed_02', 
  'Bob Builder', 
  'bob@example.com', 
  'cGFzc3dvcmQ=', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
);

-- Seed an initial enterprise project
INSERT INTO projects (id, name, description, owner_id)
VALUES (
  'project_seed_01', 
  'Specify CRM', 
  'Modern software architectural layout and specs planning for our custom CRM dashboard', 
  'user_seed_01'
);

-- Share the project with Bob
INSERT INTO project_shares (project_id, collaborating_email)
VALUES (
  'project_seed_01', 
  'bob@example.com'
);

-- Seed a standard User Authentication use case
INSERT INTO use_cases (id, project_id, title, actors, preconditions, main_flow, postconditions)
VALUES (
  'uc_seed_01',
  'project_seed_01',
  'Authenticate Architect User',
  '["User Architect", "Identity Service Provider"]',
  'User is not signed in and visits the dashboard auth portal.',
  '["Architect requests navigation to login screen", "Architect enters email credentials and password secret key", "Backend validates matching hash signatures", "Platform redirects safely granting session bearer state token"]',
  'Architect is authenticated and is granted write permissions across their projects.'
);

-- Seed a corresponding CRC Card detailing the interaction model
INSERT INTO crc_cards (id, project_id, class_name, description, responsibilities, collaborators, linked_use_case_ids)
VALUES (
  'crc_seed_01',
  'project_seed_01',
  'LocalDBStore',
  'Manages active dataset persistence using high-performance thread operations',
  '["Validates credentials authenticity", "Saves registered project elements and shares", "Provides thread-safe cascade deletions of related assets"]',
  '["User", "Project", "UseCase", "CRCCard"]',
  '["uc_seed_01"]'
);

-- Seed a supportive comment from Bob
INSERT INTO comments (id, project_id, target_type, target_id, user_id, user_name, text)
VALUES (
  'comment_seed_01',
  'project_seed_01',
  'usecase',
  'uc_seed_01',
  'user_seed_02',
  'Bob Builder',
  'Looks fantastic! The credentials validation steps are clearly mapped. Should we also log failed login attempts?'
);

-- =========================================================================
-- End of Setup Script.
-- =========================================================================
