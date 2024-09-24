import { Scenes } from 'telegraf'

export interface SceneContext extends Scenes.SceneSessionData {
	page: number
}
