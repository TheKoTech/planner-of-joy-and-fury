import { Scenes } from 'telegraf'
import { SceneList } from '../enums/scene-list.mjs'
import { SceneContext } from '../types/scene-context.mjs'

export const createBaseScene = (sceneName: SceneList) => {
	return new Scenes.BaseScene<Scenes.SceneContext<SceneContext>>(sceneName, {
		ttl: 7200,
		/* these are here just because they're required */
		enterHandlers: [],
		handlers: [],
		leaveHandlers: [],
	})
}
