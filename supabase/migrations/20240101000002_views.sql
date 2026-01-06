-- View for class leaderboard
CREATE OR REPLACE VIEW class_leaderboard AS
SELECT 
  s.id as student_id,
  s.class_id,
  s.first_name,
  s.last_name,
  s.avatar_url,
  COALESCE(SUM(b.points), 0) as total_points,
  COUNT(CASE WHEN b.points > 0 THEN 1 END) as good_behaviors,
  COUNT(CASE WHEN b.points < 0 THEN 1 END) as bad_behaviors,
  RANK() OVER (PARTITION BY s.class_id ORDER BY COALESCE(SUM(b.points), 0) DESC) as rank
FROM students s
LEFT JOIN behaviors b ON b.student_id = s.id
GROUP BY s.id, s.class_id, s.first_name, s.last_name, s.avatar_url;

-- View for student current points
CREATE OR REPLACE VIEW student_current_points AS
SELECT 
  s.id as student_id,
  s.class_id,
  s.first_name,
  s.last_name,
  COALESCE(SUM(b.points), 0) as total_points,
  COUNT(CASE WHEN b.points > 0 THEN 1 END) as good_behaviors_count,
  COUNT(CASE WHEN b.points < 0 THEN 1 END) as bad_behaviors_count,
  COUNT(b.id) as total_behaviors_count
FROM students s
LEFT JOIN behaviors b ON b.student_id = s.id
GROUP BY s.id, s.class_id, s.first_name, s.last_name;

-- View for teacher class summary
CREATE OR REPLACE VIEW teacher_class_summary AS
SELECT 
  c.id as class_id,
  c.teacher_id,
  c.name as class_name,
  c.grade,
  COUNT(DISTINCT s.id) as total_students,
  COUNT(DISTINCT b.id) as total_behaviors,
  COALESCE(SUM(CASE WHEN b.points > 0 THEN b.points ELSE 0 END), 0) as total_positive_points,
  COALESCE(SUM(CASE WHEN b.points < 0 THEN ABS(b.points) ELSE 0 END), 0) as total_negative_points,
  COUNT(DISTINCT CASE WHEN b.created_at >= NOW() - INTERVAL '7 days' THEN b.id END) as behaviors_this_week,
  COUNT(DISTINCT m.id) as unread_messages
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
LEFT JOIN behaviors b ON b.class_id = c.id
LEFT JOIN messages m ON (m.recipient_id = c.teacher_id AND m.is_read = FALSE)
GROUP BY c.id, c.teacher_id, c.name, c.grade;

-- View for parent dashboard
CREATE OR REPLACE VIEW parent_dashboard AS
SELECT 
  psl.parent_id,
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.avatar_url,
  c.id as class_id,
  c.name as class_name,
  c.grade,
  u.full_name as teacher_name,
  COALESCE(SUM(b.points), 0) as total_points,
  COUNT(CASE WHEN b.points > 0 THEN 1 END) as good_behaviors,
  COUNT(CASE WHEN b.points < 0 THEN 1 END) as bad_behaviors,
  COUNT(DISTINCT CASE WHEN b.created_at >= NOW() - INTERVAL '7 days' THEN b.id END) as behaviors_this_week
FROM parent_student_link psl
JOIN students s ON s.id = psl.student_id
JOIN classes c ON c.id = s.class_id
JOIN users u ON u.id = c.teacher_id
LEFT JOIN behaviors b ON b.student_id = s.id
GROUP BY psl.parent_id, s.id, s.first_name, s.last_name, s.avatar_url, c.id, c.name, c.grade, u.full_name;

-- View for recent activities
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
  b.id,
  'behavior' as activity_type,
  b.class_id,
  b.student_id,
  s.first_name || ' ' || s.last_name as student_name,
  bc.name as behavior_name,
  bc.type as behavior_type,
  b.points,
  b.note,
  b.created_at,
  u.full_name as teacher_name
FROM behaviors b
JOIN students s ON s.id = b.student_id
JOIN behavior_categories bc ON bc.id = b.category_id
JOIN users u ON u.id = b.teacher_id
ORDER BY b.created_at DESC;
