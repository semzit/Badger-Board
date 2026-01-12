import { useState } from 'react'
import { Button } from 'react-bootstrap'

function LandingPage({ onEnter, isExiting }) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    setIsPressed(true)
    setTimeout(() => {
      onEnter()
    }, 300)
  }
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: isExiting ? 'blur(0px)' : 'blur(20px)',
        WebkitBackdropFilter: isExiting ? 'blur(0px)' : 'blur(20px)',
        opacity: isExiting ? 0 : 1,
        transition: 'backdrop-filter 1.5s ease-out, opacity 1.5s ease-out',
        pointerEvents: isExiting ? 'none' : 'auto'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transform: isExiting ? 'scale(0.95)' : 'scale(1)',
          opacity: isExiting ? 0 : 1,
          transition: 'all 0.8s ease-out'
        }}
      >
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #c5050c 0%, #ff5555 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 10px rgba(197, 5, 12, 0.2)',
            lineHeight: '1.3',
            paddingBottom: '0.2rem'
          }}
        >
          Badger Board
        </h1>
      
        <p
          style={{
            fontSize: '1.1rem',
            marginBottom: '3rem',
            color: '#666',
            maxWidth: '500px',
            lineHeight: '1.6'
          }}
        >
          1. Only users within the building can access this canvas, and this is the only canvas they can access.<br/>
          2. No hate symbols, harassment, or explicit imagery.<br/>
          3. Have fun!
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleClick}
          disabled={isPressed}
          style={{
            padding: '15px 50px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            borderRadius: '50px',
            background: isPressed 
              ? 'linear-gradient(135deg, #9a0000 0%, #c5050c 100%)'
              : 'linear-gradient(135deg, #c5050c 0%, #ff0000 100%)',
            border: 'none',
            boxShadow: isPressed
              ? '0 2px 8px rgba(197, 5, 12, 0.4), inset 0 4px 8px rgba(0, 0, 0, 0.3)'
              : '0 8px 20px rgba(197, 5, 12, 0.5)',
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.1s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (!isPressed) {
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = '0 12px 30px rgba(197, 5, 12, 0.6)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isPressed) {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 8px 20px rgba(197, 5, 12, 0.5)'
            }
          }}
        >
          {isPressed ? (
            <>
              <span style={{ 
                display: 'inline-block',
                animation: 'ripple 0.6s ease-out'
              }}>
                Entering...
              </span>
            </>
          ) : (
            'Enter Board'
          )}
        </Button>

        {/* Ripple effect */}
        {isPressed && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              width: '100px',
              height: '100px',
              marginLeft: '-50px',
              marginTop: '-50px',
              borderRadius: '50%',
              border: '3px solid #c5050c',
              animation: 'expandRipple 0.8s ease-out',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes expandRipple {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(15);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage