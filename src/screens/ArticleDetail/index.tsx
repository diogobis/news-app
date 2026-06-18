import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'

import { ArticleDetail as ArticleDetailType } from '@/shared/interfaces/news/article-detail.interface'
import * as NewsService from '@/shared/services/news/news.service'
import { useAuthContext } from '@/context/auth.context'
import { useFavoritesContext, useReadLaterContext } from '@/context/user-features.provider'
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { useSnackbarContext } from '@/context/snackbar.context'
import { colors } from '@/shared/colors'
import { ArticleDetailHeader } from './ArticleDetailHeader'
import { ArticleContent } from './ArticleContent'
import { ArticleActions } from './ArticleActions'

type DetailRouteParams = {
	ArticleDetail: { uuid: string }
}

export const ArticleDetail = () => {
	const route = useRoute<RouteProp<DetailRouteParams, 'ArticleDetail'>>()
	const navigation = useNavigation()
	const { uuid } = route.params
	const { user } = useAuthContext()
	const { favorites, handleToggleFavorite } = useFavoritesContext()
	const { readLater, handleSaveReadLater, handleRemoveReadLater } = useReadLaterContext()
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

	return (
		<SafeAreaView className="flex-1 bg-background-primary">
			<KeyboardAvoidingView
				behavior="padding"
				style={{ flex: 1 }}
			>
			
				<ArticleDetailHeader publisher={article.publisher} onGoBack={() => navigation.goBack()} />

				<ArticleContent article={article} />

				<ArticleActions
					user={user}
					isFavorited={isFavorited}
					isSaved={isSaved}
					onFavoritePress={handleFavoritePress}
					onSaveLaterPress={handleSaveLaterPress}
					onAuthRequired={handleAuthRequired}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
