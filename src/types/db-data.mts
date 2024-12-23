import { DBEvent } from './db-event.mjs'
import { DBUser } from './db-user.mjs'

export type DBData = {
	users: Record<number, DBUser>
	/** a list of usernames */
	pendingInvites: string[]
	/** key is composite: `chat_id:message_id` */
	events: Record<string, DBEvent>
}
