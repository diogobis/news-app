import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import { IUser } from '@/shared/interfaces/user.interface'
import { colors } from '@/shared/colors'

interface CommentInputProps {
	user: IUser | null
	replyingTo: { id: number; username: string } | null
	content: string
	submitting: boolean
	onSubmit: () => Promise<void>
	onCancelReply: () => void
	onChangeText: (text: string) => void
}

export const CommentInput = ({ user, replyingTo, content, submitting, onSubmit, onCancelReply, onChangeText }: CommentInputProps) => {
	if (!user) {
		return (
			<Text className="text-gray-500 text-sm text-center mt-6">
				Faça login para comentar
			</Text>
		)
	}

	return (
		<View className="mt-6">
			{replyingTo && (
				<View className="flex-row items-center mb-2">
					<MaterialIcons name="reply" size={16} color={colors['accent-brand-light']} />
					<Text className="text-accent-brand-light text-sm ml-1 flex-1">
						Respondendo a @{replyingTo.username}
					</Text>
					<TouchableOpacity onPress={onCancelReply}>
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
					onChangeText={onChangeText}
					multiline
				/>
				<TouchableOpacity
					className="ml-2 bg-accent-brand h-12 w-12 rounded-xl items-center justify-center"
					onPress={onSubmit}
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
	)
}
