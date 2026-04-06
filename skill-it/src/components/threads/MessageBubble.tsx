import type { Message } from '@/types'

type MessageBubbleProps = {
  message: Message
  isCurrentUser: boolean
  senderName?: string
}

export default function MessageBubble({ message, isCurrentUser, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {!isCurrentUser && senderName && (
        <span className="text-[11px] text-muted px-1">{senderName}</span>
      )}
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${
          isCurrentUser
            ? 'bg-ember text-white rounded-br-md shadow-md shadow-ember/20'
            : 'bg-raised border border-edge text-fg rounded-bl-md'
        }`}
      >
        <p className="leading-relaxed">{message.Content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isCurrentUser ? 'text-white/60' : 'text-muted/60'
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
