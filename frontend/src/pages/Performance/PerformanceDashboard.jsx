import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap'
import { performanceService } from '../../services/performanceService'
import ChatWidget from '../../components/Chatbot/ChatWidget'

export default function PerformanceDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRole = localStorage.getItem('role')?.toLowerCase()
  const userName = localStorage.getItem('name')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await performanceService.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Outstanding': return 'success'
      case 'Good': return 'primary'
      case 'Satisfactory': return 'warning'
      case 'Improvement Needed': return 'danger'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    )
  }

  if (!dashboardData) {
    return (
      <Container className="mt-4">
        <h2>Performance Dashboard</h2>
        <p>No data available</p>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2>Performance Dashboard</h2>
      <p className="text-muted">Welcome, {userName}</p>

      {/* Employee View */}
      {userRole === 'employee' && (
        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>My Goals</Card.Title>
                <h3>{dashboardData.total_goals || 0}</h3>
                <p className="text-muted">
                  {dashboardData.completed_goals || 0} completed
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Latest Rating</Card.Title>
                <Badge bg={getRatingColor(dashboardData.last_rating)} className="p-2 fs-5">
                  {dashboardData.last_rating || 'Not Rated Yet'}
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Manager/HR View */}
      {(userRole === 'manager' || userRole === 'hr') && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5>Team Members</h5>
                <h2>{dashboardData.team_size || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h5>Outstanding</h5>
                <h2>{dashboardData.outstanding_count || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-warning">
              <Card.Body>
                <h5>Needs Improvement</h5>
                <h2>{dashboardData.improvement_needed_count || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5>Pending Reviews</h5>
                <h2>{dashboardData.pending_reviews || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Additional stats for Manager/HR */}
      {(userRole === 'manager' || userRole === 'hr') && (
        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Total Goals</Card.Title>
                <h3>{dashboardData.total_goals || 0}</h3>
                <p className="text-muted">
                  {dashboardData.completed_goals || 0} completed
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Average Team Score</Card.Title>
                <h3>
                  {dashboardData.average_team_score
                    ? dashboardData.average_team_score.toFixed(2)
                    : 'N/A'}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Floating Chatbot Widget */}
      <ChatWidget />
    </Container>
  )
}



