import { useAuthContext } from '@/context/auth.context'
import { colors } from '@/shared/colors'
import { MaterialIcons } from '@expo/vector-icons'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

type PublicStackParamsList = {
	Login: undefined
}

type PrivateStackParamsList = {
	Favorites: undefined
	ReadLater: undefined
	MutedKeywords: undefined
}

export const AppHeader = () => {
	const { user, handleLogout } = useAuthContext()
	const publicNavigation = useNavigation<StackNavigationProp<PublicStackParamsList>>()
	const privateNavigation = useNavigation<StackNavigationProp<PrivateStackParamsList>>()

	return (
		<View className="w-full flex-row p-8 justify-between items-center bg-background-primary">
			<View>
				<Image
					source={require('@/assets/logo.png')}
					className="w-[130px] h-[30px]"
				/>
			</View>

			{user ? (
				<View className="flex-row items-center gap-4">
					<TouchableOpacity
						onPress={() => privateNavigation.navigate('Favorites')}
					>
						<MaterialIcons name="favorite-outline" color={colors.white} size={24} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => privateNavigation.navigate('ReadLater')}
					>
						<MaterialIcons name="bookmark-outline" color={colors.white} size={24} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => privateNavigation.navigate('MutedKeywords')}
					>
						<MaterialIcons name="volume-off" color={colors.white} size={24} />
					</TouchableOpacity>

					<TouchableOpacity onPress={handleLogout}>
						<MaterialIcons name="logout" color={colors.gray[700]} size={24} />
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
