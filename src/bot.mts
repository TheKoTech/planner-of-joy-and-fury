import dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import DB from './db.mjs'
import { EventReplyStatus } from './enums/event-reply-status.mjs'
import { SceneList } from './enums/scene-list.mjs'
import { handleEventReply } from './scenes/plan.mjs'
import { stage } from './stage.mjs'
import { BotContext } from './types/bot-context.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

export default class Bot {
	static instance: Telegraf<BotContext>
	private static initialized = false

	static async init() {
		if (Bot.initialized) return

		Bot.initialized = true

		Bot.instance = new Telegraf<BotContext>(process.env.BOT_TOKEN!)
		Bot.instance.use(session())
		Bot.instance.use(stage.middleware())

		Bot.registerCommands()
		Bot.registerActions()

		await DB.init()
		await Bot.instance.launch()
		console.log('Bot launched')

		// Enable graceful stop
		process.once('SIGINT', () => Bot.instance.stop('SIGINT'))
		process.once('SIGTERM', () => Bot.instance.stop('SIGTERM'))
	}

	private static registerActions() {
		const bot = Bot.instance

		const actionHandlers = {
			accept: EventReplyStatus.Accepted,
			consider: EventReplyStatus.Considering,
			reject: EventReplyStatus.Rejected,
		} as const

		Object.entries(actionHandlers).forEach(([action, status]) => {
			bot.action(`plan__${action}:?(.*)`, async (ctx) => {
				await handleEventReply(ctx, { status })
			})
		})

		bot.action(/^plan__pick-time:?(.*)?/, async (ctx) => {
			const eventId =
				ctx.match[1] ??
				`${ctx.chat?.id}:${ctx.callbackQuery.message?.message_id}`
			console.log(`entering pick-time for event ${eventId}`)
			await ctx.scene.enter(SceneList.PickTime, { eventId })
		})
	}

	private static registerCommands() {
		const bot = Bot.instance

		bot.command('start', async (ctx) => await ctx.scene.enter(SceneList.Start))
		bot.command('plan', async (ctx) => await ctx.scene.enter(SceneList.Plan))
		bot.command(
			'settings',
			async (ctx) => await ctx.scene.enter(SceneList.Settings)
		)
		bot.command(
			'setname',
			async (ctx) => await ctx.scene.enter(SceneList.SetName)
		)
		bot.command(
			'listevents',
			async (ctx) => await ctx.scene.enter(SceneList.ListEvents)
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
	}
}
