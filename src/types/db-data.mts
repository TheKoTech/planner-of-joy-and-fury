import { DBEvent } from './db-event.mjs'
import { DBUser } from './db-user.mjs'

export type DBData = {
	users: DBUser[]
	events: DBEvent[]
}
