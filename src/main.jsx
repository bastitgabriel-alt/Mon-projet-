import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

// Une nouvelle version active immédiatement le nouveau service worker et
// recharge la page, pour que les élèves n'aient jamais à vider leur cache
// manuellement après une mise à jour de l'appli.
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
