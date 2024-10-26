import DB from '../db.mjs'
import { BotContext } from '../types/bot-context.mjs'

export const addUser = async (ctx: BotContext, next: () => Promise<void>) => {
	const user = ctx.from

	if (!user?.username) return next()

	DB.addUser(user)

	return next()
}
