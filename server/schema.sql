CREATE DATABASE IF NOT EXISTS ministryflow_db;
USE ministryflow_db;

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('head_admin', 'team_admin', 'member') DEFAULT 'member',
  team_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  quantity INT DEFAULT 1,
  condition_status ENUM('Good','Fair','Under Repair') DEFAULT 'Good',
  location VARCHAR(150),
  status ENUM('Available','In Use','Maintenance','Stored') DEFAULT 'Available',
  team_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

DROP TABLE IF EXISTS schedule_teams;
DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_type ENUM('1st Service','2nd Service','Jr Youth Service','Youth Service') NOT NULL,
  schedule_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  team_id INT NOT NULL,
  role_name VARCHAR(150) NOT NULL,
  assigned_to VARCHAR(150),
  notes TEXT,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE color_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  service_type ENUM('1st Service','2nd Service','Jr Youth Service','Youth Service') NOT NULL,
  color_code VARCHAR(10) NOT NULL,
  description VARCHAR(200),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
 
INSERT INTO teams (name, description) VALUES
('Tech Team', 'Handles presentations, OBS, and sound system'),
('Decors & Lights', 'Manages decorations, lighting, and tools'),
('Music Team', 'Instruments, microphones, and worship gear'),
('Usher Team', 'Schedules, assignments, and materials');

INSERT INTO users (name, email, password, role, team_id) VALUES
('Head Admin1', 'admin1@dcjcc.org', '$2a$10$placeholder_hash', 'head_admin', NULL);