import { Markup, Scenes } from 'telegraf'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { SceneContext } from '../types/scene-context.mjs'

export const start = new Scenes.BaseScene<Scenes.SceneContext<SceneContext>>(
	SceneList.Start,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

start.enter(async ctx => {
	if (!('message' in ctx.update)) return

	const author = ctx.update.message.from
	const user = DB.getUser(author.id) ?? DB.addUser(author)

	if (!user) return await ctx.scene.leave()

	const message = `Привет, ${user?.displayName}\n\n`
	// @todo availability
	// if (user.availability) message += `Сегодня ${user.availability}\n\n`
	// @todo daily events
	// if blah blah blah

	await ctx.telegram.sendMessage(ctx.update.message.chat.id, message, {
		disable_notification: true,
		reply_markup: {
			resize_keyboard: true,
			inline_keyboard: [
				[Markup.button.callback('Объявить сбор', 'plan-game')],
				// [{ text: 'Объявить сбор', callback_data: 'plan' }],
				// [{ text: 'Занятость', callback_data: 'availability' }],
				// [{ text: 'Мои игры', callback_data: 'games' }],
				// [{ text: '', callback_data: 'games' }],
				// [{ text: 'Настройки', callback_data: 'settings' }],
			],
		},
	})
})

start.action('plan-game', async ctx => {
	ctx.scene.enter('c_plan')
})
