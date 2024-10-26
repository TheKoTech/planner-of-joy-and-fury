import { Markup, Scenes } from 'telegraf'
import { SceneList } from '../enums/scene-list.mjs'
import DB from '../db.mjs'
import { SceneContext } from '../types/scene-context.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'
import { getEventMessageOptions } from '../utils/get-event-message-options.mjs'
import { createBaseScene } from '../create-base-scene.mjs'

const ITEMS_PER_PAGE = 4

export const listEvents = createBaseScene(SceneList.ListEvents)

listEvents.enter(async ctx => {
	ctx.scene.session.page = 0
	await showPage(ctx)
})

listEvents.action(/^page:(.+)$/, async ctx => {
	ctx.scene.session.page = parseInt(ctx.match[1])
	await showPage(ctx)
})

listEvents.action(/^display:(.+)$/, async ctx => {
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

listEvents.action('display__back', async ctx => await showPage(ctx))
listEvents.action(/^display__pin:(.*)$/, async ctx => {
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
		getEventMessageOptions(eventId),
	)
})

listEvents.action(
	'display__refresh',
	async ctx => await ctx.answerCbQuery('refresh'),
)

listEvents.action(/^display:(.*)$/, async ctx => console.log(ctx.update))

async function showPage(ctx: Scenes.SceneContext<SceneContext>) {
	let originalMsg

	if ('callback_query' in ctx.update) {
		originalMsg = ctx.update.callback_query.message?.message_id
	}

	console.log(ctx.scene.session)
	const events = Object.entries(DB.getEvents())
	const page = ctx.scene.session.page
	const startIndex = page * ITEMS_PER_PAGE
	const pageEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	const isEmpty = !pageEvents.length

	const text = pageEvents
		.map(([, e]) => `${e.displayName ?? e.name}`)
		.join('\n\n')

	const keyboard = Markup.inlineKeyboard(
		[
			page > 0
				? Markup.button.callback('⬅️', `page:${page - 1}`)
				: { text: ' ', callback_data: 'noop' },
			Markup.button.callback(
				`${page + 1}/${Math.ceil(events.length / ITEMS_PER_PAGE)}`,
				'noop',
			),
			page < Math.floor(events.length / ITEMS_PER_PAGE)
				? Markup.button.callback('➡️', `page:${page + 1}`)
				: { text: ' ', callback_data: 'noop' },
			...pageEvents.map(([k, pe]) => {
				console.log(`Listing event with id ${k}`)
				return Markup.button.callback(pe.displayName ?? pe.name, `display:${k}`)
			}),
		],
		{
			columns: 3,
			wrap(_, index) {
				return index >= 3
			},
		},
	)

	if (originalMsg) {
		return ctx.editMessageText(text, { ...keyboard, parse_mode: 'MarkdownV2' })
	} else {
		if (isEmpty) return ctx.replyWithMarkdown('Событий нет')
		return ctx.reply(text, { ...keyboard, parse_mode: 'MarkdownV2' })
	}
}
