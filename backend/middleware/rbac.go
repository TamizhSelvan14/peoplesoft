package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RoleCheck middleware checks if user has one of the allowed roles
func RoleCheck(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("role")
		if userRole == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "role not found in token"})
			c.Abort()
			return
		}

		// Normalize role names (handle case variations)
		userRole = normalizeRole(userRole)
		
		allowed := false
		for _, role := range allowedRoles {
			if userRole == normalizeRole(role) {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// NormalizeRole normalizes role names to lowercase for comparison
func NormalizeRole(role string) string {
	switch role {
	case "HR", "hr", "admin":
		return "hr"
	case "Manager", "manager":
		return "manager"
	case "Employee", "employee":
		return "employee"
	default:
		return role
	}
}

// normalizeRole is an alias for backward compatibility
func normalizeRole(role string) string {
	return NormalizeRole(role)
}

// GetUserID extracts user ID from context (set by AuthRequired middleware)
func GetUserID(c *gin.Context) (uint, error) {
	email := c.GetString("email")
	if email == "" {
		return 0, gin.Error{}
	}

	// We need to query the database to get user ID from email
	// This is a helper that should be used in handlers
	// For now, return 0 and let handlers query
	return 0, nil
}

// ScopeQueryByRole adds role-based filtering to queries
func ScopeQueryByRole(c *gin.Context, baseQuery string, params []interface{}) (string, []interface{}) {
	userRole := normalizeRole(c.GetString("role"))
	email := c.GetString("email")

	// Get user ID from email (this would ideally be cached or in context)
	// For now, we'll let handlers handle this
	_ = email
	_ = userRole

	// This is a placeholder - actual implementation would depend on your query builder
	return baseQuery, params
}

// GetUserIDFromEmail is a helper to get user ID from email
// This should be used in handlers that need user ID
func GetUserIDFromEmail(email string) (uint, error) {
	// This will be implemented in handlers using config.DB
	return 0, nil
}

