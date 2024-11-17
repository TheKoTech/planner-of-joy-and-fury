import { Markup, Scenes } from 'telegraf'
import { SceneList } from '../enums/scene-list.mjs'
import DB from '../db.mjs'
import { SceneContext } from '../types/scene-context.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { createBaseScene } from '../utils/create-base-scene.mjs'
import moment from 'moment'
import { DBEvent } from '../types/db-event.mjs'

const ITEMS_PER_PAGE = 4

export const listEvents = createBaseScene(SceneList.ListEvents)

listEvents.enter(async (ctx) => {
	ctx.scene.session.page = 0
	await showPage(ctx)
})

listEvents.action(/^page:(.+)$/, async (ctx) => {
	ctx.scene.session.page = parseInt(ctx.match[1])
	await showPage(ctx)
})

listEvents.action(/^display:(.+)$/, async (ctx) => {
	const eventId = ctx.match[1]
	const event = DB.getEvent(eventId)

	/** @todo stub */
	if (!event) return
	console.log(`Displaying event with id ${eventId}`)

	const text = getEventMessageText(event)

	return ctx.editMessageText(text, {
		...Markup.inlineKeyboard([
			Markup.button.callback('⬅️', 'display__back'),
			Markup.button.callback('📌', `display__pin:${eventId}`),
			Markup.button.callback('🔄', 'display__refresh'),
		]),
		parse_mode: 'MarkdownV2',
	})
})

listEvents.action('display__back', async (ctx) => await showPage(ctx))
listEvents.action(/^display__pin:(.*)$/, async (ctx) => {
	const callback = ctx.update.callback_query
	const eventId = ctx.match[1]
	const event = DB.getEvent(eventId)

	if (!callback.message) return
	if (!event) return

	await ctx.deleteMessage(callback.message?.message_id)
	await ctx.scene.leave()
	await ctx.telegram.sendMessage(
		callback.message.chat.id,
		getEventMessageText(event),
		getEventMessageOptions(eventId)
	)
})

listEvents.action(
	'display__refresh',
	async (ctx) => await ctx.answerCbQuery('refresh')
)

listEvents.action(/^display:(.*)$/, async (ctx) => console.log(ctx.update))

async function showPage(ctx: Scenes.SceneContext<SceneContext>) {
	let originalMsg

	if ('callback_query' in ctx.update) {
		originalMsg = ctx.update.callback_query.message?.message_id
	}

	console.log(ctx.scene.session)
	const events = Object.entries(DB.getEvents()).reverse()
	const page = ctx.scene.session.page
	const startIndex = page * ITEMS_PER_PAGE
	const pageEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	const isEmpty = !pageEvents.length

	const text = 'Выбери событие'

	const keyboard = Markup.inlineKeyboard(
		[
			page > 0
				? Markup.button.callback('⬅️', `page:${page - 1}`)
				: { text: ' ', callback_data: 'noop' },
			Markup.button.callback(
				`${page + 1}/${Math.ceil(events.length / ITEMS_PER_PAGE)}`,
				'noop'
			),
			page < Math.floor(events.length / ITEMS_PER_PAGE)
				? Markup.button.callback('➡️', `page:${page + 1}`)
				: { text: ' ', callback_data: 'noop' },
			...pageEvents.map(([k, event]) => {
				console.log(`Listing event with id ${k}`)
				return Markup.button.callback(
					`${event.displayName ?? event.name}, ${formatDate(event)}`,
					`display:${k}`
				)
			}),
		],
		{
			columns: 3,
			wrap(_, index) {
				return index >= 3
			},
		}
	)

	if (originalMsg) {
		return ctx.editMessageText(text, { ...keyboard, parse_mode: 'MarkdownV2' })
	} else {
		if (isEmpty) return ctx.replyWithMarkdown('Событий нет')
		return ctx.reply(text, { ...keyboard, parse_mode: 'MarkdownV2' })
	}
}
function formatDate(e: DBEvent) {
	const date = moment(e.date)

	if (date.isSame(moment(), 'day')) {
		return `сегодня в ${date.format('HH:mm')}`
	}

	if (date.isSame(moment().add(1, 'day'), 'day')) {
		return `завтра в ${date.format('HH:mm')}`
	}

	return `${date.format('DD.MM')} в ${date.format('HH:mm')}`
}
