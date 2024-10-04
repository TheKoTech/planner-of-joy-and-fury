import { EventReplyStatus } from '../enums/event-reply-status.mjs'

type ReplyStatusTextMap = {
	[K in EventReplyStatus]: string
}

export const replyStatusText: ReplyStatusTextMap = {
	[EventReplyStatus.Accepted]: '✅ Будет',
	[EventReplyStatus.Considering]: '🤔 Думает',
	[EventReplyStatus.Rejected]: '❌ Отказался',
	[EventReplyStatus.Busy]: '❓ Занят',
	[EventReplyStatus.Free]: '❔ Свободен',
}
