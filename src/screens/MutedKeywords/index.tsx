import { useEffect } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'

import { useMutedKeywordsContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { DrawerScreenHeader } from '@/components/DrawerScreenHeader'
import { ErrorMessage } from '@/components/ErrorMessage'
import { colors } from '@/shared/colors'
import { schema } from './schema'

export const MutedKeywords = () => {
	const { mutedKeywords, fetchMutedKeywords, handleAddMutedKeyword, handleRemoveMutedKeyword } =
		useMutedKeywordsContext()
	const { errorHandler } = useErrorHandler()

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting, errors },
	} = useForm({
		defaultValues: { keyword: '' },
		resolver: yupResolver(schema),
	})

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

	const handleAdd = handleSubmit(async (data) => {
		try {
			await handleAddMutedKeyword(data.keyword.trim())
			reset()
		} catch (error) {
			errorHandler(error, 'Falha ao silenciar palavra')
		}
	})

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<DrawerScreenHeader title="Palavras silenciadas" />

			<View className="mx-6 mb-1">
				<View className="flex-row items-center mb-1">
					<Controller
						control={control}
						name="keyword"
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="flex-1 h-[50px] bg-background-secondary text-white text-base px-4 rounded-xl"
								placeholder="Adicionar palavra..."
								placeholderTextColor={colors.gray[600]}
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>
					<TouchableOpacity
						className="ml-2 bg-accent-brand h-[50px] w-[50px] rounded-xl items-center justify-center"
						onPress={handleAdd}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<ActivityIndicator color={colors.white} />
						) : (
							<MaterialIcons name="add" size={24} color={colors.white} />
						)}
					</TouchableOpacity>
				</View>
				{errors.keyword && <ErrorMessage>{errors.keyword.message}</ErrorMessage>}
			</View>

			<View className="flex-1 min-h-0">
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
