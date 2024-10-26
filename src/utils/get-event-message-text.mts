import { getReplyStatusText } from './get-reply-status-text.mjs'
import DB from '../db.mjs'
import { DBEvent } from '../types/db-event.mjs'
import moment from 'moment'

export function getEventMessageText(event: DBEvent) {
	let text = `Сбор на ${event.name}`
	let date: moment.Moment | undefined

	if (event.date) {
		date = moment(event.date).utcOffset(3)
		const today = moment()
		const dateStr = date.format('YYYY.M.D')
		const todayStr = today.format('YYYY.M.D')

		text += ', '

		if (dateStr === todayStr) {
			text += 'сегодня '
		} else {
			text += `${date.date()}\\.${date.month() + 1} `
		}

		text += `в ${date.format('HH:mm')} МСК`
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
