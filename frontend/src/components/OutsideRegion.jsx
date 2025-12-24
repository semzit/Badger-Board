import { useState, useEffect } from 'react'
// Added Badge to the list below
import { Form, Button, Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap'

export default function BuildingForm() {
    const [availableBoards, setAvailableBoards] = useState([]); 
    const [isLoadingBoards, setIsLoadingBoards] = useState(true);
    const [error, setError] = useState(null); // Added this missing state
    
    const REST_URL = import.meta.env.REACT_APP_REST_URL || `http://localhost:8080`; 

    useEffect(() => {
        // Prevent scroll for the "Outside Region" look
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const fetchBoards = async () => {
            try {
                setIsLoadingBoards(true);
                const response = await fetch(`${REST_URL}/api/boards`);
                
                if (!response.ok) throw new Error('Failed to fetch boards');
                
                const data = await response.json();
                console.log("Received data:", data); 
                setAvailableBoards(data);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setIsLoadingBoards(false);
            } 
        }; 

        fetchBoards(); 

        return () => {
            document.body.style.overflow = previous || "auto";
        };
    }, [REST_URL]);
    

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
                        fontSize: 20,
                        marginBottom: '30px'
                    }}>
                    Enter a building recorded in our database to interact with its drawing board!
                </p>

                <Card style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '15px',
                    padding: '20px'
                }}>
                    <h5 className="text-white mb-3">Available Boards:</h5>
                    
                    {isLoadingBoards ? (
                        <div className="text-white-50 italic">Checking database...</div>
                    ) : error ? (
                        <Alert variant="danger" className="py-2">
                            Error: {error}
                        </Alert>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {availableBoards.length > 0 ? (
                                availableBoards.map((board, idx) => (
                                    <Badge 
                                        key={idx} 
                                        bg="light" 
                                        text="dark"
                                        style={{ fontSize: '1rem', padding: '10px 15px' }}
                                    >
                                        {/* This line handles ["bruh"] safely */}
                                        {typeof board === 'string' ? board : (board.boardName || "Unnamed Board")}
                                    </Badge>
                                ))
                            ) : (
                                <div className="text-white-50">No boards registered yet.</div>
                            )}
                        </div>
                    )}
                </Card>
            </Container>
        </div>
    );
}