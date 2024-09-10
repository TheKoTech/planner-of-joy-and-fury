import { DBEvent } from './db-event.mjs'
import { DBUser } from './db-user.mjs'

export type DBData = {
	users: Record<number, DBUser>
	events: Record<number, DBEvent>
}
