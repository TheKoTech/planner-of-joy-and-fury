import { User } from '@telegraf/types'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './db-default-data.mjs'
import { DBData } from './types/db-data.mjs'
import { DBUser } from './types/db-user.mjs'

export default class DB {
	static db?: Low<DBData>

	init = async () => {
		console.log('initializing DB')
		DB.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await DB.db.write()
		console.log('DB initialized')
	}

	static getUser(id: number): DBUser | undefined {
		return this.db?.data.users[id]
	}

	static addUser(user: User): DBUser {
		if (this.db!.data.users[user.id]) throw new Error('User exists')

		const newUser = {
			name: user.username ?? user.first_name,
			availability: {},
			gamesInterested: {},
			settings: {},
		}

		this.db!.data.users[user.id] = newUser
		this.db!.write()

		return newUser
	}
}
