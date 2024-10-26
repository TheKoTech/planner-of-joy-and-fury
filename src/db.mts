import { User } from '@telegraf/types'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './db-default-data.mjs'
import { DBData } from './types/db-data.mjs'
import { DBEventReply } from './types/db-event-reply.mjs'
import { DBEvent } from './types/db-event.mjs'
import { DBUser } from './types/db-user.mjs'

export default class DB {
	static db: Low<DBData>

	static async init() {
		console.log('initializing DB...')
		DB.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await DB.db.write()
		console.log('DB initialized')
	}

	static getUser(id: number): DBUser | undefined {
		return this.db?.data.users[id]
	}

	static getUserList(ids: number[]): DBUser[] {
		return Object.entries(this.db.data.users)
			.filter(([k]) => ids.includes(+k))
			.map(([, v]) => v)
	}

	static addUser(user: User): DBUser | undefined {
		console.log('Adding new user')

		if (this.db.data.users[user.id]) {
			console.error(`User with id ${user.id} already exists`, user)
			return
		}

		if (!user.username) {
			console.error(`User does not have a username`, user)
			return
		}

		const newUser: DBUser = {
			username: user.username,
			displayName: user.username,
			availability: {},
			gamesInterested: {},
			settings: {},
		}

		this.db.data.users[user.id] = newUser
		this.db.write()

		console.log('User added successfully')

		return newUser
	}

	static setDisplayName(id: number, newDisplayName: string): void {
		this.db.data.users[id].displayName = newDisplayName
		this.db.write()
	}

	static createEvent(id: string, event: DBEvent): void {
		console.log(`Creating event with id ${id}`, event)
		this.db.data.events[id] = event
		this.db.write()
	}

	static getEvent(id: string): DBEvent | undefined {
		console.log(`Querying event with id ${id}`)
		return this.db.data.events[id]
	}

	static getEvents(): DBData['events'] {
		return this.db.data.events
	}

	static updateEventReply(
		eventId: string,
		userId: number,
		reply: DBEventReply,
	): boolean {
		const event = DB.getEvent(eventId)

		if (!event) {
			console.log(`Skipped updating event reply: event not found ${eventId}`)
			return false
		}

		if (JSON.stringify(event.replies[userId]) === JSON.stringify(reply)) {
			console.log(
				`Skipped updating event ${eventId}: Nothing changed`,
				reply,
				event.replies[userId],
			)
			return false
		}

		event.replies[userId] = {
			...event.replies[userId],
			...reply,
		}
		this.db.write()
		console.log(`Updated event reply for id ${eventId}`, reply)

		return true
	}
}
