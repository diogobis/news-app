import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { useUserFeaturesContext } from '@/context/user-features.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { colors } from '@/shared/colors'

type DrawerParamsList = {
	Feed: undefined
	Favorites: undefined
	ReadLater: undefined
	MutedKeywords: undefined
}

export const MutedKeywords = () => {
	const { mutedKeywords, fetchMutedKeywords, handleAddMutedKeyword, handleRemoveMutedKeyword } =
		useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()

	const [keyword, setKeyword] = useState('')
	const [adding, setAdding] = useState(false)

	useEffect(() => {
		const load = async () => {
			try {
				await fetchMutedKeywords()
			} catch (error) {
				errorHandler(error, 'Falha ao buscar palavras silenciadas')
			}
		}
		load()
	}, [])

	const handleAdd = async () => {
		if (!keyword.trim()) return
		try {
			setAdding(true)
			await handleAddMutedKeyword(keyword.trim())
			setKeyword('')
		} catch (error) {
			errorHandler(error, 'Falha ao silenciar palavra')
		} finally {
			setAdding(false)
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<View className="flex-row items-center justify-between p-4">
				<Text className="text-white text-xl font-bold">Palavras silenciadas</Text>
				<TouchableOpacity onPress={() => navigation.toggleDrawer()}>
					<MaterialIcons name="menu" size={24} color={colors.white} />
				</TouchableOpacity>
			</View>

			<View className="flex-row items-center mx-6 mb-6">
				<TextInput
					className="flex-1 h-[50px] bg-background-secondary text-white text-base px-4 rounded-xl"
					placeholder="Adicionar palavra..."
					placeholderTextColor={colors.gray[600]}
					value={keyword}
					onChangeText={setKeyword}
					onSubmitEditing={handleAdd}
				/>
				<TouchableOpacity
					className="ml-2 bg-accent-brand h-[50px] w-[50px] rounded-xl items-center justify-center"
					onPress={handleAdd}
					disabled={adding}
				>
					{adding ? (
						<ActivityIndicator color={colors.white} />
					) : (
						<MaterialIcons name="add" size={24} color={colors.white} />
					)}
				</TouchableOpacity>
			</View>

			<View style={{ flex: 1, minHeight: 0 }}>
				<FlatList
					data={mutedKeywords}
					keyExtractor={(item) => `mute-${item.id}`}
					renderItem={({ item }) => (
						<View className="mx-6 mb-3 bg-background-tertiary rounded-xl px-4 py-3 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<MaterialIcons name="volume-off" size={20} color={colors.gray[500]} />
								<Text className="text-white text-base ml-3">{item.keyword}</Text>
							</View>
							<TouchableOpacity onPress={() => handleRemoveMutedKeyword(item.id)}>
								<MaterialIcons name="close" size={20} color={colors['accent-red']} />
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={() => (
						<Text className="text-white text-center mt-10 text-lg">
							Nenhuma palavra silenciada
						</Text>
					)}
				/>
			</View>
		</SafeAreaView>
	)
}
