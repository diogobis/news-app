import { useEffect } from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { useUserFeaturesContext } from '@/context/user-features.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'

export const Favorites = () => {
	const { favorites, fetchFavorites, handleToggleFavorite } = useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<StackNavigationProp<any>>()

	useEffect(() => {
		const load = async () => {
			try {
				await fetchFavorites()
			} catch (error) {
				errorHandler(error, 'Falha ao buscar favoritos')
			}
		}
		load()
	}, [])

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<View className="flex-row items-center p-4">
				<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
					<MaterialIcons name="arrow-back" size={24} color={colors.white} />
				</TouchableOpacity>
				<Text className="text-white text-xl font-bold">Favoritos</Text>
			</View>

			<View style={{ flex: 1, minHeight: 0 }}>
				<FlatList
					data={favorites}
					keyExtractor={(item) => `fav-${item.articleUuid}`}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="mx-6 mb-4 bg-background-tertiary rounded-xl overflow-hidden"
							onPress={() => navigation.navigate('ArticleDetail', { uuid: item.articleUuid })}
						>
							<View className="h-40 bg-background-primary items-center justify-center">
								{item.thumbnail ? (
									<Image source={{ uri: item.thumbnail }} className="w-full h-full" resizeMode="cover" />
								) : (
									<MaterialIcons name="favorite" size={48} color={colors.gray[600]} />
								)}
							</View>
							<View className="p-4">
								<Text className="text-white text-base font-bold mb-1" numberOfLines={2}>
									{item.title}
								</Text>
								<Text className="text-gray-500 text-sm mb-3">{item.publisher}</Text>
								<TouchableOpacity
									className="flex-row items-center"
									onPress={() => handleToggleFavorite(item.articleUuid)}
								>
									<MaterialIcons name="favorite" size={20} color={colors['accent-red']} />
									<Text className="text-accent-red text-sm ml-2">Remover dos favoritos</Text>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					)}
					ListEmptyComponent={() => (
						<Text className="text-white text-center mt-10 text-lg">
							Nenhum favorito ainda
						</Text>
					)}
				/>
			</View>
		</SafeAreaView>
	)
}
