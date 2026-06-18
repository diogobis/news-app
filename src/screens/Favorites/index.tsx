import { useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { useFavoritesContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { FilterInput } from '@/components/FilterInput'
import { DrawerScreenHeader } from '@/components/DrawerScreenHeader'
import { FavoriteCard } from './FavoriteCard'

export const Favorites = () => {
	const {
		favorites,
		handleToggleFavorite,
		searchTerm,
		dateFrom,
		dateTo,
		fetchFavorites,
		setSearchTerm,
		setDateFrom,
		setDateTo,
	} = useFavoritesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()

	useEffect(() => {
		;(async () => {
			try {
				await fetchFavorites()
			} catch (error) {
				errorHandler(error, 'Falha ao buscar favoritos')
			}
		})()
	}, [searchTerm, dateFrom, dateTo])

	const handleRemoveFavorite = async (articleUuid: string) => {
		try {
			await handleToggleFavorite(articleUuid)
		} catch (error) {
			errorHandler(error, 'Falha ao remover dos favoritos')
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<DrawerScreenHeader title="Favoritos" />

			<View className="px-6 pb-2">
				<FilterInput
					searchPlaceholder="Buscar favoritos..."
					onFilterChange={({ search, publishedFrom, publishedTo }) => {
						setSearchTerm(search ?? '')
						setDateFrom(publishedFrom ?? '')
						setDateTo(publishedTo ?? '')
					}}
				/>
			</View>

			<View style={styles.wrapper}>
				<FlatList
					data={favorites}
					keyExtractor={(item) => `fav-${item.articleUuid}`}
					renderItem={({ item }) => (
						<FavoriteCard
							item={item}
							onPress={() => navigation.navigate('ArticleDetail', { uuid: item.articleUuid })}
							onRemove={() => handleRemoveFavorite(item.articleUuid)}
						/>
					)}
					ListEmptyComponent={() => (
						<Text className="text-white text-center mt-10 text-lg">
							{searchTerm || dateFrom || dateTo
								? 'Nenhum favorito encontrado'
								: 'Nenhum favorito ainda'}
						</Text>
					)}
				/>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		minHeight: 0,
	},
})
