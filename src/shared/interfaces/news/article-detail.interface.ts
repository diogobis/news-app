import { Article } from './article.interface'

export interface ArticleDetail extends Article {
	body: string | null
	authors: string[] | null
	originalUrl: string | null
}
