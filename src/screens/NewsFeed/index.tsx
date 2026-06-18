import { useNewsContext } from '@/context/news.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '@/components/AppHeader'
import { CategoryChips } from './CategoryChips'
import { ArticleCard } from './ArticleCard'
import { FilterInput } from '@/components/FilterInput'
import { EmptyList } from './EmptyList'
import { colors } from '@/shared/colors'

export const NewsFeed = () => {
	const {
		articles,
		loadings,
		handleLoadings,
		fetchNews,
		refreshNews,
		loadMoreNews,
		pagination,
		searchTerm,
		dateFrom,
		dateTo,
		setSearchTerm,
		setDateFrom,
		setDateTo,
	} = useNewsContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation()

	const handleRefresh = async () => {
		try {
			handleLoadings({ key: 'refresh', value: true })
			await refreshNews()
		} catch (error) {
			errorHandler(error, 'Falha ao atualizar notícias')
		} finally {
			handleLoadings({ key: 'refresh', value: false })
		}
	}

	const handleLoadMore = async () => {
		if (loadings.loadMore || pagination.page >= pagination.totalPages) return
		try {
			handleLoadings({ key: 'loadMore', value: true })
			await loadMoreNews()
		} catch (error) {
			errorHandler(error, 'Falha ao carregar mais notícias')
		} finally {
			handleLoadings({ key: 'loadMore', value: false })
		}
	}

	useEffect(() => {
		;(async () => {
			try {
				handleLoadings({ key: 'initial', value: true })
				await fetchNews()
			} catch (error) {
				errorHandler(error, 'Falha ao buscar notícias')
			} finally {
				handleLoadings({ key: 'initial', value: false })
			}
		})()
	}, [searchTerm, dateFrom, dateTo])

	const hasFocused = useRef(false)

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			if (hasFocused.current) {
				refreshNews().catch(() => {})
			}
			hasFocused.current = true
		})
		return unsubscribe
	}, [navigation, refreshNews])

	return (
		<SafeAreaView style={styles.container}>
			<AppHeader />
			<View className="self-start">
				<CategoryChips />
			</View>
			<View className="pt-2 pb-2">
				<FilterInput
					searchPlaceholder="Buscar notícias..."
					onFilterChange={({ search, publishedFrom, publishedTo }) => {
						setSearchTerm(search ?? '')
						setDateFrom(publishedFrom ?? '')
						setDateTo(publishedTo ?? '')
					}}
				/>
			</View>
			<FlatList
				style={styles.list}
				contentContainerStyle={{ flexGrow: 1 }}
				data={articles}
				renderItem={({ item }) => <ArticleCard article={item} />}
				keyExtractor={(item) => `article-${item.uuid}`}
				ListEmptyComponent={() =>
					loadings.initial ? null : <EmptyList />
				}
				ListFooterComponent={() =>
					loadings.loadMore ? (
						<ActivityIndicator
							color={colors['accent-brand-light']}
							size="large"
						/>
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={loadings.refresh}
						onRefresh={handleRefresh}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors['background-primary'],
	},
	list: {
		flex: 1,
		minHeight: 0,
	},
})
