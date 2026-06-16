import { Text, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { DrawerParamsList } from '@/shared/interfaces/navigation.types'
import { colors } from '@/shared/colors'

interface DrawerScreenHeaderProps {
	title: string
}

export const DrawerScreenHeader = ({ title }: DrawerScreenHeaderProps) => {
	const navigation = useNavigation<DrawerNavigationProp<DrawerParamsList>>()

	return (
		<View className="flex-row items-center justify-between p-4">
			<Text className="text-white text-xl font-bold">{title}</Text>
			<TouchableOpacity onPress={() => navigation.toggleDrawer()}>
				<MaterialIcons name="menu" size={24} color={colors.white} />
			</TouchableOpacity>
		</View>
	)
}
