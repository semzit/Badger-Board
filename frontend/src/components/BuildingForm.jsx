import { useState } from 'react'
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router'

function BuildingForm() {
  const navigate = useNavigate()
  const [buildingName, setBuildingName] = useState('')
  const [password, setPassword] = useState('')
  const [vertices, setVertices] = useState([
    { lat: '', lng: '' },
    { lat: '', lng: '' },
    { lat: '', lng: '' },
    { lat: '', lng: '' }
  ])
  const [status, setStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVertexChange = (index, field, value) => {
    const newVertices = [...vertices]
    newVertices[index][field] = value
    setVertices(newVertices)
  }

  const validateForm = () => {
    if (!buildingName.trim()) {
      setStatus({ type: 'danger', message: 'Building name is required' })
      return false
    }

    if (!password.trim()) {
      setStatus({ type: 'danger', message: 'Password is required' })
      return false
    }

    for (let i = 0; i < 4; i++) {
      const v = vertices[i]
      if (!v.lat || !v.lng) {
        setStatus({ type: 'danger', message: `Vertex ${i + 1} is incomplete` })
        return false
      }
      
      const lat = parseFloat(v.lat)
      const lng = parseFloat(v.lng)
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setStatus({ type: 'danger', message: `Vertex ${i + 1}: Invalid latitude (must be -90 to 90)` })
        return false
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setStatus({ type: 'danger', message: `Vertex ${i + 1}: Invalid longitude (must be -180 to 180)` })
        return false
      }
    }

    return true
  }

  const handleDelete = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setStatus(null)

    try {
      const boardInit = Array(100).fill(0).map(() => Array(100).fill(0));
      const response = await fetch(`/api/deleteBoard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          boardName : buildingName,
          password : password
        })
      })

      if (response.ok) {
        setStatus({ type: 'success', message: 'Building removed successfully!' })
        // Reset form
        setBuildingName('')
        setPassword('')
      } else {
        const error = await response.json()
        setStatus({ type: 'danger', message: error.message || 'Failed to add building' })
      }
    } catch (error) {
      setStatus({ type: 'danger', message: 'Network error: ' + error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setStatus(null)

    try {
      const boardInit = Array(100).fill(0).map(() => Array(100).fill(0));
      const response = await fetch(`/api/setBoard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          boardName : buildingName,
          password : password, 
          board: {
            drawing : boardInit, 
            coords : [
              [parseFloat(vertices.at(0).lat), parseFloat(vertices.at(0).lng)], 
              [parseFloat(vertices.at(1).lat), parseFloat(vertices.at(1).lng)],
              [parseFloat(vertices.at(2).lat), parseFloat(vertices.at(2).lng)],
              [parseFloat(vertices.at(3).lat), parseFloat(vertices.at(3).lng)],
            ]
          }
        })
      })

      if (response.ok) {
        setStatus({ type: 'success', message: 'Building added successfully!' })
        // Reset form
        setBuildingName('')
        setPassword('')
        setVertices([
          { lat: '', lng: '' },
          { lat: '', lng: '' },
          { lat: '', lng: '' },
          { lat: '', lng: '' }
        ])
      } else {
        const error = await response.json()
        setStatus({ type: 'danger', message: error.message || 'Failed to add building' })
      }
    } catch (error) {
      setStatus({ type: 'danger', message: 'Network error: ' + error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#c5050c',
        padding: '40px 20px'
      }}
    >
      <Container style={{ maxWidth: '900px' }}>

        <Link 
          to="/"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2001,
            textDecoration: 'none'
          }}
        >
          <Button
            variant="light"
            size="sm"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Home
          </Button>
        </Link>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <h2 className="text-center mb-4" style={{ color: '#c5050c', fontWeight: 'bold' }}>
            Add/Remove A New Building
          </h2>
          
          <p className="text-center text-muted mb-4">
            Building corners not needed for remove operation
          </p>

          {status && (
            <Alert variant={status.type} onClose={() => setStatus(null)} dismissible>
              {status.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Building Name */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333' }}>
                Building Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Morgridge Hall"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #dee2e6'
                }}
              />
            </Form.Group>

            {/* Vertices */}
            <h5 className="mb-3" style={{ color: '#c5050c' }}>Building Corners</h5>
            
            {vertices.map((vertex, index) => (
              <Card key={index} className="mb-3" style={{ border: '2px solid #f0f0f0' }}>
                <Card.Body>
                  <h6 style={{ color: '#c5050c', marginBottom: '15px' }}>
                    Vertex {index + 1}
                  </h6>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Latitude</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.000001"
                          placeholder="43.073051"
                          value={vertex.lat}
                          onChange={(e) => handleVertexChange(index, 'lat', e.target.value)}
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Longitude</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.000001"
                          placeholder="-89.401230"
                          value={vertex.lng}
                          onChange={(e) => handleVertexChange(index, 'lng', e.target.value)}
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            {/* Password */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333' }}>
                Password
              </Form.Label>
              <Form.Control
                type="number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #dee2e6'
                }}
              />
            </Form.Group>

            {/* Submit Button */}
            <div className="d-grid gap-2 mt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #c5050c 0%, #ff0000 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {isSubmitting ? 'Adding Building...' : 'Add Building'}
              </Button>
            </div>
          </Form>
          
          <Form onSubmit={handleDelete}>

            {/* Submit Button */}
            <div className="d-grid gap-2 mt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #c5050c 0%, #ff0000 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {isSubmitting ? 'Removing Building...' : 'Remove Building'}
              </Button>
            </div>
            
          </Form>
          
        </div>
      </Container>
    </div>
  )
}

export default BuildingForm