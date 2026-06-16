import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, useWindowDimensions, View } from 'react-native'
import RenderHtml from 'react-native-render-html'
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
import { ArticleDetailHeader } from './ArticleDetailHeader'
import { ArticleActions } from './ArticleActions'
import { Comments } from './Comments'

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
		handleRemoveReadLater,
	} = useUserFeaturesContext()
	const { errorHandler } = useErrorHandler()
	const { notify } = useSnackbarContext()

	const [article, setArticle] = useState<ArticleDetailType | null>(null)
	const [loading, setLoading] = useState(true)
	const { width } = useWindowDimensions()

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

	const handleFavoritePress = async () => {
		try {
			await handleToggleFavorite(uuid)
		} catch (error) {
			errorHandler(error, 'Falha ao favoritar')
		}
	}

	const handleSaveLaterPress = async () => {
		try {
			if (isSaved) {
				await handleRemoveReadLater(uuid)
			} else {
				await handleSaveReadLater(uuid)
			}
		} catch (error) {
			errorHandler(error, 'Falha ao salvar para ler depois')
		}
	}

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
			<ArticleDetailHeader publisher={article.publisher} onGoBack={() => navigation.goBack()} />

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
								<Text className="text-sm" style={{ color: categoryColor(cat) }}>
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
						<RenderHtml
							contentWidth={width}
							source={{ html: `<body style="color:#9CA3AF;font-size:16px;line-height:1.6">${article.body}</body>` }}
							baseStyle={{ color: '#9CA3AF', fontSize: 16, lineHeight: 26 }}
						/>
					) : (
						<Text className="text-gray-600 text-base italic mb-8">
							Conteúdo não disponível
						</Text>
					)}

					<Comments articleUuid={uuid} />
				</ScrollView>
			</View>

			<ArticleActions
				user={user}
				isFavorited={isFavorited}
				isSaved={isSaved}
				onFavoritePress={handleFavoritePress}
				onSaveLaterPress={handleSaveLaterPress}
				onAuthRequired={handleAuthRequired}
			/>
		</SafeAreaView>
	)
}
