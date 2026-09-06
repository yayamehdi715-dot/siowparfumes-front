import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initPixels } from './utils/pixels'

// Chargement des pixels publicitaires avant le premier rendu.
// Le PageView initial est émis par PixelTracker, pas ici.
initPixels()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)