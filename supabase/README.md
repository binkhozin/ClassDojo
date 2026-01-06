# Supabase Database Schema

## Overview
This directory contains all database migrations for the ClassDojo web application.

## Migrations

### 1. `20240101000000_initial_schema.sql`
Creates the complete database schema with all tables, enums, indexes, and triggers.

**Enums:**
- `user_role`: teacher, parent, student, admin
- `behavior_type`: positive, negative
- `message_type`: general, announcement, behavior_report, progress_report
- `notification_type`: behavior_alert, message, reward, announcement
- `reset_frequency`: daily, weekly, monthly, never
- `parent_access`: view_only, full_access
- `relationship_type`: mother, father, guardian, other
- `requirement_type`: points_threshold, behavior_count, achievement
- `report_period`: weekly, monthly, term

**Tables:**
1. **users** - User profiles extending Supabase auth
2. **user_roles** - Multiple roles per user
3. **classes** - Classroom information
4. **class_settings** - Per-class configuration
5. **students** - Student profiles
6. **parent_student_link** - Parent-child relationships
7. **behavior_categories** - Behavior types
8. **behaviors** - Behavior incidents
9. **behavior_snapshots** - Leaderboard data
10. **rewards** - Reward definitions
11. **student_rewards** - Earned rewards
12. **badges** - Achievement badges
13. **student_badges** - Earned badges
14. **messages** - User messaging
15. **notifications** - System notifications
16. **assignments** - Homework/tasks
17. **assignment_submissions** - Student submissions
18. **progress_reports** - Progress reports

### 2. `20240101000001_rls_policies.sql`
Implements Row Level Security (RLS) policies for all tables.

**Security Model:**
- Teachers: Full access to their own classes, students, and related data
- Parents: Read access to their children's data only
- Students: Read access to their own data only
- Admin: Full access to all data

### 3. `20240101000002_views.sql`
Creates database views for common queries.

**Views:**
- `class_leaderboard` - Real-time class rankings with student points
- `student_current_points` - Current point totals for students
- `teacher_class_summary` - Overview statistics for teachers
- `parent_dashboard` - Parent-specific view with children's data
- `recent_activities` - Recent behavior logs with details

## Running Migrations

### Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run each migration in order:
   - First: `20240101000000_initial_schema.sql`
   - Second: `20240101000001_rls_policies.sql`
   - Third: `20240101000002_views.sql`

### Using Supabase CLI
```bash
# Initialize Supabase locally
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Database Diagram

```
users (auth.users)
  ├── user_roles (many-to-many)
  ├── classes (one-to-many as teacher)
  ├── behaviors (one-to-many as teacher)
  ├── messages (one-to-many as sender/recipient)
  ├── notifications (one-to-many)
  └── assignments (one-to-many as creator)

classes
  ├── class_settings (one-to-one)
  ├── students (one-to-many)
  ├── behavior_categories (one-to-many)
  ├── behaviors (one-to-many)
  ├── behavior_snapshots (one-to-many)
  ├── rewards (one-to-many)
  ├── badges (one-to-many)
  └── assignments (one-to-many)

students
  ├── parent_student_link (many-to-many with users)
  ├── behaviors (one-to-many)
  ├── behavior_snapshots (one-to-many)
  ├── student_rewards (one-to-many)
  ├── student_badges (one-to-many)
  ├── assignment_submissions (one-to-many)
  └── progress_reports (one-to-many)
```

## Key Features

### Automatic Timestamps
- All tables have `created_at` and `updated_at` (where applicable)
- Triggers automatically update `updated_at` on row updates

### Soft Deletes
- Uses CASCADE deletes for data integrity
- Parent records automatically clean up child records

### Indexes
- Optimized for common query patterns
- Foreign keys indexed for join performance
- Created_at fields indexed for time-based queries

## Security Considerations

1. **RLS Enabled**: All tables have Row Level Security enabled
2. **Auth Integration**: Uses Supabase auth.users as the foundation
3. **Role-based Access**: Policies enforce role-based data access
4. **Data Isolation**: Teachers can only see their own classes
5. **Privacy**: Parents only see their children's data

## Common Queries

### Get all classes for a teacher
```sql
SELECT * FROM classes WHERE teacher_id = 'user-id';
```

### Get leaderboard for a class
```sql
SELECT * FROM class_leaderboard WHERE class_id = 'class-id' ORDER BY rank;
```

### Get student's current points
```sql
SELECT * FROM student_current_points WHERE student_id = 'student-id';
```

### Get recent behaviors for a class
```sql
SELECT * FROM recent_activities WHERE class_id = 'class-id' LIMIT 20;
```

## Maintenance

### Backup
Supabase automatically handles backups, but you can also:
```bash
# Export schema
supabase db dump --schema public > backup.sql

# Export data
supabase db dump --data-only > data.sql
```

### Reset Database (Development Only)
```bash
supabase db reset
```

## Notes

- The `users` table extends `auth.users` with a foreign key relationship
- UUIDs are used for all primary keys
- Timestamps use `TIMESTAMPTZ` for timezone awareness
- All enums are strictly typed for data integrity
