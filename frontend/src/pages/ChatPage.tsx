import React, { useEffect } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import { useChat } from '../hooks/useChat'
import type { UUID } from '../types/index'

// TEMP: emulate current user selection until you wire auth
const ME: UUID = '11111111-1111-1111-1111-111111111111'
const OTHER: UUID = '22222222-2222-2222-2222-222222222222'

const ChatPage: React.FC = () => {
  const { actions, conversations } = useChat()

  useEffect(() => {
    actions.setMe(ME)
    // ensure there is a conversation to click on for demo purposes
    actions.loadConversations(ME).then(async () => {
      const exists = conversations.some(c => c.participantIds.includes(OTHER))
      if (!exists) {
        await actions.startOrOpen(ME, OTHER)
      }
    })
  }, [])

  return (
    <div className="container">
      <ChatList me={ME} />
      <ChatWindow me={ME} />
    </div>
  )
}

export default ChatPage
