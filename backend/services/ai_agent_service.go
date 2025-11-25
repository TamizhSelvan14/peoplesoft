package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"peoplesoft/config"
	"peoplesoft/models"

	"github.com/sashabaranov/go-openai"
)

type AIAgentService struct {
	client *openai.Client
	db     *gorm.DB
}

func NewAIAgentService(db *gorm.DB) *AIAgentService {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		// Return nil service if API key not configured
		return nil
	}

	return &AIAgentService{
		client: openai.NewClient(apiKey),
		db:     db,
	}
}

func (s *AIAgentService) ProcessQuery(userID uint, userRole string, query string) (string, error) {
	if s == nil || s.client == nil {
		return "AI service is not configured. Please set OPENAI_API_KEY environment variable.", nil
	}

	startTime := time.Now()

	// 1. Classify intent
	intent := s.classifyIntent(query)

	// 2. Execute based on intent with role-based access
	var response string
	var err error

	switch intent {
	case "get_worst_performers":
		response, err = s.getWorstPerformers(userID, userRole, query)
	case "get_top_performers":
		response, err = s.getTopPerformers(userID, userRole, query)
	case "schedule_meeting":
		response, err = s.scheduleMeeting(userID, query)
	case "get_team_analytics":
		response, err = s.getTeamAnalytics(userID, userRole)
	case "get_goals":
		response, err = s.getGoals(userID, userRole)
	default:
		response, err = s.generalQuery(query, userRole)
	}

	// 3. Log conversation
	executionTime := int(time.Since(startTime).Milliseconds())
	s.logConversation(userID, query, intent, response, executionTime, err == nil)

	return response, err
}

func (s *AIAgentService) classifyIntent(query string) string {
	ctx := context.Background()

	systemPrompt := `Classify the user intent into one of these categories:
- get_worst_performers: User wants to see underperforming employees
- get_top_performers: User wants to see top performing employees
- schedule_meeting: User wants to schedule a meeting
- get_team_analytics: User wants team performance analytics
- get_goals: User wants information about goals
- general_query: Any other query

Respond with only the category name.`

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: systemPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: query,
			},
		},
		MaxTokens: 10,
	})

	if err != nil {
		return "general_query"
	}

	intent := resp.Choices[0].Message.Content
	// Clean up the response
	if len(intent) > 0 {
		return intent
	}
	return "general_query"
}

func (s *AIAgentService) getWorstPerformers(userID uint, userRole string, query string) (string, error) {
	var reviews []models.PerformanceReview
	dbQuery := s.db.Where("rating_band IN ?", []string{"Improvement Needed", "Satisfactory"}).
		Where("manager_submitted = ?", true)

	if userRole == "manager" {
		dbQuery = dbQuery.Where("manager_id = ?", userID)
	} else if userRole == "employee" {
		// Employees can only see their own
		dbQuery = dbQuery.Where("employee_id = ?", userID)
	}
	// HR sees all

	dbQuery.Order("composite_score ASC").Limit(5).Find(&reviews)

	if len(reviews) == 0 {
		return "No employees found with improvement needed or satisfactory ratings.", nil
	}

	// Get employee names
	type ReviewWithName struct {
		models.PerformanceReview
		EmployeeName string
	}
	var reviewsWithNames []ReviewWithName

	for _, r := range reviews {
		var user models.User
		s.db.First(&user, r.EmployeeID)
		reviewsWithNames = append(reviewsWithNames, ReviewWithName{
			PerformanceReview: r,
			EmployeeName:      user.Name,
		})
	}

	responseText := s.formatResponseWithLLM(reviewsWithNames, "worst performers")
	return responseText, nil
}

func (s *AIAgentService) getTopPerformers(userID uint, userRole string, query string) (string, error) {
	var reviews []models.PerformanceReview
	dbQuery := s.db.Where("rating_band = ?", "Outstanding").
		Where("manager_submitted = ?", true)

	if userRole == "manager" {
		dbQuery = dbQuery.Where("manager_id = ?", userID)
	} else if userRole == "employee" {
		dbQuery = dbQuery.Where("employee_id = ?", userID)
	}

	dbQuery.Order("composite_score DESC").Limit(5).Find(&reviews)

	if len(reviews) == 0 {
		return "No outstanding performers found.", nil
	}

	type ReviewWithName struct {
		models.PerformanceReview
		EmployeeName string
	}
	var reviewsWithNames []ReviewWithName

	for _, r := range reviews {
		var user models.User
		s.db.First(&user, r.EmployeeID)
		reviewsWithNames = append(reviewsWithNames, ReviewWithName{
			PerformanceReview: r,
			EmployeeName:      user.Name,
		})
	}

	responseText := s.formatResponseWithLLM(reviewsWithNames, "top performers")
	return responseText, nil
}

func (s *AIAgentService) scheduleMeeting(userID uint, query string) (string, error) {
	// For now, return a helpful message
	// In a full implementation, this would integrate with a calendar system
	return "I can help you schedule a meeting. Please use the calendar system or contact the employee directly. Would you like me to show you the employee's contact information?", nil
}

func (s *AIAgentService) getTeamAnalytics(userID uint, userRole string) (string, error) {
	var reviews []models.PerformanceReview
	dbQuery := s.db.Where("manager_submitted = ?", true)

	if userRole == "manager" {
		dbQuery = dbQuery.Where("manager_id = ?", userID)
	}

	dbQuery.Find(&reviews)

	if len(reviews) == 0 {
		return "No team analytics available yet.", nil
	}

	// Calculate statistics
	var totalScore float64
	var scoreCount int
	ratingCounts := make(map[string]int)

	for _, r := range reviews {
		if r.CompositeScore != nil {
			totalScore += *r.CompositeScore
			scoreCount++
		}
		ratingCounts[r.RatingBand]++
	}

	avgScore := 0.0
	if scoreCount > 0 {
		avgScore = totalScore / float64(scoreCount)
	}

	analytics := map[string]interface{}{
		"total_reviews":    len(reviews),
		"average_score":    avgScore,
		"rating_breakdown": ratingCounts,
	}

	responseText := s.formatResponseWithLLM(analytics, "team analytics")
	return responseText, nil
}

func (s *AIAgentService) getGoals(userID uint, userRole string) (string, error) {
	var goals []models.PerformanceGoal
	dbQuery := s.db

	if userRole == "employee" {
		dbQuery = dbQuery.Where("employee_id = ?", userID)
	} else if userRole == "manager" {
		dbQuery = dbQuery.Where("manager_id = ?", userID)
	}

	dbQuery.Find(&goals)

	if len(goals) == 0 {
		return "No goals found.", nil
	}

	responseText := s.formatResponseWithLLM(goals, "goals")
	return responseText, nil
}

func (s *AIAgentService) generalQuery(query string, userRole string) (string, error) {
	ctx := context.Background()

	systemPrompt := fmt.Sprintf(`You are a helpful AI assistant for a Performance Management System. 
The user has the role: %s
Answer questions about performance reviews, goals, ratings, and team analytics.
Be concise and helpful.`, userRole)

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: systemPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: query,
			},
		},
		MaxTokens: 500,
	})

	if err != nil {
		return "I'm sorry, I encountered an error processing your query.", err
	}

	return resp.Choices[0].Message.Content, nil
}

func (s *AIAgentService) formatResponseWithLLM(data interface{}, context string) string {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Sprintf("Data for %s: %v", context, data)
	}

	ctx := context.Background()
	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: "Format this performance data into a helpful, natural response. Include employee names, ratings, and actionable suggestions. Be concise.",
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: fmt.Sprintf("Context: %s\nData: %s", context, string(jsonData)),
			},
		},
		MaxTokens: 500,
	})

	if err != nil {
		return fmt.Sprintf("Here's the data for %s: %s", context, string(jsonData))
	}

	return resp.Choices[0].Message.Content
}

func (s *AIAgentService) logConversation(userID uint, query, intent, response string, executionTime int, success bool) {
	if s.db == nil {
		return
	}

	conversation := models.ChatbotConversation{
		UserID:          userID,
		SessionID:       fmt.Sprintf("session_%d_%d", userID, time.Now().Unix()),
		Query:           query,
		Intent:          intent,
		Response:        response,
		ExecutionTimeMs: executionTime,
		Success:         success,
		CreatedAt:       time.Now(),
	}

	s.db.Create(&conversation)
}

