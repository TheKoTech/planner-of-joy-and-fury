import { Markup, Telegraf } from "telegraf";
import DB from "../db.mjs";

export const start = (bot: Telegraf) => {
  bot.command("start", async (ctx) => {
    console.log(`start fired`);
    // const author = ctx.message.from
    // const user = DB.getUser(author.id) ?? DB.addUser(author)

    // const message = `Привет, ${user.name}\n\n`
    // @todo availability
    // if (user.availability) message += `Сегодня ${user.availability}\n\n`
    // @todo daily events
    // if blah blah blah

    // const msg = await ctx.telegram.sendMessage(ctx.message.chat.id, message, {
    // 	reply_markup: {
    // 		resize_keyboard: true,
    // 		inline_keyboard: [
    // 			[Markup.button.callback('Объявить сбор', 'start__plan-game')],
    // 			[Markup.button.callback('Занятость', 'start__availability')],
    // 			[Markup.button.callback('', 'start_plan-game')],
    // [Markup.button.callback('Объявить сбор', 'start_plan-game')],
    // [Markup.button.callback('Объявить сбор', 'start_plan-game')],
    // [Markup.button.callback('Объявить сбор', 'start_plan-game')],
    // [{ text: 'Объявить сбор', callback_data: 'plan' }],
    // [{ text: 'Занятость', callback_data: 'availability' }],
    // [{ text: 'Мои игры', callback_data: 'games' }],
    // [{ text: '', callback_data: 'games' }],
    // [{ text: 'Настройки', callback_data: 'settings' }],
    // 		],
    // 	},
    // })

    // bot.action('start__plan-game', async () => {
    // 	console.log('callback')
    // 	let planGameMessage =
    // 		'Во что играем? Если игры нет в списке, ответь на это сообщение названием игры в таком формате:\n\n'
    // 	planGameMessage += '<игра> <день?> <время?>\n'
    // 	planGameMessage += 'deadlock сегодня 19-23\n'
    // 	planGameMessage += 'nms 12.21 18\n'
    // 	planGameMessage += 'minecraft\n\n'
    // 	planGameMessage += 'По умолчанию, день = сегодня, время = 18-24 МСК'

    // 	try {
    // 		await ctx.telegram.editMessageText(
    // 			ctx.chat.id,
    // 			msg.message_id,
    // 			undefined,
    // 			planGameMessage,
    // 		)
    // 		await ctx.telegram.editMessageReplyMarkup(
    // 			ctx.chat.id,
    // 			msg.message_id,
    // 			undefined,
    // 			{
    // 				inline_keyboard: [
    // 					[Markup.button.callback('@todo', 'start__plan-game__todo')],
    // 				],
    // 			},
    // 		)
    // 	} catch (err) {
    // 		console.log(err)
    // 	}

    // 	bot.on('message', () => undefined)
    // })
  });
};
