-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Teachers can view users in their classes"
  ON users FOR SELECT
  USING (
    role = 'admin' OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Classes policies
CREATE POLICY "Teachers can view their own classes"
  ON classes FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (teacher_id = auth.uid());

CREATE POLICY "Parents can view classes of their children"
  ON classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.class_id = classes.id AND psl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own classes"
  ON classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.class_id = classes.id AND s.user_id = auth.uid()
    )
  );

-- Class settings policies
CREATE POLICY "Teachers can manage settings for their classes"
  ON class_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_settings.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Students policies
CREATE POLICY "Teachers can manage students in their classes"
  ON students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_link psl
      WHERE psl.student_id = students.id AND psl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own profile"
  ON students FOR SELECT
  USING (user_id = auth.uid());

-- Parent-student link policies
CREATE POLICY "Teachers can manage parent-student links"
  ON parent_student_link FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = parent_student_link.student_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their own links"
  ON parent_student_link FOR SELECT
  USING (parent_id = auth.uid());

-- Behavior categories policies
CREATE POLICY "Teachers can manage behavior categories in their classes"
  ON behavior_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = behavior_categories.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents and students can view behavior categories"
  ON behavior_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = behavior_categories.class_id
      AND (
        c.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM students s
          JOIN parent_student_link psl ON psl.student_id = s.id
          WHERE s.class_id = c.id AND psl.parent_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM students s
          WHERE s.class_id = c.id AND s.user_id = auth.uid()
        )
      )
    )
  );

-- Behaviors policies
CREATE POLICY "Teachers can manage behaviors in their classes"
  ON behaviors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = behaviors.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view behaviors of their children"
  ON behaviors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.id = behaviors.student_id AND psl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own behaviors"
  ON behaviors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = behaviors.student_id AND s.user_id = auth.uid()
    )
  );

-- Behavior snapshots policies
CREATE POLICY "Teachers can manage snapshots in their classes"
  ON behavior_snapshots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = behavior_snapshots.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view snapshots of their children"
  ON behavior_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.id = behavior_snapshots.student_id AND psl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own snapshots"
  ON behavior_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = behavior_snapshots.student_id AND s.user_id = auth.uid()
    )
  );

-- Rewards policies
CREATE POLICY "Teachers can manage rewards in their classes"
  ON rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = rewards.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents and students can view rewards"
  ON rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = rewards.class_id
      AND (
        c.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM students s
          JOIN parent_student_link psl ON psl.student_id = s.id
          WHERE s.class_id = c.id AND psl.parent_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM students s
          WHERE s.class_id = c.id AND s.user_id = auth.uid()
        )
      )
    )
  );

-- Student rewards policies
CREATE POLICY "Teachers can manage student rewards"
  ON student_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = student_rewards.student_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents and students can view earned rewards"
  ON student_rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_rewards.student_id
      AND (
        s.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM parent_student_link psl
          WHERE psl.student_id = s.id AND psl.parent_id = auth.uid()
        )
      )
    )
  );

-- Badges policies
CREATE POLICY "Teachers can manage badges in their classes"
  ON badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = badges.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents and students can view badges"
  ON badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = badges.class_id
      AND (
        c.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM students s
          JOIN parent_student_link psl ON psl.student_id = s.id
          WHERE s.class_id = c.id AND psl.parent_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM students s
          WHERE s.class_id = c.id AND s.user_id = auth.uid()
        )
      )
    )
  );

-- Student badges policies
CREATE POLICY "Teachers can manage student badges"
  ON student_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = student_badges.student_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents and students can view earned badges"
  ON student_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_badges.student_id
      AND (
        s.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM parent_student_link psl
          WHERE psl.student_id = s.id AND psl.parent_id = auth.uid()
        )
      )
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update messages (mark as read)"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Assignments policies
CREATE POLICY "Teachers can manage assignments in their classes"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = assignments.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view assignments in their classes"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.class_id = assignments.class_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view assignments for their children's classes"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.class_id = assignments.class_id AND psl.parent_id = auth.uid()
    )
  );

-- Assignment submissions policies
CREATE POLICY "Teachers can manage all submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classes c ON c.id = a.class_id
      WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage their own submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = assignment_submissions.student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's submissions"
  ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.id = assignment_submissions.student_id AND psl.parent_id = auth.uid()
    )
  );

-- Progress reports policies
CREATE POLICY "Teachers can manage progress reports"
  ON progress_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = progress_reports.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's progress reports"
  ON progress_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN parent_student_link psl ON psl.student_id = s.id
      WHERE s.id = progress_reports.student_id AND psl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own progress reports"
  ON progress_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress_reports.student_id AND s.user_id = auth.uid()
    )
  );

-- Admin policies (can see everything)
CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to classes"
  ON classes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
