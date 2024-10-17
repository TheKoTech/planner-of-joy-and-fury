import { EventReplyStatus } from '../enums/event-reply-status.mjs'

export type DBEventReply = {
	status: EventReplyStatus
	timeOffset?: string
}
