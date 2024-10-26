import Bot from './bot.mjs'

Bot.init().catch((e) => {
	console.error('Error initializing bot:', e)

	Bot.instance.telegram.sendPhoto(
		-1001964753343,
		{ source: 'src/assets/i fell.png' },
		{
			caption: `${e.stack || e.message || e}`.slice(0, 4000),
			disable_notification: true,
			parse_mode: 'HTML',
		}
	)
})
