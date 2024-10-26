import { Context } from 'telegraf'
import { Update, CallbackQuery } from 'telegraf/types'
import DB from '../db.mjs'
import { DBEventReply } from '../types/db-event-reply.mjs'
import { getEventMessageOptions } from './get-event-message-options.mjs'
import { getEventMessageText } from './get-event-message-text.mjs'

export const handleEventReply = async (
	ctx: Context<Update.CallbackQueryUpdate<CallbackQuery>>,
	reply: DBEventReply
) => {
	console.log(`Handling event reply ${reply.status}`)
	if (!('callback_query' in ctx.update)) {
		console.warn('Skipped: no cb query')
		return
	}
	if (!ctx.chat) {
		console.warn('Skipped: chat not defined')
		return
	}

	const msg = ctx.update.callback_query.message
	if (!msg) {
		console.warn('Skipped: no callback_query.message')
		return
	}

	if (!('match' in ctx) || !Array.isArray(ctx.match)) {
		throw new Error('You forgot to add the ID to callback')
	}

	const eventId =
		ctx.match[1] || `${ctx.chat.id}:${ctx.callbackQuery.message?.message_id}`

	if (!eventId) {
		console.warn('Handling event reply: no event id', { eventId })
		return
	}
	console.log(`Handling reply for event ${eventId}`)

	const statusChanged = DB.updateEventReply(
		eventId,
		ctx.update.callback_query.from.id,
		reply
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
		getEventMessageOptions(eventId)
	)
}
