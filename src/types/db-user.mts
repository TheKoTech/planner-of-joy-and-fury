import { UserRole } from '../enums/user-role.mjs'

export type DBUser = {
	displayName: string
	username: string
	availability: unknown
	gamesInterested: Record<string, unknown>
	settings: Record<string, unknown>
	role: UserRole
}
