import React, { useState } from 'react'
import { Button, Card, Form, Badge } from 'react-bootstrap'
import { chatbotService } from '../../services/chatbotService'
import './ChatWidget.css'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const userRole = localStorage.getItem('role')?.toLowerCase() || 'employee'
  const userName = localStorage.getItem('name')

  const exampleQueries = {
    manager: [
      'Show worst performers in my team last month',
      'Schedule 1:1 with team member tomorrow at 3pm',
      'Team performance summary'
    ],
    hr: [
      'Top 5 performers in Sales last month',
      'Email me performance report for November',
      'Show company-wide analytics'
    ],
    employee: [
      'Show my goals due this month',
      "What's my current rating status?",
      'Show my pending reviews'
    ]
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await chatbotService.query(currentInput)
      const botMessage = {
        role: 'assistant',
        content: response.response || 'Sorry, I encountered an error.'
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (query) => {
    setInput(query)
  }

  return (
    <>
      {/* Floating button */}
      <Button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          zIndex: 1000,
          fontSize: '24px'
        }}
        variant="primary"
      >
        💬
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <Card
          className="chatbot-panel"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <strong>AI Assistant</strong>
            <Badge bg="success">Online</Badge>
          </Card.Header>

          <Card.Body
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '15px'
            }}
          >
            {messages.length === 0 && (
              <div>
                <p>
                  <strong>Hi {userName}, try asking:</strong>
                </p>
                {exampleQueries[userRole]?.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline-primary"
                    size="sm"
                    className="mb-2 w-100 text-start"
                    onClick={() => handleExampleClick(q)}
                    style={{ textAlign: 'left' }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
              >
                <Badge bg={msg.role === 'user' ? 'primary' : 'secondary'}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </Badge>
                <div
                  className="mt-1 p-2 rounded"
                  style={{
                    backgroundColor:
                      msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                    display: 'inline-block',
                    maxWidth: '80%',
                    wordWrap: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-center">
                <em>Thinking...</em>
              </div>
            )}
          </Card.Body>

          <Card.Footer>
            <Form.Control
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  sendMessage()
                }
              }}
              disabled={loading}
            />
            <Button
              className="mt-2 w-100"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </Card.Footer>
        </Card>
      )}
    </>
  )
}



