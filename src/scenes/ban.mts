import { Context, Markup } from 'telegraf'
import { createBaseScene } from '../utils/create-base-scene.mjs'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'

export const ban = createBaseScene(SceneList.Ban)

ban.enter(async (ctx) => {
	console.log('Ban incoming')
	if (!ctx.message) return

	let targetId: number | undefined
	const state = ctx.scene.state as Record<string, unknown>
	const rawUsername = state.username as string | undefined
	console.log(ctx.scene.state)

	if (rawUsername) {
		const username = (
			rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername
		).trim()
		targetId = DB.getUserId(username)
		console.log(`Found user with id ${targetId}`)
	} else if (
		'reply_to_message' in ctx.message &&
		ctx.message.reply_to_message?.from
	) {
		targetId = ctx.message.reply_to_message.from.id
		console.log(`It's a reply for ${targetId}`)
	} else {
		return ctx.reply('Кого?')
	}

	if (targetId) {
		banUser(ctx, targetId)
	} else {
		ctx.reply('Не нашёл такого пользователя')
	}

	return ctx.scene.leave()
})

ban.hears(/.*/, async (ctx) => {
	const text = ctx.message.text
	const username = text.match(/^@?(.*)$/)?.[1]

	if (!username) return quit()

	const targetId = DB.getUserId(username)

	if (!targetId) return quit()

	banUser(ctx, targetId)

	async function quit() {
		console.log(`User ${username} not found`)
		await ctx.reply('Не нашёл такого пользователя')
		return ctx.scene.leave()
	}
})
function banUser(ctx: Context, targetId: number) {
	const target = DB.getUser(targetId)
	const isBanned = DB.ban(targetId, ctx.from!.id)
	if (isBanned) {
		ctx.telegram.sendMessage(ctx.chat!.id, `${target?.username} в бане`, {
			...Markup.inlineKeyboard([
				Markup.button.callback(
					'Извините, я нечаянно',
					`ban__revert:${targetId}`
				),
			]),
		})
	}
}
