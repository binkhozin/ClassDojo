# ClassDojo Gamification System

## Overview

The gamification system enhances student engagement through behavior tracking, points, rewards, badges, and leaderboards. This document provides an overview of the key features and how they work together.

## Key Features

### 1. Behavior Logging

- **Real-time logging**: Teachers can quickly log student behaviors with points
- **Categories**: Predefined behavior categories with point values
- **Notes**: Optional notes for context
- **Keyboard shortcuts**: Ctrl+S to save for fast logging
- **Animations**: Confetti and floating points on successful logs

### 2. Behavior History

- **Comprehensive filtering**: By student, category, date range, behavior type
- **Search functionality**: Find behaviors by student name
- **Sorting options**: Newest, oldest, by points, by student name
- **Bulk actions**: Select multiple behaviors for deletion
- **Real-time updates**: New behaviors appear instantly

### 3. Leaderboard System

- **Real-time rankings**: Students ranked by total points
- **Multiple time periods**: Today, This Week, This Month, All Time
- **Visual indicators**: Medals for top 3 (🥇, 🥈, 🥉)
- **Trend indicators**: Up/down arrows for rank changes
- **Export functionality**: Download leaderboard as CSV
- **Animations**: Smooth rank transitions and point changes

### 4. Student Performance Dashboard

- **Comprehensive analytics**: Points, behaviors, streaks, rewards, badges
- **Visual charts**: Line charts, pie charts, bar charts
- **Time-based analysis**: Weekly and monthly progress
- **Comparison mode**: Student vs class average
- **Export/print**: Generate reports

### 5. Rewards Management

- **Reward creation**: Name, description, point cost, icon, color
- **Redemption system**: Students can redeem rewards with points
- **Inventory management**: Enable/disable rewards
- **Redemption history**: Track when rewards were redeemed
- **Bulk actions**: Enable/disable multiple rewards

### 6. Badges & Achievements

- **Badge types**: Points threshold, behavior count, special achievements
- **Automatic awarding**: Badges awarded when requirements met
- **Manual awarding**: Teachers can manually award badges
- **Progress tracking**: See which students earned each badge
- **Visual display**: Badge icons and progress bars

### 7. Gamification Animations

- **Confetti**: Celebration on behavior logs, rewards, badges
- **Floating points**: Visual feedback for point changes
- **Notifications**: Toast notifications for achievements
- **Streak indicators**: Visual representation of student streaks
- **Level-up animations**: Full-screen celebrations for milestones

### 8. Streak System

- **Consecutive tracking**: Track consecutive positive behaviors
- **Milestones**: 3-day, 7-day, 30-day streaks
- **Visual indicators**: Fire icons and progress bars
- **Notifications**: Alerts when streaks are achieved or broken

### 9. Real-time Notifications

- **Notification center**: Bell icon with unread count
- **Notification types**: Behavior logged, reward redeemed, badge earned, milestones
- **Toast notifications**: Auto-dismissing alerts
- **History panel**: View all notifications
- **Management**: Mark as read, clear all

## Technical Implementation

### Database Tables

- `behaviors`: Logs of student behaviors with points
- `rewards`: Available rewards with point costs
- `student_rewards`: Record of redeemed rewards
- `badges`: Available badges with requirements
- `student_badges`: Record of earned badges
- `behavior_snapshots`: Student point totals and rankings
- `notifications`: User notifications

### Custom Hooks

- `useLogBehavior`: Log behaviors and handle badge eligibility
- `useBehaviorHistory`: Fetch and filter behavior history
- `useStudentPoints`: Track student points and history
- `useLeaderboard`: Calculate and update leaderboard data
- `useRewardRedemption`: Handle reward redemption logic
- `useAwardBadge`: Award badges to students
- `useStreaks`: Calculate and track student streaks

### Components

- **Pages**: LogBehaviorPage, BehaviorLogPage, LeaderboardPage, StudentPerformancePage, RewardsManagementPage, BadgesPage
- **Gamification**: ConfettiAnimation, PointsFloatingAnimation, RewardNotification, BadgeNotification, StreakIndicator, LevelUpAnimation
- **UI**: Leaderboard, NotificationCenter

### Real-time Features

- **Supabase real-time**: WebSocket subscriptions for instant updates
- **React Query**: Caching and automatic refetching
- **Animations**: Framer Motion for smooth transitions
- **Notifications**: Sonner for toast notifications

## Usage Examples

### Logging a Behavior

1. Navigate to "Behavior Log" page
2. Select student from dropdown
3. Select behavior category
4. Add optional notes
5. Click "Log Behavior" or press Ctrl+S
6. See confetti animation and points update

### Awarding a Badge

1. Navigate to "Badges" page
2. Click "Award" on desired badge
3. Select student from dropdown
4. Click "Award Badge"
5. Student receives notification

### Redeeming a Reward

1. Navigate to "Rewards" page
2. Click "Redeem" on desired reward
3. Select student from dropdown
4. System checks point balance
5. Click "Confirm Redemption"
6. Points are deducted and reward is recorded

## Performance Considerations

- **Database views**: Used for complex leaderboard queries
- **Query caching**: TanStack Query for efficient data fetching
- **Debounced updates**: Limit real-time update frequency
- **Virtualized lists**: For large behavior history datasets
- **Lazy loading**: Animation components load on demand

## Future Enhancements

- **Parent notifications**: Alert parents about student achievements
- **Class comparisons**: Compare performance across multiple classes
- **Custom badges**: Allow students to design their own badges
- **Reward catalog**: Predefined reward templates
- **Advanced analytics**: Predictive performance insights