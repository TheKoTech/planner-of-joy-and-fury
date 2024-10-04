import { EventReplyStatus } from '../enums/event-reply-status.mjs'

export type DBEvent = {
	game: string
	/** key is user id*/
	replies: Record<number, Reply>
	displayName?: string
}

type Reply = {
	status: EventReplyStatus
}


