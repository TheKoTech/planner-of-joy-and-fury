import { Context, Scenes } from 'telegraf'
import { eventMessageOptions } from '../constants/event-message-options.mjs'
import { SceneList } from '../constants/scene-list.mjs'
import DB from '../db.mjs'
import { DBEvent, EventReplyStatus } from '../types/db-event.mjs'
import { SceneContext } from '../types/scene-context.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'

export const plan = new Scenes.BaseScene<Scenes.SceneContext<SceneContext>>(
	SceneList.Plan,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

plan.enter(async ctx => {
	const message = `Напиши название`

	await ctx.telegram.sendMessage(ctx.chat!.id, message, {
		disable_notification: true,
	})
})

plan.on('text', async ctx => {
	const game = ctx.message.text

	const event: DBEvent = {
		game: game,
		replies: { [ctx.message.from.id]: { status: EventReplyStatus.Accepted } },
	}

	const text = getEventMessageText(event)

	const message = await ctx.telegram.sendMessage(
		ctx.chat.id,
		text,
		eventMessageOptions,
	)

	DB.createEvent(`${message.chat.id}:${message.message_id}`, event)

	await ctx.scene.leave()
})

export function drawAvailabilityTable(event: DBEvent): string {
	const users = DB.getUserList(
		Object.entries(event.replies).map(([k]) => +k),
	).map(u => u.displayName)

	return users.join(' ')
}

export const handleAccepted = async (ctx: Context) => {
	if (!('callback_query' in ctx.update)) return
	if (!ctx.chat) return

	const msg = ctx.update.callback_query.message
	if (!msg) return

	const eventId = `${msg.chat.id}:${msg.message_id}`

	const statusChanged = DB.updateEventReply(
		eventId,
		ctx.update.callback_query.from.id,
		EventReplyStatus.Accepted,
	)

	if (!statusChanged) return

	const event = DB.getEvent(eventId)

	if (!event) return

	await ctx.telegram.editMessageText(
		msg.chat.id,
		msg.message_id,
		undefined,
		getEventMessageText(event),
		eventMessageOptions,
	)
}

export const setRejected = async (ctx: Context, eventId: number) => {}

export function getTags(event: DBEvent) {
	const userIds = Object.keys(event.replies).map(v => +v)
	return DB.getUserList(userIds)
		.map(u => `@${u.username}`)
		.join(' ')
}
