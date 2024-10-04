import { Markup } from 'telegraf'
import { ParseMode } from 'telegraf/types'

export const eventMessageOptions = {
	disable_notification: true,
	parse_mode: 'MarkdownV2' as ParseMode,
	reply_markup: {
		inline_keyboard: [
			[Markup.button.callback('✅ Пойду', 'plan__accept')],
			[Markup.button.callback('🤔 50 на 50', 'plan__consider')],
			[Markup.button.callback('❌ Откажусь', 'plan__reject')],
		],
	},
}
