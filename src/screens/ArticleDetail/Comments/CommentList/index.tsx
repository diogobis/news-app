import { ActivityIndicator, Text, View } from 'react-native'

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
	if (loading) {
		return <ActivityIndicator color={colors['accent-brand-light']} size="large" />
	}

	if (flattened.length === 0) {
		return (
			<Text className="text-gray-500 text-base text-center mb-6">
				Nenhum comentário ainda. Seja o primeiro a comentar!
			</Text>
		)
	}

	return (
		<View>
			{flattened.map((item) => (
				<View key={`comment-${item.id}`} style={item.depth === 1 ? { marginLeft: 24 } : undefined}>
					<CommentCard
						comment={item}
						currentUserId={currentUserId}
						onReply={onReply}
						onDelete={onDelete}
						onEdit={onEdit}
					/>
				</View>
			))}
		</View>
	)
}
