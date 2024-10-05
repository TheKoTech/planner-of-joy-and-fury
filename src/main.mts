import dotenv from 'dotenv'
import { Scenes, session, Telegraf } from 'telegraf'
import DB from './db.mjs'
import { plan, handleEventReply } from './scenes/plan.mjs'
import { SceneList } from './enums/scene-list.mjs'
import { setName } from './scenes/set-name.mjs'
import { settings } from './scenes/settings.mjs'
import { start } from './scenes/start.mjs'
import { listEvents } from './scenes/list-events.mjs'
import { SceneContext } from './types/scene-context.mjs'
import { BotContext } from './types/bot-context.mjs'
import { EventReplyStatus } from './enums/event-reply-status.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

const stage = new Scenes.Stage<Scenes.SceneContext<SceneContext>>([
	start,
	plan,
	settings,
	setName,
	listEvents,
])

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)
const db = new DB()

db.init().then(() => {
	bot.use(session())
	bot.use(stage.middleware())
	bot.command('start', async ctx => await ctx.scene.enter(SceneList.Start))

	bot.command('plan', async ctx => await ctx.scene.enter(SceneList.Plan))
	bot.action(/^plan__accept:?/, async ctx => {
		await handleEventReply(ctx, EventReplyStatus.Accepted)
	})
	bot.action(/^plan__consider:?/, async ctx => {
		await handleEventReply(ctx, EventReplyStatus.Considering)
	})
	bot.action(/^plan__reject:?/, async ctx => {
		await handleEventReply(ctx, EventReplyStatus.Rejected)
	})

	bot.command(
		'settings',
		async ctx => await ctx.scene.enter(SceneList.Settings),
	)

	bot.command('setname', async ctx => await ctx.scene.enter(SceneList.SetName))

	bot.command(
		'listevents',
		async ctx => await ctx.scene.enter(SceneList.ListEvents),
	)

	// bot.command(
	// 	'crash',
	// 	async () =>
	// 		await bot.telegram.sendPhoto(
	// 			-1001964753343,
	// 			{
	// 				source: 'src/assets/i fell.png',
	// 			},
	// 			{ disable_notification: true },
	// 		).then(async () => bot.stop('SIGINT')),
	// )

	/** @todo delete when DB is filled */
	bot.on('message', async ctx => DB.autofillUsername(ctx.message.from))

	bot.launch().catch(e => {
		console.error(e)
		return bot.telegram.sendPhoto(
			-1001964753343,
			{ source: 'src/assets/i fell.png' },
			{ disable_notification: true },
		)
	})
	console.log('Bot launched')

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'))
	process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
