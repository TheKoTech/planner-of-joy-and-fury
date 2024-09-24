import { Scenes } from 'telegraf'
import { SceneList } from '../constants/scene-list.mjs'
import DB from '../db.mjs'
import { SceneContext } from '../types/scene-context.mjs'

export const setName = new Scenes.BaseScene<Scenes.SceneContext<SceneContext>>(
	SceneList.SetName,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

setName.enter(async ctx => {
	let from
	let originalMsg

	if ('message' in ctx.update) from = ctx.update.message.from.id
	if ('callback_query' in ctx.update) {
		from = ctx.update.callback_query.from.id
		originalMsg = ctx.update.callback_query.message?.message_id
	}

	if (!from) return

	if (originalMsg) {
		return await ctx.editMessageText('Напиши новый никнейм')
	}

	await ctx.reply('Напиши новый никнейм', { disable_notification: true })
})

setName.on('text', async ctx => {
	DB.setDisplayName(ctx.message.from.id, ctx.message.text)

	ctx.reply(`Изменено имя на "${ctx.message.text}"`, {
		disable_notification: true,
	})

	ctx.scene.leave()
})
