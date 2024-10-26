import { createBaseScene } from '../utils/create-base-scene.mjs'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'

export const setName = createBaseScene(SceneList.SetName)

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
	const newName = ctx.message.text

	if (newName.length > 20) {
		await ctx.reply(
			'во 1) имя должно быть меньше или равно 20 символам вовторых пошел нахуй в третьих 3) нехуй бота ломать уёбок',
		)
		return ctx.scene.leave()
	}

	await ctx.reply(`Изменено имя на "${newName}"`, {
		disable_notification: true,
	})
	DB.setDisplayName(ctx.message.from.id, ctx.message.text)

	return ctx.scene.leave()
})
