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
	searchTerm: string
	dateFrom: string
	dateTo: string
	fetchReadLater: () => Promise<void>
	handleSaveReadLater: (articleUuid: string) => Promise<void>
	handleRemoveReadLater: (articleUuid: string) => Promise<void>
	setSearchTerm: (term: string) => void
	setDateFrom: (date: string) => void
	setDateTo: (date: string) => void
}

export const ReadLaterContext = createContext({} as ReadLaterContextType)

export const ReadLaterContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuthContext()
	// Lista local de leitura: evita consultar o backend toda vez que a UI precisa saber se uma noticia esta salva.
	const [readLater, setReadLater] = useState<ReadLaterItem[]>([])
	// Filtros usados na tela "Ler depois".
	const [searchTerm, setSearchTerm] = useState('')
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')

	// Busca no backend os artigos salvos do usuario.
	const fetchReadLater = useCallback(async () => {
		if (!user) return
		const items = await UserService.getReadLater({
			search: searchTerm || undefined,
			publishedFrom: dateFrom || undefined,
			publishedTo: dateTo || undefined,
		})
		setReadLater(items)
	}, [user, searchTerm, dateFrom, dateTo])

	// Salva um artigo e atualiza a lista.
	const handleSaveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.saveReadLater(articleUuid)
		await fetchReadLater()
	}, [fetchReadLater])

	// Remove um artigo e tira ele da lista local.
	const handleRemoveReadLater = useCallback(async (articleUuid: string) => {
		await UserService.removeReadLater(articleUuid)
		setReadLater((prev) => prev.filter((r) => r.articleUuid !== articleUuid))
	}, [])

	return (
		<ReadLaterContext.Provider
			value={{
				readLater,
				searchTerm,
				dateFrom,
				dateTo,
				fetchReadLater,
				handleSaveReadLater,
				handleRemoveReadLater,
				setSearchTerm,
				setDateFrom,
				setDateTo,
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
