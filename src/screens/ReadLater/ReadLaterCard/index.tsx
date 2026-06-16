import { ReadLaterItem } from '@/shared/interfaces/news/read-later.interface'
import { colors } from '@/shared/colors'
import { MaterialIcons } from '@expo/vector-icons'
import { Image, Text, TouchableOpacity, View } from 'react-native'

interface ReadLaterCardProps {
	item: ReadLaterItem
	onPress: () => void
	onRemove: () => void
}

export const ReadLaterCard = ({ item, onPress, onRemove }: ReadLaterCardProps) => {
	return (
		<TouchableOpacity
			className="mx-6 mb-4 bg-background-tertiary rounded-xl overflow-hidden"
			onPress={onPress}
		>
			<View className="h-40 bg-background-primary items-center justify-center">
				{item.thumbnail ? (
					<Image source={{ uri: item.thumbnail }} className="w-full h-full" resizeMode="cover" />
				) : (
					<MaterialIcons name="bookmark" size={48} color={colors.gray[600]} />
				)}
			</View>
			<View className="p-4">
				<Text className="text-white text-base font-bold mb-1" numberOfLines={2}>
					{item.title}
				</Text>
				<Text className="text-gray-500 text-sm mb-3">{item.publisher}</Text>
				<TouchableOpacity className="flex-row items-center" onPress={onRemove}>
					<MaterialIcons name="bookmark-remove" size={20} color={colors['accent-red']} />
					<Text className="text-accent-red text-sm ml-2">Remover</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}
