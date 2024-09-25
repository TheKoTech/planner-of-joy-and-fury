import { Markup, Scenes } from 'telegraf'
import { SceneList } from '../constants/scene-list.mjs'
import DB from '../db.mjs'
import { SceneContext } from '../types/scene-context.mjs'
import { getEventMessageText } from '../utils/get-event-message-text.mjs'
import { eventMessageOptions } from '../constants/event-message-options.mjs'

const ITEMS_PER_PAGE = 4

export const listEvents = new Scenes.BaseScene<
	Scenes.SceneContext<SceneContext>
>(SceneList.ListEvents, {
	ttl: 7200,
	/* these are here just because they're required */
	enterHandlers: [],
	handlers: [],
	leaveHandlers: [],
})

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

	const text = getEventMessageText(event)

	return ctx.editMessageText(
		text,
		Markup.inlineKeyboard([
			Markup.button.callback('⬅️', 'display_back'),
			Markup.button.callback('📌', `display_pin:${eventId}`),
			Markup.button.callback('🔄', 'display_refresh'),
		]),
	)
})

listEvents.action('display_back', async ctx => await showPage(ctx))
listEvents.action(/^display_pin:(.*)$/, async ctx => {
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
		eventMessageOptions,
	)
})
listEvents.action(
	'display_refresh',
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
		.map(([, e]) => `${e.displayName ?? e.game}`)
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
			...pageEvents.map(([k, pe]) =>
				Markup.button.callback(pe.displayName ?? pe.game, `display:${k}`),
			),
		],
		{
			columns: 3,
			wrap(_, index) {
				return index >= 3
			},
		},
	)

	if (originalMsg) {
		return ctx.editMessageText(text, keyboard)
	} else {
		if (isEmpty) return ctx.reply('Событий нет')
		return ctx.reply(text, keyboard)
	}
}
