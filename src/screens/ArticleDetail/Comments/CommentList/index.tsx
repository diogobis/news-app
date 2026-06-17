import { useCallback } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import { colors } from '@/shared/colors'
import { CommentCard } from '../CommentCard'

export type FlattenedComment = CommentItem & { depth: number }

interface CommentListProps {
	flattened: FlattenedComment[]
	loading: boolean
	currentUserId: number | null
	onReply: (id: number, username: string) => void
	onDelete: (id: number) => Promise<void>
	onEdit: (id: number, content: string) => Promise<void>
}

export const CommentList = ({ flattened, loading, currentUserId, onReply, onDelete, onEdit }: CommentListProps) => {
	const renderComment = useCallback(
		({ item }: { item: FlattenedComment }) => (
			<View style={item.depth === 1 ? { marginLeft: 24 } : undefined}>
				<CommentCard
					comment={item}
					currentUserId={currentUserId}
					onReply={onReply}
					onDelete={onDelete}
					onEdit={onEdit}
				/>
			</View>
		),
		[currentUserId, onReply, onDelete, onEdit],
	)

	if (loading) {
		return <ActivityIndicator color={colors['accent-brand-light']} size="large" />
	}

	return (
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
	)
}
