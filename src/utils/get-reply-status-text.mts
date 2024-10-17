import { EventReplyStatus } from '../enums/event-reply-status.mjs'
import { DBEventReply } from '../types/db-event-reply.mjs'

type ReplyStatusTextMap = {
	[K in EventReplyStatus]: string
}

export const getReplyStatusText = (reply: DBEventReply): string => {
	const map: ReplyStatusTextMap = {
		[EventReplyStatus.Accepted]: '✅ Будет',
		[EventReplyStatus.Considering]: '🤔 Думает',
		[EventReplyStatus.Rejected]: '❌ Отказался',
		[EventReplyStatus.Busy]: '❓ Занят',
		[EventReplyStatus.Free]: '❔ Свободен',
		[EventReplyStatus.PickedTime]: `🕑 ${reply.timeOffset}`,
	}

	console.log(
		`Got reply status text for reply ${reply.status}`,
		reply,
		map[reply.status],
	)

	return map[reply.status]
}
