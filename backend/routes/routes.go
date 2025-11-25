package routes

import (
	"fmt"
	"peoplesoft/controllers"
	"peoplesoft/handlers"
	"peoplesoft/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/auth0-login", controllers.Auth0Login)

	}

	api := r.Group("/api")
	api.Use(middleware.AuthRequired())
	{
		// Employees
		fmt.Println("test befote")
		api.GET("/employees", controllers.ListEmployees)
		api.GET("/employees/:id", controllers.GetEmployee)
		api.POST("/employees", controllers.CreateEmployee)
		api.PUT("/employees/:id", controllers.UpdateEmployee)
		api.DELETE("/employees/:id", controllers.DeleteEmployee)
		api.GET("/my-team", controllers.ListMyTeam)

		api.GET("/users/by-email/:email", controllers.GetUserByEmail)
		api.DELETE("/users/:id", controllers.DeleteUser)

		// Manager team
		api.GET("/managers/:managerId/team", controllers.ListTeam)

		// Leaves
		api.GET("/leaves", controllers.ListLeaves)
		api.POST("/leaves", controllers.CreateLeave)
		api.PUT("/leaves/:id/approve", controllers.ApproveLeave)
		api.PUT("/leaves/:id/reject", controllers.RejectLeave)

		// Performance
		api.GET("/performance", controllers.ListPerformance)
		api.POST("/performance", controllers.CreatePerformance)
	}

	//pms
	pms := api.Group("/pms")
	{
		// Employee
		pms.POST("/goals", controllers.CreateGoal)
		pms.PUT("/goals/:id", controllers.UpdateGoal)
		pms.GET("/my-goals", controllers.ListMyGoals)

		// Manager/Admin
		pms.GET("/manager/goals", controllers.ManagerListEmployeeGoals)
		pms.POST("/reviews", controllers.CreateOrUpdateReview)

		// Employee self-assessment
		pms.POST("/self-assess", controllers.SubmitSelfAssessment)

		// Admin analytics
		pms.GET("/admin/report", controllers.AdminReport)

		// History
		pms.GET("/my-reviews", controllers.MyReviews)
	}

	// Performance Management Routes
	performance := api.Group("/performance")
	{
		// Cycles
		performance.POST("/cycles", middleware.RoleCheck("HR", "hr", "admin"), handlers.CreateCycle)
		performance.GET("/cycles", handlers.GetCycles)
		performance.GET("/cycles/:id", handlers.GetCycleByID)

		// Goals
		performance.POST("/goals", middleware.RoleCheck("Manager", "manager", "HR", "hr", "admin"), handlers.CreateGoal)
		performance.GET("/goals", handlers.GetGoals)
		performance.PUT("/goals/:id", handlers.UpdateGoal)
		performance.POST("/goals/:id/acknowledge", middleware.RoleCheck("Employee", "employee"), handlers.AcknowledgeGoal)

		// Reviews
		performance.POST("/reviews/:id/self-assessment", middleware.RoleCheck("Employee", "employee"), handlers.SubmitSelfAssessment)
		performance.POST("/reviews/:id/manager-review", middleware.RoleCheck("Manager", "manager", "HR", "hr", "admin"), handlers.SubmitManagerReview)
		performance.GET("/reviews", handlers.GetReviews)
		performance.POST("/reviews/:id/response", middleware.RoleCheck("Employee", "employee"), handlers.EmployeeResponse)
		performance.GET("/reviews/reports", middleware.RoleCheck("Manager", "manager", "HR", "hr", "admin"), handlers.GetPerformanceReports)

		// Analytics
		performance.GET("/analytics/dashboard", middleware.RoleCheck("Manager", "manager", "HR", "hr", "admin"), handlers.GetDashboard)
		performance.GET("/analytics/trends", middleware.RoleCheck("HR", "hr", "admin"), handlers.GetTrends)
	}

	// Chatbot Routes
	chatbot := api.Group("/chatbot")
	{
		chatbot.POST("/query", handlers.ProcessChatbotQuery)
		chatbot.POST("/actions/schedule-meeting", handlers.ScheduleMeeting)
		chatbot.POST("/actions/generate-report", handlers.GenerateReport)
	}

	// Surveys
	surveys := api.Group("/surveys")
	{
		surveys.POST("/templates", middleware.RoleCheck("HR", "hr", "admin"), handlers.CreateSurveyTemplate)
		surveys.GET("/templates", handlers.GetSurveyTemplates)
		surveys.POST("/responses", handlers.SubmitSurveyResponse)
		surveys.GET("/analytics", middleware.RoleCheck("HR", "hr", "admin"), handlers.GetSurveyAnalytics)
	}
}
