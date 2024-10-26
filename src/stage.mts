import { Scenes } from 'telegraf'
import { listEvents } from './scenes/list-events.mjs'
import { pickTime } from './scenes/pick-time.mjs'
import { plan } from './scenes/plan.mjs'
import { setName } from './scenes/set-name.mjs'
import { settings } from './scenes/settings.mjs'
import { SceneContext } from './types/scene-context.mjs'
import { start } from './scenes/start.mjs'

export const stage = new Scenes.Stage<Scenes.SceneContext<SceneContext>>([
	start,
	plan,
	pickTime,
	settings,
	setName,
	listEvents,
])
