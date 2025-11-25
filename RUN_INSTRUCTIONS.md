# Step-by-Step Instructions to Run Performance Management Module

## Prerequisites Check

Before starting, ensure you have:
- ✅ Go 1.20+ installed (`go version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL running and accessible
- ✅ Database `peoplesoft_db` created

---

## Step 1: Install Backend Dependencies

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install the OpenAI Go client:

```bash
go get github.com/sashabaranov/go-openai
go mod tidy
```

**Expected output:** Dependencies downloaded successfully.

---

## Step 2: Install Frontend Dependencies

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

Install npm packages (including react-bootstrap):

```bash
npm install
```

**Expected output:** Packages installed, including `react-bootstrap` and `bootstrap`.

---

## Step 3: Configure Environment Variables

In the `backend/` directory, create or update the `.env` file:

```bash
# If .env doesn't exist, create it
# Windows: type nul > .env
# Mac/Linux: touch .env
```

Add these variables to `backend/.env`:

```env
# Database Configuration (update with your values)
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=peoplesoft_db
DB_PORT=5432

# JWT Secret (keep your existing value)
JWT_SECRET=mysecretkey

# OpenAI API Key (OPTIONAL - chatbot works without it)
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** 
- Update database credentials if different
- OpenAI API key is optional - get it from https://platform.openai.com/ if you want full chatbot functionality
- Without API key, chatbot will show "service not configured" message

---

## Step 4: Verify PostgreSQL is Running

Check if PostgreSQL is running:

```bash
# Windows (PowerShell)
Get-Service -Name postgresql*

# Mac/Linux
sudo systemctl status postgresql
# OR
pg_isready
```

If not running, start PostgreSQL:
- **Windows:** Services → PostgreSQL → Start
- **Mac/Linux:** `sudo systemctl start postgresql`

---

## Step 5: Start the Backend Server

In the terminal where you installed backend dependencies:

```bash
cd backend
go run main.go
```

**Expected output:**
```
✅ Connected to PostgreSQL (schema=public)
Backend running on :8080
```

**If you see errors:**
- Database connection error → Check `.env` file and PostgreSQL is running
- Port 8080 in use → Change port in `main.go` or stop other service
- Migration errors → Check database permissions

**Keep this terminal open!**

---

## Step 6: Start the Frontend Server

Open a **new terminal** (keep backend running):

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

## Step 7: Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. Login with your existing credentials

---

## Step 8: Test the Performance Module

### As Any User:
1. Click on **"Performance Dashboard"** in navigation (or go to `/performance/dashboard`)
2. You should see role-based dashboard with metrics

### As Employee:
1. Go to **"My Goals"** (`/performance/goals`)
2. View your assigned goals
3. Try acknowledging a goal

### As Manager/HR:
1. Go to **"Analytics"** (`/performance/analytics`)
2. View performance reports and statistics

### Test the Chatbot:
1. Look for the floating **💬** button (bottom-right corner)
2. Click it to open the AI assistant
3. Try these queries:
   - **Employee:** "Show my goals due this month"
   - **Manager:** "Show worst performers in my team"
   - **HR:** "Show company-wide analytics"

---

## Step 9: Create Your First Performance Cycle (HR Only)

1. Login as HR user
2. Navigate to Performance Dashboard
3. Create a new cycle:
   - Cycle Name: "Q1 2024"
   - Cycle Type: "Quarterly"
   - Start Date: 2024-01-01
   - End Date: 2024-03-31
   - Set deadlines

---

## Step 10: Create Goals (Manager/HR)

1. Login as Manager or HR
2. Go to **"My Goals"** (`/performance/goals`)
3. Click **"Create Goal"**
4. Fill in:
   - Select employee
   - Enter title and description
   - Set priority (High/Medium/Low)
   - Set target date

---

## Troubleshooting

### Backend Won't Start

**Error: "DB connection failed"**
```bash
# Check PostgreSQL is running
# Verify .env file has correct credentials
# Test connection:
psql -U postgres -d peoplesoft_db
```

**Error: "port 8080 already in use"**
```bash
# Find what's using port 8080
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -i :8080
# Kill the process or change port in main.go
```

**Error: "package not found"**
```bash
cd backend
go mod tidy
go get github.com/sashabaranov/go-openai
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "port 5173 already in use"**
- Close other Vite servers or change port in `vite.config.js`

### Database Errors

**Error: "relation does not exist"**
- Tables are auto-created on first run
- Check backend logs for migration errors
- Verify database user has CREATE permissions

**Error: "connection refused"**
- Ensure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in `.env`

### Chatbot Not Working

**Shows "service not configured"**
- This is normal if `OPENAI_API_KEY` is not set
- Add your API key to `backend/.env` for full functionality
- Get key from: https://platform.openai.com/

**Shows "authentication failed"**
- Check API key is correct
- Verify key has credits/usage available

---

## Quick Commands Reference

```bash
# Start Backend
cd backend && go run main.go

# Start Frontend
cd frontend && npm run dev

# Install Backend Dependencies
cd backend && go get github.com/sashabaranov/go-openai && go mod tidy

# Install Frontend Dependencies
cd frontend && npm install

# Check Go Version
go version

# Check Node Version
node --version

# Check PostgreSQL
pg_isready
```

---

## What's Next?

After everything is running:

1. ✅ **Create Performance Cycles** (HR)
2. ✅ **Assign Goals** (Manager/HR)
3. ✅ **Submit Self-Assessments** (Employee)
4. ✅ **Complete Manager Reviews** (Manager)
5. ✅ **View Analytics** (Manager/HR)
6. ✅ **Use AI Chatbot** for insights

---

## Need Help?

- Check `PERFORMANCE_MODULE_SETUP.md` for detailed setup
- Check `IMPLEMENTATION_SUMMARY.md` for feature overview
- Review backend logs for errors
- Check browser console (F12) for frontend errors

---

## Success Indicators

You'll know everything is working when:

✅ Backend shows: "Backend running on :8080"  
✅ Frontend shows: "Local: http://localhost:5173/"  
✅ You can login successfully  
✅ Performance Dashboard loads  
✅ Chatbot button (💬) appears  
✅ No errors in browser console  

**Happy coding! 🚀**

