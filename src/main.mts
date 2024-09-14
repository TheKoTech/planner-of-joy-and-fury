import dotenv from 'dotenv'
import { Scenes, session, Telegraf } from 'telegraf'
import DB from './db.mjs'
import { plan, setAccepted } from './scenes/plan.mjs'
import { SceneList } from './scenes/scene-list.mjs'
import { setName } from './scenes/set-name.mjs'
import { settings } from './scenes/settings.mjs'
import { start } from './scenes/start.mjs'

dotenv.config()

if (!process.env.BOT_TOKEN) throw new Error('No token')

const stage = new Scenes.Stage<Scenes.SceneContext>([
	start,
	plan,
	settings,
	setName,
])

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN)
const db = new DB()

db.init().then(() => {
	bot.use(session())
	bot.use(stage.middleware())
	bot.command('start', async ctx => await ctx.scene.enter(SceneList.Start))

	bot.command('plan', async ctx => await ctx.scene.enter(SceneList.Plan))
	bot.action('plan__accept', async ctx => {
		const message = ctx.update.callback_query.message
		if (!message) return

		console.log('set accepted!')

		await setAccepted(ctx, message?.message_id)
	})
	bot.action('plan__reject', async ctx => {})

	bot.command(
		'settings',
		async ctx => await ctx.scene.enter(SceneList.Settings),
	)

	bot.command('setname', async ctx => await ctx.scene.enter(SceneList.SetName))

	bot.command(
		'crash',
		async () =>
			await bot.telegram.sendPhoto(
				-1001964753343,
				{
					source: 'src/assets/i fell.png',
				},
				{ disable_notification: true },
			),
	)

	/** @todo delete when DB is filled */
	bot.on('message', async ctx => DB.autofillUsername(ctx.message.from))

	bot.launch().catch(e => {
		console.error(e)
		return bot.telegram.sendPhoto(
			-1001964753343,
			{ source: 'src/assets/i fell.png' },
			{ disable_notification: true },
		)
	})
	console.log('Bot launched')

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'))
	process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
