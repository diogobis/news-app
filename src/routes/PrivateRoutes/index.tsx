import { NewsFeed } from '@/screens/NewsFeed'
import { ArticleDetail } from '@/screens/ArticleDetail'
import { Favorites } from '@/screens/Favorites'
import { ReadLater } from '@/screens/ReadLater'
import { MutedKeywords } from '@/screens/MutedKeywords'
import { createStackNavigator } from '@react-navigation/stack'

export type PrivateStackParamsList = {
	NewsFeed: undefined
	ArticleDetail: { uuid: string }
	Favorites: undefined
	ReadLater: undefined
	MutedKeywords: undefined
}

export const PrivateRoutes = () => {
	const PrivateStack = createStackNavigator<PrivateStackParamsList>()

	return (
		<PrivateStack.Navigator screenOptions={{ headerShown: false }}>
			<PrivateStack.Screen name="NewsFeed" component={NewsFeed} />
			<PrivateStack.Screen name="ArticleDetail" component={ArticleDetail} />
			<PrivateStack.Screen name="Favorites" component={Favorites} />
			<PrivateStack.Screen name="ReadLater" component={ReadLater} />
			<PrivateStack.Screen name="MutedKeywords" component={MutedKeywords} />
		</PrivateStack.Navigator>
	)
}
