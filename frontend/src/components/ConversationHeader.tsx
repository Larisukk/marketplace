import React from 'react'
import type { UUID } from '../types/index'

const ConversationHeader: React.FC<{ me: UUID, participants: UUID[] }> = ({ me, participants }) => {
  const other = participants.find(p => p !== me) ?? 'Unknown'
  return (
    <div className="header">
      <div style={{ fontWeight: 600 }}>Conversation</div>
      <div style={{ opacity: .7, fontSize: 14 }}>with {other}</div>
    </div>
  )
}

export default ConversationHeader
