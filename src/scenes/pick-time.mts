import { Markup } from 'telegraf'
import { createBaseScene } from '../utils/create-base-scene.mjs'
import DB from '../db.mjs'
import { EventReplyStatus } from '../enums/event-reply-status.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'

export const pickTime = createBaseScene(SceneList.PickTime)

pickTime.enter(async ctx => {
	let message = `Во сколько пойдёшь?`
	message += `\n\nМожешь текстом, например:`
	message += `\n\nНа 4 часа раньше`
	message += `\nНа 999 минут позже`
	message += `\nОпоздаю на 15 минут`

	await ctx.telegram.sendMessage(ctx.chat!.id, message, {
		disable_notification: true,
		reply_markup: {
			inline_keyboard: [
				[Markup.button.callback('На 2 часа раньше', 'pick-time__2e')],
				[Markup.button.callback('На 1 час раньше', 'pick-time__1e')],
				[Markup.button.callback('На 1 час позже', 'pick-time__1l')],
				[Markup.button.callback('На 2 часа позже', 'pick-time__2l')],
			],
		},
	})
})

pickTime.action(/^pick-time__(.+)/, async ctx => {
	if (!('callback_query' in ctx.update)) return
	if (!ctx.chat) return

	const msg = ctx.update.callback_query.message
	if (!msg) return

	const state = ctx.scene.state as Record<string, unknown>
	const eventId = state.eventId as string

	console.log('pickTime')

	const args = ctx.match[1]

	if (!args) return

	DB.updateEventReply(eventId, ctx.from.id, {
		status: EventReplyStatus.PickedTime,
		timeOffset: args,
	})

	const event = DB.getEvent(eventId)

	if (!event) {
		console.log(`Updating pick-time failed: event ${eventId} not found`)
		return
	}

	const [chatId, msgId] = eventId.split(':')

	const text = getEventMessageText(event)

	const opts = getEventMessageOptions(eventId)
	await ctx.telegram
		.editMessageText(+chatId, +msgId, undefined, text, opts)
		.catch(() =>
			console.warn(`Failed to update message text`, {
				chatId,
				msgId,
				text,
				opts,
			}),
		)
})
