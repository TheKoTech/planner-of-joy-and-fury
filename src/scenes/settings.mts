import { Markup, Scenes } from 'telegraf'
import DB from '../db.mjs'
import { SceneList } from './scene-list.mjs'

export const settings = new Scenes.BaseScene<Scenes.SceneContext>(
	SceneList.Settings,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

settings.enter(async ctx => {
	if (!('message' in ctx.update)) return

	const author = ctx.update.message.from
	const user = DB.getUser(author.id) ?? DB.addUser(author)

	// const message = `Привет, ${user.name}\n\n`
	// @todo availability
	// if (user.availability) message += `Сегодня ${user.availability}\n\n`
	// @todo daily events
	// if blah blah blah

	await ctx.reply('Настройки', {
		reply_markup: {
			resize_keyboard: true,
			inline_keyboard: [
				[Markup.button.callback('Установить ник', 'settings__set-username')],
			],
		},
	})
})

settings.action('settings__set-username', async (ctx) => ctx.scene.enter(SceneList.SetName))
