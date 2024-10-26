import Bot from './bot.mjs'

Bot.init().catch(e => {
	console.error('Error initializing bot:', e)

	// Error handling: send a photo to a error channel (kept from your original code)
	Bot.instance.telegram.sendPhoto(
		-1001964753343,
		{ source: 'src/assets/i fell.png' },
		{ disable_notification: true },
	)
})
