import { Context, Scenes } from 'telegraf'
import { SceneContext } from './scene-context.mjs'

export interface BotContext extends Context {
	scene: Scenes.SceneContextScene<BotContext, SceneContext>
	session: object
}
