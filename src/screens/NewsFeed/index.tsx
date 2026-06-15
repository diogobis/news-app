import { useNewsContext } from '@/context/news.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, RefreshControl, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { AppHeader } from '@/components/AppHeader'
import { CategoryChips } from './CategoryChips'
import { ArticleCard } from './ArticleCard'
import { DatePicker } from '@/components/DatePicker'
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
	const [input, setInput] = useState('')
	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const dateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchRef = useRef('')
	const dateFromRef = useRef<Date | undefined>(undefined)
	const dateToRef = useRef<Date | undefined>(undefined)

	const fmt = (d: Date | undefined) => d ? d.toISOString().slice(0, 10) : undefined

	const handleFetchNews = async (search?: string, published_from?: string, published_to?: string) => {
		try {
			handleLoadings({ key: 'initial', value: true })
			await fetchNews({ search, published_from, published_to })
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
				published_from: fmt(dateFromRef.current),
				published_to: fmt(dateToRef.current),
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
				published_from: fmt(dateFromRef.current),
				published_to: fmt(dateToRef.current),
			})
		} catch (error) {
			errorHandler(error, 'Falha ao carregar mais notícias')
		} finally {
			handleLoadings({ key: 'loadMore', value: false })
		}
	}

	const handleSearchChange = (text: string) => {
		setInput(text)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			searchRef.current = text
			setSearchTerm(text)
			handleFetchNews(text || undefined, fmt(dateFrom), fmt(dateTo))
		}, 500)
	}

	const scheduleDateFetch = (from: Date | undefined, to: Date | undefined) => {
		if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current)
		dateDebounceRef.current = setTimeout(() => {
			dateFromRef.current = from
			dateToRef.current = to
			handleFetchNews(searchRef.current || undefined, fmt(from), fmt(to))
		}, 500)
	}

	const handleDateFromChange = (d: Date | undefined) => {
		setDateFrom(d)
		dateFromRef.current = d
		scheduleDateFetch(d, dateTo)
	}

	const handleDateToChange = (d: Date | undefined) => {
		setDateTo(d)
		dateToRef.current = d
		scheduleDateFetch(dateFrom, d)
	}

	const today = useMemo(() => new Date(), [])

	useEffect(() => {
		handleFetchNews()
	}, [])

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
			if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current)
		}
	}, [])

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors['background-primary'] }}>
			<AppHeader />
			<View className="self-start">
				<CategoryChips />
			</View>
			<View className="px-6 pt-2 pb-2">
				<View className="flex-row items-center bg-background-tertiary rounded-xl px-4 h-12">
					<MaterialIcons name="search" size={20} color={colors.gray[600]} />
					<TextInput
						className="flex-1 text-white text-base ml-2"
						placeholder="Buscar notícias..."
						placeholderTextColor={colors.gray[600]}
						value={input}
						onChangeText={handleSearchChange}
					/>
				</View>
			</View>
			<View className="flex-row px-6 pb-3 gap-2">
				<DatePicker value={dateFrom} onChange={handleDateFromChange} placeholder="De" maxDate={dateTo ?? today} />
				<DatePicker value={dateTo} onChange={handleDateToChange} placeholder="Até" minDate={dateFrom} maxDate={today} />
			</View>
			<FlatList
				style={{ flex: 1, minHeight: 0 }}
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
