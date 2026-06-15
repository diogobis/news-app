import { NewsFeed } from '@/screens/NewsFeed'
import { ArticleDetail } from '@/screens/ArticleDetail'
import { Login } from '@/screens/Login'
import { Register } from '@/screens/Register'
import { createStackNavigator } from '@react-navigation/stack'

export type PublicStackParamsList = {
	NewsFeed: undefined
	ArticleDetail: { uuid: string }
	Login: undefined
	Register: undefined
}

export const PublicRoutes = () => {
	const PublicStack = createStackNavigator<PublicStackParamsList>()

	return (
		<PublicStack.Navigator screenOptions={{ headerShown: false }}>
			<PublicStack.Screen name="NewsFeed" component={NewsFeed} />
			<PublicStack.Screen name="ArticleDetail" component={ArticleDetail} />
			<PublicStack.Screen name="Login" component={Login} />
			<PublicStack.Screen name="Register" component={Register} />
		</PublicStack.Navigator>
	)
}
