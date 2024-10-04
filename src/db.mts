import { User } from '@telegraf/types'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './db-default-data.mjs'
import { DBData } from './types/db-data.mjs'
import { DBUser } from './types/db-user.mjs'
import { DBEvent } from './types/db-event.mjs'
import { EventReplyStatus } from './enums/event-reply-status.mjs'

export default class DB {
	static db: Low<DBData>

	init = async () => {
		console.log('initializing DB')
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

	/** forgot to include usernames to @tag them. I'm such a fucking idiot */
	static autofillUsername(user: User): void {
		const dbUser = this.db.data.users[user.id] ?? this.addUser(user)

		if (!user.username) return

		dbUser.username = user.username
		this.db.write()
	}

	static addUser(user: User): DBUser | undefined {
		if (this.db.data.users[user.id]) throw new Error('User exists')
		if (!user.username) return

		const newUser: DBUser = {
			username: user.username!,
			displayName: user.username ?? user.first_name,
			availability: {},
			gamesInterested: {},
			settings: {},
		}

		this.db.data.users[user.id] = newUser
		this.db.write()

		return newUser
	}

	static setDisplayName(id: number, newDisplayName: string): void {
		this.db.data.users[id].displayName = newDisplayName
		this.db.write()
	}

	static createEvent(id: string, event: DBEvent): void {
		this.db.data.events[id] = event
		this.db.write()
	}

	static createEventLink(sourceId: string, targetId: string) {
		this.db.data.eventLinks[targetId] = sourceId
		this.db.write()
	}

	static getEvent(id: string): DBEvent | undefined {
		let event: DBEvent | undefined = this.db.data.events[id]

		event ??= DB.getEvent(this.db.data.eventLinks[id])

		return event
	}

	static getEvents(): DBData['events'] {
		return this.db.data.events
	}

	static updateEventReply(
		eventId: string,
		userId: number,
		replyStatus: EventReplyStatus
	): boolean {
		const event = DB.getEvent(eventId)

		if (!event) {
			console.log(`event not found: ${eventId}`)
		}

		if (!event) return false

		console.log({ reply: event.replies[userId], replyStatus })

		if (event.replies[userId]?.status === replyStatus) return false

		event.replies[userId] = {
			...event.replies[userId],
			status: replyStatus,
		}
		this.db.write()

		return true
	}
}
