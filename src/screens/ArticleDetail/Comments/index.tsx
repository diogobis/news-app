import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { useAuthContext } from '@/context/auth.context'
import { useCommentsContext } from '@/context/comments.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { CommentList, FlattenedComment } from './CommentList'
import { CommentInput } from './CommentInput'

interface CommentsProps {
	articleUuid: string
}

export const Comments = ({ articleUuid }: CommentsProps) => {
	const { user } = useAuthContext()
	const { comments, loading, fetchComments, createComment, updateComment, deleteComment } =
		useCommentsContext()
	const { errorHandler } = useErrorHandler()

	const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null)

	const flattened = useMemo(() => {
		const result: FlattenedComment[] = []
		comments.forEach((c) => {
			result.push({ ...c, depth: 0 })
			c.replies.forEach((r) => result.push({ ...r, depth: 1 }))
		})
		return result
	}, [comments])

	useEffect(() => {
		const load = async () => {
			try {
				await fetchComments(articleUuid)
			} catch (error) {
				errorHandler(error, 'Falha ao carregar comentários')
			}
		}
		load()
	}, [articleUuid])

	const handleSubmit = async (content: string) => {
		try {
			await createComment(articleUuid, content, replyingTo?.id ?? null)
			setReplyingTo(null)
		} catch (error) {
			errorHandler(error, 'Falha ao enviar comentário')
		}
	}

	const handleEdit = async (commentId: number, content: string) => {
		try {
			await updateComment(articleUuid, commentId, content)
		} catch (error) {
			errorHandler(error, 'Falha ao editar comentário')
		}
	}

	const handleDelete = async (commentId: number) => {
		try {
			await deleteComment(articleUuid, commentId)
		} catch (error) {
			errorHandler(error, 'Falha ao deletar comentário')
		}
	}

	const cancelReply = () => {
		setReplyingTo(null)
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
				key={replyingTo ? `reply-${replyingTo.id}` : 'comment-input'}
				user={user}
				replyingTo={replyingTo}
				onSubmit={handleSubmit}
				onCancelReply={cancelReply}
			/>
		</View>
	)
}
