import { DBEventReply } from './db-event-reply.mjs'

export type DBEvent = {
	name: string
	date: string
	/** key is user id*/
	replies: Record<number, DBEventReply>
	displayName?: string
}
