import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import * as CommentsService from '@/shared/services/news/comments.service'
import { useAuthContext } from '@/context/auth.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'

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

			{loading ? (
				<ActivityIndicator color={colors['accent-brand-light']} size="large" />
			) : comments.length === 0 ? (
				<Text className="text-gray-500 text-base text-center mb-6">
					Nenhum comentário ainda. Seja o primeiro a comentar!
				</Text>
			) : (
				comments.map((comment) => (
					<View key={comment.id}>
						<CommentCard
							comment={comment}
							currentUserId={user?.id ?? null}
							onReply={(id, username) => setReplyingTo({ id, username })}
							onDelete={handleDelete}
						/>

						{comment.replies.map((reply) => (
							<View key={reply.id} className="ml-6">
								<CommentCard
									comment={reply}
									currentUserId={user?.id ?? null}
									onReply={(id, username) => setReplyingTo({ id, username })}
									onDelete={handleDelete}
								/>
							</View>
						))}
					</View>
				))
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
							style={{ opacity: !content.trim() || submitting ? 0.5 : 1 }}
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

interface CommentCardProps {
	comment: CommentItem
	currentUserId: number | null
	onReply: (id: number, username: string) => void
	onDelete: (id: number) => void
}

const CommentCard = ({ comment, currentUserId, onReply, onDelete }: CommentCardProps) => {
	const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
		addSuffix: true,
		locale: ptBR,
	})

	const isOwner = currentUserId === comment.userId

	return (
		<View className="mb-4 bg-background-tertiary rounded-xl p-4">
			<View className="flex-row items-center mb-2">
				<View className="w-8 h-8 rounded-full bg-accent-brand items-center justify-center mr-2">
					<Text className="text-white text-xs font-bold">
						{comment.username.charAt(0).toUpperCase()}
					</Text>
				</View>
				<Text className="text-white text-sm font-bold flex-1">@{comment.username}</Text>
				<Text className="text-gray-600 text-xs">{timeAgo}</Text>
			</View>

			<Text className="text-gray-400 text-base mb-3">{comment.content}</Text>

			<View className="flex-row items-center">
				<TouchableOpacity
					className="flex-row items-center mr-4"
					onPress={() => onReply(comment.id, comment.username)}
				>
					<MaterialIcons name="reply" size={16} color={colors.gray[500]} />
					<Text className="text-gray-500 text-sm ml-1">Responder</Text>
				</TouchableOpacity>

				{isOwner && (
					<TouchableOpacity
						className="flex-row items-center"
						onPress={() => onDelete(comment.id)}
					>
						<MaterialIcons name="delete-outline" size={16} color={colors['accent-red']} />
						<Text className="text-accent-red text-sm ml-1">Deletar</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}
