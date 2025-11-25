import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Table, Badge } from 'react-bootstrap'
import { performanceService } from '../../services/performanceService'

export default function Analytics() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRole = localStorage.getItem('role')?.toLowerCase()

  useEffect(() => {
    if (userRole === 'manager' || userRole === 'hr') {
      loadReports()
    }
  }, [userRole])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await performanceService.getPerformanceReports()
      setReports(data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
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

  if (userRole !== 'manager' && userRole !== 'hr') {
    return (
      <Container className="mt-4">
        <h2>Analytics</h2>
        <p className="text-danger">Access denied. This page is for Managers and HR only.</p>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading analytics...</p>
      </Container>
    )
  }

  if (!reports) {
    return (
      <Container className="mt-4">
        <h2>Analytics</h2>
        <p>No data available</p>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2>Performance Analytics</h2>

      {/* Statistics */}
      {reports.stats && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5>Total Reviews</h5>
                <h2>{reports.stats.total_reviews || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h5>Average Score</h5>
                <h2>
                  {reports.stats.average_score
                    ? reports.stats.average_score.toFixed(2)
                    : 'N/A'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <h5>Outstanding</h5>
                <h2>{reports.stats.outstanding_count || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center bg-danger text-white">
              <Card.Body>
                <h5>Needs Improvement</h5>
                <h2>{reports.stats.improvement_count || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Reviews Table */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Performance Reviews</h5>
            </Card.Header>
            <Card.Body>
              {reports.data && reports.data.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Review ID</th>
                      <th>Rating</th>
                      <th>Composite Score</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.data.map((review) => (
                      <tr key={review.id}>
                        <td>{review.id}</td>
                        <td>{review.rating_band && getRatingBadge(review.rating_band)}</td>
                        <td>
                          {review.composite_score
                            ? review.composite_score.toFixed(2)
                            : 'N/A'}
                        </td>
                        <td>{review.status}</td>
                        <td>
                          {review.manager_submitted ? (
                            <Badge bg="success">Yes</Badge>
                          ) : (
                            <Badge bg="warning">No</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No reviews found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

