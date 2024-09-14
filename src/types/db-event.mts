export type DBEvent = {
	game: string
	replies: Record<number, EventReplyStatus>
	name?: string
}

// type Reply = {
// 	userId: number
// 	status: EventReplyStatus
// }

export enum EventReplyStatus {
	Accepted,
	Rejected,
}
