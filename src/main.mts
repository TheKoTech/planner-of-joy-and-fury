import dotenv from 'dotenv'
import { Markup, Scenes, session, Telegraf } from 'telegraf'
import { busy } from './scenes/busy.mjs'
import { free } from './scenes/free.mjs'
import { games } from './scenes/games.mjs'
import { plan } from './scenes/plan.mjs'
import { settings } from './scenes/settings.mjs'
import { start } from './scenes/start.mjs'
import DB from './db.mjs'
import { BotContext } from './types/bot-context.mjs'
import { SceneList } from './scenes/scene-list.mjs'
import { setName } from './scenes/set-name.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

// /** @todo ID */
// const scene1 = new Scenes.BaseScene<Scenes.SceneContext>('id1', {
// 	enterHandlers: [],
// 	handlers: [],
// 	leaveHandlers: [],
// 	ttl: 3600,
// })
// scene1.enter(async ctx => {
// 	await ctx.reply('Entered Scene', {
// 		reply_markup: {
// 			inline_keyboard: [[Markup.button.callback('Ping', 'cb1')]],
// 		},
// 	})
// })
// scene1.action('cb1', async ctx => {
// 	console.log('callback!', ctx)
// 	return await ctx.reply(`pong`)
// })
// scene1.leave(async ctx => await ctx.reply('Left Scene'))
// scene1.hears('test', async ctx => await ctx.reply('Scene'))
// scene1.command('leave', async ctx => await ctx.scene.leave())

const stage = new Scenes.Stage<Scenes.SceneContext>([
	start,
	plan,
	settings,
	setName,
])

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
	bot.command('start', async ctx => await ctx.scene.enter(SceneList.Start))
	bot.command('plan', async ctx => await ctx.scene.enter(SceneList.Plan))
	bot.action('plan__accept', async ctx => {
		if ('callback_query' in ctx.update) {
			console.log(ctx.update.callback_query)
		}
	})
	bot.action('plan__reject', async ctx => {
		if ('callback_query' in ctx.update) {
			console.log(ctx.update.callback_query)
		}
	})

	bot.command(
		'settings',
		async ctx => await ctx.scene.enter(SceneList.Settings),
	)

	bot.launch().catch(e => console.error(e))
	console.log('Bot launched')

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'))
	process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
