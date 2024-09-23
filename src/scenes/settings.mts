import { Markup, Scenes } from 'telegraf'
import { SceneList } from '../constants/scene-list.mjs'

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

	await ctx.reply('Настройки', {
		disable_notification: true,
		reply_markup: {
			resize_keyboard: true,
			inline_keyboard: [
				[Markup.button.callback('Установить ник', 'settings__set-username')],
			],
		},
	})
})

settings.action('settings__set-username', async ctx =>
	ctx.scene.enter(SceneList.SetName),
)
