import dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import DB from './db.mjs'
import { EventReplyStatus } from './enums/event-reply-status.mjs'
import { SceneList } from './enums/scene-list.mjs'
import { handleEventReply } from './utils/handle-event-reply.mjs'
import { stage } from './stage.mjs'
import { BotContext } from './types/bot-context.mjs'
import { chelOnly, superChelOnly } from './middleware/roles.mjs'
import { addUser } from './middleware/add-user.mjs'

dotenv.config()

export default class Bot {
	static instance: Telegraf<BotContext>
	private static initialized = false

	static async init() {
		if (Bot.initialized) throw new Error('Bot must be a singleton')
		if (!process.env.BOT_TOKEN) throw new Error('No token')

		await DB.init()

		console.log('Initializing bot...')

		Bot.initialized = true

		Bot.instance = new Telegraf<BotContext>(process.env.BOT_TOKEN!)
		Bot.instance.use(addUser)
		Bot.instance.use(session())
		Bot.instance.use(stage.middleware())

		Bot.instance.hears(/^мой робот (тесла|tesla)/i, async (ctx) =>
			ctx.replyWithPhoto(
				{ source: 'src/assets/tesla.png' },
				{
					disable_notification: true,
					// @ts-expect-error somehow this is not a field, even though it definitely is
					reply_to_message_id: ctx.message.message_id,
				}
			)
		)

		Bot.registerCommands()
		Bot.registerActions()

		// Enable graceful stop
		process.once('SIGINT', () => Bot.instance.stop('SIGINT'))
		process.once('SIGTERM', () => Bot.instance.stop('SIGTERM'))

		console.log('Bot initialized')

		return Bot.instance.launch()
	}

	private static registerActions() {
		const bot = Bot.instance

		const actionHandlers = {
			accept: EventReplyStatus.Accepted,
			consider: EventReplyStatus.Considering,
			reject: EventReplyStatus.Rejected,
		} as const

		Object.entries(actionHandlers).forEach(([action, status]) => {
			const matcher = new RegExp(`^plan__${action}:?(.*)$`)
			bot.action(matcher, chelOnly(true), async (ctx) => {
				console.log(`Received action plan__${action} with status ${status}`)
				await handleEventReply(ctx, { status })
			})
		})

		bot.action(/^plan__pick-time:?(.*)?/, chelOnly(true), async (ctx) => {
			const eventId =
				ctx.match[1] ??
				`${ctx.chat?.id}:${ctx.callbackQuery.message?.message_id}`
			console.log(`Entering pick-time scene for event ${eventId}`)
			await ctx.scene.enter(SceneList.PickTime, { eventId })
		})

		bot.action(/^ban__revert:(.*)/, superChelOnly(true), async (ctx) => {
			const userId = ctx.match[1]
			const user = DB.getUser(+userId)
			const isUnBanned = DB.unBan(+userId, ctx.from.id)

			if (!isUnBanned) {
				return ctx.reply(`Оишбка: пользователь ${userId} не найдет для разбана`)
			}

			return ctx.telegram.editMessageText(
				ctx.chat?.id,
				ctx.callbackQuery.message!.message_id,
				undefined,
				`${user?.username} был забанен, а потом разбанен`
			)
		})
	}

	private static registerCommands() {
		const bot = Bot.instance

		bot.command(
			'start',
			chelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.Start)
		)
		bot.command(
			'plan',
			chelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.Plan)
		)
		bot.command(
			'settings',
			chelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.Settings)
		)
		bot.command(
			'setname',
			chelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.SetName)
		)
		bot.command(
			'listevents',
			chelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.ListEvents)
		)
		bot.command('invite', superChelOnly(), async (ctx) => {
			const match = ctx.message.text.match(/^\/invite\s*@?(.*)$/)
			console.log(match)

			return ctx.scene.enter(SceneList.Invite, {
				username: match?.[1],
			})
		})

		bot.command(/^ban.*$/, superChelOnly(), async (ctx) =>
			ctx.scene.enter(SceneList.Ban, {
				username: ctx.message.text.match(/^\/ban\s*@?(.*)$/)?.[1],
			})
		)
		bot.command(
			/^invite.*$/,
			superChelOnly(),
			async (ctx) => await ctx.scene.enter(SceneList.Invite)
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
