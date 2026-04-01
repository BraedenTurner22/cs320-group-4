import type { Message } from '@/types'

type MessageBubbleProps = {
  message: Message
  isCurrentUser: boolean
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isCurrentUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <p>{message.Content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isCurrentUser ? 'text-indigo-200' : 'text-gray-400'
          }`}
        >
          {new Date(message.sent_on).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
