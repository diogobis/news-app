export type DrawerParamsList = {
	Feed: undefined
	Favorites: undefined
	ReadLater: undefined
	MutedKeywords: undefined
	ArticleDetail: { uuid: string }
}

export type PrivateStackParamsList = {
	Drawer: undefined
	ArticleDetail: { uuid: string }
}

export type PublicStackParamsList = {
	NewsFeed: undefined
	ArticleDetail: { uuid: string }
	Login: undefined
	Register: undefined
}
