import { dtMoneyApi } from '@/shared/api/dtmoney'
import { ArticleDetail } from '@/shared/interfaces/news/article-detail.interface'
import { FavoriteItem } from '@/shared/interfaces/news/favorite.interface'
import { ReadLaterItem } from '@/shared/interfaces/news/read-later.interface'
import { MutedKeyword } from '@/shared/interfaces/news/muted-keyword.interface'

// Favorites
export const getFavorites = async (): Promise<FavoriteItem[]> => {
	const { data } = await dtMoneyApi.get<{ data: FavoriteItem[] }>('/me/favorites')
	return data.data
}

export const saveFavorite = async (articleUuid: string): Promise<void> => {
	await dtMoneyApi.post('/me/favorites', { articleUuid })
}

export const removeFavorite = async (articleUuid: string): Promise<void> => {
	await dtMoneyApi.delete(`/me/favorites/${articleUuid}`)
}

// Read Later
export const getReadLater = async (): Promise<ReadLaterItem[]> => {
	const { data } = await dtMoneyApi.get<{ data: ReadLaterItem[] }>('/me/read-later')
	return data.data
}

export const saveReadLater = async (articleUuid: string): Promise<void> => {
	await dtMoneyApi.post('/me/read-later', { articleUuid })
}

export const removeReadLater = async (articleUuid: string): Promise<void> => {
	await dtMoneyApi.delete(`/me/read-later/${articleUuid}`)
}

// Muted Keywords
export const getMutedKeywords = async (): Promise<MutedKeyword[]> => {
	const { data } = await dtMoneyApi.get<{ data: MutedKeyword[] }>('/me/mutes')
	return data.data
}

export const addMutedKeyword = async (keyword: string): Promise<void> => {
	await dtMoneyApi.post('/me/mutes', { keyword })
}

export const removeMutedKeyword = async (id: number): Promise<void> => {
	await dtMoneyApi.delete(`/me/mutes/${id}`)
}

// User news feed (with muting applied)
interface GetUserNewsParams {
	page?: number
	limit?: number
	category?: string
	search?: string
	publishedFrom?: string
	publishedTo?: string
}

interface GetNewsResponse {
	data: ArticleDetail[]
	meta: {
		page: number
		limit: number
		total: number
		hasMore: boolean
	}
}

export const getUserNews = async (params?: GetUserNewsParams): Promise<GetNewsResponse> => {
	const { data } = await dtMoneyApi.get<GetNewsResponse>('/me/news', { params })
	return data
}
