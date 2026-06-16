import { NewsFeed } from '@/screens/NewsFeed'
import { ArticleDetail } from '@/screens/ArticleDetail'
import { Favorites } from '@/screens/Favorites'
import { ReadLater } from '@/screens/ReadLater'
import { MutedKeywords } from '@/screens/MutedKeywords'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { DrawerContent } from '@/components/DrawerContent'
import { colors } from '@/shared/colors'
import { PrivateStackParamsList, DrawerParamsList } from '@/shared/interfaces/navigation.types'

const PrivateStack = createStackNavigator<PrivateStackParamsList>()
const Drawer = createDrawerNavigator<DrawerParamsList>()

const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			drawerContent={(props) => <DrawerContent {...props} />}
			screenOptions={{
				headerShown: false,
				drawerType: 'front',
				drawerStyle: { backgroundColor: colors['background-primary'], width: 280 },
				swipeEnabled: true,
				swipeEdgeWidth: 50,
				drawerPosition: 'right',
			}}
		>
			<Drawer.Screen name="Feed" component={NewsFeed} />
			<Drawer.Screen name="Favorites" component={Favorites} />
			<Drawer.Screen name="ReadLater" component={ReadLater} />
			<Drawer.Screen name="MutedKeywords" component={MutedKeywords} />
		</Drawer.Navigator>
	)
}

export const PrivateRoutes = () => {
	return (
		<PrivateStack.Navigator screenOptions={{ headerShown: false }}>
			<PrivateStack.Screen name="Drawer" component={DrawerNavigator} />
			<PrivateStack.Screen name="ArticleDetail" component={ArticleDetail} />
		</PrivateStack.Navigator>
	)
}
