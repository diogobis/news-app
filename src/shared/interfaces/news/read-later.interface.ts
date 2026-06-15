export interface ReadLaterItem {
	userId: number
	articleUuid: string
	savedAt: string
	title: string
	publisher: string | null
	publishedAt: string | null
	thumbnail: string | null
}
