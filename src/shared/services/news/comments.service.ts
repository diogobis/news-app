import { dtMoneyApi } from '@/shared/api/dtmoney'
import { CommentItem } from '@/shared/interfaces/news/comment.interface'

interface CreateCommentPayload {
	articleUuid: string
	content: string
	parentId?: number | null
}

export const getComments = async (articleUuid: string): Promise<CommentItem[]> => {
	const { data } = await dtMoneyApi.get<{ data: CommentItem[] }>(`/comments/${articleUuid}`)
	return data.data
}

export const createComment = async (payload: CreateCommentPayload): Promise<CommentItem> => {
	const { data } = await dtMoneyApi.post<{ data: CommentItem }>('/comments', payload)
	return data.data
}

export const deleteComment = async (id: number): Promise<void> => {
	await dtMoneyApi.delete(`/comments/${id}`)
}
