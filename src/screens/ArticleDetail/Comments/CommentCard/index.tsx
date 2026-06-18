import { useEffect, useMemo, useState } from 'react'
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { MaterialIcons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CommentItem } from '@/shared/interfaces/news/comment.interface'
import { colors } from '@/shared/colors'
import { ErrorMessage } from '@/components/ErrorMessage'
import { schema } from './schema'

interface CommentCardProps {
	comment: CommentItem
	currentUserId: number | null
	onReply: (id: number, username: string) => void
	onDelete: (id: number) => void
	onEdit: (id: number, content: string) => Promise<void>
}

export const CommentCard = ({ comment, currentUserId, onReply, onDelete, onEdit }: CommentCardProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)

	const {
		control,
		handleSubmit: formSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: { editContent: comment.content },
		resolver: yupResolver(schema),
	})

	useEffect(() => {
		if (!isEditing) {
			setValue('editContent', comment.content)
		}
	}, [comment.content, isEditing, setValue])

	const timeAgo = useMemo(
		() => formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false, locale: ptBR }),
		[comment.createdAt],
	)

	const isOwner = currentUserId === comment.userId

	const handleSaveEdit = formSubmit(async (data) => {
		if (data.editContent.trim() === comment.content) {
			setIsEditing(false)
			return
		}
		await onEdit(comment.id, data.editContent.trim())
		setIsEditing(false)
	})

	const handleCancelEdit = () => {
		reset({ editContent: comment.content })
		setIsEditing(false)
	}

	if (isEditing) {
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

				<Controller
					control={control}
					name="editContent"
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="bg-background-primary text-white text-base px-3 py-2 rounded-xl mb-3 max-h-24"
							value={value}
							onChangeText={onChange}
							multiline
							autoFocus
						/>
					)}
				/>
				{errors.editContent && <ErrorMessage>{errors.editContent.message}</ErrorMessage>}

				<View className="flex-row items-center">
					<TouchableOpacity className="flex-row items-center mr-4" onPress={handleSaveEdit}>
						<MaterialIcons name="check" size={20} color={colors['accent-brand-light']} />
						<Text className="text-accent-brand-light text-sm ml-1">Salvar</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center" onPress={handleCancelEdit}>
						<MaterialIcons name="close" size={20} color={colors.gray[500]} />
						<Text className="text-gray-500 text-sm ml-1">Cancelar</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

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
					onPress={() => onReply(comment.parentId ?? comment.id, comment.username)}
				>
					<MaterialIcons name="reply" size={16} color={colors.gray[500]} />
					<Text className="text-gray-500 text-sm ml-1">Responder</Text>
				</TouchableOpacity>

				{isOwner && (
					<View>
						<TouchableOpacity className="flex-row items-center" onPress={() => setMenuOpen(true)}>
							<MaterialIcons name="more-horiz" size={20} color={colors.gray[500]} />
						</TouchableOpacity>

						<Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
							<TouchableOpacity
								className="flex-1 justify-center items-center"
								activeOpacity={1}
								onPress={() => setMenuOpen(false)}
							>
								<View className="bg-background-tertiary rounded-xl overflow-hidden w-48">
									<TouchableOpacity
										className="flex-row items-center px-4 py-3"
										onPress={() => { setMenuOpen(false); setIsEditing(true); setValue('editContent', comment.content) }}
									>
										<MaterialIcons name="edit" size={20} color={colors.gray[400]} />
										<Text className="text-gray-400 text-base ml-3">Editar</Text>
									</TouchableOpacity>

									<View className="h-px bg-gray-800" />

									<TouchableOpacity
										className="flex-row items-center px-4 py-3"
										onPress={() => { setMenuOpen(false); onDelete(comment.id) }}
									>
										<MaterialIcons name="delete-outline" size={20} color={colors['accent-red']} />
										<Text className="text-accent-red text-base ml-3">Deletar</Text>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						</Modal>
					</View>
				)}
			</View>
		</View>
	)
}
