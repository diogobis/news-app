import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { MutedKeyword } from '@/shared/interfaces/news/muted-keyword.interface'
import * as UserService from '@/shared/services/news/user.service'
import { useAuthContext } from './auth.context'

type MutedKeywordsContextType = {
	mutedKeywords: MutedKeyword[]
	fetchMutedKeywords: () => Promise<void>
	handleAddMutedKeyword: (keyword: string) => Promise<void>
	handleRemoveMutedKeyword: (id: number) => Promise<void>
}

export const MutedKeywordsContext = createContext({} as MutedKeywordsContextType)

export const MutedKeywordsContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [mutedKeywords, setMutedKeywords] = useState<MutedKeyword[]>([])

	const fetchMutedKeywords = useCallback(async () => {
		if (!user) return
		const items = await UserService.getMutedKeywords()
		setMutedKeywords(items)
	}, [user])

	const handleAddMutedKeyword = useCallback(async (keyword: string) => {
		await UserService.addMutedKeyword(keyword)
		await fetchMutedKeywords()
	}, [fetchMutedKeywords])

	const handleRemoveMutedKeyword = useCallback(async (id: number) => {
		await UserService.removeMutedKeyword(id)
		setMutedKeywords((prev) => prev.filter((k) => k.id !== id))
	}, [])

	return (
		<MutedKeywordsContext.Provider
			value={{
				mutedKeywords,
				fetchMutedKeywords,
				handleAddMutedKeyword,
				handleRemoveMutedKeyword,
			}}
		>
			{children}
		</MutedKeywordsContext.Provider>
	)
}

export const useMutedKeywordsContext = () => {
	const context = useContext(MutedKeywordsContext)
	return context
}
