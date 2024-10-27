import { Markup } from 'telegraf'
import { createBaseScene } from '../utils/create-base-scene.mjs'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'

export const start = createBaseScene(SceneList.Start)

start.enter(async ctx => {
	if (!('message' in ctx.update)) return ctx.scene.leave()

	const author = ctx.update.message.from
	const user = DB.getUser(author.id)

	if (!user) return ctx.scene.leave()

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
				[Markup.button.callback('Объявить сбор', 'start__plan-game')],
				[Markup.button.callback('Поменять ник', 'start__set-name')],
				[Markup.button.callback('Пригласить', 'start__invite')],
			],
		},
	})
})

start.action('start__plan-game', async ctx => ctx.scene.enter(SceneList.Plan))

start.action('start__set-name', async ctx => ctx.scene.enter(SceneList.SetName))

start.action('start__invite', async ctx => ctx.scene.enter(SceneList.Invite))
