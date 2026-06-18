import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'
import { ReadLaterItem } from '@/shared/interfaces/news/read-later.interface'
import * as UserService from '@/shared/services/news/user.service'
import { useAuthContext } from './auth.context'

type ReadLaterContextType = {
	readLater: ReadLaterItem[]
	fetchReadLater: (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => Promise<void>
	handleSaveReadLater: (articleUuid: string) => Promise<void>
	handleRemoveReadLater: (articleUuid: string) => Promise<void>
}

export const ReadLaterContext = createContext({} as ReadLaterContextType)

export const ReadLaterContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	const [readLater, setReadLater] = useState<ReadLaterItem[]>([])

	const fetchReadLater = useCallback(async (params?: { search?: string; publishedFrom?: string; publishedTo?: string }) => {
		if (!user) return
		const items = await UserService.getReadLater(params)
		setReadLater(items)
	}, [user])

	const handleSaveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.saveReadLater(articleUuid)
		await fetchReadLater()
	}, [fetchReadLater])

	const handleRemoveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.removeReadLater(articleUuid)
		setReadLater((prev) => prev.filter((r) => r.articleUuid !== articleUuid))
	}, [])

	return (
		<ReadLaterContext.Provider
			value={{
				readLater,
				fetchReadLater,
				handleSaveReadLater,
				handleRemoveReadLater,
			}}
		>
			{children}
		</ReadLaterContext.Provider>
	)
}

export const useReadLaterContext = () => {
	const context = useContext(ReadLaterContext)
	return context
}
