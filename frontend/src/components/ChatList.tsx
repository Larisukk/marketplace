import React, { useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import type { UUID } from '../types/index'

type Props = { me: UUID }

const ChatList: React.FC<Props> = ({ me }) => {
  const { conversations, activeConversationId, actions } = useChat()

  useEffect(() => {
    actions.loadConversations(me)
  }, [me])

  return (
    <div className="sidebar">
      {conversations.map(c => {
        const other = c.participantIds.find(id => id !== me) ?? 'Unknown'
        const active = c.id === activeConversationId
        return (
          <div key={c.id} className={active ? 'item active' : 'item'} onClick={() => actions.openConversation(c.id)}>
            <div><strong>Chat</strong></div>
            <div style={{ fontSize: 12, opacity: .7 }}>with: {other}</div>
          </div>
        )
      })}
    </div>
  )
}

export default ChatList
