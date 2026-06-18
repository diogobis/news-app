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
	fetchFavorites: (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => Promise<void>
	handleToggleFavorite: (articleUuid: string) => Promise<void>
}

export const FavoritesContext = createContext({} as FavoritesContextType)

export const FavoritesContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [favorites, setFavorites] = useState<FavoriteItem[]>([])

	const fetchFavorites = useCallback(async (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => {
		if (!user) return
		const items = await UserService.getFavorites(params)
		setFavorites(items)
	}, [user])

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
				fetchFavorites,
				handleToggleFavorite,
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
