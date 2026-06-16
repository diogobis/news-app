import { useAuthContext } from '@/context/auth.context'
import { colors } from '@/shared/colors'
import { MaterialIcons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { PublicStackParamsList } from '@/shared/interfaces/navigation.types'

export const AppHeader = () => {
	const { user, handleLogout } = useAuthContext()
	const publicNavigation = useNavigation<StackNavigationProp<PublicStackParamsList>>()
	const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()

	return (
		<View className="w-full flex-row p-8 justify-between items-center bg-background-primary">
			<View>
				<MaterialIcons name="newspaper" color={colors.white} size={28} />
			</View>

			{user ? (
				<View className="flex-row items-center gap-4">
					<TouchableOpacity onPress={() => drawerNavigation.toggleDrawer()}>
						<MaterialIcons name="menu" color={colors.white} size={28} />
					</TouchableOpacity>
				</View>
			) : (
				<View className="flex-row items-center gap-2">
					<TouchableOpacity
						className="bg-accent-brand px-4 py-2 rounded-xl"
						onPress={() => publicNavigation.navigate('Login')}
					>
						<Text className="text-white font-bold text-sm">Entrar</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	)
}
