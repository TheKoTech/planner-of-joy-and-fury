import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'

export type DBData = {
	users: unknown[]
	events: unknown[]
}

export default class DB {
	static defaultData = { users: [], events: [] }
	db?: Low<DBData>

	init = async () => {
		this.db = await JSONFilePreset<DBData>('db.json', DB.defaultData)
		await this.db.write()
	}
}
