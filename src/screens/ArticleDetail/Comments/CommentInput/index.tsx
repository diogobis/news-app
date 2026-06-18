import { useForm } from 'react-hook-form'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Controller } from 'react-hook-form'
import { MaterialIcons } from '@expo/vector-icons'
import { yupResolver } from '@hookform/resolvers/yup'

import { IUser } from '@/shared/interfaces/user.interface'
import { colors } from '@/shared/colors'
import { ErrorMessage } from '@/components/ErrorMessage'
import { schema } from './schema'

interface CommentInputProps {
	user: IUser | null
	replyingTo: { id: number; username: string } | null
	onSubmit: (content: string) => Promise<void>
	onCancelReply: () => void
}

export const CommentInput = ({ user, replyingTo, onSubmit, onCancelReply }: CommentInputProps) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm({
		defaultValues: { content: '' },
		resolver: yupResolver(schema),
	})

	if (!user) {
		return (
			<Text className="text-gray-500 text-sm text-center mt-6">
				Faça login para comentar
			</Text>
		)
	}

	const onValidSubmit = async (data: { content: string }) => {
		await onSubmit(data.content.trim())
		reset()
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

			<Controller
				control={control}
				name="content"
				render={({ field: { onChange, value }, fieldState: { error } }) => (
					<>
						<View className="flex-row items-end">
							<TextInput
								className="flex-1 bg-background-tertiary text-white text-base px-4 py-3 rounded-xl max-h-24"
								placeholder={replyingTo ? 'Escreva sua resposta...' : 'Escreva um comentário...'}
								placeholderTextColor={colors.gray[600]}
								value={value}
								onChangeText={onChange}
								multiline
							/>
							<TouchableOpacity
								className="ml-2 bg-accent-brand h-12 w-12 rounded-xl items-center justify-center"
								onPress={handleSubmit(onValidSubmit)}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<ActivityIndicator color={colors.white} size="small" />
								) : (
									<MaterialIcons name="send" size={20} color={colors.white} />
								)}
							</TouchableOpacity>
						</View>
						{error && <ErrorMessage>{error.message}</ErrorMessage>}
					</>
				)}
			/>
		</View>
	)
}
