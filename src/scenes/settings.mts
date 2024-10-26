import { Markup } from 'telegraf'
import { createBaseScene } from '../create-base-scene.mjs'
import { SceneList } from '../enums/scene-list.mjs'

export const settings = createBaseScene(SceneList.Settings)

settings.enter(async (ctx) => {
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

settings.action('settings__set-username', async (ctx) =>
	ctx.scene.enter(SceneList.SetName)
)
