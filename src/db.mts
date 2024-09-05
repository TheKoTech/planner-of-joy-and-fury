import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { DBData } from './types/db-data.mjs'
import { dbDefaultData } from './db-default-data.mjs'

export default class DB {
	db?: Low<DBData>

	init = async () => {
		console.log('initializing DB')
		this.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await this.db.write()
		console.log('DB initialized')
	}
}
