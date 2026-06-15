import { dtMoneyApi } from '@/shared/api/dtmoney'
import { Article } from '@/shared/interfaces/news/article.interface'
import { ArticleDetail } from '@/shared/interfaces/news/article-detail.interface'

interface GetNewsParams {
	page?: number
	limit?: number
	category?: string
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
	const { data } = await dtMoneyApi.get<GetNewsResponse>('/news', { params })
	return data
}

export const getArticleDetails = async (uuid: string): Promise<ArticleDetail> => {
	const { data } = await dtMoneyApi.get<{ data: ArticleDetail }>('/details', {
		params: { uuid },
	})
	return data.data
}
