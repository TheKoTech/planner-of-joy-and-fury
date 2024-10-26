import { createBaseScene } from '../create-base-scene.mjs'
import DB from '../db.mjs'
import { EventReplyStatus } from '../enums/event-reply-status.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'
import { Parser } from '../utils/parser.mjs'

export const plan = createBaseScene(SceneList.Plan)

plan.enter(async (ctx) => {
	let message = `Напиши название, дату и время, например:\n\n`

	message += `Название игры Дата Время\n`
	message += `NMS 20:30\n`
	message += `Deadlock 21.10 21:10\n`
	message += `Factorio пн в 21:10`

	await ctx.telegram.sendMessage(ctx.chat!.id, message, {
		disable_notification: true,
	})
})

plan.on('text', async (ctx) => {
	const messageText = ctx.message.text
	let event
	try {
		event = Parser.parseEvent(messageText)
	} catch (e) {
		console.error(e)
		ctx.reply((e as Error).message)
		ctx.scene.leave()
	}

	if (!event) {
		console.error('Failed to parse event', messageText)
		await ctx.reply('Ты хуйню написал какую-то. Попробуй ещё раз, что ли')
		return ctx.scene.leave()
	}

	event.replies[ctx.from.id] = {
		status: EventReplyStatus.Accepted,
	}

	const text = getEventMessageText(event)
	const options = getEventMessageOptions()

	const message = await ctx.telegram.sendMessage(ctx.chat.id, text, options)
	DB.createEvent(`${ctx.chat.id}:${message.message_id}`, event)

	return ctx.scene.leave()
})
