# ClassDojo Web Application

A comprehensive classroom management and behavior tracking system built with modern web technologies.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend/Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Date Handling**: date-fns

## Features

### User Roles
- **Teachers**: Manage classes, students, track behavior, create rewards and badges
- **Parents**: View children's progress, communicate with teachers
- **Students**: Track own progress, view earned rewards and badges
- **Admin**: Full system access

### Core Functionality
- 📚 **Class Management**: Create and manage multiple classes
- 👥 **Student Management**: Add students, track profiles
- ⭐ **Behavior Tracking**: Record positive and negative behaviors
- 🏆 **Rewards System**: Create and award rewards to students
- 🎖️ **Badges & Achievements**: Define and award achievement badges
- 📊 **Leaderboards**: Track student rankings by points
- 💬 **Messaging**: Communication between teachers and parents
- 🔔 **Notifications**: Real-time updates for important events
- 📝 **Assignments**: Create and track homework/assignments
- 📈 **Progress Reports**: Generate detailed student progress reports
- 📉 **Analytics**: Visual insights with charts and statistics

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Supabase client configuration
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
│       ├── 20240101000000_initial_schema.sql
│       ├── 20240101000001_rls_policies.sql
│       └── 20240101000002_views.sql
└── ...config files
```

## Database Schema

### Tables
- **users** - User profiles (extends Supabase auth)
- **user_roles** - Multiple roles per user support
- **classes** - Classroom information
- **class_settings** - Per-class configuration
- **students** - Student profiles
- **parent_student_link** - Parent-child relationships
- **behavior_categories** - Behavior types (positive/negative)
- **behaviors** - Behavior incidents
- **behavior_snapshots** - Leaderboard data
- **rewards** - Reward definitions
- **student_rewards** - Earned rewards
- **badges** - Achievement badge definitions
- **student_badges** - Earned badges
- **messages** - User-to-user messaging
- **notifications** - System notifications
- **assignments** - Homework/tasks
- **assignment_submissions** - Student submissions
- **progress_reports** - Generated progress reports

### Database Views
- **class_leaderboard** - Real-time class rankings
- **student_current_points** - Current point totals
- **teacher_class_summary** - Class overview stats
- **parent_dashboard** - Parent-specific view
- **recent_activities** - Recent behavior logs

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your project URL and anon key

4. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run database migrations**

In your Supabase dashboard:
- Go to SQL Editor
- Run the migrations in order:
  1. `supabase/migrations/20240101000000_initial_schema.sql`
  2. `supabase/migrations/20240101000001_rls_policies.sql`
  3. `supabase/migrations/20240101000002_views.sql`

Alternatively, if you have Supabase CLI installed:
```bash
supabase db push
```

6. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security Features

- **Row Level Security (RLS)**: All tables are protected with RLS policies
- **Role-based Access Control**: Users can only access data relevant to their role
- **Teacher Isolation**: Teachers only see their own classes and students
- **Parent Privacy**: Parents only see their own children's data
- **Student Privacy**: Students only see their own data

## Development Guidelines

### Adding New Features
1. Create TypeScript types in `src/types/`
2. Add database migrations in `supabase/migrations/`
3. Create components in `src/components/`
4. Add pages in `src/pages/`
5. Use TanStack Query for data fetching

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Use shadcn/ui components for consistency
- Implement proper error handling
- Add loading states for async operations

## Future Enhancements

- [ ] Real-time updates with Supabase subscriptions
- [ ] File upload for student avatars
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for teachers
- [ ] Parent mobile app
- [ ] Integration with Google Classroom
- [ ] Custom themes per class
- [ ] Export data to CSV/PDF

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Vite + React + TypeScript + Supabase
