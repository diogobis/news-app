import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { FavoriteItem } from '@/shared/interfaces/news/favorite.interface'
import { ReadLaterItem } from '@/shared/interfaces/news/read-later.interface'
import { MutedKeyword } from '@/shared/interfaces/news/muted-keyword.interface'
import * as UserService from '@/shared/services/news/user.service'
import { useAuthContext } from './auth.context'

type UserFeaturesContextType = {
	favorites: FavoriteItem[]
	readLater: ReadLaterItem[]
	mutedKeywords: MutedKeyword[]
	fetchFavorites: (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => Promise<void>
	fetchReadLater: (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => Promise<void>
	fetchMutedKeywords: () => Promise<void>
	handleToggleFavorite: (articleUuid: string) => Promise<void>
	handleSaveReadLater: (articleUuid: string) => Promise<void>
	handleRemoveReadLater: (articleUuid: string) => Promise<void>
	handleAddMutedKeyword: (keyword: string) => Promise<void>
	handleRemoveMutedKeyword: (id: number) => Promise<void>
}

export const UserFeaturesContext = createContext({} as UserFeaturesContextType)

export const UserFeaturesContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [favorites, setFavorites] = useState<FavoriteItem[]>([])
	const [readLater, setReadLater] = useState<ReadLaterItem[]>([])
	const [mutedKeywords, setMutedKeywords] = useState<MutedKeyword[]>([])

	const fetchFavorites = useCallback(async (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => {
		if (!user) return
		const items = await UserService.getFavorites(params)
		setFavorites(items)
	}, [user])

	const fetchReadLater = useCallback(async (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => {
		if (!user) return
		const items = await UserService.getReadLater(params)
		setReadLater(items)
	}, [user])

	const fetchMutedKeywords = useCallback(async () => {
		if (!user) return
		const items = await UserService.getMutedKeywords()
		setMutedKeywords(items)
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

	const handleSaveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.saveReadLater(articleUuid)
		await fetchReadLater()
	}, [fetchReadLater])

	const handleRemoveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.removeReadLater(articleUuid)
		setReadLater((prev) => prev.filter((r) => r.articleUuid !== articleUuid))
	}, [])

	const handleAddMutedKeyword = useCallback(async (keyword: string) => {
		await UserService.addMutedKeyword(keyword)
		await fetchMutedKeywords()
	}, [fetchMutedKeywords])

	const handleRemoveMutedKeyword = useCallback(async (id: number) => {
		await UserService.removeMutedKeyword(id)
		setMutedKeywords((prev) => prev.filter((k) => k.id !== id))
	}, [])

	return (
		<UserFeaturesContext.Provider
			value={{
				favorites,
				readLater,
				mutedKeywords,
				fetchFavorites,
				fetchReadLater,
				fetchMutedKeywords,
				handleToggleFavorite,
				handleSaveReadLater,
				handleRemoveReadLater,
				handleAddMutedKeyword,
				handleRemoveMutedKeyword,
			}}
		>
			{children}
		</UserFeaturesContext.Provider>
	)
}

export const useUserFeaturesContext = () => {
	const context = useContext(UserFeaturesContext)
	return context
}
