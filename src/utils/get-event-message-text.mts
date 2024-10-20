import { getReplyStatusText } from './get-reply-status-text.mjs'
import DB from '../db.mjs'
import { DBEvent } from '../types/db-event.mjs'

export function getEventMessageText(event: DBEvent) {
	let text = `Сбор на ${event.game}`
	let date: Date | undefined

	if (event.date) {
		date = new Date(event.date)
		const today = new Date()
		const dateStr = `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}`
		const todayStr = `${today.getFullYear()}.${today.getMonth()}.${today.getDate()}`

		text += ', '

		if (dateStr === todayStr) {
			text += 'сегодня '
		} else {
			text += `${date.getDate()}\\.${date.getMonth() + 1} `
		}

		const time =
			String(date.getHours()).padStart(2, '0') +
			':' +
			String(date.getMinutes()).padStart(2, '0')

		text += `в ${time} МСК`
	}

	text += '\n\n'

	text += `\`\`\`\n${drawAvailabilityTable(event)}\`\`\`\n`
	// text += getTags(event)

	return text
}

function drawAvailabilityTable(event: DBEvent): string {
	const replies = Object.entries(event.replies)

	const rows: [string, string][] = replies.map(([k, v]) => [
		DB.getUser(+k)!.displayName.replaceAll(/(`)/g, '\\$1'),
		getReplyStatusText(v),
	])

	const columnWidths: [number, number] = [0, 0]
	const rowData = rows.reduce<string[][]>((acc, cur) => {
		columnWidths[0] =
			columnWidths[0] < cur[0].length ? cur[0].length : columnWidths[0]

		const user = cur[0]
		const status = cur[1].split(/(?<=(?:^[^ ]+)) /)

		const statusEmoji = status[0]
		const statusText = status[1]

		columnWidths[1] =
			columnWidths[1] < cur[1].length ? cur[1].length : columnWidths[1]

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

// function getTags(event: DBEvent) {
// 	const userIds = Object.keys(event.replies).map(v => +v)
// 	return DB.getUserList(userIds)
// 		.map(u => `@${u.username}`.replaceAll(/(_)/g, '\\$1'))
// 		.join(' ')
// }
