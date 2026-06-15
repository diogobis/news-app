import { useNewsContext } from '@/context/news.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useEffect } from 'react'
import { ActivityIndicator, FlatList, Platform, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppHeader } from '@/components/AppHeader'
import { CategoryChips } from './CategoryChips'
import { ArticleCard } from './ArticleCard'
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
	} = useNewsContext()
	const { errorHandler } = useErrorHandler()

	const handleFetchNews = async () => {
		try {
			handleLoadings({ key: 'initial', value: true })
			await fetchNews()
		} catch (error) {
			errorHandler(error, 'Falha ao buscar notícias')
		} finally {
			handleLoadings({ key: 'initial', value: false })
		}
	}

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
		handleFetchNews()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors['background-primary'] }}>
			<FlatList
				style={{ flex: 1, minHeight: 0 }}
				contentContainerStyle={{ flexGrow: 1 }}
				data={articles}
				renderItem={({ item }) => <ArticleCard article={item} />}
				keyExtractor={(item) => `article-${item.uuid}`}
				ListHeaderComponent={() => (
					<>
						<AppHeader />
						<CategoryChips />
					</>
				)}
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
