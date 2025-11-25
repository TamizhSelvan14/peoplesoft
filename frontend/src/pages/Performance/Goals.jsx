import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap'
import { performanceService } from '../../services/performanceService'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState('')
  const userRole = localStorage.getItem('role')?.toLowerCase()

  useEffect(() => {
    loadCycles()
    loadGoals()
  }, [])

  const loadCycles = async () => {
    try {
      const data = await performanceService.getCycles()
      setCycles(data)
      if (data.length > 0) {
        setSelectedCycle(data[0].id.toString())
      }
    } catch (error) {
      console.error('Failed to load cycles:', error)
    }
  }

  const loadGoals = async (cycleId = null) => {
    try {
      setLoading(true)
      const filters = cycleId ? { cycle_id: cycleId } : {}
      const data = await performanceService.getGoals(filters)
      setGoals(data)
    } catch (error) {
      console.error('Failed to load goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (goalId) => {
    try {
      await performanceService.acknowledgeGoal(goalId)
      loadGoals()
    } catch (error) {
      console.error('Failed to acknowledge goal:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      in_progress: 'primary',
      assigned: 'warning',
      cancelled: 'danger'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      High: 'danger',
      Medium: 'warning',
      Low: 'info'
    }
    return <Badge bg={variants[priority] || 'secondary'}>{priority}</Badge>
  }

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Goals</h2>
        {(userRole === 'manager' || userRole === 'hr') && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Goal'}
          </Button>
        )}
      </div>

      {/* Cycle Filter */}
      {cycles.length > 0 && (
        <Form.Select
          className="mb-3"
          value={selectedCycle}
          onChange={(e) => {
            setSelectedCycle(e.target.value)
            loadGoals(e.target.value)
          }}
        >
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.cycle_name} ({cycle.cycle_type})
            </option>
          ))}
        </Form.Select>
      )}

      {/* Goals List */}
      <Row>
        {goals.length === 0 ? (
          <Col>
            <Alert variant="info">No goals found</Alert>
          </Col>
        ) : (
          goals.map((goal) => (
            <Col md={6} key={goal.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>{goal.title}</Card.Title>
                    <div>
                      {getStatusBadge(goal.status)}
                      {goal.priority && getPriorityBadge(goal.priority)}
                    </div>
                  </div>
                  <Card.Text>{goal.description}</Card.Text>
                  <div className="mb-2">
                    <small className="text-muted">
                      Progress: {goal.progress}%
                    </small>
                    <div className="progress mt-1">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${goal.progress}%` }}
                      >
                        {goal.progress}%
                      </div>
                    </div>
                  </div>
                  {goal.target_date && (
                    <p className="text-muted small">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                  {userRole === 'employee' && !goal.employee_acknowledged && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleAcknowledge(goal.id)}
                    >
                      Acknowledge Goal
                    </Button>
                  )}
                  {goal.employee_acknowledged && (
                    <Badge bg="success" className="mt-2">Acknowledged</Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  )
}

