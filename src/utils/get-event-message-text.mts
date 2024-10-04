import { replyStatusText } from '../constants/reply-status-text.mjs'
import DB from '../db.mjs'
import { DBEvent } from '../types/db-event.mjs'

export function getEventMessageText(event: DBEvent) {
	// 	return `\`\`\`
	// test
	// \`\`\``

	let text = `Сбор на ${event.game}\n\n`
	text += `\`\`\`\n${drawAvailabilityTable(event)}\`\`\`\n`
	text += getTags(event)

	console.log(`text: ${text}`)

	return text
}

function drawAvailabilityTable(event: DBEvent): string {
	const replies = Object.entries(event.replies)

	const rows: [string, string][] = replies.map(([k, v]) => [
		DB.getUser(+k)!.displayName.replaceAll(/(`)/g, '\\$1'),
		replyStatusText[v.status],
	])

	return rows.reduce(
		(acc, prev) => (acc += `| ${prev[0]} | ${prev[1]} |\n`),
		''
	)
}

function getTags(event: DBEvent) {
	const userIds = Object.keys(event.replies).map((v) => +v)
	return DB.getUserList(userIds)
		.map((u) => `@${u.username}`.replaceAll(/(_)/g, '\\$1'))
		.join(' ')
}
