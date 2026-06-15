import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { ArticleDetail as ArticleDetailType } from '@/shared/interfaces/news/article-detail.interface'
import * as NewsService from '@/shared/services/news/news.service'
import { useAuthContext } from '@/context/auth.context'
import { useUserFeaturesContext } from '@/context/user-features.context'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useSnackbarContext } from '@/context/snackbar.context'
import { colors } from '@/shared/colors'
import { categoryLabel, categoryColor } from '@/shared/utils/categoryLabels'

type DetailRouteParams = {
	ArticleDetail: { uuid: string }
}

export const ArticleDetail = () => {
	const route = useRoute<RouteProp<DetailRouteParams, 'ArticleDetail'>>()
	const navigation = useNavigation()
	const { uuid } = route.params
	const { user } = useAuthContext()
	const {
		favorites,
		readLater,
		handleToggleFavorite,
		handleSaveReadLater,
	} = useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const { notify } = useSnackbarContext()

	const [article, setArticle] = useState<ArticleDetailType | null>(null)
	const [loading, setLoading] = useState(true)

	const fetchDetails = useCallback(async () => {
		try {
			setLoading(true)
			const result = await NewsService.getArticleDetails(uuid)
			setArticle(result)
		} catch (error) {
			errorHandler(error, 'Falha ao carregar artigo')
			navigation.goBack()
		} finally {
			setLoading(false)
		}
	}, [uuid])

	const handleAuthRequired = (action: string) => {
		notify({ message: `Faça login para ${action}`, messageType: 'error' })
	}

	const isFavorited = favorites.some((f) => f.articleUuid === uuid)
	const isSaved = readLater.some((r) => r.articleUuid === uuid)

	useEffect(() => {
		fetchDetails()
	}, [fetchDetails])

	if (loading || !article) {
		return (
			<SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
				<ActivityIndicator color={colors['accent-brand-light']} size="large" />
			</SafeAreaView>
		)
	}

	const publishedDate = article.publishedAt
		? format(new Date(article.publishedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
		: null

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<View className="flex-row items-center p-4">
				<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
					<MaterialIcons name="arrow-back" size={24} color={colors.white} />
				</TouchableOpacity>
				<Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
					{article.publisher || 'Artigo'}
				</Text>
			</View>

			<View style={{ flex: 1, minHeight: 0 }}>
				<ScrollView className="flex-1 px-4">
				<Text className="text-white text-2xl font-bold mb-4">{article.title}</Text>

				<View className="flex-row items-center mb-4">
					<MaterialIcons name="newspaper" size={16} color={colors.gray[500]} />
					<Text className="text-gray-500 text-base ml-2">
						{article.publisher || 'Fonte desconhecida'}
					</Text>
				</View>

				{publishedDate && (
					<View className="flex-row items-center mb-4">
						<MaterialIcons name="calendar-today" size={16} color={colors.gray[600]} />
						<Text className="text-gray-600 text-base ml-2">{publishedDate}</Text>
					</View>
				)}

				<View className="flex-row flex-wrap gap-2 mb-6">
					{article.categories.map((cat) => (
						<View
							key={cat}
							className="px-3 py-1 rounded"
							style={{ backgroundColor: categoryColor(cat) + '20' }}
						>
							<Text
								className="text-sm"
								style={{ color: categoryColor(cat) }}
							>
								{categoryLabel(cat)}
							</Text>
						</View>
					))}
				</View>

				<View className="h-60 bg-background-secondary rounded-xl mb-6 overflow-hidden items-center justify-center">
					{article.thumbnail ? (
						<Image source={{ uri: article.thumbnail }} className="w-full h-full" resizeMode="cover" />
					) : (
						<MaterialIcons name="image" size={64} color={colors.gray[600]} />
					)}
				</View>

				{article.authors && (() => {
					let parsed: string[]
					try {
						const result = JSON.parse(article.authors)
						parsed = Array.isArray(result) ? result : [result]
					} catch {
						parsed = article.authors.split(',').map((a: string) => a.trim()).filter(Boolean)
					}
					return parsed.length > 0 ? (
						<View className="flex-row items-center mb-4">
							<MaterialIcons name="person" size={16} color={colors.gray[500]} />
							<Text className="text-gray-500 text-base ml-2">{parsed.join(', ')}</Text>
						</View>
					) : null
				})()}

				{article.body ? (
					<Text className="text-gray-400 text-base leading-6 mb-8">{article.body}</Text>
				) : (
					<Text className="text-gray-600 text-base italic mb-8">
						Conteúdo não disponível
					</Text>
				)}
				</ScrollView>
			</View>

			{user ? (
				<View className="flex-row justify-around p-4 bg-background-secondary">
					<TouchableOpacity
						className="items-center"
						onPress={() => handleToggleFavorite(uuid)}
					>
						<MaterialIcons
							name={isFavorited ? 'favorite' : 'favorite-outline'}
							size={28}
							color={isFavorited ? colors['accent-red'] : colors.gray[500]}
						/>
						<Text className="text-gray-500 text-sm mt-1">
							{isFavorited ? 'Favoritado' : 'Favoritar'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="items-center"
						onPress={() => {
							if (isSaved) return
							handleSaveReadLater(uuid)
						}}
					>
						<MaterialIcons
							name={isSaved ? 'bookmark' : 'bookmark-outline'}
							size={28}
							color={isSaved ? colors['accent-brand-light'] : colors.gray[500]}
						/>
						<Text className="text-gray-500 text-sm mt-1">
							{isSaved ? 'Salvo' : 'Ler depois'}
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View className="flex-row justify-around p-4 bg-background-secondary">
					<TouchableOpacity
						className="items-center opacity-50"
						onPress={() => handleAuthRequired('favoritar')}
					>
						<MaterialIcons name="favorite-outline" size={28} color={colors.gray[600]} />
						<Text className="text-gray-600 text-sm mt-1">Favoritar</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="items-center opacity-50"
						onPress={() => handleAuthRequired('salvar')}
					>
						<MaterialIcons name="bookmark-outline" size={28} color={colors.gray[600]} />
						<Text className="text-gray-600 text-sm mt-1">Ler depois</Text>
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	)
}
