package handlers

import (
	"net/http"
	"peoplesoft/config"
	"peoplesoft/services"

	"github.com/gin-gonic/gin"
)

var aiService *services.AIAgentService

func init() {
	aiService = services.NewAIAgentService(config.DB)
}

// ProcessChatbotQuery processes a chatbot query
func ProcessChatbotQuery(c *gin.Context) {
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		Query string `json:"query" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query is required"})
		return
	}

	role := c.GetString("role")
	response, err := aiService.ProcessQuery(user.ID, role, input.Query)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"response": response,
	})
}

// ScheduleMeeting handles meeting scheduling requests
func ScheduleMeeting(c *gin.Context) {
	email := c.GetString("email")
	_, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		EmployeeID uint   `json:"employee_id" binding:"required"`
		DateTime   string `json:"datetime" binding:"required"`
		Topic      string `json:"topic"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a full implementation, this would integrate with a calendar system
	// For now, return a success message
	c.JSON(http.StatusOK, gin.H{
		"message": "Meeting scheduling request received. This feature will integrate with your calendar system.",
		"employee_id": input.EmployeeID,
		"datetime": input.DateTime,
		"topic": input.Topic,
	})
}

// GenerateReport handles report generation requests
func GenerateReport(c *gin.Context) {
	email := c.GetString("email")
	role := c.GetString("role")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		ReportType string `json:"report_type" binding:"required"`
		CycleID    *uint  `json:"cycle_id"`
		Format     string `json:"format"` // pdf, excel, json
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a full implementation, this would generate actual reports
	// For now, return a placeholder response
	c.JSON(http.StatusOK, gin.H{
		"message": "Report generation request received. This feature will generate reports based on your criteria.",
		"report_type": input.ReportType,
		"user_id": user.ID,
		"role": role,
	})
}



