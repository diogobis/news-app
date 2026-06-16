import { MaterialIcons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '@/shared/colors'

interface ArticleDetailHeaderProps {
	publisher: string | null
	onGoBack: () => void
}

export const ArticleDetailHeader = ({ publisher, onGoBack }: ArticleDetailHeaderProps) => {
	return (
		<View className="flex-row items-center p-4">
			<TouchableOpacity onPress={onGoBack} className="mr-4">
				<MaterialIcons name="arrow-back" size={24} color={colors.white} />
			</TouchableOpacity>
			<Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
				{publisher || 'Artigo'}
			</Text>
		</View>
	)
}
