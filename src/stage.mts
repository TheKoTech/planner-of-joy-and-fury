import { Scenes } from 'telegraf'
import { ban } from './scenes/ban.mjs'
import { invite } from './scenes/invite.mjs'
import { listEvents } from './scenes/list-events.mjs'
import { pickTime } from './scenes/pick-time.mjs'
import { plan } from './scenes/plan.mjs'
import { setName } from './scenes/set-name.mjs'
import { settings } from './scenes/settings.mjs'
import { start } from './scenes/start.mjs'
import { SceneContext } from './types/scene-context.mjs'
import { deleteEvent } from './scenes/delete-event.mjs'

export const stage = new Scenes.Stage<Scenes.SceneContext<SceneContext>>([
	start,
	plan,
	pickTime,
	settings,
	setName,
	listEvents,
	ban,
	invite,
	deleteEvent,
])
