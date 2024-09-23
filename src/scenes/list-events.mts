import { Context, Markup, Scenes } from 'telegraf'
import { SceneList } from '../constants/scene-list.mjs'
import DB from '../db.mjs'

const ITEMS_PER_PAGE = 5

export const listEvents = new Scenes.BaseScene<Scenes.SceneContext>(
	SceneList.ListEvents,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

listEvents.enter(async ctx => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	ctx.scene.session.page = 0
	await showPage(ctx)
})

listEvents.action(/^page_(.+)$/, async ctx => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	ctx.scene.session.page = parseInt(ctx.match[1])
	await showPage(ctx)
	await ctx.answerCbQuery()
})

async function showPage(ctx: Scenes.SceneContext) {
	let originalMsg

	if ('callback_query' in ctx.update) {
		originalMsg = ctx.update.callback_query.message?.message_id
	}

	const events = Object.entries(DB.getEvents())
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const page = ctx.scene.session.page
	const startIndex = page * ITEMS_PER_PAGE
	const pageEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	const text = pageEvents
		.map(([k, e]) => `${e.displayName ?? e.game}`)
		.join('\n\n')

	const keyboard = Markup.inlineKeyboard([
		page > 0
			? Markup.button.callback('⬅️', `page_${page - 1}`)
			: { text: ' ', callback_data: 'noop' },
		Markup.button.callback(
			`${page + 1}/${Math.ceil(events.length / ITEMS_PER_PAGE)}`,
			'noop',
		),
		page < Math.floor(events.length / ITEMS_PER_PAGE)
			? Markup.button.callback('➡️', `page_${page + 1}`)
			: { text: ' ', callback_data: 'noop' },
	])

	console.log(originalMsg)

	if (originalMsg) {
		await ctx.editMessageText(text, keyboard)
	} else {
	  await ctx.reply(text, keyboard)
	}
}
