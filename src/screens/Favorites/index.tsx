import { useCallback, useEffect, useRef } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { useFavoritesContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { SearchBar } from '@/components/SearchBar'
import { DateFilterBar } from '@/components/DateFilterBar'
import { DrawerScreenHeader } from '@/components/DrawerScreenHeader'
import { FavoriteCard } from './FavoriteCard'

export const Favorites = () => {
	const { favorites, fetchFavorites, handleToggleFavorite } = useFavoritesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()
	const searchRef = useRef('')
	const dateFromRef = useRef<string | undefined>(undefined)
	const dateToRef = useRef<string | undefined>(undefined)

	const loadFavorites = useCallback(async (search?: string, publishedFrom?: string, publishedTo?: string) => {
		try {
			await fetchFavorites({ search, publishedFrom, publishedTo })
		} catch (error) {
			errorHandler(error, 'Falha ao buscar favoritos')
		}
	}, [fetchFavorites])

	useEffect(() => {
		loadFavorites()
	}, [])

	const handleRemoveFavorite = useCallback(async (articleUuid: string) => {
		try {
			await handleToggleFavorite(articleUuid)
		} catch (error) {
			errorHandler(error, 'Falha ao remover dos favoritos')
		}
	}, [handleToggleFavorite])

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<DrawerScreenHeader title="Favoritos" />

			<View className="px-6 pb-2">
				<SearchBar
					placeholder="Buscar favoritos..."
					onSearch={(text) => {
						searchRef.current = text
						loadFavorites(text || undefined, dateFromRef.current, dateToRef.current)
					}}
				/>
			</View>
			<DateFilterBar
				onFilterChange={(from, to) => {
					dateFromRef.current = from
					dateToRef.current = to
					loadFavorites(searchRef.current || undefined, from, to)
				}}
			/>

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
							{searchRef.current || dateFromRef.current || dateToRef.current
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
