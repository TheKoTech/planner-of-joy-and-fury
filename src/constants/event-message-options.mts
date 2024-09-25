import { Markup } from 'telegraf'

export const eventMessageOptions = {
	disable_notification: true,
	reply_markup: {
		inline_keyboard: [
			[Markup.button.callback('✅ Пойду', 'plan__accept')],
			[Markup.button.callback('❌ Откажусь', 'plan__reject')],
		],
	},
}
