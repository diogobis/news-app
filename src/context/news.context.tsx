import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { Article } from '@/shared/interfaces/news/article.interface'
import * as NewsService from '@/shared/services/news/news.service'
import { useAuthContext } from './auth.context'
import * as UserService from '@/shared/services/news/user.service'

interface Loadings {
	initial: boolean
	refresh: boolean
	loadMore: boolean
}

interface PaginationMeta {
	page: number
	perPage: number
	totalRows: number
	totalPages: number
}

type NewsContextType = {
	articles: Article[]
	selectedCategory: string | null
	pagination: PaginationMeta
	loadings: Loadings
	fetchNews: (params?: { page?: number; category?: string }) => Promise<void>
	refreshNews: () => Promise<void>
	loadMoreNews: () => Promise<void>
	setSelectedCategory: (category: string | null) => void
	handleLoadings: (params: { key: keyof Loadings; value: boolean }) => void
}

export const NewsContext = createContext({} as NewsContextType)

export const NewsContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [articles, setArticles] = useState<Article[]>([])
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [pagination, setPagination] = useState<PaginationMeta>({
		page: 1,
		perPage: 15,
		totalRows: 0,
		totalPages: 0,
	})
	const [loadings, setLoadings] = useState<Loadings>({
		initial: false,
		refresh: false,
		loadMore: false,
	})

	const handleLoadings = ({ key, value }: { key: keyof Loadings; value: boolean }) => {
		setLoadings((prev) => ({ ...prev, [key]: value }))
	}

	const fetchNews = useCallback(async (params?: { page?: number; category?: string }) => {
		const page = params?.page ?? 1
		const category = params?.category ?? selectedCategory ?? undefined

		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page, limit: 15, category })

		if (page === 1) {
			setArticles(response.data as Article[])
		} else {
			setArticles((prev) => [...prev, ...(response.data as Article[])])
		}

		setPagination({
			page,
			perPage: 15,
			totalRows: response.meta.total,
			totalPages: Math.ceil(response.meta.total / 15),
		})
	}, [selectedCategory, user])

	const refreshNews = useCallback(async () => {
		const category = selectedCategory ?? undefined
		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page: 1, limit: 15, category })

		setArticles(response.data as Article[])
		setPagination({
			page: 1,
			perPage: 15,
			totalRows: response.meta.total,
			totalPages: Math.ceil(response.meta.total / 15),
		})
	}, [selectedCategory, user])

	const loadMoreNews = useCallback(async () => {
		if (loadings.loadMore || pagination.page >= pagination.totalPages) return

		const category = selectedCategory ?? undefined
		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page: pagination.page + 1, limit: 15, category })

		setArticles((prev) => [...prev, ...(response.data as Article[])])
		setPagination((prev) => ({
			...prev,
			page: prev.page + 1,
			totalRows: response.meta.total,
			totalPages: Math.ceil(response.meta.total / 15),
		}))
	}, [loadings.loadMore, pagination, selectedCategory, user])

	return (
		<NewsContext.Provider
			value={{
				articles,
				selectedCategory,
				pagination,
				loadings,
				fetchNews,
				refreshNews,
				loadMoreNews,
				setSelectedCategory,
				handleLoadings,
			}}
		>
			{children}
		</NewsContext.Provider>
	)
}

export const useNewsContext = () => {
	const context = useContext(NewsContext)
	return context
}
