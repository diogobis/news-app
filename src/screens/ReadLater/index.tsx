import { useCallback, useEffect, useRef } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { useReadLaterContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { SearchBar } from '@/components/SearchBar'
import { DateFilterBar } from '@/components/DateFilterBar'
import { DrawerScreenHeader } from '@/components/DrawerScreenHeader'
import { ReadLaterCard } from './ReadLaterCard'

export const ReadLater = () => {
	const { readLater, fetchReadLater, handleRemoveReadLater } = useReadLaterContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()
	const searchRef = useRef('')
	const dateFromRef = useRef<string | undefined>(undefined)
	const dateToRef = useRef<string | undefined>(undefined)

	const loadReadLater = useCallback(async (search?: string, publishedFrom?: string, publishedTo?: string) => {
		try {
			await fetchReadLater({ search, publishedFrom, publishedTo })
		} catch (error) {
			errorHandler(error, 'Falha ao buscar lista de leitura')
		}
	}, [fetchReadLater])

	useEffect(() => {
		loadReadLater()
	}, [])

	const handleRemove = useCallback(async (articleUuid: string) => {
		try {
			await handleRemoveReadLater(articleUuid)
		} catch (error) {
			errorHandler(error, 'Falha ao remover')
		}
	}, [handleRemoveReadLater])

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<DrawerScreenHeader title="Ler depois" />

			<View className="px-6 pb-2">
				<SearchBar
					placeholder="Buscar na lista..."
					onSearch={(text) => {
						searchRef.current = text
						loadReadLater(text || undefined, dateFromRef.current, dateToRef.current)
					}}
				/>
			</View>
			<DateFilterBar
				onFilterChange={(from, to) => {
					dateFromRef.current = from
					dateToRef.current = to
					loadReadLater(searchRef.current || undefined, from, to)
				}}
			/>

			<View style={styles.wrapper}>
				<FlatList
					data={readLater}
					keyExtractor={(item) => `rl-${item.articleUuid}`}
					renderItem={({ item }) => (
						<ReadLaterCard
							item={item}
							onPress={() => navigation.navigate('ArticleDetail', { uuid: item.articleUuid })}
							onRemove={() => handleRemove(item.articleUuid)}
						/>
					)}
					ListEmptyComponent={() => (
						<Text className="text-white text-center mt-10 text-lg">
							{searchRef.current || dateFromRef.current || dateToRef.current
								? 'Nenhum artigo encontrado'
								: 'Nenhum artigo salvo'}
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
