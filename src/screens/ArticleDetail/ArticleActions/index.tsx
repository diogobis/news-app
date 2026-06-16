import { MaterialIcons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '@/shared/colors'
import { IUser } from '@/shared/interfaces/user.interface'

interface ArticleActionsProps {
	isFavorited: boolean
	isSaved: boolean
	onFavoritePress: () => void
	onSaveLaterPress: () => void
	onAuthRequired: (action: string) => void
	user: IUser | null
}

export const ArticleActions = ({
	isFavorited,
	isSaved,
	onFavoritePress,
	onSaveLaterPress,
	onAuthRequired,
	user,
}: ArticleActionsProps) => {
	if (user) {
		return (
			<View className="flex-row justify-around p-4 bg-background-secondary">
				<TouchableOpacity className="items-center" onPress={onFavoritePress}>
					<MaterialIcons
						name={isFavorited ? 'favorite' : 'favorite-outline'}
						size={28}
						color={isFavorited ? colors['accent-red'] : colors.gray[500]}
					/>
					<Text className="text-gray-500 text-sm mt-1">
						{isFavorited ? 'Favoritado' : 'Favoritar'}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity className="items-center" onPress={onSaveLaterPress}>
					<MaterialIcons
						name={isSaved ? 'bookmark' : 'bookmark-outline'}
						size={28}
						color={isSaved ? colors['accent-brand-light'] : colors.gray[500]}
					/>
					<Text className="text-gray-500 text-sm mt-1">
						{isSaved ? 'Salvo' : 'Ler depois'}
					</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View className="flex-row justify-around p-4 bg-background-secondary">
			<TouchableOpacity
				className="items-center opacity-50"
				onPress={() => onAuthRequired('favoritar')}
			>
				<MaterialIcons name="favorite-outline" size={28} color={colors.gray[600]} />
				<Text className="text-gray-600 text-sm mt-1">Favoritar</Text>
			</TouchableOpacity>

			<TouchableOpacity
				className="items-center opacity-50"
				onPress={() => onAuthRequired('salvar')}
			>
				<MaterialIcons name="bookmark-outline" size={28} color={colors.gray[600]} />
				<Text className="text-gray-600 text-sm mt-1">Ler depois</Text>
			</TouchableOpacity>
		</View>
	)
}
