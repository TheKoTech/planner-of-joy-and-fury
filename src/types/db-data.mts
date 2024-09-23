import { DBEvent } from './db-event.mjs'
import { DBUser } from './db-user.mjs'

export type DBData = {
	users: Record<number, DBUser>
	/** key is composite: `chat_id:message_id` */
	events: Record<string, DBEvent>
	/** key is of a replica message for an event, value is the key of the event */
	eventLinks: Record<string, string>
}
