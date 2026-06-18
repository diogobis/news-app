import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { FavoriteItem } from '@/shared/interfaces/news/favorite.interface'
import * as UserService from '@/shared/services/news/user.service'
import { useAuthContext } from './auth.context'

type FavoritesContextType = {
	favorites: FavoriteItem[]
	searchTerm: string
	dateFrom: string
	dateTo: string
	fetchFavorites: () => Promise<void>
	handleToggleFavorite: (articleUuid: string) => Promise<void>
	setSearchTerm: (term: string) => void
	setDateFrom: (date: string) => void
	setDateTo: (date: string) => void
}

export const FavoritesContext = createContext({} as FavoritesContextType)

export const FavoritesContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [favorites, setFavorites] = useState<FavoriteItem[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')

	const fetchFavorites = useCallback(async () => {
		if (!user) return
		const items = await UserService.getFavorites({
			search: searchTerm || undefined,
			publishedFrom: dateFrom || undefined,
			publishedTo: dateTo || undefined,
		})
		setFavorites(items)
	}, [user, searchTerm, dateFrom, dateTo])

	const handleToggleFavorite = useCallback(async (articleUuid: string) => {
		const isFavorited = favorites.some((f) => f.articleUuid === articleUuid)

		if (isFavorited) {
			await UserService.removeFavorite(articleUuid)
			setFavorites((prev) => prev.filter((f) => f.articleUuid !== articleUuid))
		} else {
			await UserService.saveFavorite(articleUuid)
			await fetchFavorites()
		}
	}, [favorites, fetchFavorites])

	return (
		<FavoritesContext.Provider
			value={{
				favorites,
				searchTerm,
				dateFrom,
				dateTo,
				fetchFavorites,
				handleToggleFavorite,
				setSearchTerm,
				setDateFrom,
				setDateTo,
			}}
		>
			{children}
		</FavoritesContext.Provider>
	)
}

export const useFavoritesContext = () => {
	const context = useContext(FavoritesContext)
	return context
}
