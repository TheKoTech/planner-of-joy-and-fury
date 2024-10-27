import moment, { Moment } from 'moment'
import { eventDateTimeRe } from '../constants/event-date-time-regex.mjs'
import { DBEvent } from '../types/db-event.mjs'

interface EventMatch {
	name: string
	date?: string
	dayOfWeek?: string
	time?: string
}

type EventDateData = Pick<EventMatch, 'date' | 'dayOfWeek' | 'time'>

export class Parser {
	private static extractEventMatch(text: string): EventMatch | undefined {
		const match = text.match(eventDateTimeRe)

		if (!match?.groups) return undefined

		return {
			name: match.groups['name'],
			date: match.groups['date'],
			dayOfWeek: match.groups['day_of_week'],
			time: match.groups['time'],
		}
	}

	static parseEvent(text: string): Pick<DBEvent, 'name' | 'date'> | undefined {
		const match = Parser.extractEventMatch(text)

		if (!match) return undefined

		const date = Parser.parseEventDate(match)

		return {
			name: Parser.parseEventName(match.name),
			date: date.format(),
		}
	}

	static parseEventName(name: string): string {
		if (name.length > 100) {
			throw new Error('Имя игры должно быть короче 100 символов')
		}

		return name
	}

	static parseEventDate({ date, time, dayOfWeek }: EventDateData): Moment {
		const moscowOffset = 3
		const now = moment().utcOffset(moscowOffset, true)
		const eventDate = now.clone()

		const parsedTime = Parser.parseTimeString(time, eventDate)

		if (parsedTime.isBefore(now)) {
			parsedTime.add(1, 'day')
		}

		if (date) {
			return Parser.parseDateString(date, parsedTime, now)
		} else if (dayOfWeek) {
			return Parser.parseDayOfWeek(dayOfWeek, parsedTime, now)
		}

		return parsedTime
	}
	static parseTimeString(
		timeString: string | undefined,
		eventDate: moment.Moment,
	): moment.Moment {
		if (!timeString) {
			return eventDate.set({ hour: 20, minute: 0, second: 0, millisecond: 0 })
		}

		const timeMatch = timeString.match(/(?<h>\d+):?(?<m>\d+)?/)
		if (!timeMatch?.groups) {
			return eventDate.set({ hour: 20, minute: 0, second: 0, millisecond: 0 })
		}

		const { h: hours, m: minutes } = timeMatch.groups
		return eventDate.set({
			hour: +hours,
			minute: minutes ? +minutes : 0,
			second: 0,
			millisecond: 0,
		})
	}

	static parseDateString(
		dateString: string,
		eventDate: moment.Moment,
		now: moment.Moment,
	): moment.Moment {
		console.log('Parsing date')
		const dateFormats = ['D.M.Y', 'D.M', 'M', 'MMMM', 'MMM']

		for (const format of dateFormats) {
			const parsedDate = moment(dateString, format, true)
			if (parsedDate.isValid()) {
				return Parser.adjustYearAndCombineTime(parsedDate, eventDate, now)
			}
		}

		return now
	}

	static adjustYearAndCombineTime(
		parsedDate: moment.Moment,
		eventDate: moment.Moment,
		now: moment.Moment,
	): moment.Moment {
		if (!parsedDate.year()) {
			if (
				parsedDate.month() > now.month() ||
				(parsedDate.month() === now.month() && parsedDate.date() >= now.date())
			) {
				parsedDate.year(now.year())
			} else {
				parsedDate.year(now.year() + 1)
			}
		}

		return eventDate.set({
			year: parsedDate.year(),
			month: parsedDate.month(),
			date: parsedDate.date(),
		})
	}

	static parseDayOfWeek(
		dayOfWeek: string,
		eventDate: moment.Moment,
		now: moment.Moment,
	): moment.Moment {
		console.log('Parsing day of week')

		const relativeDays: Record<string, number> = {
			сегодня: 0,
			завтра: 1,
			послезавтра: 2,
		}
		const days: Record<string, number> = {
			пн: 1,
			вт: 2,
			ср: 3,
			чт: 4,
			пт: 5,
			сб: 6,
			вс: 0,
			пнд: 1,
			втр: 2,
			срд: 3,
			чтв: 4,
			птн: 5,
			сбт: 6,
			вск: 0,
			понедельник: 1,
			вторник: 2,
			среда: 3,
			четверг: 4,
			пятница: 5,
			суббота: 6,
			воскресенье: 0,
		}

		const relativeOffset = relativeDays[dayOfWeek]
		if (relativeOffset !== undefined) {
			console.log(`Relative day, adding ${relativeOffset}`)
			return eventDate.add(relativeOffset, 'days')
		}

		const dayOffset = days[dayOfWeek]
		if (dayOffset === undefined) {
			console.log(`Absolute date, adding ${dayOffset}`)
			return now
		}

		eventDate.day(dayOffset)
		if (eventDate.isBefore(now)) {
			console.log(`Date is in the past, setting the date a week forward`)
			eventDate.add(7, 'days')
		}

		return eventDate
	}
}
