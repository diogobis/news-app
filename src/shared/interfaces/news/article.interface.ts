export interface Article {
	uuid: string
	title: string
	publisher: string | null
	publishedAt: string | null
	thumbnail: string | null
	categories: string[]
}
