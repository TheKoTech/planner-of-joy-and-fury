import { Context, Markup, Scenes } from 'telegraf'
import { SceneList } from './scene-list.mjs'
import DB from '../db.mjs'
import { DBEvent, EventReplyStatus } from '../types/db-event.mjs'

export const plan = new Scenes.BaseScene<Scenes.SceneContext>(SceneList.Plan, {
	ttl: 7200,
	/* these are here just because they're required */
	enterHandlers: [],
	handlers: [],
	leaveHandlers: [],
})

plan.enter(async ctx => {
	const message = `Напиши название`

	await ctx.telegram.sendMessage(ctx.chat!.id, message, {
		disable_notification: true,
	})
})

const messageOptions = {
	disable_notification: true,
	reply_markup: {
		inline_keyboard: [
			[Markup.button.callback('✅ Пойду', 'plan__accept')],
			[Markup.button.callback('❌ Откажусь', 'plan__reject')],
		],
	},
}
plan.on('text', async ctx => {
	const game = ctx.message.text

	const event: DBEvent = {
		game: game,
		replies: { [ctx.message.from.id]: EventReplyStatus.Accepted },
	}

	const text = getPlanMessageText(event)

	const message = await ctx.telegram.sendMessage(
		ctx.chat.id,
		text,
		messageOptions,
	)

	DB.createEvent(message.message_id, event)

	await ctx.scene.leave()
})

function getPlanMessageText(event: DBEvent) {
	let text = `Сбор на ${event.game}\n\n`
	text += drawAvailabilityTable(event) + '\n\n'
	text += getTags(event)

	return text
}

function drawAvailabilityTable(event: DBEvent): string {
	const users = DB.getUserList(
		Object.entries(event.replies).map(([k]) => +k),
	).map(u => u.displayName)

	return users.join(' ')
}

export const setAccepted = async (ctx: Context, eventId: number) => {
	if (!('callback_query' in ctx.update)) return

	const updated = DB.updateEventReply(
		eventId,
		ctx.update.callback_query.from.id,
		EventReplyStatus.Accepted,
	)

	if (!updated) return

	const event = DB.getEvent(eventId)
	if (!event) return

	await ctx.telegram.editMessageText(
		ctx.chat?.id,
		eventId,
		undefined,
		getPlanMessageText(event),
		messageOptions,
	)
}

export const setRejected = async (ctx: Context, eventId: number) => {}

function getTags(event: DBEvent) {
	const userIds = Object.keys(event.replies).map(v => +v)
	return DB.getUserList(userIds)
		.map(u => `@${u.username}`)
		.join(' ')
}
