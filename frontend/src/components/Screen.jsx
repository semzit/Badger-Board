import { useState, useRef, useEffect } from 'react'
import { Button, Card } from 'react-bootstrap'
import { HashRouter, Route, Routes } from 'react-router'

function Screen() {

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    //draw(context);
  });

  return <canvas ref={canvasRef} width={400} height={400} />;
}

export default Screen
