import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { useUserFeaturesContext } from '@/context/user-features.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'
import { DatePicker } from '@/components/DatePicker'
import { ReadLaterCard } from './ReadLaterCard'

type DrawerParamsList = {
	Feed: undefined
	Favorites: undefined
	ReadLater: undefined
	MutedKeywords: undefined
	ArticleDetail: { uuid: string }
}

export const ReadLater = () => {
	const { readLater, fetchReadLater, handleRemoveReadLater } = useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()
	const [input, setInput] = useState('')
	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const dateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchRef = useRef('')
	const dateFromRef = useRef<Date | undefined>(undefined)
	const dateToRef = useRef<Date | undefined>(undefined)

	const fmt = (d: Date | undefined) => d ? d.toISOString().slice(0, 10) : undefined

	const loadReadLater = useCallback(async (search?: string, publishedFrom?: string, publishedTo?: string) => {
		try {
			await fetchReadLater({ search, publishedFrom, publishedTo })
		} catch (error) {
			errorHandler(error, 'Falha ao buscar lista de leitura')
		}
	}, [fetchReadLater, errorHandler])

	useEffect(() => {
		loadReadLater()
	}, [])

	const handleSearchChange = (text: string) => {
		setInput(text)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			searchRef.current = text
			loadReadLater(text || undefined, fmt(dateFromRef.current), fmt(dateToRef.current))
		}, 500)
	}

	const scheduleFilteredFetch = (from: Date | undefined, to: Date | undefined) => {
		if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current)
		dateDebounceRef.current = setTimeout(() => {
			dateFromRef.current = from
			dateToRef.current = to
			loadReadLater(searchRef.current || undefined, fmt(from), fmt(to))
		}, 500)
	}

	const handleDateFromChange = (d: Date | undefined) => {
		setDateFrom(d)
		dateFromRef.current = d
		scheduleFilteredFetch(d, dateToRef.current)
	}

	const handleDateToChange = (d: Date | undefined) => {
		setDateTo(d)
		dateToRef.current = d
		scheduleFilteredFetch(dateFromRef.current, d)
	}

	const today = useMemo(() => new Date(), [])

	const handleRemove = useCallback(async (articleUuid: string) => {
		try {
			await handleRemoveReadLater(articleUuid)
		} catch (error) {
			errorHandler(error, 'Falha ao remover')
		}
	}, [handleRemoveReadLater, errorHandler])

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
			if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current)
		}
	}, [])

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<View className="flex-row items-center justify-between p-4">
				<Text className="text-white text-xl font-bold">Ler depois</Text>
				<TouchableOpacity onPress={() => navigation.toggleDrawer()}>
					<MaterialIcons name="menu" size={24} color={colors.white} />
				</TouchableOpacity>
			</View>

			<View className="px-6 pb-2">
				<View className="flex-row items-center bg-background-tertiary rounded-xl px-4 h-12">
					<MaterialIcons name="search" size={20} color={colors.gray[600]} />
					<TextInput
						className="flex-1 text-white text-base ml-2"
						placeholder="Buscar na lista..."
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

			<View style={{ flex: 1, minHeight: 0 }}>
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
							{input || dateFrom || dateTo ? 'Nenhum artigo encontrado' : 'Nenhum artigo salvo'}
						</Text>
					)}
				/>
			</View>
		</SafeAreaView>
	)
}
