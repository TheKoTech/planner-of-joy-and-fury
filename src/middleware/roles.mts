import DB from '../db.mjs'
import { UserRole } from '../enums/user-role.mjs'
import { BotContext } from '../types/bot-context.mjs'

const isCustomEvent = (ctx: BotContext) => {
	return (
		(ctx.message &&
			'text' in ctx.message &&
			ctx.message?.text?.startsWith('/')) ||
		ctx.callbackQuery
	)
}

const createRoleMiddleware = (requiredRole: UserRole, errorMessage: string) => {
	return (isSilent = false) => {
		return async (ctx: BotContext, next: () => Promise<void>) => {
			if (!isCustomEvent(ctx)) return next()

			const user = DB.getUser(ctx.from!.id)
			if (!user || user.role < requiredRole) {
				if (!isSilent) {
					await ctx.reply(errorMessage, {
						parse_mode: 'MarkdownV2',
					})
				} else {
					ctx.answerCbQuery(errorMessage)
				}
				return
			}
			return next()
		}
	}
}

export const chelOnly = createRoleMiddleware(
	UserRole.Чел,
	'Ботом могут пользоваться только зарегистрированные пользователи\\. Напиши @welnyr или своему другу, чтобы он тебя пригласил\\.',
)

export const superChelOnly = createRoleMiddleware(
	UserRole.СуперЧел,
	'Не трогай, этот функционал только для админов',
)

export const ovnerOnly = createRoleMiddleware(
	UserRole.Овнер,
	'Этот функционал только для овнера',
)
