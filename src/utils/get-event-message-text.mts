import { DBEvent } from '../types/db-event.mjs'
import { drawAvailabilityTable, getTags } from '../scenes/plan.mjs'

export function getEventMessageText(event: DBEvent) {
	let text = `Сбор на ${event.game}\n\n`
	text += drawAvailabilityTable(event) + '\n\n'
	text += getTags(event)

	return text
}
