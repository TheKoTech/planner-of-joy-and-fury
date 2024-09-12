import { Context, Scenes } from 'telegraf'

export interface BotContext extends Context {
	scene: Scenes.SceneContextScene<BotContext, Scenes.SceneSessionData>
}
