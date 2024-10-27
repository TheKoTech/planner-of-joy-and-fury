import { Markup } from 'telegraf'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { BotContext } from '../types/bot-context.mjs'
import { createBaseScene } from '../utils/create-base-scene.mjs'

async function inviteUser(ctx: BotContext, username: string) {
	try {
		// @ts-expect-error because it exists
		const author = ctx.update.message.from

		DB.inviteUser(username, author.id)

		await ctx.reply(`@${username} добавлен`)
	} catch (error) {
		await ctx.reply((error as Error).message)
	}

	return ctx.scene.leave()
}

export const invite = createBaseScene(SceneList.Invite)

invite.enter(async ctx => {
	const state = ctx.scene.state as Record<string, unknown>
	const username = state.username as string | undefined

	console.log(state)

	if (username) {
		return inviteUser(ctx, username)
	} else {
		return ctx.reply(
			'Кого?',
			Markup.inlineKeyboard([
				[Markup.button.callback('Отмена', 'invite__cancel')],
			]),
		)
	}
})

invite.action('invite__cancel', async ctx => ctx.scene.leave())

invite.hears(/.+/, async ctx => {
	const text = ctx.message.text
	const username = text.match(/@?([a-z_-\d])$/i)?.[1]

	if (!username) {
		console.warn(`Could not parse username`, text)
		await ctx.reply('Это не настоящий ник, ты написал что-то не так')
		return ctx.scene.leave()
	}

	return inviteUser(ctx, username)
})
