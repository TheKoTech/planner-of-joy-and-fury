import { User } from '@telegraf/types'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './db-default-data.mjs'
import { DBData } from './types/db-data.mjs'
import { DBEventReply } from './types/db-event-reply.mjs'
import { DBEvent } from './types/db-event.mjs'
import { DBUser } from './types/db-user.mjs'
import { UserRole } from './enums/user-role.mjs'

export default class DB {
	static db: Low<DBData>

	static async init() {
		console.log('initializing DB...')
		DB.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await DB.db.write()
		console.log('DB initialized')
	}

	static getUser(id: number): DBUser | undefined
	static getUser(username: string): DBUser | undefined

	static getUser(query: number | string): DBUser | undefined {
		const dbData = this.db.data

		if (typeof query === 'number') {
			return dbData.users[query]
		}

		return Object.values(dbData.users).find(user => user.username === query)
	}

	static getUserId(username: string): number | undefined {
		const user = Object.entries(this.db.data.users).find(
			([, u]) => u.username === username,
		)

		return user?.[0] ? +user?.[0] : undefined
	}

	static getUserList(ids: number[]): DBUser[] {
		return Object.entries(this.db.data.users)
			.filter(([k]) => ids.includes(+k))
			.map(([, v]) => v)
	}

	static inviteUser(username: string, byId: number): void {
		console.log('Adding new user')

		if (!username) {
			console.error(`User does not have a username`, username)
			throw new Error("У нового пользователя нет username'а O_O")
		}

		const by = DB.getUser(byId)

		if (!by || by.role < UserRole.СуперЧел) {
			console.error(
				`User with id ${byId} has insufficient rights to invite user ${username}`,
			)
			throw new Error('У вас недостаточно прав')
		}

		const dbUserId = DB.getUserId(username)
		const dbUser = dbUserId === undefined ? undefined : DB.getUser(dbUserId)

		if (dbUser && dbUser.role !== UserRole.ЧелВБане) throwExists()

		const isInvited = this.db.data.pendingInvites.some(u => u === username)

		if (isInvited) throwExists()

		if ((dbUser && dbUser.role !== UserRole.ЧелВБане) || isInvited) {
			throwExists()
		} else if (dbUser && dbUser.role === UserRole.ЧелВБане) {
			DB.unBan(dbUserId!, byId)
		}

		this.db.data.pendingInvites.push(username)
		this.db.write()

		function throwExists() {
			console.error(`User ${username} already exists`)
			throw new Error('Такой пользователь уже есть')
		}
	}

	static addUser(user: User): undefined {
		const existingUser = DB.getUser(user.id)
		if (existingUser) return

		const username = user.username

		const invitedUserIndex = this.db.data.pendingInvites.findIndex(
			u => u === username,
		)

		if (!username || invitedUserIndex === -1) return

		const newUser: DBUser = {
			username: username,
			displayName: username,
			availability: {},
			gamesInterested: {},
			settings: {},
			role: UserRole.Чел,
		}

		this.db.data.users[user.id] = newUser
		console.log({
			invites: this.db.data.pendingInvites,
			index: invitedUserIndex,
		})
		this.db.data.pendingInvites.splice(invitedUserIndex, 1)
		console.log({
			invites: this.db.data.pendingInvites,
			index: invitedUserIndex,
		})
		this.db.write()

		console.log('User added successfully')
	}

	static ban(targetId: number, byId: number): boolean {
		return DB.updateRole(targetId, byId, UserRole.ЧелВБане)
	}

	static unBan(targetId: number, byId: number): boolean {
		return DB.updateRole(targetId, byId, UserRole.Чел)
	}

	private static updateRole(
		targetId: number,
		byId: number,
		role: UserRole,
	): boolean {
		const target = DB.getUser(targetId)
		const by = DB.getUser(byId)

		if (!target || !by || by.role <= target.role) return false

		target.role = role
		this.db.write()

		return true
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

	static canDeleteEvent(eventId: string, fromId: number): boolean
	static canDeleteEvent(event: DBEvent, fromId: number): boolean

	static canDeleteEvent(event: DBEvent | string, fromId: number): boolean {
		if (typeof event === 'string') {
			return DB.getEvent(event)?.authorId === fromId
		}

		return event.authorId === fromId
	}

	static deleteEvent(eventId: string, fromId: number): DBEvent | undefined {
		const event = DB.getEvent(eventId)

		if (!event) {
			console.error(`Event with id ${eventId} doesn't exist`)
			throw Error(`События с ID ${eventId} не существует`)
		}

		if (!DB.canDeleteEvent(event, fromId)) {
			console.log(
				`User ${fromId} tried to delete event ${eventId}, but has insufficient rights`,
			)
			return
		}

		delete this.db.data.events[eventId]
		this.db.write()

		return event
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
