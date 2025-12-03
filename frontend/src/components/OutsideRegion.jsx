import { useState, useEffect } from 'react'
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap'

export default function BuildingForm() {
  
    
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
        document.body.style.overflow = previous || "auto";
        };
    }, []);
    

    return (
        <div
            className="p-sm-1 p-md-2 p-lg-3 p-xl-4 p-xxl-5"
            style={{
            minHeight: '100vh',
            background: '#c5050c',
            }}>

            <Container style={{ maxWidth: '900px' }}>
                <h1
                    className="text-center mb-5"
                    style={{
                        color: '#dee2e6',
                        fontWeight: 'bold',
                        fontSize: 50,
                    }}>
                    Outside Marked Region
                </h1>
                <p
                    className="text-center"
                    style={{
                        color: '#dee2e6',
                        fontSize: 20
                    }}>
                    Enter a building recorded in our database to interact with its drawing board!
                </p>
            </Container>

        </div>
    )}