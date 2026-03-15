import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LangProvider } from "./context/LangProvider.jsx";

import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <LangProvider>
    <AuthProvider>
    <App />
    </AuthProvider>
    </LangProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
