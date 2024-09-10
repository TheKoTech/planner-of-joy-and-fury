import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { busy } from './commands/busy.mjs'
import { free } from './commands/free.mjs'
import { games } from './commands/games.mjs'
import { plan } from './commands/plan.mjs'
import { settings } from './commands/settings.mjs'
import { start } from './commands/start.mjs'
import DB from './db.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

const bot = new Telegraf(process.env.BOT_TOKEN)
const db = new DB()

const createCommands = () => {
	start(bot)
	plan(bot)
	free(bot)
	busy(bot)
	games(bot)
	settings(bot)
}

db.init().then(() => {
	createCommands()
	bot.launch().catch(e => console.error(e))
	console.log('Bot launched')

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'))
	process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
