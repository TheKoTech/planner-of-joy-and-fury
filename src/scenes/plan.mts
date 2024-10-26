import { Context } from 'telegraf'
import { CallbackQuery, Update } from 'telegraf/types'
import { gameDateTimeRe } from '../constants/game-date-time-regex.mjs'
import { createBaseScene } from '../create-base-scene.mjs'
import DB from '../db.mjs'
import { EventReplyStatus } from '../enums/event-reply-status.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { DBEventReply } from '../types/db-event-reply.mjs'
import { DBEvent } from '../types/db-event.mjs'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'

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

	const match = messageText.match(gameDateTimeRe)

	if (!match || !match.groups) {
		console.warn(`Could not parse message ${messageText}`, match)
		return
	}

	// const { game, day_of_week, date, time } = match.groups
	const game = match.groups?.['name']
	// const dayOfWeek = match.groups?.['day_of_week']
	// const date = match.groups?.['date']
	const time = match.groups?.['time']

	if (game.length > 100) {
		console.warn(`Game name is too long: "${game}"`)
		await ctx.reply('Имя игры должно быть короче 100 символов')
		await ctx.scene.leave()
		return
	}

	console.log(`Successfully parsed message "${messageText}"`, match.groups)

	const eventDate = new Date()
	let hours, minutes

	if (time) {
		const timeMatch = time.match(/(?<h>\d+):?(?<m>\d+)?/)

		if (timeMatch) {
			hours = timeMatch.groups?.['h']
			minutes = timeMatch.groups?.['m']
		}
	}

	// let dayNumber: number | undefined

	// if (dayOfWeek) {
	// 	const days = {
	// 		0: ['пн', 'пнд', 'понедельник'],
	// 		1: ['вт', 'втр', 'вторник'],
	// 		2: ['ср', 'срд', 'среда'],
	// 		3: ['чт', 'чтг', 'чтв', 'четверг'],
	// 		4: ['пт', 'птн', 'пятница'],
	// 		5: ['сб', 'сбт', 'суббота'],
	// 		6: ['вс', 'вск', 'воскресенье'],
	// 	}

	// 	dayNumber = Number(
	// 		Object.entries(days).find(([, val]) => val.includes(dayOfWeek))?.[0] ??
	// 			-1,
	// 	)
	// }

	if (hours) {
		if (
			+hours < eventDate.getHours() ||
			(!minutes && +hours === eventDate.getHours())
		) {
			eventDate.setDate(eventDate.getDate() + 1)
		}

		if (
			minutes &&
			+hours === eventDate.getHours() &&
			+minutes <= eventDate.getMinutes()
		) {
			eventDate.setDate(eventDate.getDate() + 1)
		}

		eventDate.setHours(+hours)
		eventDate.setMinutes(minutes ? +minutes : 0)
	}

	// if (dayNumber) {
	// 	eventDate.setDate(eventDate.getDate() + 7 - (dayNumber - eventDate.getDay()))

	// }

	const event: DBEvent = {
		game: game,
		date: eventDate.toString(),
		replies: { [ctx.message.from.id]: { status: EventReplyStatus.Accepted } },
	}

	const text = getEventMessageText(event)

	const message = await ctx.telegram.sendMessage(
		ctx.chat.id,
		text,
		getEventMessageOptions()
	)

	DB.createEvent(`${message.chat.id}:${message.message_id}`, event)

	await ctx.scene.leave()
})

export const handleEventReply = async (
	ctx: Context<Update.CallbackQueryUpdate<CallbackQuery>>,
	reply: DBEventReply
) => {
	if (!('callback_query' in ctx.update)) return
	if (!ctx.chat) return

	const msg = ctx.update.callback_query.message
	if (!msg) return

	const eventId =
		// @ts-expect-error This should be called with a regex
		ctx.match?.[1] || `${ctx.chat.id}:${ctx.callbackQuery.message?.message_id}`

	if (!eventId) {
		console.log('Handling event reply: no event id', { eventId })
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
