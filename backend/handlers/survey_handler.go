package handlers

import (
	"net/http"
	"time"

	"peoplesoft/config"
	"peoplesoft/models"

	"github.com/gin-gonic/gin"
)

// CreateSurveyTemplate creates a new survey template (HR only)
func CreateSurveyTemplate(c *gin.Context) {
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		TemplateName string                 `json:"template_name" binding:"required"`
		Description  string                 `json:"description"`
		Frequency    string                 `json:"frequency"`
		IsAnonymous  bool                   `json:"is_anonymous"`
		Questions    map[string]interface{} `json:"questions" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template := models.SurveyTemplate{
		TemplateName: input.TemplateName,
		Description:  input.Description,
		Frequency:    input.Frequency,
		IsAnonymous:  input.IsAnonymous,
		Questions:    models.JSONB(input.Questions),
		Active:       true,
		CreatedBy:    user.ID,
		CreatedAt:    time.Now(),
	}

	if err := config.DB.Create(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create template"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": template})
}

// GetSurveyTemplates returns all active survey templates
func GetSurveyTemplates(c *gin.Context) {
	var templates []models.SurveyTemplate
	config.DB.Where("active = ?", true).Order("created_at DESC").Find(&templates)
	c.JSON(http.StatusOK, gin.H{"data": templates})
}

// SubmitSurveyResponse submits a survey response
func SubmitSurveyResponse(c *gin.Context) {
	email := c.GetString("email")
	user, err := getUserFromEmail(email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var input struct {
		TemplateID    uint                   `json:"template_id" binding:"required"`
		Department    string                 `json:"department"`
		ResponseMonth string                 `json:"response_month" binding:"required"`
		Responses     map[string]interface{} `json:"responses" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if template exists
	var template models.SurveyTemplate
	if err := config.DB.First(&template, input.TemplateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "template not found"})
		return
	}

	responseMonth, err := time.Parse("2006-01-02", input.ResponseMonth)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	// Get user's department if not provided
	department := input.Department
	if department == "" {
		var employee models.Employee
		config.DB.Where("user_id = ?", user.ID).First(&employee)
		if employee.ID > 0 {
			var dept models.Department
			config.DB.First(&dept, employee.DepartmentID)
			department = dept.Name
		}
	}

	response := models.SurveyResponse{
		TemplateID:    input.TemplateID,
		RespondentID:  user.ID,
		Department:    department,
		ResponseMonth: responseMonth,
		Responses:     models.JSONB(input.Responses),
		IsAnonymous:   template.IsAnonymous,
		SubmittedAt:   time.Now(),
	}

	if err := config.DB.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to submit response"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": response})
}

// GetSurveyAnalytics returns survey analytics (HR only)
func GetSurveyAnalytics(c *gin.Context) {
	templateID := c.Query("template_id")
	department := c.Query("department")

	var responses []models.SurveyResponse
	query := config.DB

	if templateID != "" {
		query = query.Where("template_id = ?", templateID)
	}
	if department != "" {
		query = query.Where("department = ?", department)
	}

	query.Order("submitted_at DESC").Find(&responses)

	// Calculate basic statistics
	type Analytics struct {
		TotalResponses   int     `json:"total_responses"`
		AverageSentiment float64 `json:"average_sentiment"`
		Departments      []string `json:"departments"`
	}

	analytics := Analytics{
		TotalResponses: len(responses),
		Departments:    []string{},
	}

	departmentMap := make(map[string]bool)
	var totalSentiment float64
	var sentimentCount int

	for _, r := range responses {
		if !departmentMap[r.Department] {
			analytics.Departments = append(analytics.Departments, r.Department)
			departmentMap[r.Department] = true
		}
		if r.SentimentScore != nil {
			totalSentiment += *r.SentimentScore
			sentimentCount++
		}
	}

	if sentimentCount > 0 {
		analytics.AverageSentiment = totalSentiment / float64(sentimentCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      responses,
		"analytics": analytics,
	})
}



