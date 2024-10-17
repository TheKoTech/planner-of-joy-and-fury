import { DBEventReply } from './db-event-reply.mjs'

export type DBEvent = {
	game: string
	/** key is user id*/
	replies: Record<number, DBEventReply>
	displayName?: string
}
