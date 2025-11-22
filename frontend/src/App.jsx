import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import Screen from './components/Screen'

function App() {
  const [count, setCount] = useState(0);

  return <Card>

    <Screen/>

  </Card>
}

export default App
