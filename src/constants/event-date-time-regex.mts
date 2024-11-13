/**
 * Regular expression for parsing event date and time information
 *
 * @example
 * const match = "Шахматы завтра в 15:00".match(eventDateTimeRe);
 * if (match) {
 *   const { name, day_of_week, date, time } = match.groups;
 *   console.log(name); // "Шахматы"
 *   console.log(date); // "завтра"
 *   console.log(time); // "в 15:00"
 * }
 *
 * @description
 * Parsed groups:
 * - name: The name of the event (optional)
 * - day_of_week: The day of the week in (optional)
 * - date: The date in various formats (optional)
 * - time: The time of the event (optional)
 *
 * day_of_week and date are mutually exclusive.
 */
export const eventDateTimeRe =
	/^(?<name>.*?)(?:\s+(?:(?<day_of_week>пнд?|втр?|срд?|чт(?:в|г)?|птн?|сбт?|вск?|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье|(?:после)?завтра|сегодня)|(?<date>(?:\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?|\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)(?:\s+\d{2,4})?)))?\s*(?<time>(?:в\s+)?(?:\d{1,2}(?::\d{2})?|(?:\d{1,2}\s+)?(?:утра|дня|вечера|ночи|мск|час(?:ов|а)?)))?\s*)?$/i

/*
test string (add gm flags in regex101)

NMS
Deadlock
Deadlock в 19
Deadlock 19:00
Deadlock 19.00
Deadlock 7 вечера
Deadlock 19 часов
Игра с предлогом в названии
Игра с предлогом в названии 19
Игра с предлогом в названии 19:00
Игра с предлогом в названии 7 вечера
Factorio
Factorio пн
Factorio пн 21:10
Factorio понедельник 21:10
Factorio 21.10
Factorio 21.10 в 21:10
D&D
D&D 20.10
D&D 20.10 21:10
D&D 20 октября 21:10
D&D 20 окт 21:10
Dota 2
Dota 2 завтра
Dota 2 завтра в 20:00
CS:GO сб 18:30
CS:GO суббота 18:30
Warcraft III 15.11 20:45
WoW рейд
WoW рейд чт 21:00
WoW рейд четверг 21:00
Мафия
Мафия пт 22:00
Мафия пятница 22:00
Покер 01.12
Покер 1 декабря
Покер 1 дек 20:00
Minecraft
Minecraft вс 16:00
Minecraft воскресенье 16:00
Among Us
Among Us сегодня 23:00
FIFA 22
FIFA 22 10.10 19:30
Overwatch 2
Overwatch 2 вт 20:15
Overwatch 2 вторник 20:15
Настолки
Настолки 05.11 17:00
Настолки 5 ноября 17:00
*/
