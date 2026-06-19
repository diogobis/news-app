import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useRef,
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
	searchTerm: string
	pagination: PaginationMeta
	loadings: Loadings
	dateFrom: string
	dateTo: string
	fetchNews: (params?: { page?: number; category?: string }) => Promise<void>
	refreshNews: () => Promise<void>
	loadMoreNews: () => Promise<void>
	setSelectedCategory: (category: string | null) => void
	setSearchTerm: (term: string) => void
	setDateFrom: (date: string) => void
	setDateTo: (date: string) => void
	handleLoadings: (params: { key: keyof Loadings; value: boolean }) => void
}

export const NewsContext = createContext({} as NewsContextType)

export const NewsContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const loadMoreLockRef = useRef(false)
	const [articles, setArticles] = useState<Article[]>([])
	const selectedCategoryRef = useRef<string | null>(null);
	const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')
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

	const setSelectedCategory = useCallback((category: string | null) => {
		selectedCategoryRef.current = category  // Síncrono, disponível imediatamente nos fetchNews
		setSelectedCategoryState(category)      // Assíncrono, re-renderiza os componentes
	}, [])

	const fetchNews = useCallback(async (params?: { page?: number }) => {
		const page = params?.page ?? 1
		const category = selectedCategoryRef.current ?? undefined;

		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page, limit: 15, category, search: searchTerm || undefined, publishedFrom: dateFrom || undefined, publishedTo: dateTo || undefined })

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
	}, [selectedCategory, searchTerm, dateFrom, dateTo, user])

	const refreshNews = useCallback(async () => {
		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page: 1, limit: 15, category: selectedCategory ?? undefined, search: searchTerm || undefined, publishedFrom: dateFrom || undefined, publishedTo: dateTo || undefined })

		setArticles(response.data as Article[])
		setPagination({
			page: 1,
			perPage: 15,
			totalRows: response.meta.total,
			totalPages: Math.ceil(response.meta.total / 15),
		})
	}, [selectedCategory, searchTerm, dateFrom, dateTo, user])

	const loadMoreNews = useCallback(async () => {
		if (loadMoreLockRef.current || pagination.page >= pagination.totalPages) return
		loadMoreLockRef.current = true

		const service = user ? UserService.getUserNews : NewsService.getNews
		const response = await service({ page: pagination.page + 1, limit: 15, category: selectedCategory ?? undefined, search: searchTerm || undefined, publishedFrom: dateFrom || undefined, publishedTo: dateTo || undefined })

		setArticles((prev) => [...prev, ...(response.data as Article[])])
		setPagination((prev) => ({
			...prev,
			page: prev.page + 1,
			totalRows: response.meta.total,
			totalPages: Math.ceil(response.meta.total / 15),
		}))
		loadMoreLockRef.current = false
	}, [pagination, selectedCategory, searchTerm, dateFrom, dateTo, user])

	return (
		<NewsContext.Provider
			value={{
				articles,
				selectedCategory,
				searchTerm,
				dateFrom,
				dateTo,
				pagination,
				loadings,
				fetchNews,
				refreshNews,
				loadMoreNews,
				setSelectedCategory,
				setSearchTerm,
				setDateFrom,
				setDateTo,
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
