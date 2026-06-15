export interface CommentItem {
	id: number
	userId: number
	articleUuid: string
	parentId: number | null
	content: string
	createdAt: string
	username: string
	replies: CommentItem[]
}
