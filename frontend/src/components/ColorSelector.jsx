import { useState, useEffect } from 'react'
import { Form, InputGroup } from 'react-bootstrap'

function ColorSelector({ selectedColor, onColorSelect }) {
  const [inputValue, setInputValue] = useState(selectedColor)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setInputValue(selectedColor)
  }, [selectedColor])

  const isValidHexColor = (color) => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  const handleInputChange = (e) => {
    let value = e.target.value
    
    if (value && !value.startsWith('#')) {
      value = '#' + value
    }
    
    setInputValue(value)

    if (isValidHexColor(value)) {
      setIsValid(true)
      onColorSelect(value.toUpperCase())
    } else {
      setIsValid(false)
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <InputGroup style={{ width: '300px', margin: '0 auto' }}>
        <InputGroup.Text 
          className="p-0" 
          style={{ 
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <div
            className="rounded-circle"
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: isValid ? inputValue : '#6c757d',
              border: '3px solid #000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </InputGroup.Text>
        
        <Form.Control
          type="text"
          placeholder="#000000"
          value={inputValue}
          onChange={handleInputChange}
          isInvalid={!isValid}
          style={{
            fontSize: '16px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
        />
      </InputGroup>
    </div>
  )
}

export default ColorSelector