-- =================
-- DATABASE CREATION
-- =================

CREATE DATABASE IF NOT EXISTS specify_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE specify_db;

-- =====================
-- CLEAR EXISTING TABLES
-- =====================

SET FOREIGN_KEY_CHECKS = 0; -- DISABLE FOREIGN KEY CHECKS
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

SET FOREIGN_KEY_CHECKS = 1; -- REENABLE FOREIGN_KEY_CHECKS

-- ===========================
-- TABLE STRUCTURE DEFINITIONS
-- ===========================

-- USERS TABLE
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_email (email)
) ENGINE=InnoDB;

-- PROJECTS TABLE
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

-- =============================================
-- DATABASE INDEXES FOR HIGHER QUERY PERFORMANCE
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_collaborators_email ON project_collaborators(collaborator_email);
CREATE INDEX idx_usecases_project ON use_cases(project_id);
CREATE INDEX idx_crccards_project ON crc_cards(project_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);