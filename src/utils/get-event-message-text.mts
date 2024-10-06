import { CLIENT_RENEG_WINDOW } from 'tls'
import { replyStatusText } from '../constants/reply-status-text.mjs'
import DB from '../db.mjs'
import { DBEvent } from '../types/db-event.mjs'

export function getEventMessageText(event: DBEvent) {
	let text = `Сбор на ${event.game}\n\n`
	text += `\`\`\`\n${drawAvailabilityTable(event)}\`\`\`\n`
	// text += getTags(event)

	return text
}

function drawAvailabilityTable(event: DBEvent): string {
	const replies = Object.entries(event.replies)

	const rows: [string, string][] = replies.map(([k, v]) => [
		DB.getUser(+k)!.displayName.replaceAll(/(`)/g, '\\$1'),
		replyStatusText[v.status],
	])

	const columnWidths: [number, number] = [0, 0]
	// rowData.reduce(
	// 	(acc, [user, , status]) => [
	// 		acc[0] < Array.from(user).length ? Array.from(user).length : acc[0],
	// 		acc[0] < Array.from(status).length ? Array.from(status).length : acc[0],
	// 	],
	// 	[0, 0]
	// )

	const rowData = rows.reduce<string[][]>((acc, prev) => {
		columnWidths[0] =
			columnWidths[0] < prev[0].length ? prev[0].length : columnWidths[0]

		const user = prev[0]
		const status = prev[1].split(/(?<=(?:^[^ ]+)) /)

		const statusEmoji = status[0]
		const statusText = status[1]

		columnWidths[1] =
			columnWidths[1] < prev[1].length ? prev[1].length : columnWidths[1]

		acc.push([user, statusEmoji, statusText])

		return acc
	}, [])

	columnWidths[1] -= 2

	return rowData.reduce(
		(acc, [user, statusEmoji, statusText]) =>
			(acc += `| ${user.padEnd(
				columnWidths[0],
			)} | ${statusEmoji} ${statusText.padEnd(columnWidths[1], ' ')} |\n`),
		'',
	)
}

function getTags(event: DBEvent) {
	const userIds = Object.keys(event.replies).map(v => +v)
	return DB.getUserList(userIds)
		.map(u => `@${u.username}`.replaceAll(/(_)/g, '\\$1'))
		.join(' ')
}
