# Performance Management Module - Setup Guide

This guide explains how to set up and use the new Performance Management Module that has been integrated into your PeopleSoft application.

## Overview

The Performance Management Module includes:
- **Performance Cycles**: Quarterly, Half-Yearly, and Annual review cycles
- **Goals Management**: Create, track, and manage performance goals
- **Performance Reviews**: Self-assessments and manager reviews with ratings
- **Analytics Dashboard**: Role-based performance analytics
- **AI Chatbot**: OpenAI-powered assistant for performance queries
- **Surveys**: Employee engagement surveys

## Prerequisites

1. Go 1.20+ installed
2. Node.js 18+ and npm installed
3. PostgreSQL database running
4. OpenAI API key (optional, for chatbot functionality)

## Backend Setup

### 1. Install Go Dependencies

```bash
cd backend
go get github.com/sashabaranov/go-openai
go mod tidy
```

### 2. Environment Variables

Add to your `.env` file in the `backend/` directory:

```env
# Existing variables
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=peoplesoft_db
DB_PORT=5432
JWT_SECRET=mysecretkey

# New variable for AI chatbot (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The chatbot will work without OpenAI API key, but will return a message indicating the service is not configured.

### 3. Database Migration

The new tables will be automatically created when you run the backend (via GORM AutoMigrate). The following tables are created:

- `performance_cycles`
- `performance_goals`
- `performance_reviews`
- `survey_templates`
- `survey_responses`
- `chatbot_conversations`
- `audit_logs`

### 4. Run Backend

```bash
cd backend
go run main.go
```

The backend will start on `http://localhost:8080`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install react-bootstrap bootstrap
```

### 2. Run Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## New API Endpoints

### Performance Cycles
- `POST /api/performance/cycles` - Create cycle (HR only)
- `GET /api/performance/cycles` - List cycles
- `GET /api/performance/cycles/:id` - Get cycle details

### Goals
- `POST /api/performance/goals` - Create goal (Manager/HR)
- `GET /api/performance/goals` - List goals (role-filtered)
- `PUT /api/performance/goals/:id` - Update goal
- `POST /api/performance/goals/:id/acknowledge` - Acknowledge goal (Employee)

### Reviews
- `GET /api/performance/reviews` - List reviews (role-filtered)
- `POST /api/performance/reviews/:id/self-assessment` - Submit self-assessment (Employee)
- `POST /api/performance/reviews/:id/manager-review` - Submit manager review (Manager/HR)
- `POST /api/performance/reviews/:id/response` - Employee response to review
- `GET /api/performance/reviews/reports` - Performance reports (Manager/HR)

### Analytics
- `GET /api/performance/analytics/dashboard` - Dashboard data (Manager/HR)
- `GET /api/performance/analytics/trends` - Performance trends (HR only)

### Chatbot
- `POST /api/chatbot/query` - Process chatbot query
- `POST /api/chatbot/actions/schedule-meeting` - Schedule meeting
- `POST /api/chatbot/actions/generate-report` - Generate report

### Surveys
- `POST /api/surveys/templates` - Create survey template (HR)
- `GET /api/surveys/templates` - List templates
- `POST /api/surveys/responses` - Submit survey response
- `GET /api/surveys/analytics` - Survey analytics (HR)

## Frontend Routes

### New Pages
- `/performance/dashboard` - Performance Dashboard (all roles, different views)
- `/performance/goals` - Goals Management
- `/performance/reviews` - Performance Reviews
- `/performance/analytics` - Analytics (Manager/HR only)

### Chatbot Widget
The chatbot widget appears as a floating button on all pages. Click it to open the AI assistant.

## Role-Based Access

### Employee
- View own goals
- Submit self-assessments
- Acknowledge goals
- Respond to reviews
- View own performance data

### Manager
- Create goals for team members
- Submit manager reviews
- View team performance analytics
- Access team dashboard
- Use chatbot for team insights

### HR
- Create performance cycles
- View all performance data
- Access company-wide analytics
- Create survey templates
- Full system access

## Usage Examples

### Creating a Performance Cycle (HR)

1. Navigate to Performance Dashboard
2. Click "Create Cycle" (if available)
3. Fill in cycle details:
   - Cycle Name: "Q1 2024"
   - Cycle Type: "Quarterly"
   - Start Date: 2024-01-01
   - End Date: 2024-03-31
   - Set deadlines for goals, self-assessment, and manager review

### Creating a Goal (Manager/HR)

1. Navigate to Performance Goals
2. Click "Create Goal"
3. Fill in:
   - Select employee
   - Enter goal title and description
   - Set priority and category
   - Set target date

### Submitting Self-Assessment (Employee)

1. Navigate to Performance Reviews
2. Find a review that needs self-assessment
3. Click "Submit Self Assessment"
4. Fill in:
   - Self assessment text
   - Achievements
   - Challenges
   - Comments

### Using the Chatbot

1. Click the floating chatbot button (💬) on any page
2. Try example queries:
   - "Show worst performers in my team last month"
   - "Show my goals due this month"
   - "Team performance summary"
3. The AI will process your query and provide insights

## Troubleshooting

### Backend Issues

1. **Database connection errors**: Check your `.env` file and ensure PostgreSQL is running
2. **Migration errors**: Ensure all existing models are properly defined
3. **OpenAI errors**: Check if `OPENAI_API_KEY` is set correctly, or the chatbot will work in limited mode

### Frontend Issues

1. **Bootstrap not working**: Ensure `react-bootstrap` and `bootstrap` are installed
2. **API errors**: Check that the backend is running on port 8080
3. **Authentication errors**: Ensure JWT token is stored in localStorage

## Next Steps

1. **Configure OpenAI API Key**: Get your API key from https://platform.openai.com/
2. **Create Performance Cycles**: Set up your first performance cycle
3. **Assign Goals**: Managers can start assigning goals to team members
4. **Train Users**: Guide employees on using self-assessments and the chatbot

## Support

For issues or questions, refer to the main README.md or contact your development team.



