import React, { useEffect, useCallback } from 'react'
import type { UUID } from '../types/index'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from '../components/MessageBubble'
import MessageInput from '../components/MessageInput'
import ConversationHeader from '../components/ConversationHeader'

const ChatWindow: React.FC<{ me: UUID }> = ({ me }) => {
  const { activeConversationId, conversations, messages, actions, loading } = useChat()
  const msgs = activeConversationId ? (messages[activeConversationId] || []) : []
  const participants = conversations.find(c => c.id === activeConversationId)?.participantIds || [me]

  useEffect(() => {
    if (activeConversationId) actions.loadMessages(activeConversationId, 0, 100)
  }, [activeConversationId])

  const onSend = useCallback(async (text: string) => {
    if (!activeConversationId) return
    await actions.send(activeConversationId, me, text)
  }, [activeConversationId, me])

  return (
    <div className="content">
      <ConversationHeader me={me} participants={participants} />
      <div className="messages" id="messages">
        {msgs.map(m => <MessageBubble key={m.id} me={me} msg={m} />)}
      </div>
      <MessageInput onSend={onSend} disabled={!activeConversationId || loading} />
    </div>
  )
}

export default ChatWindow
