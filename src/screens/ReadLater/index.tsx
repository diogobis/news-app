import { useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { useReadLaterContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { FilterInput } from '@/components/FilterInput'
import { DrawerScreenHeader } from '@/components/DrawerScreenHeader'
import { ReadLaterCard } from './ReadLaterCard'

export const ReadLater = () => {
	const {
		readLater,
		handleRemoveReadLater,
		searchTerm,
		dateFrom,
		dateTo,
		fetchReadLater,
		setSearchTerm,
		setDateFrom,
		setDateTo,
	} = useReadLaterContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()

	useEffect(() => {
		(async () => {
			try {
				await fetchReadLater()
			} catch (error) {
				errorHandler(error, 'Falha ao buscar lista de leitura')
			}
		})()
	}, [searchTerm, dateFrom, dateTo])

	const handleRemove = async (articleUuid: string) => {
		try {
			await handleRemoveReadLater(articleUuid)
		} catch (error) {
			errorHandler(error, 'Falha ao remover')
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<DrawerScreenHeader title="Ler depois" />

			<View className="pb-2">
				<FilterInput
					searchPlaceholder="Buscar na lista..."
					onFilterChange={({ search, publishedFrom, publishedTo }) => {
						setSearchTerm(search ?? '')
						setDateFrom(publishedFrom ?? '')
						setDateTo(publishedTo ?? '')
					}}
				/>
			</View>

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
							{searchTerm || dateFrom || dateTo
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
