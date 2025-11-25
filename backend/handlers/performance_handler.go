package handlers

import (
	"net/http"
	"time"

	"peoplesoft/config"
	"peoplesoft/models"
	"peoplesoft/middleware"

	"github.com/gin-gonic/gin"
)

// Helper to get user ID from email
func getUserIDFromEmail(email string) (uint, error) {
	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return 0, err
	}
	return user.ID, nil
}

// Helper to get user from email
func getUserFromEmail(email string) (*models.User, error) {
	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// ========== PERFORMANCE CYCLES ==========

// CreateCycle creates a new performance cycle (HR only)
func CreateCycle(c *gin.Context) {
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		CycleName              string     `json:"cycle_name" binding:"required"`
		CycleType              string     `json:"cycle_type" binding:"required"`
		StartDate              string     `json:"start_date" binding:"required"`
		EndDate                string     `json:"end_date" binding:"required"`
		GoalDeadline           *string    `json:"goal_deadline"`
		SelfAssessmentDeadline *string    `json:"self_assessment_deadline"`
		ManagerReviewDeadline  *string    `json:"manager_review_deadline"`
		PublishDate            *string    `json:"publish_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, _ := time.Parse("2006-01-02", input.StartDate)
	endDate, _ := time.Parse("2006-01-02", input.EndDate)

	cycle := models.PerformanceCycle{
		CycleName:     input.CycleName,
		CycleType:     input.CycleType,
		StartDate:     startDate,
		EndDate:       endDate,
		Status:        "draft",
		CreatedBy:     user.ID,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if input.GoalDeadline != nil {
		if d, err := time.Parse("2006-01-02", *input.GoalDeadline); err == nil {
			cycle.GoalDeadline = &d
		}
	}
	if input.SelfAssessmentDeadline != nil {
		if d, err := time.Parse("2006-01-02", *input.SelfAssessmentDeadline); err == nil {
			cycle.SelfAssessmentDeadline = &d
		}
	}
	if input.ManagerReviewDeadline != nil {
		if d, err := time.Parse("2006-01-02", *input.ManagerReviewDeadline); err == nil {
			cycle.ManagerReviewDeadline = &d
		}
	}
	if input.PublishDate != nil {
		if d, err := time.Parse("2006-01-02", *input.PublishDate); err == nil {
			cycle.PublishDate = &d
		}
	}

	if err := config.DB.Create(&cycle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create cycle"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": cycle})
}

// GetCycles returns all performance cycles (filtered by role)
func GetCycles(c *gin.Context) {
	role := middleware.NormalizeRole(c.GetString("role"))
	
	var cycles []models.PerformanceCycle
	query := config.DB

	// HR sees all, others see only active/closed
	if role != "hr" {
		query = query.Where("status IN ?", []string{"active", "closed"})
	}

	query.Order("created_at DESC").Find(&cycles)
	c.JSON(http.StatusOK, gin.H{"data": cycles})
}

// GetCycleByID returns a specific cycle
func GetCycleByID(c *gin.Context) {
	id := c.Param("id")
	var cycle models.PerformanceCycle

	if err := config.DB.First(&cycle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cycle not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": cycle})
}

// ========== GOALS ==========

// CreateGoal creates a new goal (Manager/HR only)
func CreateGoal(c *gin.Context) {
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		CycleID     uint    `json:"cycle_id" binding:"required"`
		EmployeeID  uint    `json:"employee_id" binding:"required"`
		Title       string  `json:"title" binding:"required"`
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Priority    string  `json:"priority"`
		Weight      float64 `json:"weight"`
		TargetDate  *string `json:"target_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	goal := models.PerformanceGoal{
		CycleID:     input.CycleID,
		EmployeeID:  input.EmployeeID,
		ManagerID:   user.ID,
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Priority:    input.Priority,
		Weight:      input.Weight,
		Status:      "assigned",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if input.TargetDate != nil {
		if d, err := time.Parse("2006-01-02", *input.TargetDate); err == nil {
			goal.TargetDate = &d
		}
	}

	if err := config.DB.Create(&goal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create goal"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": goal})
}

// GetGoals returns goals (filtered by role)
func GetGoals(c *gin.Context) {
	email := c.GetString("email")
	role := middleware.NormalizeRole(c.GetString("role"))
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var goals []models.PerformanceGoal
	query := config.DB

	// Filter by role
	if role == "employee" {
		query = query.Where("employee_id = ?", user.ID)
	} else if role == "manager" {
		query = query.Where("manager_id = ?", user.ID)
	}
	// HR sees all

	// Optional filters
	if cycleID := c.Query("cycle_id"); cycleID != "" {
		query = query.Where("cycle_id = ?", cycleID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at DESC").Find(&goals)
	c.JSON(http.StatusOK, gin.H{"data": goals})
}

// UpdateGoal updates a goal
func UpdateGoal(c *gin.Context) {
	id := c.Param("id")
	email := c.GetString("email")
	role := middleware.NormalizeRole(c.GetString("role"))
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var goal models.PerformanceGoal
	if err := config.DB.First(&goal, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "goal not found"})
		return
	}

	// Check permissions: employee can update their own goals, manager can update goals they created
	if role == "employee" && goal.EmployeeID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}
	if role == "manager" && goal.ManagerID != user.ID && goal.EmployeeID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	var input struct {
		Title       *string  `json:"title"`
		Description *string  `json:"description"`
		Progress    *int     `json:"progress"`
		Status      *string  `json:"status"`
		TargetDate  *string  `json:"target_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}
	if input.Progress != nil {
		updates["progress"] = *input.Progress
	}
	if input.Status != nil {
		updates["status"] = *input.Status
	}
	if input.TargetDate != nil {
		if d, err := time.Parse("2006-01-02", *input.TargetDate); err == nil {
			updates["target_date"] = d
		}
	}
	updates["updated_at"] = time.Now()

	config.DB.Model(&goal).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"data": goal})
}

// AcknowledgeGoal allows employee to acknowledge a goal
func AcknowledgeGoal(c *gin.Context) {
	id := c.Param("id")
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var goal models.PerformanceGoal
	if err := config.DB.First(&goal, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "goal not found"})
		return
	}

	if goal.EmployeeID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	now := time.Now()
	goal.EmployeeAcknowledged = true
	goal.AcknowledgedAt = &now
	goal.UpdatedAt = now

	config.DB.Save(&goal)
	c.JSON(http.StatusOK, gin.H{"data": goal})
}

// ========== REVIEWS ==========

// SubmitSelfAssessment submits employee self-assessment
func SubmitSelfAssessment(c *gin.Context) {
	id := c.Param("id")
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var review models.PerformanceReview
	if err := config.DB.Where("id = ? AND employee_id = ?", id, user.ID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	var input struct {
		SelfAssessmentText string `json:"self_assessment_text"`
		SelfAchievements   string `json:"self_achievements"`
		SelfChallenges     string `json:"self_challenges"`
		SelfComments       string `json:"self_comments"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	review.SelfAssessmentText = input.SelfAssessmentText
	review.SelfAchievements = input.SelfAchievements
	review.SelfChallenges = input.SelfChallenges
	review.SelfComments = input.SelfComments
	review.SelfSubmitted = true
	review.SelfSubmittedAt = &now
	review.UpdatedAt = now

	config.DB.Save(&review)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

// SubmitManagerReview submits manager review
func SubmitManagerReview(c *gin.Context) {
	id := c.Param("id")
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var review models.PerformanceReview
	if err := config.DB.Where("id = ? AND manager_id = ?", id, user.ID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	var input struct {
		ManagerReviewText       string   `json:"manager_review_text"`
		ManagerStrengths        string   `json:"manager_strengths"`
		ManagerAreasImprovement string   `json:"manager_areas_improvement"`
		ManagerComments         string   `json:"manager_comments"`
		RatingBand              string   `json:"rating_band"`
		TechnicalSkills         *int     `json:"technical_skills"`
		Communication           *int     `json:"communication"`
		Teamwork                *int     `json:"teamwork"`
		Leadership              *int     `json:"leadership"`
		ProblemSolving          *int     `json:"problem_solving"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate composite score
	var scores []int
	if input.TechnicalSkills != nil {
		scores = append(scores, *input.TechnicalSkills)
	}
	if input.Communication != nil {
		scores = append(scores, *input.Communication)
	}
	if input.Teamwork != nil {
		scores = append(scores, *input.Teamwork)
	}
	if input.Leadership != nil {
		scores = append(scores, *input.Leadership)
	}
	if input.ProblemSolving != nil {
		scores = append(scores, *input.ProblemSolving)
	}

	var compositeScore *float64
	if len(scores) > 0 {
		sum := 0
		for _, s := range scores {
			sum += s
		}
		avg := float64(sum) / float64(len(scores))
		compositeScore = &avg
	}

	now := time.Now()
	review.ManagerReviewText = input.ManagerReviewText
	review.ManagerStrengths = input.ManagerStrengths
	review.ManagerAreasImprovement = input.ManagerAreasImprovement
	review.ManagerComments = input.ManagerComments
	review.RatingBand = input.RatingBand
	review.TechnicalSkills = input.TechnicalSkills
	review.Communication = input.Communication
	review.Teamwork = input.Teamwork
	review.Leadership = input.Leadership
	review.ProblemSolving = input.ProblemSolving
	review.CompositeScore = compositeScore
	review.ManagerSubmitted = true
	review.ManagerSubmittedAt = &now
	review.UpdatedAt = now

	config.DB.Save(&review)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

// GetReviews returns reviews (filtered by role)
func GetReviews(c *gin.Context) {
	email := c.GetString("email")
	role := middleware.NormalizeRole(c.GetString("role"))
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var reviews []models.PerformanceReview
	query := config.DB

	// Filter by role
	if role == "employee" {
		query = query.Where("employee_id = ?", user.ID)
	} else if role == "manager" {
		query = query.Where("manager_id = ?", user.ID)
	}
	// HR sees all

	// Optional filters
	if cycleID := c.Query("cycle_id"); cycleID != "" {
		query = query.Where("cycle_id = ?", cycleID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at DESC").Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

// EmployeeResponse allows employee to respond to review
func EmployeeResponse(c *gin.Context) {
	id := c.Param("id")
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var review models.PerformanceReview
	if err := config.DB.Where("id = ? AND employee_id = ?", id, user.ID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	var input struct {
		EmployeeResponse        string `json:"employee_response" binding:"required"`
		EmployeeResponseComments string `json:"employee_response_comments"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	review.EmployeeResponse = input.EmployeeResponse
	review.EmployeeResponseComments = input.EmployeeResponseComments
	review.EmployeeResponseAt = &now
	review.UpdatedAt = now

	config.DB.Save(&review)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

// GetPerformanceReports returns performance reports (Manager/HR only)
func GetPerformanceReports(c *gin.Context) {
	email := c.GetString("email")
	role := middleware.NormalizeRole(c.GetString("role"))
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var reviews []models.PerformanceReview
	query := config.DB

	// Filter by role
	if role == "manager" {
		query = query.Where("manager_id = ?", user.ID)
	}
	// HR sees all

	// Optional filters
	if cycleID := c.Query("cycle_id"); cycleID != "" {
		query = query.Where("cycle_id = ?", cycleID)
	}
	if ratingBand := c.Query("rating_band"); ratingBand != "" {
		query = query.Where("rating_band = ?", ratingBand)
	}

	query.Where("manager_submitted = ?", true).Order("composite_score DESC").Find(&reviews)

	// Aggregate statistics
	type ReportStats struct {
		TotalReviews      int     `json:"total_reviews"`
		AverageScore      float64 `json:"average_score"`
		OutstandingCount  int     `json:"outstanding_count"`
		GoodCount         int     `json:"good_count"`
		SatisfactoryCount int     `json:"satisfactory_count"`
		ImprovementCount  int     `json:"improvement_count"`
	}

	stats := ReportStats{
		TotalReviews: len(reviews),
	}

	var totalScore float64
	var scoreCount int
	for _, r := range reviews {
		if r.CompositeScore != nil {
			totalScore += *r.CompositeScore
			scoreCount++
		}
		switch r.RatingBand {
		case "Outstanding":
			stats.OutstandingCount++
		case "Good":
			stats.GoodCount++
		case "Satisfactory":
			stats.SatisfactoryCount++
		case "Improvement Needed":
			stats.ImprovementCount++
		}
	}

	if scoreCount > 0 {
		stats.AverageScore = totalScore / float64(scoreCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  reviews,
		"stats": stats,
	})
}

// ========== ANALYTICS ==========

// GetDashboard returns dashboard data (Manager/HR only)
func GetDashboard(c *gin.Context) {
	email := c.GetString("email")
	role := middleware.NormalizeRole(c.GetString("role"))
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	type DashboardData struct {
		TeamSize                 int     `json:"team_size"`
		OutstandingCount         int     `json:"outstanding_count"`
		ImprovementNeededCount   int     `json:"improvement_needed_count"`
		PendingReviews           int     `json:"pending_reviews"`
		TotalGoals               int     `json:"total_goals"`
		CompletedGoals           int     `json:"completed_goals"`
		LastRating               *string  `json:"last_rating"`
		AverageTeamScore         float64 `json:"average_team_score"`
	}

	data := DashboardData{}

	if role == "manager" {
		// Get team members
		var teamMembers []models.Employee
		config.DB.Where("manager_id = ?", user.ID).Find(&teamMembers)
		data.TeamSize = len(teamMembers)

		// Get team reviews
		var teamUserIDs []uint
		for _, member := range teamMembers {
			teamUserIDs = append(teamUserIDs, member.UserID)
		}

		var reviews []models.PerformanceReview
		config.DB.Where("employee_id IN ? AND manager_submitted = ?", teamUserIDs, true).Find(&reviews)

		var totalScore float64
		var scoreCount int
		for _, r := range reviews {
			if r.CompositeScore != nil {
				totalScore += *r.CompositeScore
				scoreCount++
			}
			switch r.RatingBand {
			case "Outstanding":
				data.OutstandingCount++
			case "Improvement Needed":
				data.ImprovementNeededCount++
			}
		}
		if scoreCount > 0 {
			data.AverageTeamScore = totalScore / float64(scoreCount)
		}

		// Pending reviews
		config.DB.Where("manager_id = ? AND manager_submitted = ?", user.ID, false).Count(&data.PendingReviews)

		// Goals
		config.DB.Where("manager_id = ?", user.ID).Count(&data.TotalGoals)
		config.DB.Where("manager_id = ? AND status = ?", user.ID, "completed").Count(&data.CompletedGoals)

	} else if role == "hr" {
		// HR sees company-wide stats
		var allReviews []models.PerformanceReview
		config.DB.Where("manager_submitted = ?", true).Find(&allReviews)

		var totalScore float64
		var scoreCount int
		for _, r := range allReviews {
			if r.CompositeScore != nil {
				totalScore += *r.CompositeScore
				scoreCount++
			}
			switch r.RatingBand {
			case "Outstanding":
				data.OutstandingCount++
			case "Improvement Needed":
				data.ImprovementNeededCount++
			}
		}
		if scoreCount > 0 {
			data.AverageTeamScore = totalScore / float64(scoreCount)
		}

		config.DB.Where("manager_submitted = ?", false).Count(&data.PendingReviews)
		config.DB.Model(&models.PerformanceGoal{}).Count(&data.TotalGoals)
		config.DB.Where("status = ?", "completed").Count(&data.CompletedGoals)
	} else {
		// Employee view
		var goals []models.PerformanceGoal
		config.DB.Where("employee_id = ?", user.ID).Find(&goals)
		data.TotalGoals = len(goals)
		config.DB.Where("employee_id = ? AND status = ?", user.ID, "completed").Count(&data.CompletedGoals)

		var lastReview models.PerformanceReview
		config.DB.Where("employee_id = ? AND manager_submitted = ?", user.ID, true).
			Order("manager_submitted_at DESC").First(&lastReview)
		if lastReview.ID > 0 {
			data.LastRating = &lastReview.RatingBand
		}
	}

	c.JSON(http.StatusOK, data)
}

// GetTrends returns performance trends (HR only)
func GetTrends(c *gin.Context) {
	// This would return time-series data for performance trends
	// For now, return a simple structure
	c.JSON(http.StatusOK, gin.H{
		"message": "Trends endpoint - to be implemented with time-series analysis",
	})
}

