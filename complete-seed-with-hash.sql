-- ============================================
-- COMPLETE SEED DATA - EXACT DATABASE STATE
-- ============================================
-- This script will reset your database to the exact current state
-- Safe to run multiple times - will replace all existing data
-- ============================================

-- ============================================
-- STEP 0: ENABLE PGCRYPTO EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 1: CLEAN ALL EXISTING DATA
-- ============================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Truncate all tables (this will delete all data)
TRUNCATE TABLE manager_reviews CASCADE;
TRUNCATE TABLE self_assessments CASCADE;
TRUNCATE TABLE review_cycles CASCADE;
TRUNCATE TABLE performances CASCADE;
TRUNCATE TABLE leave_allocations CASCADE;
TRUNCATE TABLE leaves CASCADE;
TRUNCATE TABLE goals CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE departments CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- ============================================
-- STEP 2: INSERT DEPARTMENTS
-- ============================================

INSERT INTO departments (id, name) VALUES
(1, 'Engineering'),
(2, 'Human Resources'),
(3, 'Sales'),
(4, 'Marketing'),
(5, 'Finance'),
(6, 'Operations');

-- ============================================
-- STEP 3: INSERT USERS
-- ============================================

INSERT INTO users (id, name, email, password_hash, role, department_id, created_at) VALUES
(1, 'Sarah Johnson', 'sarah.johnson@company.com', '$2a$10$D5rsuJljh.5BzTFD.xnF8.zKvSvZrdPCGl1vK/i.TFXN3wqrRNLGW', 'hr', 2, '2025-11-30 00:03:13.361735+00'),
(2, 'Michael Davis', 'michael.davis@company.com', '$2a$10$qhUGpjgN8bXnWBY3N6kmHOysdkGXDMACMgmeYHvfNMewCF9g5UmAm', 'hr', 2, '2025-11-30 00:03:13.361735+00'),
(3, 'Robert Williams', 'robert.williams@company.com', '$2a$10$rhtLiMrihjxqgVXcMUuPeeyLQVkQv1D7Xrs0ZgisOC.umnLoRjSh2', 'manager', 1, '2025-11-30 00:03:13.361735+00'),
(4, 'Jennifer Brown', 'jennifer.brown@company.com', '$2a$10$Cql0SgASYOv195gXHcZkdeKdskEJTyBwPkyQQg.uXlDzdSzWugZ5.', 'manager', 3, '2025-11-30 00:03:13.361735+00'),
(5, 'David Martinez', 'david.martinez@company.com', '$2a$10$gw7S.EBDXpoCK1PJde77COX8ylgXFm/Ix28I5jGabuPh7pfzrHVmy', 'manager', 4, '2025-11-30 00:03:13.361735+00'),
(6, 'Lisa Anderson', 'lisa.anderson@company.com', '$2a$10$yA3jAMONeif3P.Vz4ZSHLO0sAMYytuMV1oZdLIELjV7IeZ/cHvUWm', 'manager', 5, '2025-11-30 00:03:13.361735+00'),
(7, 'James Taylor', 'james.taylor@company.com', '$2a$10$thnBFVVlxTayxe2l.oZeX.2KWyp.KHve1f2gNadTGXNMhyXD3ZnA2', 'employee', 1, '2025-11-30 00:03:13.361735+00'),
(8, 'Mary Thomas', 'mary.thomas@company.com', '$2a$10$0VMrhZlP433zaH/l9rRTUu3mbjmUIQBsU2wmh6Q.D/U4Hr5JRtXxm', 'employee', 1, '2025-11-30 00:03:13.361735+00'),
(9, 'John Jackson', 'john.jackson@company.com', '$2a$10$aGAeb8/j/DtERIW7mEPNv.o.dfVak.Gd6u4EZB7QOlMTb83P4mD.2', 'employee', 1, '2025-11-30 00:03:13.361735+00'),
(10, 'Patricia White', 'patricia.white@company.com', '$2a$10$rENpAVv26NsNCRVClrwvDu7l4jDdAa0DIFwWwkHpdH9HS6SKPPkTi', 'employee', 3, '2025-11-30 00:03:13.361735+00'),
(11, 'Christopher Harris', 'christopher.harris@company.com', '$2a$10$W/WatqwF17wpF9LYjmwuqeZ9ZFGYpwGcDZyi1//HytasOrzLMK7fC', 'employee', 3, '2025-11-30 00:03:13.361735+00'),
(12, 'Linda Martin', 'linda.martin@company.com', '$2a$10$.wPSogK/vuheRcZruGEQ1ewbuR0yaC3ye0K/nWirFI6Ak7QDzxXd.', 'employee', 3, '2025-11-30 00:03:13.361735+00'),
(13, 'Daniel Thompson', 'daniel.thompson@company.com', '$2a$10$U7v3eU6QSPg2FFCbv0qSWeKJUD6UV3bvUbmmgtbWNacGPBKENEszW', 'employee', 4, '2025-11-30 00:03:13.361735+00'),
(14, 'Barbara Garcia', 'barbara.garcia@company.com', '$2a$10$qbPX9mJai1oysLZedp7oMehOXwz9ktAyhILYT2MzNmZ3huZceVuU2', 'employee', 4, '2025-11-30 00:03:13.361735+00'),
(15, 'Matthew Rodriguez', 'matthew.rodriguez@company.com', '$2a$10$6/AZkQVHXIK10DFP90ZoheFt9VGib9fm4cTg/R8wwxCb25/qvhsqm', 'employee', 5, '2025-11-30 00:03:13.361735+00'),
(16, 'Susan Martinez', 'susan.martinez@company.com', '$2a$10$G9pT7JXap7sqpC2HxtCGRO9CxKPBmLt61ogAOqVSGAojG4ySDF9h.', 'employee', 5, '2025-11-30 00:03:13.361735+00'),
(17, 'Anthony Hernandez', 'anthony.hernandez@company.com', '$2a$10$kw21xPaJFEfPIg1udUS6mO6Qm2vlm6NfeaJRLEpLdjcCNcTcCEAYq', 'employee', 6, '2025-11-30 00:03:13.361735+00'),
(18, 'Jessica Lopez', 'jessica.lopez@company.com', '$2a$10$jzB6aKTJ2hvCMxMyIAYY6uv5f2hIi4xqx71/Jm8LL8C.fLsDclHIi', 'employee', 6, '2025-11-30 00:03:13.361735+00'),
(19, 'Mark Gonzalez', 'mark.gonzalez@company.com', '$2a$10$DMuMyj0K5Bqu6YrfxH55w.3zPG/5SAsmW0P6XYcYsHAcjTc2oWuzC', 'employee', 6, '2025-11-30 00:03:13.361735+00'),
(20, 'Karen Wilson', 'karen.wilson@company.com', '$2a$10$yD34KWszaKhfkYOrHjQRV.ggJKdQeEMYfROgat4WkwQStLPPu/pJ6', 'employee', 6, '2025-11-30 00:03:13.361735+00'),
(21, 'Carol Ferguson', 'peoplesoftent.hr@gmail.com', '$2a$10$DUOG7pK/1eF4DijpuLY16.gEBo6JNiUAhvBaZG/mZg7zs0wh32.9C', 'hr', 2, '2025-11-30 00:03:13.361735+00'),
(22, 'Frank Leonard', 'peoplesoftent.manager@gmail.com', '$2a$10$RgiLqR5FOpG6GoZRlCplZezLXbOWMropzjf4osdXXYrXMu1ruegpi', 'manager', 6, '2025-11-30 00:03:13.361735+00'),
(23, 'Amelie Griffith', 'peoplesoftent.employee@gmail.com', '$2a$10$t/OtogAQN8qRT6p2Pk/wg.pch33h/NlmdCCA4cz8usiymwmqoYTfe', 'employee', 1, '2025-11-30 00:03:13.361735+00');

-- ============================================
-- STEP 4: INSERT EMPLOYEES
-- ============================================

INSERT INTO employees (id, user_id, designation, department_id, manager_id, phone, location, created_at) VALUES
(1, 1, 'HR Director', 2, 21, '555-0101', 'New York', '2025-11-30 00:03:13.361735+00'),
(2, 2, 'HR Manager', 2, 21, '555-0102', 'New York', '2025-11-30 00:03:13.361735+00'),
(3, 3, 'Engineering Manager', 1, 21, '555-0103', 'San Francisco', '2025-11-30 00:03:13.361735+00'),
(4, 7, 'Senior Software Engineer', 1, 3, '555-0107', 'San Francisco', '2025-11-30 00:03:13.361735+00'),
(5, 8, 'Software Engineer', 1, 3, '555-0108', 'San Francisco', '2025-11-30 00:03:13.361735+00'),
(6, 9, 'Software Engineer', 1, 3, '555-0109', 'Remote', '2025-11-30 00:03:13.361735+00'),
(7, 4, 'Sales Manager', 3, 21, '555-0104', 'Chicago', '2025-11-30 00:03:13.361735+00'),
(8, 10, 'Senior Sales Executive', 3, 7, '555-0110', 'Chicago', '2025-11-30 00:03:13.361735+00'),
(9, 11, 'Sales Executive', 3, 7, '555-0111', 'Chicago', '2025-11-30 00:03:13.361735+00'),
(10, 12, 'Sales Executive', 3, 7, '555-0112', 'Remote', '2025-11-30 00:03:13.361735+00'),
(11, 5, 'Marketing Manager', 4, 21, '555-0105', 'Los Angeles', '2025-11-30 00:03:13.361735+00'),
(12, 13, 'Marketing Specialist', 4, 11, '555-0113', 'Los Angeles', '2025-11-30 00:03:13.361735+00'),
(13, 14, 'Content Marketing Manager', 4, 11, '555-0114', 'Los Angeles', '2025-11-30 00:03:13.361735+00'),
(14, 6, 'Finance Manager', 5, 21, '555-0106', 'New York', '2025-11-30 00:03:13.361735+00'),
(15, 15, 'Financial Analyst', 5, 14, '555-0115', 'New York', '2025-11-30 00:03:13.361735+00'),
(16, 16, 'Accountant', 5, 14, '555-0116', 'New York', '2025-11-30 00:03:13.361735+00'),
(17, 17, 'Operations Specialist', 6, 22, '555-0117', 'Austin', '2025-11-30 00:03:13.361735+00'),
(18, 18, 'Customer Support Lead', 6, 22, '555-0118', 'Austin', '2025-11-30 00:03:13.361735+00'),
(19, 19, 'Operations Coordinator', 6, 22, '555-0119', 'Remote', '2025-11-30 00:03:13.361735+00'),
(20, 20, 'Support Specialist', 6, 1, '555-0120', 'Austin', '2025-11-30 00:03:13.361735+00'),
(21, 21, 'Chief HR Officer', 2, NULL, '555-0121', 'San Francisco', '2025-11-30 00:03:13.361735+00'),
(22, 22, 'Operations Manager', 6, 21, '555-0122', 'Austin', '2025-11-30 00:03:13.361735+00'),
(23, 23, 'Junior Software Engineer', 1, 22, '555-0123', 'San Francisco', '2025-11-30 00:03:13.361735+00');

-- ============================================
-- STEP 5: INSERT REVIEW CYCLES
-- ============================================

INSERT INTO review_cycles (id, name, period_start, period_end, status, created_at) VALUES
(1, 'Cycle 1 - Q1 2025', '2025-01-01', '2025-03-31', 'open', NOW()),
(2, 'Q3 2024 Performance Review', '2024-07-01', '2024-09-30', 'open', NOW());

-- ============================================
-- STEP 6: INSERT GOALS
-- ============================================

INSERT INTO goals (id, user_id, cycle_id, title, description, timeline, progress, status, created_at, assigned_by, approval_flow, employee_accepted_at, manager_accepted_at, hr_approved_at, feedback, rating) VALUES
(1, 7, 2, 'Complete Cloud Migration Project', 'Lead the migration of legacy systems to AWS cloud infrastructure', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 7, 2, 'Obtain AWS Solutions Architect Certification', 'Complete certification to enhance cloud expertise', 'Q3 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 8, 2, 'Improve Code Review Process', 'Implement automated code review tools and establish best practices', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 10, 2, 'Increase Q3 Sales by 25%', 'Expand client base and close major enterprise deals', 'Q3 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 13, 2, 'Launch New Product Marketing Campaign', 'Develop and execute comprehensive marketing strategy', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 13, 2, 'Social Media Engagement Growth', 'Increase social media followers by 40%', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 15, 2, 'Complete Financial Audit Documentation', 'Prepare comprehensive audit reports for FY2024', 'Q4 2024', 85, 'submitted', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 9, 2, 'Mentor Junior Developers', 'Provide guidance and support to 3 junior team members', 'Q4 2024', 50, 'submitted', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 21, 2, 'Implement Company-Wide Performance Management System', 'Roll out new performance management framework across all departments', 'Q4 2024', 70, 'submitted', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 22, 2, 'Improve Operations Efficiency', 'Implement new workflow automation to increase team productivity by 20%', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 23, 2, 'Complete React Development Training', 'Master React framework and build 3 production-ready components', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 1, 2, 'Enhance Employee Engagement Programs', 'Launch quarterly team building activities and improve retention by 15%', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 3, 2, 'Scale Engineering Team', 'Hire 5 new engineers and establish mentorship program', 'Q4 2024', 100, 'approved', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 4, 2, 'Expand Sales Territory', 'Open new market in Southeast region and hire 2 sales representatives', 'Q4 2024', 45, 'submitted', '2025-11-30 00:03:13.361735+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 5, 1, 'Unit testing', E'\n\n--- Submission Comments ---\n100', 'quarterly', 100, 'approved', '2025-12-02 05:59:24.598209+00', 21, 'hr_manager', NULL, '2025-12-02 06:00:32.566593+00', '2025-12-02 06:04:40.618033+00', 'Good', 4),
(16, 14, 1, 'Unit Testing ', E'\n\n--- Submission Comments ---\nCompleted', 'quarterly', 100, 'approved', '2025-12-02 06:00:55.683062+00', 5, 'manager_employee', NULL, '2025-12-02 06:03:34.163019+00', '2025-12-02 06:03:45.354029+00', 'Excellent', 5),
(17, 22, 1, 'Deployment Work', E'Complete deployment tasks as assigned\n\n--- Submission Comments ---\ndone', NULL, 100, 'approved', '2025-12-02 06:08:45.63202+00', 21, 'hr_manager', NULL, '2025-12-02 06:09:18.489826+00', '2025-12-02 06:09:24.960369+00', 'Satisfactory', 3),
(18, 17, 2, 'Complete Sales Training Program', 'Complete advanced sales training and achieve certification', NULL, 100, 'approved', '2025-12-02 07:21:11.429697+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 22, 1, 'Demo of new feature', 'Demo', 'quarterly', 100, 'approved', '2025-12-02 08:30:45.233002+00', 21, 'hr_manager', NULL, '2025-12-02 08:31:06.972675+00', '2025-12-02 08:32:56.821245+00', 'Good', 4),
(20, 22, 1, 'Bug fix task', E'\n\n--- Submission Comments ---\ndone', NULL, 100, 'approved', '2025-12-02 08:34:32.627545+00', 21, 'hr_manager', NULL, '2025-12-02 08:34:48.646807+00', '2025-12-02 08:34:58.841376+00', 'Good', 4),
(21, 22, 1, 'Migration task', E'\n\n--- Submission Comments ---\ndone', '2025-12-09', 100, 'approved', '2025-12-02 08:39:36.473688+00', 21, 'hr_manager', NULL, '2025-12-02 08:39:55.07587+00', '2025-12-02 08:40:02.499858+00', 'Excellent', 5),
(22, 23, 1, 'Migration Task', E'Migration task details\n\n--- Submission Comments ---\n100', 'next cycle', 100, 'approved', '2025-12-02 08:42:10.863939+00', 22, 'manager_employee', NULL, '2025-12-02 08:42:24.647428+00', '2025-12-02 08:42:31.786712+00', 'Excellent', 5),
(23, 22, 1, 'Code Cleanup', E'\n\n--- Submission Comments ---\ndone', 'half-yearly', 100, 'approved', '2025-12-02 09:09:25.084241+00', 21, 'hr_manager', NULL, '2025-12-02 09:09:51.251994+00', '2025-12-02 09:17:25.157079+00', 'Good', 4),
(24, 22, 1, 'Bug Fix Task', E'Please provide details\n\n--- Submission Comments ---\ndone', 'Please provide deadline', 100, 'approved', '2025-12-02 09:18:00.23374+00', 21, 'hr_manager', NULL, '2025-12-02 09:18:17.78001+00', '2025-12-02 09:29:47.49098+00', 'Good', 4),
(25, 23, 1, 'Bug Fix Task', NULL, NULL, 100, 'approved', '2025-12-02 09:30:23.655159+00', 22, 'manager_employee', NULL, '2025-12-02 09:30:34.742601+00', '2025-12-02 09:30:46.761194+00', 'Good', 4),
(26, 22, 1, 'Production deployment', NULL, NULL, 20, 'accepted', '2025-12-02 10:32:07.980667+00', 21, 'hr_manager', NULL, '2025-12-02 10:37:08.483318+00', NULL, NULL, NULL),
(27, 23, 1, 'Production deployment', E'\n\n--- Submission Comments ---\ndone', 'quarterly', 100, 'submitted', '2025-12-02 10:38:00.543697+00', 22, 'manager_employee', NULL, '2025-12-02 10:38:42.917997+00', NULL, NULL, NULL);

-- ============================================
-- STEP 7: INSERT LEAVE ALLOCATIONS
-- ============================================

INSERT INTO leave_allocations (id, user_id, year, type, total, used) VALUES
-- 2024 Allocations
(1, 1, 2024, 'sick', 15, 0),
(2, 1, 2024, 'casual', 5, 0),
(3, 1, 2024, 'vacation', 10, 0),
(4, 7, 2024, 'sick', 15, 0),
(5, 7, 2024, 'casual', 5, 0),
(6, 7, 2024, 'vacation', 10, 0),
(7, 8, 2024, 'sick', 15, 0),
(8, 8, 2024, 'casual', 5, 0),
(9, 8, 2024, 'vacation', 10, 0),
(10, 9, 2024, 'sick', 15, 0),
(11, 9, 2024, 'casual', 5, 0),
(12, 9, 2024, 'vacation', 10, 0),
(13, 10, 2024, 'sick', 15, 0),
(14, 10, 2024, 'casual', 5, 0),
(15, 10, 2024, 'vacation', 10, 0),
(16, 11, 2024, 'sick', 15, 0),
(17, 11, 2024, 'casual', 5, 0),
(18, 11, 2024, 'vacation', 10, 0),
(19, 13, 2024, 'sick', 15, 0),
(20, 13, 2024, 'casual', 5, 0),
(21, 13, 2024, 'vacation', 10, 0),
(22, 15, 2024, 'sick', 15, 0),
(23, 15, 2024, 'casual', 5, 0),
(24, 15, 2024, 'vacation', 10, 0),
(25, 3, 2024, 'sick', 15, 0),
(26, 3, 2024, 'casual', 5, 0),
(27, 3, 2024, 'vacation', 10, 0),
(28, 17, 2024, 'sick', 15, 0),
(29, 17, 2024, 'casual', 5, 0),
(30, 17, 2024, 'vacation', 10, 0),
(31, 22, 2024, 'sick', 15, 0),
(32, 22, 2024, 'casual', 5, 0),
(33, 22, 2024, 'vacation', 10, 0),
(34, 23, 2024, 'sick', 15, 0),
(35, 23, 2024, 'casual', 5, 0),
(36, 23, 2024, 'vacation', 10, 0),
(37, 21, 2024, 'sick', 15, 0),
(38, 21, 2024, 'casual', 5, 0),
(39, 21, 2024, 'vacation', 10, 0),
(40, 2, 2024, 'sick', 15, 0),
(41, 2, 2024, 'casual', 5, 0),
(42, 2, 2024, 'vacation', 10, 0),
(43, 4, 2024, 'sick', 15, 0),
(44, 4, 2024, 'casual', 5, 0),
(45, 4, 2024, 'vacation', 10, 0),
(46, 5, 2024, 'sick', 15, 0),
(47, 5, 2024, 'casual', 5, 0),
(48, 5, 2024, 'vacation', 10, 0),
(49, 6, 2024, 'sick', 15, 0),
(50, 6, 2024, 'casual', 5, 0),
(51, 6, 2024, 'vacation', 10, 0),
(52, 12, 2024, 'sick', 15, 0),
(53, 12, 2024, 'casual', 5, 0),
(54, 12, 2024, 'vacation', 10, 0),
(55, 14, 2024, 'sick', 15, 0),
(56, 14, 2024, 'casual', 5, 0),
(57, 14, 2024, 'vacation', 10, 0),
(58, 16, 2024, 'sick', 15, 0),
(59, 16, 2024, 'casual', 5, 0),
(60, 16, 2024, 'vacation', 10, 0),
(61, 18, 2024, 'sick', 15, 0),
(62, 18, 2024, 'casual', 5, 0),
(63, 18, 2024, 'vacation', 10, 0),
(64, 19, 2024, 'sick', 15, 0),
(65, 19, 2024, 'casual', 5, 0),
(66, 19, 2024, 'vacation', 10, 0),
(67, 20, 2024, 'sick', 15, 0),
(68, 20, 2024, 'casual', 5, 0),
(69, 20, 2024, 'vacation', 10, 0),
-- 2025 Allocations (with usage tracking)
(70, 21, 2025, 'sick', 15, 2),
(71, 22, 2025, 'sick', 15, 3),
(72, 22, 2025, 'casual', 5, 2),
(73, 22, 2025, 'vacation', 10, 1),
(74, 21, 2025, 'casual', 5, 2),
(75, 23, 2025, 'casual', 5, 4),
(76, 23, 2025, 'vacation', 10, 1);

-- ============================================
-- STEP 8: INSERT LEAVES
-- ============================================

INSERT INTO leaves (id, user_id, start_date, end_date, type, reason, status, approved_by, created_at) VALUES
(1, 7, '2024-08-15 07:00:00+00', '2024-08-22 07:00:00+00', 'vacation', 'Family vacation to Europe', 'approved', 3, '2025-11-30 00:03:13.361735+00'),
(2, 8, '2024-07-10 07:00:00+00', '2024-07-12 07:00:00+00', 'sick', 'Medical appointment and recovery', 'approved', 3, '2025-11-30 00:03:13.361735+00'),
(3, 10, '2024-09-05 07:00:00+00', '2024-09-12 07:00:00+00', 'vacation', 'Annual vacation', 'approved', 4, '2025-11-30 00:03:13.361735+00'),
(4, 11, '2024-07-20 07:00:00+00', '2024-07-21 07:00:00+00', 'casual', 'Personal matter', 'approved', 4, '2025-11-30 00:03:13.361735+00'),
(5, 13, '2024-10-10 07:00:00+00', '2024-10-17 07:00:00+00', 'vacation', 'Vacation', 'approved', 5, '2025-11-30 00:03:13.361735+00'),
(6, 15, '2024-07-05 07:00:00+00', '2024-07-06 07:00:00+00', 'sick', 'Medical leave', 'approved', 6, '2025-11-30 00:03:13.361735+00'),
(7, 9, '2024-11-20 08:00:00+00', '2024-11-27 08:00:00+00', 'vacation', 'Thanksgiving holiday', 'approved', 3, '2025-11-30 00:03:13.361735+00'),
(8, 10, '2024-08-01 07:00:00+00', '2024-08-02 07:00:00+00', 'casual', 'Family event', 'approved', 4, '2025-11-30 00:03:13.361735+00'),
(9, 1, '2024-09-15 07:00:00+00', '2024-09-20 07:00:00+00', 'vacation', 'Personal vacation', 'approved', 21, '2025-11-30 00:03:13.361735+00'),
(10, 22, '2024-11-05 08:00:00+00', '2024-11-08 08:00:00+00', 'vacation', 'Family time', 'approved', 21, '2025-11-30 00:03:13.361735+00'),
(11, 23, '2024-08-25 07:00:00+00', '2024-08-26 07:00:00+00', 'sick', 'Flu recovery', 'approved', 3, '2025-11-30 00:03:13.361735+00'),
(12, 3, '2024-12-20 08:00:00+00', '2024-12-27 08:00:00+00', 'vacation', 'Year-end vacation', 'approved', 21, '2025-11-30 00:03:13.361735+00'),
(13, 17, '2024-10-15 07:00:00+00', '2024-10-16 07:00:00+00', 'casual', 'Personal appointment', 'approved', 22, '2025-11-30 00:03:13.361735+00'),
(14, 21, '2025-12-03 00:00:00+00', '2025-12-04 00:00:00+00', 'sick', 'Sick', 'pending', NULL, '2025-12-02 04:59:40.574377+00'),
(15, 22, '2025-12-02 00:00:00+00', '2025-12-02 00:00:00+00', 'sick', NULL, 'approved', 21, '2025-12-02 05:16:06.10169+00'),
(17, 22, '2025-12-25 00:00:00+00', '2025-12-25 00:00:00+00', 'casual', NULL, 'approved', 21, '2025-12-02 05:34:36.663614+00'),
(18, 22, '2025-12-11 00:00:00+00', '2025-12-11 00:00:00+00', 'casual', NULL, 'approved', 21, '2025-12-02 05:35:41.627438+00'),
(21, 21, '2025-12-16 00:00:00+00', '2025-12-17 00:00:00+00', 'casual', 'Casual', 'pending', NULL, '2025-12-02 05:42:43.136573+00'),
(23, 23, '2025-12-02 08:00:00+00', '2025-12-05 08:00:00+00', 'casual', 'Casual', 'approved', 21, '2025-12-02 05:53:48.66343+00'),
(24, 22, '2025-12-02 08:00:00+00', '2025-12-03 08:00:00+00', 'sick', 'Sick', 'approved', 21, '2025-12-02 05:56:10.105644+00'),
(25, 23, '2025-12-16 08:00:00+00', '2025-12-16 08:00:00+00', 'vacation', 'family time', 'pending', NULL, '2025-12-02 10:18:38.076094+00');

-- ============================================
-- STEP 9: INSERT PERFORMANCES
-- ============================================

INSERT INTO performances (id, user_id, goal, rating, comments, reviewer_id, created_at, status) VALUES
(1, 7, 'Cloud migration and AWS certification', 5, 'Excellent technical skills and leadership. Successfully delivered cloud migration phase 1 ahead of schedule.', 3, '2025-11-30 00:03:13.361735+00', NULL),
(2, 8, 'Code quality improvements', 4, 'Strong performer with good attention to detail. Shows initiative in improving team processes.', 3, '2025-11-30 00:03:13.361735+00', NULL),
(3, 10, 'Sales targets Q3', 5, 'Consistently exceeds sales targets. Great client relationship management skills.', 4, '2025-11-30 00:03:13.361735+00', NULL),
(4, 11, 'Client relationship management', 4, 'Good performance with room for growth. Needs to improve on project deadline management.', 4, '2025-11-30 00:03:13.361735+00', NULL),
(5, 13, 'Marketing campaigns', 4, 'Creative and strategic thinker. Successfully launched two major campaigns this quarter.', 5, '2025-11-30 00:03:13.361735+00', NULL),
(6, 15, 'Financial analysis and reporting', 4, 'Reliable and accurate work. Good analytical skills and attention to financial details.', 6, '2025-11-30 00:03:13.361735+00', NULL),
(7, 1, 'Employee engagement initiatives', 5, 'Outstanding leadership in HR initiatives. Improved employee satisfaction significantly.', 21, '2025-11-30 00:03:13.361735+00', NULL),
(8, 22, 'Operations management', 4, 'Effective team leadership and good problem-solving abilities. Building a strong operations team.', 21, '2025-11-30 00:03:13.361735+00', NULL),
(9, 23, 'Learning and development', 3, 'Shows potential and eagerness to learn. Needs more experience with complex projects.', 3, '2025-11-30 00:03:13.361735+00', NULL),
(10, 3, 'Team scaling and mentorship', 5, 'Excellent leadership. Successfully grew the engineering team and established strong culture.', 21, '2025-11-30 00:03:13.361735+00', NULL),
(11, 17, 'Operations efficiency', 4, 'Good performance in streamlining operations processes. Reliable team member.', 22, '2025-11-30 00:03:13.361735+00', NULL);

-- ============================================
-- STEP 10: GRANT PERMISSIONS
-- ============================================

-- Grant all necessary permissions to peoplesoft_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO peoplesoft_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO peoplesoft_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO peoplesoft_user;

-- ============================================
-- STEP 11: RESET SEQUENCES
-- ============================================

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('review_cycles_id_seq', (SELECT MAX(id) FROM review_cycles));
SELECT setval('goals_id_seq', (SELECT MAX(id) FROM goals));
SELECT setval('leave_allocations_id_seq', (SELECT MAX(id) FROM leave_allocations));
SELECT setval('leaves_id_seq', (SELECT MAX(id) FROM leaves));
SELECT setval('performances_id_seq', (SELECT MAX(id) FROM performances));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data insertion
SELECT 'Departments' as table_name, COUNT(*) as record_count FROM departments
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees
UNION ALL
SELECT 'Review Cycles', COUNT(*) FROM review_cycles
UNION ALL
SELECT 'Goals', COUNT(*) FROM goals
UNION ALL
SELECT 'Leave Allocations', COUNT(*) FROM leave_allocations
UNION ALL
SELECT 'Leaves', COUNT(*) FROM leaves
UNION ALL
SELECT 'Performances', COUNT(*) FROM performances;

-- ============================================
-- DONE!
-- ============================================
-- Database has been reset to current production state
--
-- LOGIN CREDENTIALS (All passwords: PeopleSoft123 for peoplesoft accounts):
--   peoplesoftent.hr@gmail.com -> PeopleSoft123 (Carol Ferguson - Chief HR)
--   peoplesoftent.manager@gmail.com -> PeopleSoft123 (Frank Leonard - Operations Manager)
--   peoplesoftent.employee@gmail.com -> PeopleSoft123 (Amelie Griffith - Junior Software Engineer)
--
-- Other users follow pattern: FirstnameLast123 (e.g., JamesTaylor123)
--
-- REPORTING HIERARCHY:
-- Carol Ferguson (Chief HR Officer) - Top Level
--   ├─ Sarah Johnson (HR Director)
--   ├─ Michael Davis (HR Manager)
--   ├─ Robert Williams (Engineering Manager)
--   │   ├─ James Taylor (Senior Software Engineer)
--   │   ├─ Mary Thomas (Software Engineer)
--   │   ├─ John Jackson (Software Engineer)
--   │   └─ Amelie Griffith (Junior Software Engineer) [NEW REPORTING to Robert]
--   ├─ Jennifer Brown (Sales Manager)
--   │   ├─ Patricia White (Senior Sales Executive)
--   │   ├─ Christopher Harris (Sales Executive)
--   │   └─ Linda Martin (Sales Executive)
--   ├─ David Martinez (Marketing Manager)
--   │   ├─ Daniel Thompson (Marketing Specialist)
--   │   └─ Barbara Garcia (Content Marketing Manager)
--   ├─ Lisa Anderson (Finance Manager)
--   │   ├─ Matthew Rodriguez (Financial Analyst)
--   │   └─ Susan Martinez (Accountant)
--   └─ Frank Leonard (Operations Manager)
--       ├─ Anthony Hernandez (Operations Specialist)
--       ├─ Jessica Lopez (Customer Support Lead)
--       ├─ Mark Gonzalez (Operations Coordinator)
--       └─ Karen Wilson (Support Specialist) [Reports to Sarah Johnson (ID 1)]
