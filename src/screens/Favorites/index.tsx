import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { useUserFeaturesContext } from '@/context/user-features.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'
import { DatePicker } from '@/components/DatePicker'

export const Favorites = () => {
	const { favorites, fetchFavorites, handleToggleFavorite } = useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<StackNavigationProp<any>>()
	const [input, setInput] = useState('')
	const [debounced, setDebounced] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => setDebounced(input), 500)
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [input])

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

	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

	const filtered = useMemo(() => {
		let result = favorites

		if (debounced) {
			result = result.filter((f) => f.title.toLowerCase().includes(debounced.toLowerCase()))
		}

		if (dateFrom || dateTo) {
			result = result.filter((f) => {
				if (!f.publishedAt) return false
				const date = new Date(f.publishedAt).getTime()
				if (dateFrom && date < dateFrom.getTime()) return false
				if (dateTo && date > new Date(dateTo.getTime() + 86400000).getTime()) return false
				return true
			})
		}

		return result
	}, [favorites, debounced, dateFrom, dateTo])

	const today = useMemo(() => new Date(), [])

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<View className="flex-row items-center p-4">
				<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
					<MaterialIcons name="arrow-back" size={24} color={colors.white} />
				</TouchableOpacity>
				<Text className="text-white text-xl font-bold">Favoritos</Text>
			</View>

			<View className="px-6 pb-2">
				<View className="flex-row items-center bg-background-tertiary rounded-xl px-4 h-12">
					<MaterialIcons name="search" size={20} color={colors.gray[600]} />
					<TextInput
						className="flex-1 text-white text-base ml-2"
						placeholder="Buscar favoritos..."
						placeholderTextColor={colors.gray[600]}
						value={input}
						onChangeText={setInput}
					/>
				</View>
			</View>
			<View className="flex-row px-6 pb-3 gap-2">
				<DatePicker value={dateFrom} onChange={setDateFrom} placeholder="De" maxDate={dateTo ?? today} />
				<DatePicker value={dateTo} onChange={setDateTo} placeholder="Até" minDate={dateFrom} maxDate={today} />
			</View>

			<View style={{ flex: 1, minHeight: 0 }}>
				<FlatList
					data={filtered}
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
							{debounced ? 'Nenhum favorito encontrado' : 'Nenhum favorito ainda'}
						</Text>
					)}
				/>
			</View>
		</SafeAreaView>
	)
}
