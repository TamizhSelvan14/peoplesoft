package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// PerformanceCycle represents a performance review cycle
type PerformanceCycle struct {
	ID                      uint      `gorm:"primaryKey" json:"id"`
	CycleName               string    `gorm:"type:varchar(100);not null" json:"cycle_name"`
	CycleType               string    `gorm:"type:varchar(50);check:cycle_type IN ('Quarterly', 'Half-Yearly', 'Annual')" json:"cycle_type"`
	StartDate               time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate                 time.Time `gorm:"type:date;not null" json:"end_date"`
	GoalDeadline            *time.Time `gorm:"type:date" json:"goal_deadline"`
	SelfAssessmentDeadline  *time.Time `gorm:"type:date" json:"self_assessment_deadline"`
	ManagerReviewDeadline   *time.Time `gorm:"type:date" json:"manager_review_deadline"`
	PublishDate             *time.Time `gorm:"type:date" json:"publish_date"`
	Status                  string    `gorm:"type:varchar(20);default:'draft';check:status IN ('draft', 'active', 'closed')" json:"status"`
	CreatedBy               uint      `gorm:"not null" json:"created_by"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}

// Goal represents a performance goal
type PerformanceGoal struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	CycleID             uint      `gorm:"not null;index" json:"cycle_id"`
	EmployeeID          uint      `gorm:"not null;index" json:"employee_id"`
	ManagerID           uint      `gorm:"not null;index" json:"manager_id"`
	Title               string    `gorm:"type:varchar(255);not null" json:"title"`
	Description         string    `gorm:"type:text" json:"description"`
	Category            string    `gorm:"type:varchar(50);check:category IN ('Individual', 'Team', 'Stretch')" json:"category"`
	Priority            string    `gorm:"type:varchar(20);check:priority IN ('High', 'Medium', 'Low')" json:"priority"`
	Weight              float64   `gorm:"type:decimal(5,2);default:1.0" json:"weight"`
	TargetDate          *time.Time `gorm:"type:date" json:"target_date"`
	Status              string    `gorm:"type:varchar(20);default:'assigned';check:status IN ('assigned', 'in_progress', 'completed', 'cancelled')" json:"status"`
	Progress            int       `gorm:"default:0;check:progress >= 0 AND progress <= 100" json:"progress"`
	EvidenceLinks       StringArray `gorm:"type:text[]" json:"evidence_links"`
	EmployeeAcknowledged bool     `gorm:"default:false" json:"employee_acknowledged"`
	AcknowledgedAt      *time.Time `json:"acknowledged_at"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// Review represents a comprehensive performance review
type PerformanceReview struct {
	ID                      uint      `gorm:"primaryKey" json:"id"`
	CycleID                 uint      `gorm:"not null;index" json:"cycle_id"`
	EmployeeID              uint      `gorm:"not null;index" json:"employee_id"`
	ManagerID               uint      `gorm:"not null;index" json:"manager_id"`
	
	// Self Assessment
	SelfAssessmentText      string    `gorm:"type:text" json:"self_assessment_text"`
	SelfAchievements        string    `gorm:"type:text" json:"self_achievements"`
	SelfChallenges          string    `gorm:"type:text" json:"self_challenges"`
	SelfComments            string    `gorm:"type:text" json:"self_comments"`
	SelfSubmitted           bool      `gorm:"default:false" json:"self_submitted"`
	SelfSubmittedAt         *time.Time `json:"self_submitted_at"`
	
	// Manager Review
	ManagerReviewText       string    `gorm:"type:text" json:"manager_review_text"`
	ManagerStrengths        string    `gorm:"type:text" json:"manager_strengths"`
	ManagerAreasImprovement string    `gorm:"type:text" json:"manager_areas_improvement"`
	ManagerComments         string    `gorm:"type:text" json:"manager_comments"`
	ManagerSubmitted        bool      `gorm:"default:false" json:"manager_submitted"`
	ManagerSubmittedAt      *time.Time `json:"manager_submitted_at"`
	
	// Ratings
	RatingBand              string    `gorm:"type:varchar(30);check:rating_band IN ('Improvement Needed', 'Satisfactory', 'Good', 'Outstanding')" json:"rating_band"`
	TechnicalSkills         *int      `gorm:"check:technical_skills >= 1 AND technical_skills <= 5" json:"technical_skills"`
	Communication           *int      `gorm:"check:communication >= 1 AND communication <= 5" json:"communication"`
	Teamwork                *int      `gorm:"check:teamwork >= 1 AND teamwork <= 5" json:"teamwork"`
	Leadership              *int      `gorm:"check:leadership >= 1 AND leadership <= 5" json:"leadership"`
	ProblemSolving          *int      `gorm:"check:problem_solving >= 1 AND problem_solving <= 5" json:"problem_solving"`
	CompositeScore          *float64  `gorm:"type:decimal(5,2)" json:"composite_score"`
	
	// Employee Response
	EmployeeResponse        string    `gorm:"type:varchar(20);check:employee_response IN ('accepted', 're-discuss', 'pending')" json:"employee_response"`
	EmployeeResponseAt      *time.Time `json:"employee_response_at"`
	EmployeeResponseComments string    `gorm:"type:text" json:"employee_response_comments"`
	
	Status                  string    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PublishedAt             *time.Time `json:"published_at"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}

// SurveyTemplate represents a survey template
type SurveyTemplate struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TemplateName string  `gorm:"type:varchar(100);not null" json:"template_name"`
	Description string   `gorm:"type:text" json:"description"`
	Frequency   string   `gorm:"type:varchar(20)" json:"frequency"`
	IsAnonymous bool     `gorm:"default:true" json:"is_anonymous"`
	Questions   JSONB    `gorm:"type:jsonb;not null" json:"questions"`
	Active      bool     `gorm:"default:true" json:"active"`
	CreatedBy   uint     `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

// SurveyResponse represents a survey response
type SurveyResponse struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	TemplateID    uint      `gorm:"not null" json:"template_id"`
	RespondentID  uint      `gorm:"not null" json:"respondent_id"`
	Department    string    `gorm:"type:varchar(100)" json:"department"`
	ResponseMonth time.Time `gorm:"type:date;not null" json:"response_month"`
	Responses     JSONB     `gorm:"type:jsonb;not null" json:"responses"`
	SentimentScore *float64 `gorm:"type:decimal(3,2)" json:"sentiment_score"`
	IsAnonymous   bool     `gorm:"default:true" json:"is_anonymous"`
	SubmittedAt   time.Time `json:"submitted_at"`
}

// ChatbotConversation represents a chatbot interaction
type ChatbotConversation struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"not null;index" json:"user_id"`
	SessionID     string    `gorm:"type:varchar(100)" json:"session_id"`
	Query         string    `gorm:"type:text;not null" json:"query"`
	Intent        string    `gorm:"type:varchar(100)" json:"intent"`
	Response      string    `gorm:"type:text;not null" json:"response"`
	Sources       JSONB     `gorm:"type:jsonb" json:"sources"`
	ExecutionTimeMs int    `json:"execution_time_ms"`
	Success       bool      `gorm:"default:true" json:"success"`
	CreatedAt     time.Time `json:"created_at"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ActorID     uint      `gorm:"not null" json:"actor_id"`
	Action      string    `gorm:"type:varchar(100);not null" json:"action"`
	ResourceType string   `gorm:"type:varchar(50)" json:"resource_type"`
	ResourceID  *uint     `json:"resource_id"`
	BeforeState JSONB     `gorm:"type:jsonb" json:"before_state"`
	AfterState  JSONB     `gorm:"type:jsonb" json:"after_state"`
	IPAddress   string    `gorm:"type:inet" json:"ip_address"`
	Success     bool      `gorm:"default:true" json:"success"`
	CreatedAt   time.Time `json:"created_at"`
}

// JSONB type for PostgreSQL JSONB fields
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// StringArray type for PostgreSQL text arrays
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, s)
}



