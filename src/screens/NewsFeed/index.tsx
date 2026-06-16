import { useNewsContext } from '@/context/news.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '@/components/AppHeader'
import { CategoryChips } from './CategoryChips'
import { ArticleCard } from './ArticleCard'
import { SearchBar } from '@/components/SearchBar'
import { DateFilterBar } from '@/components/DateFilterBar'
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
		setSearchTerm,
	} = useNewsContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation()
	const searchRef = useRef('')
	const dateFromRef = useRef<string | undefined>(undefined)
	const dateToRef = useRef<string | undefined>(undefined)

	const handleFetchNews = async (search?: string, publishedFrom?: string, publishedTo?: string) => {
		try {
			handleLoadings({ key: 'initial', value: true })
			await fetchNews({ search, publishedFrom, publishedTo })
		} catch (error) {
			errorHandler(error, 'Falha ao buscar notícias')
		} finally {
			handleLoadings({ key: 'initial', value: false })
		}
	}

	const handleRefresh = async () => {
		try {
			handleLoadings({ key: 'refresh', value: true })
			await refreshNews({
				search: searchRef.current || undefined,
				publishedFrom: dateFromRef.current,
				publishedTo: dateToRef.current,
			})
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
			await loadMoreNews({
				search: searchRef.current || undefined,
				publishedFrom: dateFromRef.current,
				publishedTo: dateToRef.current,
			})
		} catch (error) {
			errorHandler(error, 'Falha ao carregar mais notícias')
		} finally {
			handleLoadings({ key: 'loadMore', value: false })
		}
	}

	const hasFocused = useRef(false)

	useEffect(() => {
		handleFetchNews()
	}, [])

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			if (hasFocused.current) {
				refreshNews({
					search: searchRef.current || undefined,
					publishedFrom: dateFromRef.current,
					publishedTo: dateToRef.current,
				}).catch(() => {})
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
			<View className="px-6 pt-2 pb-2">
				<SearchBar
					placeholder="Buscar notícias..."
					onSearch={(text) => {
						searchRef.current = text
						setSearchTerm(text)
						handleFetchNews(text || undefined, dateFromRef.current, dateToRef.current)
					}}
				/>
			</View>
			<DateFilterBar
				onFilterChange={(from, to) => {
					dateFromRef.current = from
					dateToRef.current = to
					handleFetchNews(searchRef.current || undefined, from, to)
				}}
			/>
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
