import { newsApi } from '@/shared/api/news'
import { ArticleDetail } from '@/shared/interfaces/news/article-detail.interface'
import { FavoriteItem } from '@/shared/interfaces/news/favorite.interface'
import { ReadLaterItem } from '@/shared/interfaces/news/read-later.interface'
import { MutedKeyword } from '@/shared/interfaces/news/muted-keyword.interface'

// Filtros enviados para buscar apenas favoritos que batem com texto/data.
interface FavoritesFilterParams {
	search?: string
	publishedFrom?: string
	publishedTo?: string
}

// Busca os artigos favoritados do usuario autenticado.
export const getFavorites = async (params?: FavoritesFilterParams): Promise<FavoriteItem[]> => {
	const { data } = await newsApi.get<{ data: FavoriteItem[] }>('/me/favorites', { params })
	return data.data
}

// Adiciona um artigo aos favoritos pelo uuid.
export const saveFavorite = async (articleUuid: string): Promise<void> => {
	await newsApi.post('/me/favorites', { articleUuid })
}

// Remove um artigo dos favoritos pelo uuid.
export const removeFavorite = async (articleUuid: string): Promise<void> => {
	await newsApi.delete(`/me/favorites/${articleUuid}`)
}

// Filtros enviados para buscar apenas itens salvos para ler depois.
interface ReadLaterFilterParams {
	search?: string
	publishedFrom?: string
	publishedTo?: string
}

// Busca a lista de leitura do usuario autenticado.
export const getReadLater = async (params?: ReadLaterFilterParams): Promise<ReadLaterItem[]> => {
	const { data } = await newsApi.get<{ data: ReadLaterItem[] }>('/me/read-later', { params })
	return data.data
}

// Salva um artigo na lista de leitura pelo uuid.
export const saveReadLater = async (articleUuid: string): Promise<void> => {
	await newsApi.post('/me/read-later', { articleUuid })
}

// Remove um artigo da lista de leitura pelo uuid.
export const removeReadLater = async (articleUuid: string): Promise<void> => {
	await newsApi.delete(`/me/read-later/${articleUuid}`)
}

// Palavras silenciadas pelo usuario para filtrar o feed personalizado.
export const getMutedKeywords = async (): Promise<MutedKeyword[]> => {
	const { data } = await newsApi.get<{ data: MutedKeyword[] }>('/me/mutes')
	return data.data
}

// Adiciona uma palavra que deve ser silenciada no feed.
export const addMutedKeyword = async (keyword: string): Promise<void> => {
	await newsApi.post('/me/mutes', { keyword })
}

// Remove uma palavra silenciada pelo id do registro.
export const removeMutedKeyword = async (id: number): Promise<void> => {
	await newsApi.delete(`/me/mutes/${id}`)
}

// Parametros do feed autenticado, incluindo paginacao, categoria e filtros.
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

// Busca o feed do usuario com preferencias e palavras silenciadas aplicadas.
export const getUserNews = async (params?: GetUserNewsParams): Promise<GetNewsResponse> => {
	const { data } = await newsApi.get<GetNewsResponse>('/me/news', { params })
	return data
}
