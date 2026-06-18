import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import * as CommentsService from '@/shared/services/news/comments.service'

type CommentsContextType = {
	comments: CommentItem[]
	loading: boolean
	fetchComments: (articleUuid: string) => Promise<void>
	createComment: (articleUuid: string, content: string, parentId?: number | null) => Promise<void>
	updateComment: (articleUuid: string, commentId: number, content: string) => Promise<void>
	deleteComment: (articleUuid: string, commentId: number) => Promise<void>
}

export const CommentsContext = createContext({} as CommentsContextType)

export const CommentsContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const [comments, setComments] = useState<CommentItem[]>([])
	const [loading, setLoading] = useState(false)

	const fetchComments = useCallback(async (articleUuid: string) => {
		setLoading(true)
		const result = await CommentsService.getComments(articleUuid)
		setComments(result)
		setLoading(false)
	}, [])

	const createComment = useCallback(async (articleUuid: string, content: string, parentId?: number | null) => {
		await CommentsService.createComment({ articleUuid, content, parentId })
		await fetchComments(articleUuid)
	}, [fetchComments])

	const updateComment = useCallback(async (articleUuid: string, commentId: number, content: string) => {
		await CommentsService.updateComment(commentId, content)
		await fetchComments(articleUuid)
	}, [fetchComments])

	const deleteComment = useCallback(async (articleUuid: string, commentId: number) => {
		await CommentsService.deleteComment(commentId)
		await fetchComments(articleUuid)
	}, [fetchComments])

	return (
		<CommentsContext.Provider
			value={{
				comments,
				loading,
				fetchComments,
				createComment,
				updateComment,
				deleteComment,
			}}
		>
			{children}
		</CommentsContext.Provider>
	)
}

export const useCommentsContext = () => {
	const context = useContext(CommentsContext)
	return context
}
