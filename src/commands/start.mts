import { Telegraf } from 'telegraf'

export const start = (bot: Telegraf) => {
	bot.command('start', async ctx =>
		ctx.telegram.sendMessage(ctx.message.chat.id, 'Hi bitch', {
			reply_markup: {
				resize_keyboard: true,
				inline_keyboard: [
					[{ text: 'Запланировать игру', callback_data: 'plan' }],
					[{ text: 'Занятость', callback_data: 'availability' }],
					[{ text: 'Мои игры', callback_data: 'games' }],
					[{ text: 'Настройки', callback_data: 'settings' }],
				],
			},
		}),
	)
}
