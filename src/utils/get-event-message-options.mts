import { Markup } from 'telegraf'
import { ParseMode } from 'telegraf/types'

export const getEventMessageOptions = (eventId?: string) => ({
	disable_notification: true,
	parse_mode: 'MarkdownV2' as ParseMode,
	reply_markup: {
		inline_keyboard: [
			...[
				['✅ Пойду', `plan__accept`],
				['🤔 50 на 50', `plan__consider`],
				['❌ Откажусь', `plan__reject`],
				// ['🕑 Выбрать время', `plan__pick-time`],
				['🗑 Удалить', 'plan__delete'],
			].map(([text, callbackQueryId]) => [
				Markup.button.callback(
					text,
					eventId ? `${callbackQueryId}:${eventId}` : callbackQueryId,
				),
			]),
		],
	},
})
