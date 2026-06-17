import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import * as CommentsService from '@/shared/services/news/comments.service'
import { useAuthContext } from '@/context/auth.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { CommentList, FlattenedComment } from './CommentList'
import { CommentInput } from './CommentInput'

interface CommentsProps {
	articleUuid: string
}

export const Comments = ({ articleUuid }: CommentsProps) => {
	const { user } = useAuthContext()
	const { errorHandler } = useErrorHandler()

	const [comments, setComments] = useState<CommentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [content, setContent] = useState('')
	const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const flattened = useMemo(() => {
		const result: FlattenedComment[] = []
		comments.forEach((c) => {
			result.push({ ...c, depth: 0 })
			c.replies.forEach((r) => result.push({ ...r, depth: 1 }))
		})
		return result
	}, [comments])

	const fetchComments = useCallback(async () => {
		try {
			setLoading(true)
			const result = await CommentsService.getComments(articleUuid)
			setComments(result)
		} catch (error) {
			errorHandler(error, 'Falha ao carregar comentários')
		} finally {
			setLoading(false)
		}
	}, [articleUuid])

	useEffect(() => {
		fetchComments()
	}, [fetchComments])

	const handleSubmit = async () => {
		if (!content.trim()) return

		try {
			setSubmitting(true)
			await CommentsService.createComment({
				articleUuid,
				content: content.trim(),
				parentId: replyingTo?.id ?? null,
			})
			setContent('')
			setReplyingTo(null)
			await fetchComments()
		} catch (error) {
			errorHandler(error, 'Falha ao enviar comentário')
		} finally {
			setSubmitting(false)
		}
	}

	const handleEdit = async (commentId: number, content: string) => {
		try {
			await CommentsService.updateComment(commentId, content)
			await fetchComments()
		} catch (error) {
			errorHandler(error, 'Falha ao editar comentário')
		}
	}

	const handleDelete = async (commentId: number) => {
		try {
			await CommentsService.deleteComment(commentId)
			await fetchComments()
		} catch (error) {
			errorHandler(error, 'Falha ao deletar comentário')
		}
	}

	const cancelReply = () => {
		setReplyingTo(null)
		setContent('')
	}

	return (
		<View className="mt-8 mb-4">
			<View className="flex-row items-center mb-6">
				<View className="flex-1 h-px bg-gray-800" />
				<Text className="text-white text-lg font-bold mx-4">Comentários</Text>
				<View className="flex-1 h-px bg-gray-800" />
			</View>

			<CommentList
				flattened={flattened}
				loading={loading}
				currentUserId={user?.id ?? null}
				onReply={(id, username) => setReplyingTo({ id, username })}
				onDelete={handleDelete}
				onEdit={handleEdit}
			/>

			<CommentInput
				user={user}
				replyingTo={replyingTo}
				content={content}
				submitting={submitting}
				onSubmit={handleSubmit}
				onCancelReply={cancelReply}
				onChangeText={setContent}
			/>
		</View>
	)
}
