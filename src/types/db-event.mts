export type DBEvent = {
	game: string
	/** key is user id*/
	replies: Record<number, Reply>
	displayName?: string
}

type Reply = {
	status: EventReplyStatus
}

export enum EventReplyStatus {
	Accepted,
	Considering,
	Rejected,
}
