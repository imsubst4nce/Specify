-- =========================================================================
-- Specify Application MySQL Setup Script
-- Generated: 2026-05-26
-- Description: Complete SQL command set to instantiate the database,
--              structured tables, foreign keys, indexes, and sample seeds.
-- =========================================================================

-- 1. DATABASE CREATION
CREATE DATABASE IF NOT EXISTS specify_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE specify_db;

-- 2. CLEAR EXISTING TABLES (Safety precaution)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS crc_card_responsibilities;
DROP TABLE IF EXISTS crc_card_collaborators;
DROP TABLE IF EXISTS crc_card_linked_usecases;
DROP TABLE IF EXISTS crc_cards;
DROP TABLE IF EXISTS use_case_actors;
DROP TABLE IF EXISTS use_case_main_flow;
DROP TABLE IF EXISTS use_cases;
DROP TABLE IF EXISTS project_collaborators;
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
  avatar_url LONGTEXT NULL,
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

-- PROJECT COLLABORATORS TABLE
-- Many-to-many relationship tracking project collaboration sharing.
CREATE TABLE project_collaborators (
  project_id VARCHAR(36) NOT NULL,
  collaborator_email VARCHAR(255) NOT NULL,
  PRIMARY KEY (project_id, collaborator_email),
  CONSTRAINT fk_collaborator_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- USE CASES TABLE
-- Model requirements with structured preconditions and postconditions.
CREATE TABLE use_cases (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  preconditions TEXT NULL,
  postconditions TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_usecase_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- USE CASE ACTORS TABLE
CREATE TABLE use_case_actors (
  use_case_id VARCHAR(36) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (use_case_id, actor_name),
  CONSTRAINT fk_actor_usecase
    FOREIGN KEY (use_case_id) REFERENCES use_cases (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- USE CASE MAIN FLOW TABLE
CREATE TABLE use_case_main_flow (
  use_case_id VARCHAR(36) NOT NULL,
  flow_step TEXT NOT NULL,
  step_index INT NOT NULL,
  PRIMARY KEY (use_case_id, step_index),
  CONSTRAINT fk_flow_usecase
    FOREIGN KEY (use_case_id) REFERENCES use_cases (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- CRC CARDS TABLE
-- Object interactions mapping (Class Name, Description, and linked elements).
CREATE TABLE crc_cards (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_crccard_project 
    FOREIGN KEY (project_id) REFERENCES projects (id) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- CRC CARD RESPONSIBILITIES TABLE
CREATE TABLE crc_card_responsibilities (
  crc_card_id VARCHAR(36) NOT NULL,
  responsibility TEXT NOT NULL,
  CONSTRAINT fk_responsibility_crccard
    FOREIGN KEY (crc_card_id) REFERENCES crc_cards (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- CRC CARD COLLABORATORS TABLE
CREATE TABLE crc_card_collaborators (
  crc_card_id VARCHAR(36) NOT NULL,
  collaborator_name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_collaborator_crccard
    FOREIGN KEY (crc_card_id) REFERENCES crc_cards (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- CRC CARD LINKED USECASES TABLE
CREATE TABLE crc_card_linked_usecases (
  crc_card_id VARCHAR(36) NOT NULL,
  usecase_id VARCHAR(255) NOT NULL,
  CONSTRAINT fk_usecase_crccard
    FOREIGN KEY (crc_card_id) REFERENCES crc_cards (id)
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
  avatar_url LONGTEXT NULL,
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
CREATE INDEX idx_collaborators_email ON project_collaborators(collaborator_email);
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
INSERT INTO project_collaborators (project_id, collaborator_email)
VALUES (
  'project_seed_01', 
  'bob@example.com'
);

-- Seed a standard User Authentication use case
INSERT INTO use_cases (id, project_id, title, preconditions, postconditions)
VALUES (
  'uc_seed_01',
  'project_seed_01',
  'Authenticate Architect User',
  'User is not signed in and visits the dashboard auth portal.',
  'Architect is authenticated and is granted write permissions across their projects.'
);

-- Seed use case actors
INSERT INTO use_case_actors (use_case_id, actor_name) 
VALUES 
  ('uc_seed_01', 'User Architect'),
  ('uc_seed_01', 'Identity Service Provider');

-- Seed use case main flow steps
INSERT INTO use_case_main_flow (use_case_id, flow_step, step_index) 
VALUES 
  ('uc_seed_01', 'Architect requests navigation to login screen', 0),
  ('uc_seed_01', 'Architect enters email credentials and password secret key', 1),
  ('uc_seed_01', 'Backend validates matching hash signatures', 2),
  ('uc_seed_01', 'Platform redirects safely granting session bearer state token', 3);

-- Seed a corresponding CRC Card detailing the interaction model
INSERT INTO crc_cards (id, project_id, class_name, description)
VALUES (
  'crc_seed_01',
  'project_seed_01',
  'LocalDBStore',
  'Manages active dataset persistence using high-performance thread operations'
);

-- Seed CRC Card responsibilities
INSERT INTO crc_card_responsibilities (crc_card_id, responsibility)
VALUES 
  ('crc_seed_01', 'Validates credentials authenticity'),
  ('crc_seed_01', 'Saves registered project elements and shares'),
  ('crc_seed_01', 'Provides thread-safe cascade deletions of related assets');

-- Seed CRC Card collaborators
INSERT INTO crc_card_collaborators (crc_card_id, collaborator_name)
VALUES 
  ('crc_seed_01', 'User'),
  ('crc_seed_01', 'Project'),
  ('crc_seed_01', 'UseCase'),
  ('crc_seed_01', 'CRCCard');

-- Seed CRC Card linked use cases reference
INSERT INTO crc_card_linked_usecases (crc_card_id, usecase_id)
VALUES 
  ('crc_seed_01', 'uc_seed_01');

-- Seed a supportive comment from Bob
INSERT INTO comments (id, project_id, target_type, target_id, user_id, user_name, avatar_url, text)
VALUES (
  'comment_seed_01',
  'project_seed_01',
  'usecase',
  'uc_seed_01',
  'user_seed_02',
  'Bob Builder',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
  'Looks fantastic! The credentials validation steps are clearly mapped. Should we also log failed login attempts?'
);

-- =========================================================================
-- End of Setup Script.
-- =========================================================================