import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import DB from './db.mjs'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN!)

const db = new DB()
db.init()

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

bot.command('plan', async () => {})
bot.command('free', async () => {})
bot.command('busy', async () => {})
bot.command('games', async () => {})
bot.command('settings', async () => {})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
