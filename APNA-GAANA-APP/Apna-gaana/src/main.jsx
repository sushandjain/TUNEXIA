import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PlayerContext from './context/PlayerContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <PlayerContext>
     <App />
    </PlayerContext>
  </StrictMode>,
  </BrowserRouter>
)
