# Quick Start Guide - Performance Management Module

## 🚀 How to Run

### Step 1: Install Dependencies

#### Backend (Go)
```bash
cd backend
go get github.com/sashabaranov/go-openai
go mod tidy
```

#### Frontend (Node.js)
```bash
cd frontend
npm install
```

### Step 2: Set Up Environment Variables

Create or update `backend/.env`:
```env
# Database (existing)
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=peoplesoft_db
DB_PORT=5432
JWT_SECRET=mysecretkey

# OpenAI API Key (optional - chatbot works without it)
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Start PostgreSQL

Make sure PostgreSQL is running on your system.

### Step 4: Run Backend

```bash
cd backend
go run main.go
```

The backend will:
- Connect to PostgreSQL
- Auto-migrate all tables (including new performance tables)
- Start on `http://localhost:8080`

### Step 5: Run Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 6: Access the Application

1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Navigate to:
   - **Performance Dashboard**: `/performance/dashboard`
   - **Goals**: `/performance/goals`
   - **Reviews**: `/performance/reviews`
   - **Analytics**: `/performance/analytics` (Manager/HR only)

### Step 7: Try the Chatbot

1. Look for the floating 💬 button (bottom-right)
2. Click it to open the AI assistant
3. Try queries like:
   - "Show my goals due this month"
   - "Show worst performers in my team" (Manager)
   - "Team performance summary" (Manager)

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file has correct database credentials
- Check port 8080 is not in use

### Frontend won't start
- Run `npm install` in frontend directory
- Check port 5173 is not in use
- Verify Node.js 18+ is installed

### Database errors
- Ensure PostgreSQL is running
- Check database `peoplesoft_db` exists
- Verify user has permissions

### Chatbot not working
- Check `OPENAI_API_KEY` in `.env` (optional)
- Without API key, chatbot shows "service not configured" message
- Get API key from: https://platform.openai.com/

## 📝 First Steps After Running

1. **As HR**: Create a performance cycle
2. **As Manager**: Create goals for team members
3. **As Employee**: View goals and submit self-assessments
4. **Try Chatbot**: Click the 💬 button and ask questions

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can login with existing credentials
- [ ] Can access Performance Dashboard
- [ ] Can view/create goals (based on role)
- [ ] Chatbot widget appears and opens
- [ ] Can submit self-assessment (as employee)
- [ ] Can submit manager review (as manager)

