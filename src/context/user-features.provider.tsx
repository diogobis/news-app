import { FC, PropsWithChildren } from 'react'
import { FavoritesContextProvider } from './favorites.context'
import { ReadLaterContextProvider } from './read-later.context'
import { MutedKeywordsContextProvider } from './muted-keywords.context'

export const UserFeaturesContextProvider: FC<PropsWithChildren> = ({ children }) => (
	<FavoritesContextProvider>
		<ReadLaterContextProvider>
			<MutedKeywordsContextProvider>
				{children}
			</MutedKeywordsContextProvider>
		</ReadLaterContextProvider>
	</FavoritesContextProvider>
)

export { useFavoritesContext } from './favorites.context'
export { useReadLaterContext } from './read-later.context'
export { useMutedKeywordsContext } from './muted-keywords.context'
