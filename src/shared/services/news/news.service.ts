import { newsApi } from '@/shared/api/news'
import { Article } from '@/shared/interfaces/news/article.interface'
import { ArticleDetail } from '@/shared/interfaces/news/article-detail.interface'

interface GetNewsParams {
	page?: number
	limit?: number
	category?: string
	search?: string
	publishedFrom?: string
	publishedTo?: string
}

interface GetNewsResponse {
	data: Article[]
	meta: {
		page: number
		limit: number
		total: number
		hasMore: boolean
	}
}

export const getNews = async (params?: GetNewsParams): Promise<GetNewsResponse> => {
	const { data } = await newsApi.get<GetNewsResponse>('/news', { params })
	return data
}

export const getArticleDetails = async (uuid: string): Promise<ArticleDetail> => {
	const { data } = await newsApi.get<{ data: ArticleDetail }>('/details', {
		params: { uuid },
	})
	return data.data
}
