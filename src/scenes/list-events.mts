import { Markup, Scenes } from 'telegraf'
import { SceneList } from '../constants/scene-list.mjs'
import DB from '../db.mjs'
import { SceneContext } from '../types/scene-context.mjs'

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

listEvents.enter(async (ctx) => {
	ctx.scene.session.page = 0
	await showPage(ctx)
})

listEvents.action(/^page:(.+)$/, async (ctx) => {
	ctx.scene.session.page = parseInt(ctx.match[1])
	await showPage(ctx)
	await ctx.answerCbQuery()
})

listEvents.action(/^display:(.*)$/, async (ctx) => console.log(ctx.update))

async function showPage(ctx: Scenes.SceneContext<SceneContext>) {
	let originalMsg

	if ('callback_query' in ctx.update) {
		originalMsg = ctx.update.callback_query.message?.message_id
	}

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
				'noop'
			),
			page < Math.floor(events.length / ITEMS_PER_PAGE)
				? Markup.button.callback('➡️', `page:${page + 1}`)
				: { text: ' ', callback_data: 'noop' },
			...pageEvents.map(([k, pe]) =>
				Markup.button.callback(pe.displayName ?? pe.game, `display:${k}`)
			),
		],
		{
			columns: 3,
			wrap(_, index) {
				return index >= 3
			},
		}
	)

	if (originalMsg) {
		return ctx.editMessageText(text, keyboard)
	} else {
		if (isEmpty) return ctx.reply('Событий нет')
		return ctx.reply(text, keyboard)
	}
}
