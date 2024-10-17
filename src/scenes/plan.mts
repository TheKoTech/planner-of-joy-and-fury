import { Context, Scenes } from 'telegraf'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import DB from '../db.mjs'
import { DBEvent } from '../types/db-event.mjs'
import { EventReplyStatus } from '../enums/event-reply-status.mjs'
import { SceneContext } from '../types/scene-context.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'
import { DBEventReply } from '../types/db-event-reply.mjs'
import { CallbackQuery, Update } from 'telegraf/types'

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
	let message = `Напиши название и время, например:\n\n`

	message += `NMS 20:30`
	message += `Дилдак в 19`
	message += `Factorio пн 21:10`
	message += `D&D 20.10 21:10`

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
		getEventMessageOptions(),
	)

	DB.createEvent(`${message.chat.id}:${message.message_id}`, event)

	await ctx.scene.leave()
})

export const handleEventReply = async (
	ctx: Context<Update.CallbackQueryUpdate<CallbackQuery>>,
	reply: DBEventReply,
) => {
	if (!('callback_query' in ctx.update)) return
	if (!ctx.chat) return

	const msg = ctx.update.callback_query.message
	if (!msg) return

	// @ts-expect-error This should be called with a regex
	const eventId = ctx.match?.[1]

	if (!eventId) {
		console.log('Handling event reply: no event id')
		return
	}
	console.log(`Handling reply for event ${eventId}`)

	const statusChanged = DB.updateEventReply(
		eventId,
		ctx.update.callback_query.from.id,
		reply,
	)

	if (!statusChanged) return

	const event = DB.getEvent(eventId)

	if (!event) return

	const text = getEventMessageText(event)

	await ctx.telegram.editMessageText(
		msg.chat.id,
		msg.message_id,
		undefined,
		text,
		getEventMessageOptions(eventId),
	)
}
