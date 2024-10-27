import { Markup } from 'telegraf'
import DB from '../db.mjs'
import { SceneList } from '../enums/scene-list.mjs'
import { BotContext } from '../types/bot-context.mjs'
import { createBaseScene } from '../utils/create-base-scene.mjs'

export const deleteEvent = createBaseScene(SceneList.Delete)

deleteEvent.enter(async ctx => {
	console.log(`Entered scene: ${SceneList.Delete}`)

	const state = ctx.scene.state as Record<string, unknown>
	const eventId = state.eventId as string
	state.msgId = ctx.callbackQuery?.message?.message_id
	state.chatId = ctx.chat?.id

	DB.canDeleteEvent(eventId, ctx.from!.id)

	return ctx.reply(
		'Ты уверен, что хочешь удалить событие?',
		Markup.inlineKeyboard([
			[
				Markup.button.callback('Да', 'delete__yes'),
				Markup.button.callback('Нет', 'delete__no'),
			],
		]),
	)
})

deleteEvent.action('delete__no', async ctx => {
	console.log('User cancelled deletion')
	await deleteConfirmationMsg(ctx)

	return ctx.scene.leave()
})

deleteEvent.action('delete__yes', async ctx => {
	console.log('User confirmed deletion')
	await deleteConfirmationMsg(ctx)

	tryDelete(ctx)

	return ctx.scene.leave()
})

async function deleteConfirmationMsg(ctx: BotContext) {
	const msgId = ctx.callbackQuery?.message?.message_id

	if (msgId) {
		console.log('Deleting confirmation msg')
		await ctx.deleteMessage(msgId)
	}
}

async function tryDelete(ctx: BotContext) {
	if (!ctx.from || !ctx.callbackQuery) {
		console.error(`Deletion skipped: missing fields in ctx`)
		return ctx.scene.leave()
	}

	const state = ctx.scene.state as Record<string, unknown>
	const eventId = state.eventId as string
	const [chatId, messageId] = eventId.split(':')

	console.log(`Event ID for deletion: ${eventId}`)

	try {
		const deleted = DB.deleteEvent(eventId, ctx.from.id)

		if (!deleted) {
			console.log(
				`User ${ctx.from.username} tried to delete event with id ${eventId}`,
			)
			return ctx.answerCbQuery('Не ты создал, не тебе выёбываться')
		}

		console.log('Deleting original event message')
		await ctx.telegram.deleteMessage(+chatId, +messageId)

		if (+chatId !== state.chatId || +messageId !== state.msgId) {
			console.log('Deleting event clone')
			await ctx.telegram.deleteMessage(
				+(state.chatId as string),
				+(state.msgId as string),
			)
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		console.error('Could not find event')
	}
}
