import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import * as CommentsService from '@/shared/services/news/comments.service'
import { useAuthContext } from '@/context/auth.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'
import { CommentCard } from './CommentCard'

interface CommentsProps {
	articleUuid: string
}

type FlattenedComment = CommentItem & { depth: number }

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

	const renderComment = ({ item }: { item: FlattenedComment }) => (
		<View style={item.depth === 1 ? { marginLeft: 24 } : undefined}>
			<CommentCard
				comment={item}
				currentUserId={user?.id ?? null}
				onReply={(id, username) => setReplyingTo({ id, username })}
				onDelete={handleDelete}
				onEdit={handleEdit}
			/>
		</View>
	)

	return (
		<View className="mt-8 mb-4">
			<View className="flex-row items-center mb-6">
				<View className="flex-1 h-px bg-gray-800" />
				<Text className="text-white text-lg font-bold mx-4">Comentários</Text>
				<View className="flex-1 h-px bg-gray-800" />
			</View>

			{loading ? (
				<ActivityIndicator color={colors['accent-brand-light']} size="large" />
			) : (
				<FlatList
					data={flattened}
					keyExtractor={(item) => `comment-${item.id}`}
					renderItem={renderComment}
					scrollEnabled={false}
					ListEmptyComponent={
						<Text className="text-gray-500 text-base text-center mb-6">
							Nenhum comentário ainda. Seja o primeiro a comentar!
						</Text>
					}
				/>
			)}

			{user ? (
				<View className="mt-6">
					{replyingTo && (
						<View className="flex-row items-center mb-2">
							<MaterialIcons name="reply" size={16} color={colors['accent-brand-light']} />
							<Text className="text-accent-brand-light text-sm ml-1 flex-1">
								Respondendo a @{replyingTo.username}
							</Text>
							<TouchableOpacity onPress={cancelReply}>
								<MaterialIcons name="close" size={18} color={colors.gray[500]} />
							</TouchableOpacity>
						</View>
					)}

					<View className="flex-row items-end">
						<TextInput
							className="flex-1 bg-background-tertiary text-white text-base px-4 py-3 rounded-xl max-h-24"
							placeholder={replyingTo ? 'Escreva sua resposta...' : 'Escreva um comentário...'}
							placeholderTextColor={colors.gray[600]}
							value={content}
							onChangeText={setContent}
							multiline
						/>
						<TouchableOpacity
							className="ml-2 bg-accent-brand h-12 w-12 rounded-xl items-center justify-center"
							onPress={handleSubmit}
							disabled={!content.trim() || submitting}
						>
							{submitting ? (
								<ActivityIndicator color={colors.white} size="small" />
							) : (
								<MaterialIcons name="send" size={20} color={colors.white} />
							)}
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<Text className="text-gray-500 text-sm text-center mt-6">
					Faça login para comentar
				</Text>
			)}
		</View>
	)
}
