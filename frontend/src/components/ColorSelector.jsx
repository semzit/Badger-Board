import { useState, useEffect, useRef, useCallback } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { HexColorPicker } from 'react-colorful'

function ColorSelector({ selectedColor, onColorSelect }) {
  const [inputValue, setInputValue] = useState(selectedColor)
  const [isValid, setIsValid] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerColor, setPickerColor] = useState(selectedColor)
  const [justChanged, setJustChanged] = useState(false)
  const containerRef = useRef(null)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    if (!isUpdatingRef.current) {
      setInputValue(selectedColor)
      setPickerColor(selectedColor)
    }
  }, [selectedColor])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const isValidHexColor = (color) => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  const handleInputChange = (e) => {
    let value = e.target.value
    
    // Only allow valid hex characters (0-9, A-F, a-f, #)
    value = value.replace(/[^0-9A-Fa-f#]/g, '')
    
    // Ensure only one # at the start
    if (value.includes('#')) {
      const parts = value.split('#')
      value = '#' + parts.filter(p => p).join('')
    }
    
    // Limit to 7 characters max (#RRGGBB)
    if (value.length > 7) {
      value = value.substring(0, 7)
    }
    
    // Auto-add # if missing and user starts typing
    if (value && !value.startsWith('#')) {
      value = '#' + value
    }
    
    setInputValue(value)

    if (isValidHexColor(value)) {
      setIsValid(true)
      setPickerColor(value.toUpperCase())
      onColorSelect(value.toUpperCase())
      
      // Trigger bounce animation
      setJustChanged(true)
      setTimeout(() => setJustChanged(false), 300)
    } else {
      setIsValid(false)
    }
  }

  const handlePickerChange = useCallback((color) => {
    const upperColor = color.toUpperCase()
    
    // Prevent update loop
    if (upperColor === inputValue) return
    
    isUpdatingRef.current = true
    setPickerColor(upperColor)
    setInputValue(upperColor)
    setIsValid(true)
    onColorSelect(upperColor)
    
    // Trigger bounce animation
    setJustChanged(true)
    setTimeout(() => setJustChanged(false), 300)
    
    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 50)
  }, [inputValue, onColorSelect])

  const togglePicker = () => {
    setShowPicker(!showPicker)
  }

  return (
    <div style={{ 
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000
    }}>
      {/* Glass Container */}
      <div 
        ref={containerRef}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '15px 20px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        <InputGroup style={{ width: '220px' }}>
          <InputGroup.Text 
            className="p-0" 
            style={{ 
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            <div
              className="rounded-circle"
              onClick={togglePicker}
              style={{
                width: '45px',
                height: '45px',
                backgroundColor: isValid ? inputValue : '#6c757d',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isValid 
                  ? `0 4px 15px ${inputValue}44, 0 0 0 ${justChanged ? '8px' : '0px'} ${inputValue}33`
                  : '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease, background-color 0.5s ease, box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: justChanged ? 'scale(1.15)' : 'scale(1)',
                backdropFilter: 'blur(5px)',
                marginRight: '12px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!justChanged) {
                  e.target.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!justChanged) {
                  e.target.style.transform = 'scale(1)'
                }
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
              fontSize: '14px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#000',
              transition: 'all 0.3s ease, color 0.4s ease',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
              padding: '8px 12px'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)'
              e.target.style.boxShadow = `0 0 0 3px ${inputValue}33`
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
            }}
          />
        </InputGroup>

        {/* Color Picker Popup */}
        {showPicker && (
          <div 
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <HexColorPicker 
              color={pickerColor} 
              onChange={handlePickerChange}
              style={{
                width: '180px',
                height: '180px'
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .react-colorful {
          border-radius: 12px;
        }
        
        .react-colorful__saturation {
          border-radius: 12px 12px 0 0;
        }
        
        .react-colorful__hue {
          border-radius: 8px;
          height: 20px;
          margin-top: 12px;
        }
        
        .react-colorful__pointer {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  )
}

export default ColorSelector