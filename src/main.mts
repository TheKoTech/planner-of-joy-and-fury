import dotenv from 'dotenv'
import { Markup, Scenes, session, Telegraf } from 'telegraf'
import { busy } from './commands/busy.mjs'
import { free } from './commands/free.mjs'
import { games } from './commands/games.mjs'
import { plan } from './commands/plan.mjs'
import { settings } from './commands/settings.mjs'
import { start } from './commands/start.mjs'
import DB from './db.mjs'
import { BotContext } from './types/bot-context.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

/** @todo ID */
const scene1 = new Scenes.BaseScene<Scenes.SceneContext>('id1', {
	enterHandlers: [],
	handlers: [],
	leaveHandlers: [],
	ttl: 3600,
})
scene1.enter(async ctx => {
	await ctx.reply('Entered Scene', {
		reply_markup: {
			inline_keyboard: [[Markup.button.callback('Ping', 'cb1')]],
		},
	})
})
scene1.action('cb1', async ctx => {
	console.log('callback!', ctx)
	return await ctx.reply(`pong`)
})
scene1.leave(async ctx => await ctx.reply('Left Scene'))
scene1.hears('test', async ctx => await ctx.reply('Scene'))
scene1.command('leave', async ctx => await ctx.scene.leave())

const stage = new Scenes.Stage<Scenes.SceneContext>([scene1])

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN)
const db = new DB()

// const createCommands = () => {
//   start(bot);
//   plan(bot);
//   free(bot);
//   busy(bot);
//   games(bot);
//   settings(bot);
// };

db.init().then(() => {
	// createCommands();
	bot.use(session())
	bot.use(stage.middleware())
	bot.command(
		'sessions',
		async ctx => await ctx.reply(`${ctx.session.__scenes}`),
	)
	bot.command('test1', async ctx => await ctx.scene.enter('id1'))

	bot.launch().catch(e => console.error(e))
	console.log('Bot launched')

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'))
	process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
