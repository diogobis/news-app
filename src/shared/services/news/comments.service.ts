import { newsApi } from '@/shared/api/news'
import { CommentItem } from '@/shared/interfaces/news/comment.interface'

interface CreateCommentPayload {
	articleUuid: string
	content: string
	parentId?: number | null
}

export const getComments = async (articleUuid: string): Promise<CommentItem[]> => {
	const { data } = await newsApi.get<{ data: CommentItem[] }>(`/comments/${articleUuid}`)
	return data.data.map((c) => ({ ...c, replies: c.replies ?? [] }))
}

export const createComment = async (payload: CreateCommentPayload): Promise<void> => {
	await newsApi.post('/comments', payload)
}

export const updateComment = async (id: number, content: string): Promise<void> => {
	await newsApi.put(`/comments/${id}`, { content })
}

export const deleteComment = async (id: number): Promise<void> => {
	await newsApi.delete(`/comments/${id}`)
}
