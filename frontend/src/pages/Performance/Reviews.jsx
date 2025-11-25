import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert, Modal } from 'react-bootstrap'
import { performanceService } from '../../services/performanceService'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSelfAssessment, setShowSelfAssessment] = useState(false)
  const [showManagerReview, setShowManagerReview] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const userRole = localStorage.getItem('role')?.toLowerCase()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await performanceService.getReviews()
      setReviews(data)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelfAssessment = async (formData) => {
    try {
      await performanceService.submitSelfAssessment(selectedReview.id, formData)
      setShowSelfAssessment(false)
      setSelectedReview(null)
      loadReviews()
    } catch (error) {
      console.error('Failed to submit self-assessment:', error)
    }
  }

  const handleManagerReview = async (formData) => {
    try {
      await performanceService.submitManagerReview(selectedReview.id, formData)
      setShowManagerReview(false)
      setSelectedReview(null)
      loadReviews()
    } catch (error) {
      console.error('Failed to submit manager review:', error)
    }
  }

  const getRatingBadge = (rating) => {
    const variants = {
      Outstanding: 'success',
      Good: 'primary',
      Satisfactory: 'warning',
      'Improvement Needed': 'danger'
    }
    return <Badge bg={variants[rating] || 'secondary'}>{rating}</Badge>
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
      <h2>Performance Reviews</h2>

      <Row className="mt-4">
        {reviews.length === 0 ? (
          <Col>
            <Alert variant="info">No reviews found</Alert>
          </Col>
        ) : (
          reviews.map((review) => (
            <Col md={6} key={review.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>Review #{review.id}</Card.Title>
                    {review.rating_band && getRatingBadge(review.rating_band)}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Status:</strong> {review.status}
                  </div>

                  {review.self_submitted && (
                    <Badge bg="info" className="me-2">Self Assessment Submitted</Badge>
                  )}
                  {review.manager_submitted && (
                    <Badge bg="success" className="me-2">Manager Review Submitted</Badge>
                  )}

                  {review.composite_score && (
                    <div className="mt-2">
                      <strong>Composite Score:</strong> {review.composite_score.toFixed(2)}/5.0
                    </div>
                  )}

                  <div className="mt-3">
                    {userRole === 'employee' && !review.self_submitted && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedReview(review)
                          setShowSelfAssessment(true)
                        }}
                      >
                        Submit Self Assessment
                      </Button>
                    )}
                    {(userRole === 'manager' || userRole === 'hr') && 
                     review.self_submitted && 
                     !review.manager_submitted && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedReview(review)
                          setShowManagerReview(true)
                        }}
                      >
                        Submit Manager Review
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Self Assessment Modal */}
      <Modal show={showSelfAssessment} onHide={() => setShowSelfAssessment(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Self Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SelfAssessmentForm
            review={selectedReview}
            onSubmit={handleSelfAssessment}
            onCancel={() => setShowSelfAssessment(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Manager Review Modal */}
      <Modal show={showManagerReview} onHide={() => setShowManagerReview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manager Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerReviewForm
            review={selectedReview}
            onSubmit={handleManagerReview}
            onCancel={() => setShowManagerReview(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

function SelfAssessmentForm({ review, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    self_assessment_text: '',
    self_achievements: '',
    self_challenges: '',
    self_comments: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Self Assessment</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.self_assessment_text}
          onChange={(e) =>
            setFormData({ ...formData, self_assessment_text: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Achievements</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.self_achievements}
          onChange={(e) =>
            setFormData({ ...formData, self_achievements: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Challenges</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.self_challenges}
          onChange={(e) =>
            setFormData({ ...formData, self_challenges: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.self_comments}
          onChange={(e) =>
            setFormData({ ...formData, self_comments: e.target.value })
          }
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="me-2">
        Submit
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </Form>
  )
}

function ManagerReviewForm({ review, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    manager_review_text: '',
    manager_strengths: '',
    manager_areas_improvement: '',
    manager_comments: '',
    rating_band: 'Satisfactory',
    technical_skills: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    problem_solving: 3
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Review Text</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.manager_review_text}
          onChange={(e) =>
            setFormData({ ...formData, manager_review_text: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Strengths</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.manager_strengths}
          onChange={(e) =>
            setFormData({ ...formData, manager_strengths: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Areas for Improvement</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.manager_areas_improvement}
          onChange={(e) =>
            setFormData({ ...formData, manager_areas_improvement: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Rating Band</Form.Label>
        <Form.Select
          value={formData.rating_band}
          onChange={(e) =>
            setFormData({ ...formData, rating_band: e.target.value })
          }
        >
          <option>Outstanding</option>
          <option>Good</option>
          <option>Satisfactory</option>
          <option>Improvement Needed</option>
        </Form.Select>
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Technical Skills (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={formData.technical_skills}
              onChange={(e) =>
                setFormData({ ...formData, technical_skills: parseInt(e.target.value) })
              }
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Communication (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={formData.communication}
              onChange={(e) =>
                setFormData({ ...formData, communication: parseInt(e.target.value) })
              }
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Teamwork (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={formData.teamwork}
              onChange={(e) =>
                setFormData({ ...formData, teamwork: parseInt(e.target.value) })
              }
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Leadership (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={formData.leadership}
              onChange={(e) =>
                setFormData({ ...formData, leadership: parseInt(e.target.value) })
              }
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Problem Solving (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={formData.problem_solving}
              onChange={(e) =>
                setFormData({ ...formData, problem_solving: parseInt(e.target.value) })
              }
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.manager_comments}
          onChange={(e) =>
            setFormData({ ...formData, manager_comments: e.target.value })
          }
        />
      </Form.Group>
      <Button type="submit" variant="success" className="me-2">
        Submit Review
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </Form>
  )
}



