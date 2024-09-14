import { Markup, Scenes } from 'telegraf'
import { SceneList } from './scene-list.mjs'

export const plan = new Scenes.BaseScene<Scenes.SceneContext>(
	SceneList.Plan,
	{
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	},
)

plan.enter(async ctx => {
	// let user: User | undefined;

	// if ('message' in ctx.update) user = ctx.update.message
	// if ('callback_query' in ctx.update) user = ctx.chat
	// if (!user) return; // @todo log

	// user can be either in update.message or *.callback_query
	// if (!('message' in ctx.update)) return

	// const author = ctx.update.message.from
	// const user = DB.getUser(author.id) ?? DB.addUser(author)

	const message = `Напиши название`
	// @todo availability
	// if (user.availability) message += `Сегодня ${user.availability}\n\n`
	// @todo daily events
	// if blah blah blah

	await ctx.telegram.sendMessage(
		ctx.chat!.id,
		message,
		// {
		// 	reply_markup: {
		// 		resize_keyboard: true,
		// 		inline_keyboard: [
		// 			[Markup.button.callback('Объявить сбор', 'plan-game')],
		// 			// [{ text: 'Объявить сбор', callback_data: 'plan' }],
		// 			// [{ text: 'Занятость', callback_data: 'availability' }],
		// 			// [{ text: 'Мои игры', callback_data: 'games' }],
		// 			// [{ text: '', callback_data: 'games' }],
		// 			// [{ text: 'Настройки', callback_data: 'settings' }],
		// 		],
		// 	},
		// },
	)
})

plan.on('text', async ctx => {
	ctx.telegram.sendMessage(ctx.chat.id, `Сбор на ${ctx.message.text}`, { reply_markup: {
    resize_keyboard: true,
    inline_keyboard: [
      [Markup.button.callback('Пойду', 'plan__accept')],
      [Markup.button.callback('Откажусь', 'plan__reject')],
    ]
  }})

	ctx.scene.leave()
})
