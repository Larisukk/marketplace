import React, { useState } from 'react'

type Props = {
  onSend: (text: string) => Promise<void> | void
  disabled?: boolean
}

const MessageInput: React.FC<Props> = ({ onSend, disabled }) => {
  const [text, setText] = useState('')

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    await onSend(trimmed)
    setText('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="composer">
      <input
        className="input"
        placeholder="Type a message"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button className="btn" onClick={handleSend} disabled={disabled}>Send</button>
    </div>
  )
}

export default MessageInput
