import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChatProvider } from './context/ChatContext'
import ChatPage from './pages/ChatPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  </React.StrictMode>
)
