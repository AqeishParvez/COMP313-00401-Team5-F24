import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to the Bakery Website</h1>
      <p>Browse our delicious products and place your order online!</p>
    </div>
  )
}

export default App
