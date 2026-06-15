export interface FavoriteItem {
	userId: number
	articleUuid: string
	createdAt: string
	title: string
	publisher: string | null
	publishedAt: string | null
	thumbnail: string | null
}
