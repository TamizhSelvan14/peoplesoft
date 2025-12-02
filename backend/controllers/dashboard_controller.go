package controllers

import (
	"fmt"
	"net/http"
	"peoplesoft/config"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	PendingLeaves   int64 `json:"pendingLeaves"`
	UpcomingReviews int64 `json:"upcomingReviews"`
	ActiveGoals     int64 `json:"activeGoals"`
	TeamSize        int64 `json:"teamSize"`
}

type UpcomingEvent struct {
	Date  string `json:"date"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
}

type QuarterlyResults struct {
	Quarter               string  `json:"quarter"`
	Year                  int     `json:"year"`
	AvgPerformance        float64 `json:"avg_performance"`
	GoalsCompleted        int64   `json:"goals_completed"`
	TotalGoals            int64   `json:"total_goals"`
	GoalsCompletedPercent int     `json:"goals_completed_percent"`
	EngagementScore       int     `json:"engagement_score"`
	EngagementTrend       string  `json:"engagement_trend"`
	EngagementChange      int     `json:"engagement_change"`
	ReviewsCompleted      int64   `json:"reviews_completed"`
	ReviewsPending        int64   `json:"reviews_pending"`
}

type TopPerformer struct {
	Name        string  `json:"name"`
	Designation string  `json:"designation"`
	Score       float64 `json:"score"`
}

type RecentActivity struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Details string `json:"details"`
	Time    string `json:"time"`
}

func GetDashboardStats(c *gin.Context) {
	email := c.GetString("email")
	role := c.GetString("role")

	fmt.Printf("\n=== Dashboard Stats Request ===\n")
	fmt.Printf("Email: %s, Role: %s\n", email, role)

	// Get user ID from users table
	var userID uint
	err := config.DB.Table("users").Select("id").Where("email = ?", email).Scan(&userID).Error
	if err != nil {
		fmt.Printf("Error getting user ID: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}
	fmt.Printf("User ID from users table: %d\n", userID)

	stats := DashboardStats{}

	// For HR role with peoplesoftent.hr@gmail.com, let's count ALL pending leaves
	if role == "hr" {
		// Count all pending leaves in the system (including HR's own)
		config.DB.Table("leaves").Where("status = ?", "pending").Count(&stats.PendingLeaves)
		fmt.Printf("HR - Total Pending Leaves in system (including own): %d\n", stats.PendingLeaves)

		// Count all goals (for testing)
		var totalGoals int64
		config.DB.Table("goals").Count(&totalGoals)
		fmt.Printf("HR - Total Goals in system: %d\n", totalGoals)

		// Count all active goals (accepted and in progress, not yet approved/completed)
		config.DB.Table("goals").
			Where("status IN (?)", []string{"accepted", "employee_accepted", "manager_accepted", "in_progress", "in-progress", "pending", "submitted"}).
			Count(&stats.ActiveGoals)
		fmt.Printf("HR - Active Goals: %d\n", stats.ActiveGoals)

		// Count all performances in progress + goals submitted for approval
		var performanceReviews int64
		config.DB.Table("performances").
			Where("status IN (?)", []string{"in_progress", "in-progress", "pending"}).
			Count(&performanceReviews)

		var goalsSubmitted int64
		config.DB.Table("goals").
			Where("status = ?", "submitted").
			Count(&goalsSubmitted)

		stats.UpcomingReviews = performanceReviews + goalsSubmitted
		fmt.Printf("HR - Upcoming Reviews (Performance: %d + Goals Submitted: %d = Total: %d)\n", performanceReviews, goalsSubmitted, stats.UpcomingReviews)

		// Count all employees
		config.DB.Table("employees").Count(&stats.TeamSize)
		fmt.Printf("HR - Team Size: %d\n", stats.TeamSize)

	} else if role == "manager" {
		// Manager sees their team's data + their own

		// Count team members' pending leaves
		var teamLeaves int64
		config.DB.Table("leaves l").
			Joins("JOIN employees e ON l.user_id = e.user_id").
			Where("e.manager_id = ? AND l.status = ?", userID, "pending").
			Count(&teamLeaves)

		// Count manager's own pending leaves
		var ownLeaves int64
		config.DB.Table("leaves").
			Where("user_id = ? AND status = ?", userID, "pending").
			Count(&ownLeaves)

		// Total = team + own
		stats.PendingLeaves = teamLeaves + ownLeaves
		fmt.Printf("Manager - Pending Leaves (Team: %d + Own: %d = Total: %d)\n", teamLeaves, ownLeaves, stats.PendingLeaves)

		// Count team's active goals
		var teamGoals int64
		config.DB.Table("goals g").
			Joins("JOIN employees e ON g.user_id = e.user_id").
			Where("e.manager_id = ? AND g.status IN (?)", userID, []string{"accepted", "employee_accepted", "manager_accepted", "in_progress", "in-progress", "pending", "submitted"}).
			Count(&teamGoals)

		// Count manager's own active goals
		var ownGoals int64
		config.DB.Table("goals").
			Where("user_id = ? AND status IN (?)", userID, []string{"accepted", "employee_accepted", "manager_accepted", "in_progress", "in-progress", "pending", "submitted"}).
			Count(&ownGoals)

		// Total = team + own
		stats.ActiveGoals = teamGoals + ownGoals
		fmt.Printf("Manager - Active Goals (Team: %d + Own: %d = Total: %d)\n", teamGoals, ownGoals, stats.ActiveGoals)

		// Count team's upcoming reviews (performances + submitted goals)
		var teamPerformanceReviews int64
		config.DB.Table("performances p").
			Joins("JOIN employees e ON p.user_id = e.user_id").
			Where("e.manager_id = ? AND p.status IN (?)", userID, []string{"in_progress", "in-progress", "pending"}).
			Count(&teamPerformanceReviews)

		var teamGoalsSubmitted int64
		config.DB.Table("goals g").
			Joins("JOIN employees e ON g.user_id = e.user_id").
			Where("e.manager_id = ? AND g.status = ?", userID, "submitted").
			Count(&teamGoalsSubmitted)

		// Count manager's own upcoming reviews (performances + submitted goals)
		var ownPerformanceReviews int64
		config.DB.Table("performances").
			Where("user_id = ? AND status IN (?)", userID, []string{"in_progress", "in-progress", "pending"}).
			Count(&ownPerformanceReviews)

		var ownGoalsSubmitted int64
		config.DB.Table("goals").
			Where("user_id = ? AND status = ?", userID, "submitted").
			Count(&ownGoalsSubmitted)

		// Total = team + own (both performances and goals)
		stats.UpcomingReviews = teamPerformanceReviews + teamGoalsSubmitted + ownPerformanceReviews + ownGoalsSubmitted
		fmt.Printf("Manager - Upcoming Reviews (Team Perf: %d + Team Goals: %d + Own Perf: %d + Own Goals: %d = Total: %d)\n",
			teamPerformanceReviews, teamGoalsSubmitted, ownPerformanceReviews, ownGoalsSubmitted, stats.UpcomingReviews)

		config.DB.Table("employees").Where("manager_id = ?", userID).Count(&stats.TeamSize)
		fmt.Printf("Manager - Team Size: %d\n", stats.TeamSize)

	} else {
		// Employee sees their own data

		// Count employee's pending leaves
		config.DB.Table("leaves").
			Where("user_id = ? AND status = ?", userID, "pending").
			Count(&stats.PendingLeaves)
		fmt.Printf("Employee - Pending Leaves: %d\n", stats.PendingLeaves)

		// Active goals = accepted, in_progress, submitted (NOT completed or archived)
		config.DB.Table("goals").
			Where("user_id = ? AND status IN (?)", userID, []string{"accepted", "employee_accepted", "manager_accepted", "in_progress", "in-progress", "pending", "submitted"}).
			Count(&stats.ActiveGoals)
		fmt.Printf("✅ Employee - Active Goals: %d\n", stats.ActiveGoals)

		// Count employee's upcoming reviews (performances + submitted goals)
		var performanceReviews int64
		config.DB.Table("performances").
			Where("user_id = ? AND status IN (?)", userID, []string{"in_progress", "in-progress", "pending"}).
			Count(&performanceReviews)

		var goalsSubmitted int64
		config.DB.Table("goals").
			Where("user_id = ? AND status = ?", userID, "submitted").
			Count(&goalsSubmitted)

		stats.UpcomingReviews = performanceReviews + goalsSubmitted
		fmt.Printf("Employee - Upcoming Reviews (Performance: %d + Goals Submitted: %d = Total: %d)\n", performanceReviews, goalsSubmitted, stats.UpcomingReviews)

		// Team size is 0 for employees
		stats.TeamSize = 0
	}

	fmt.Printf("Final Stats: %+v\n", stats)

	// Quarterly Results
	quarterlyResults := getQuarterlyResults(role, userID)
	fmt.Printf("Quarterly Results: %+v\n", quarterlyResults)

	// Top Performers (for manager/HR only)
	var topPerformers []TopPerformer
	if role == "manager" || role == "hr" {
		topPerformers = getTopPerformers(role, userID)
	}

	// Recent activity
	activity := getRecentActivity(role, userID)
	upcomingEvents := getUpcomingEvents()

	response := gin.H{
		"stats":             stats,
		"quarterly_results": quarterlyResults,
		"top_performers":    topPerformers,
		"recent_activity":   activity,
		"upcoming_events":   upcomingEvents,
	}

	fmt.Printf("=== Response Sent ===\n\n")

	c.JSON(http.StatusOK, response)
}

func getQuarterlyResults(role string, userID uint) *QuarterlyResults {
	now := time.Now()
	quarter := (int(now.Month())-1)/3 + 1
	quarterName := ""
	switch quarter {
	case 1:
		quarterName = "Q1"
	case 2:
		quarterName = "Q2"
	case 3:
		quarterName = "Q3"
	case 4:
		quarterName = "Q4"
	}

	results := &QuarterlyResults{
		Quarter: quarterName,
		Year:    now.Year(),
	}

	fmt.Printf("\n=== Calculating Quarterly Results ===\n")
	fmt.Printf("Role: %s, UserID: %d\n", role, userID)

	// For HR, count ALL goals in system
	if role == "hr" {
		// Count goals with status 'completed', 'approved', or ('submitted' AND progress = 100)
		err := config.DB.Table("goals").
			Where("status IN (?) OR (status = ? AND progress = ?)", []string{"completed", "approved", "hr_approved"}, "submitted", 100).
			Count(&results.GoalsCompleted).Error

		if err != nil {
			fmt.Printf("❌ Error counting completed goals: %v\n", err)
		} else {
			fmt.Printf("✅ HR - Completed goals: %d\n", results.GoalsCompleted)
		}

		// Count total goals
		config.DB.Table("goals").Count(&results.TotalGoals)

	} else if role == "manager" {
		// Manager sees their own goals (not team goals)
		config.DB.Table("goals").
			Where("user_id = ? AND (status IN (?) OR (status = ? AND progress = ?))",
				userID, []string{"completed", "approved", "hr_approved"}, "submitted", 100).
			Count(&results.GoalsCompleted)

		config.DB.Table("goals").
			Where("user_id = ?", userID).
			Count(&results.TotalGoals)

	} else {
		// Employee sees their own goals
		config.DB.Table("goals").
			Where("user_id = ? AND (status IN (?) OR (status = ? AND progress = ?))",
				userID, []string{"completed", "approved", "hr_approved"}, "submitted", 100).
			Count(&results.GoalsCompleted)

		config.DB.Table("goals").
			Where("user_id = ?", userID).
			Count(&results.TotalGoals)
	}

	// Calculate percentage
	if results.TotalGoals > 0 {
		results.GoalsCompletedPercent = int((results.GoalsCompleted * 100) / results.TotalGoals)
	}

	fmt.Printf("📊 Completion Rate: %d%%\n", results.GoalsCompletedPercent)

	// Mock engagement data
	results.EngagementScore = 78
	results.EngagementTrend = "up"
	results.EngagementChange = 5

	// Reviews
	if role == "hr" {
		config.DB.Table("performances").Where("status = ?", "completed").Count(&results.ReviewsCompleted)
		config.DB.Table("performances").Where("status != ?", "completed").Count(&results.ReviewsPending)
	} else if role == "manager" {
		config.DB.Table("performances p").
			Joins("JOIN employees e ON p.user_id = e.user_id").
			Where("e.manager_id = ? AND p.status = ?", userID, "completed").
			Count(&results.ReviewsCompleted)

		config.DB.Table("performances p").
			Joins("JOIN employees e ON p.user_id = e.user_id").
			Where("e.manager_id = ? AND p.status != ?", userID, "completed").
			Count(&results.ReviewsPending)
	} else {
		config.DB.Table("performances").Where("employee_id = ? AND status = ?", userID, "completed").Count(&results.ReviewsCompleted)
		config.DB.Table("performances").Where("employee_id = ? AND status != ?", userID, "completed").Count(&results.ReviewsPending)
	}

	fmt.Printf("🎯 Final Results: Quarter=%s, Year=%d, Completed=%d, Total=%d, Percent=%d%%\n",
		results.Quarter, results.Year, results.GoalsCompleted, results.TotalGoals, results.GoalsCompletedPercent)
	fmt.Printf("=== End Quarterly Results ===\n\n")

	return results
}

func getTopPerformers(role string, userID uint) []TopPerformer {
	var performers []TopPerformer
	// Mock data for now
	return performers
}

func getRecentActivity(role string, userID uint) []RecentActivity {
	// Combined activity structure with timestamp for sorting
	type CombinedActivity struct {
		Type         string
		Message      string
		Details      string
		Time         string
		CreatedAt    time.Time
	}
	var combinedActivities []CombinedActivity

	// Query for recent leave requests
	type LeaveActivity struct {
		EmployeeName string
		StartDate    time.Time
		EndDate      time.Time
		Status       string
		CreatedAt    time.Time
	}
	var leaves []LeaveActivity

	if role == "hr" {
		// HR sees all recent leaves
		config.DB.Table("leaves l").
			Select("u.name as employee_name, l.start_date, l.end_date, l.status, l.created_at").
			Joins("JOIN users u ON l.user_id = u.id").
			Order("l.created_at DESC").
			Limit(10).
			Scan(&leaves)
	} else if role == "manager" {
		// Manager sees team + own leaves
		config.DB.Table("leaves l").
			Select("u.name as employee_name, l.start_date, l.end_date, l.status, l.created_at").
			Joins("JOIN users u ON l.user_id = u.id").
			Joins("LEFT JOIN employees e ON l.user_id = e.user_id").
			Where("e.manager_id = ? OR l.user_id = ?", userID, userID).
			Order("l.created_at DESC").
			Limit(10).
			Scan(&leaves)
	} else {
		// Employee sees their own leaves
		config.DB.Table("leaves l").
			Select("u.name as employee_name, l.start_date, l.end_date, l.status, l.created_at").
			Joins("JOIN users u ON l.user_id = u.id").
			Where("l.user_id = ?", userID).
			Order("l.created_at DESC").
			Limit(10).
			Scan(&leaves)
	}

	// Add leave activities to combined list
	for _, leave := range leaves {
		duration := leave.EndDate.Sub(leave.StartDate).Hours() / 24
		timeAgo := getTimeAgo(leave.CreatedAt)
		statusEmoji := "📝"
		if leave.Status == "approved" {
			statusEmoji = "✅"
		} else if leave.Status == "rejected" {
			statusEmoji = "❌"
		}

		combinedActivities = append(combinedActivities, CombinedActivity{
			Type:      "leave",
			Message:   fmt.Sprintf("%s %s leave request", statusEmoji, leave.EmployeeName),
			Details:   fmt.Sprintf("%.0f days - %s", duration, leave.Status),
			Time:      timeAgo,
			CreatedAt: leave.CreatedAt,
		})
	}

	// Query for recent goal submissions
	type GoalActivity struct {
		EmployeeName string
		Title        string
		Status       string
		CreatedAt    time.Time
	}
	var goals []GoalActivity

	if role == "hr" {
		config.DB.Table("goals g").
			Select("u.name as employee_name, g.title, g.status, g.created_at").
			Joins("JOIN users u ON g.user_id = u.id").
			Where("g.status IN (?)", []string{"submitted", "approved", "hr_approved"}).
			Order("g.created_at DESC").
			Limit(10).
			Scan(&goals)
	} else if role == "manager" {
		config.DB.Table("goals g").
			Select("u.name as employee_name, g.title, g.status, g.created_at").
			Joins("JOIN users u ON g.user_id = u.id").
			Joins("LEFT JOIN employees e ON g.user_id = e.user_id").
			Where("(e.manager_id = ? OR g.user_id = ?) AND g.status IN (?)", userID, userID, []string{"submitted", "approved", "manager_accepted"}).
			Order("g.created_at DESC").
			Limit(10).
			Scan(&goals)
	} else {
		config.DB.Table("goals g").
			Select("u.name as employee_name, g.title, g.status, g.created_at").
			Joins("JOIN users u ON g.user_id = u.id").
			Where("g.user_id = ? AND g.status IN (?)", userID, []string{"submitted", "approved", "employee_accepted"}).
			Order("g.created_at DESC").
			Limit(10).
			Scan(&goals)
	}

	// Add goal activities to combined list
	for _, goal := range goals {
		timeAgo := getTimeAgo(goal.CreatedAt)
		combinedActivities = append(combinedActivities, CombinedActivity{
			Type:      "goal",
			Message:   fmt.Sprintf("🎯 %s: %s", goal.EmployeeName, goal.Title),
			Details:   fmt.Sprintf("Status: %s", goal.Status),
			Time:      timeAgo,
			CreatedAt: goal.CreatedAt,
		})
	}

	// Sort combined activities by CreatedAt DESC (most recent first)
	sort.Slice(combinedActivities, func(i, j int) bool {
		return combinedActivities[i].CreatedAt.After(combinedActivities[j].CreatedAt)
	})

	// Take only top 3 most recent activities
	var activities []RecentActivity
	limit := 3
	if len(combinedActivities) < limit {
		limit = len(combinedActivities)
	}

	for i := 0; i < limit; i++ {
		activities = append(activities, RecentActivity{
			Type:    combinedActivities[i].Type,
			Message: combinedActivities[i].Message,
			Details: combinedActivities[i].Details,
			Time:    combinedActivities[i].Time,
		})
	}

	return activities
}

func getTimeAgo(t time.Time) string {
	duration := time.Since(t)

	if duration.Hours() < 1 {
		minutes := int(duration.Minutes())
		if minutes < 1 {
			return "Just now"
		}
		return fmt.Sprintf("%d minutes ago", minutes)
	} else if duration.Hours() < 24 {
		hours := int(duration.Hours())
		return fmt.Sprintf("%d hours ago", hours)
	} else if duration.Hours() < 48 {
		return "1 day ago"
	} else {
		days := int(duration.Hours() / 24)
		return fmt.Sprintf("%d days ago", days)
	}
}

func getUpcomingEvents() []UpcomingEvent {
	return []UpcomingEvent{
		{
			Date:  "25 DEC",
			Title: "Christmas Day",
			Desc:  "Company Holiday - Office Closed",
		},
		{
			Date:  "01 JAN",
			Title: "New Year's Day",
			Desc:  "Company Holiday - Office Closed",
		},
	}
}
