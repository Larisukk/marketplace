import React from 'react'
import type { MessageDTO, UUID } from '../types/index'
import { fmtTime } from '../utils/format'

export const MessageBubble: React.FC<{ me: UUID, msg: MessageDTO }> = ({ me, msg }) => {
  const isMe = msg.senderId === me
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
      <div className={'bubble ' + (isMe ? 'me' : 'them')}>
        {msg.body}
      </div>
      <div className="timestamp">{fmtTime(msg.createdAt)}</div>
    </div>
  )
}
