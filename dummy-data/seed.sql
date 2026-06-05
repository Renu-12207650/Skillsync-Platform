-- =============================================================
-- SkillSync Dummy Data Seed Script
-- MySQL — run this while the stack is up
-- BCrypt hash used: Password@123
--   hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu
-- =============================================================

-- ─────────────────────────────────────────────
-- 1. AUTH DATABASE  (skillsync_auth_db)
-- ─────────────────────────────────────────────
USE skillsync_auth_db;

INSERT IGNORE INTO auth_users (full_name, email, password, role, enabled, created_at) VALUES
-- Learners
('Aarav Sharma',    'aarav.sharma@demo.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_LEARNER', 1, NOW()),
('Priya Nair',      'priya.nair@demo.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_LEARNER', 1, NOW()),
('Rohan Mehta',     'rohan.mehta@demo.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_LEARNER', 1, NOW()),
('Sneha Patel',     'sneha.patel@demo.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_LEARNER', 1, NOW()),
('Kiran Joshi',     'kiran.joshi@demo.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_LEARNER', 1, NOW()),
-- Mentors
('Vikram Rao',      'vikram.rao@demo.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_MENTOR',  1, NOW()),
('Ananya Iyer',     'ananya.iyer@demo.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_MENTOR',  1, NOW()),
('Dev Kapoor',      'dev.kapoor@demo.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_MENTOR',  1, NOW()),
('Meera Krishnan',  'meera.krishnan@demo.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_MENTOR',  1, NOW()),
('Arjun Singh',     'arjun.singh@demo.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'ROLE_MENTOR',  1, NOW());


-- ─────────────────────────────────────────────
-- 2. USER DATABASE  (skillsync_user_db)
-- ─────────────────────────────────────────────
-- NOTE: auth_user_id must match the IDs auto-assigned above.
-- The SELECT subquery resolves them by email — safe and portable.
USE skillsync_user_db;

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Aarav Sharma',
  'Final-year CS student exploring backend systems and system design.',
  'https://linkedin.com/in/aarav-sharma', 'https://github.com/aarav-sharma', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'aarav.sharma@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Priya Nair',
  'Frontend developer learning React and TypeScript. Love building pixel-perfect UIs.',
  'https://linkedin.com/in/priya-nair', 'https://github.com/priya-nair', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'priya.nair@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Rohan Mehta',
  'Data science enthusiast diving into ML and Python. Open to peer learning.',
  'https://linkedin.com/in/rohan-mehta', 'https://github.com/rohan-mehta', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'rohan.mehta@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Sneha Patel',
  'Aspiring DevOps engineer. Experimenting with Docker and Kubernetes on weekends.',
  'https://linkedin.com/in/sneha-patel', 'https://github.com/sneha-patel', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'sneha.patel@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Kiran Joshi',
  'Mobile developer (Android/Kotlin). Looking for mentors in system design.',
  'https://linkedin.com/in/kiran-joshi', 'https://github.com/kiran-joshi', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'kiran.joshi@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Vikram Rao',
  '8 years in Spring Boot microservices. Passionate about mentoring junior engineers.',
  'https://linkedin.com/in/vikram-rao', 'https://github.com/vikram-rao', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'vikram.rao@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Ananya Iyer',
  'Senior React & TypeScript engineer. Ex-Flipkart. Loves helping people get their first PR merged.',
  'https://linkedin.com/in/ananya-iyer', 'https://github.com/ananya-iyer', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'ananya.iyer@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Dev Kapoor',
  'ML engineer at a fintech startup. 5 years in TensorFlow, PyTorch, and production ML systems.',
  'https://linkedin.com/in/dev-kapoor', 'https://github.com/dev-kapoor', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'dev.kapoor@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Meera Krishnan',
  'DevOps architect with 6 years. Kubernetes, Terraform, and AWS are my daily drivers.',
  'https://linkedin.com/in/meera-krishnan', 'https://github.com/meera-krishnan', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'meera.krishnan@demo.com';

INSERT IGNORE INTO user_profiles (auth_user_id, full_name, bio, linkedin_url, github_url, created_at, updated_at)
SELECT id, 'Arjun Singh',
  'Engineering manager and system design coach. 10 years across FAANG-style interviews.',
  'https://linkedin.com/in/arjun-singh', 'https://github.com/arjun-singh', NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'arjun.singh@demo.com';


-- ─────────────────────────────────────────────
-- 3. MENTOR DATABASE  (skillsync_mentor_db)
-- ─────────────────────────────────────────────
-- Skill IDs from SkillDataSeeder (seeded in order):
--  1=React  2=Vue.js  3=Angular  4=Next.js  5=TypeScript
--  6=Spring Boot  7=Node.js  8=Django  9=FastAPI  10=Go  11=Rust
-- 12=PostgreSQL 13=MongoDB 14=Redis 15=MySQL
-- 16=Docker 17=Kubernetes 18=Terraform
-- 19=AWS 20=Azure 21=GCP
-- 22=Machine Learning 23=Data Engineering 24=TensorFlow 25=PyTorch 26=SQL
-- 27=iOS(Swift) 28=Android(Kotlin) 29=React Native 30=Flutter
-- 31=System Design 32=DSA/Interviews 33=Product Strategy 34=Engineering Mgmt
USE skillsync_mentor_db;

-- Vikram Rao — Spring Boot, Microservices, PostgreSQL
INSERT IGNORE INTO mentor_profiles
  (auth_user_id, bio, years_of_experience, hourly_rate, status, average_rating, created_at, updated_at)
SELECT id,
  '8 years in Spring Boot microservices. Passionate about mentoring junior engineers.',
  8, 1200.00, 'ACTIVE', 4.80, NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'vikram.rao@demo.com';

INSERT IGNORE INTO mentor_skill_ids (mentor_id, skill_id)
SELECT mp.id, s.skill_id FROM
  (SELECT id FROM skillsync_auth_db.auth_users WHERE email = 'vikram.rao@demo.com') u
  JOIN mentor_profiles mp ON mp.auth_user_id = u.id,
  (SELECT 6 AS skill_id UNION SELECT 12 UNION SELECT 15 UNION SELECT 31) s;

-- Ananya Iyer — React, TypeScript, Next.js
INSERT IGNORE INTO mentor_profiles
  (auth_user_id, bio, years_of_experience, hourly_rate, status, average_rating, created_at, updated_at)
SELECT id,
  'Senior React & TypeScript engineer. Ex-Flipkart. Loves helping people get their first PR merged.',
  6, 1000.00, 'ACTIVE', 4.90, NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'ananya.iyer@demo.com';

INSERT IGNORE INTO mentor_skill_ids (mentor_id, skill_id)
SELECT mp.id, s.skill_id FROM
  (SELECT id FROM skillsync_auth_db.auth_users WHERE email = 'ananya.iyer@demo.com') u
  JOIN mentor_profiles mp ON mp.auth_user_id = u.id,
  (SELECT 1 AS skill_id UNION SELECT 4 UNION SELECT 5 UNION SELECT 7) s;

-- Dev Kapoor — ML, TensorFlow, PyTorch
INSERT IGNORE INTO mentor_profiles
  (auth_user_id, bio, years_of_experience, hourly_rate, status, average_rating, created_at, updated_at)
SELECT id,
  'ML engineer at a fintech startup. 5 years in TensorFlow, PyTorch, and production ML systems.',
  5, 1400.00, 'ACTIVE', 4.75, NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'dev.kapoor@demo.com';

INSERT IGNORE INTO mentor_skill_ids (mentor_id, skill_id)
SELECT mp.id, s.skill_id FROM
  (SELECT id FROM skillsync_auth_db.auth_users WHERE email = 'dev.kapoor@demo.com') u
  JOIN mentor_profiles mp ON mp.auth_user_id = u.id,
  (SELECT 22 AS skill_id UNION SELECT 24 UNION SELECT 25 UNION SELECT 26) s;

-- Meera Krishnan — Kubernetes, Terraform, AWS
INSERT IGNORE INTO mentor_profiles
  (auth_user_id, bio, years_of_experience, hourly_rate, status, average_rating, created_at, updated_at)
SELECT id,
  'DevOps architect with 6 years. Kubernetes, Terraform, and AWS are my daily drivers.',
  6, 1300.00, 'ACTIVE', 4.85, NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'meera.krishnan@demo.com';

INSERT IGNORE INTO mentor_skill_ids (mentor_id, skill_id)
SELECT mp.id, s.skill_id FROM
  (SELECT id FROM skillsync_auth_db.auth_users WHERE email = 'meera.krishnan@demo.com') u
  JOIN mentor_profiles mp ON mp.auth_user_id = u.id,
  (SELECT 16 AS skill_id UNION SELECT 17 UNION SELECT 18 UNION SELECT 19) s;

-- Arjun Singh — System Design, DSA, Engineering Mgmt
INSERT IGNORE INTO mentor_profiles
  (auth_user_id, bio, years_of_experience, hourly_rate, status, average_rating, created_at, updated_at)
SELECT id,
  'Engineering manager and system design coach. 10 years across FAANG-style interviews.',
  10, 1800.00, 'ACTIVE', 4.95, NOW(), NOW()
FROM skillsync_auth_db.auth_users WHERE email = 'arjun.singh@demo.com';

INSERT IGNORE INTO mentor_skill_ids (mentor_id, skill_id)
SELECT mp.id, s.skill_id FROM
  (SELECT id FROM skillsync_auth_db.auth_users WHERE email = 'arjun.singh@demo.com') u
  JOIN mentor_profiles mp ON mp.auth_user_id = u.id,
  (SELECT 31 AS skill_id UNION SELECT 32 UNION SELECT 34) s;
