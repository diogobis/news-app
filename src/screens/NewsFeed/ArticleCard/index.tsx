import { Article } from '@/shared/interfaces/news/article.interface'
import { colors } from '@/shared/colors'
import { MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FC } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { categoryLabel, categoryColor } from '@/shared/utils/categoryLabels'

interface ArticleCardProps {
	article: Article
}

export const ArticleCard: FC<ArticleCardProps> = ({ article }) => {
	const navigation = useNavigation<StackNavigationProp<any>>()

	const publishedDate = article.publishedAt
		? format(new Date(article.publishedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
		: null

	return (
		<TouchableOpacity
			className="mx-6 mb-4 bg-background-tertiary rounded-xl overflow-hidden"
			onPress={() => navigation.navigate('ArticleDetail', { uuid: article.uuid })}
		>
			<View className="h-48 bg-background-primary items-center justify-center">
				{article.thumbnail ? (
					<Image source={{ uri: article.thumbnail }} className="w-full h-full" resizeMode="cover" />
				) : (
					<MaterialIcons name="article" size={48} color={colors.gray[600]} />
				)}
			</View>

			<View className="p-4">
				<Text className="text-white text-lg font-bold mb-2" numberOfLines={2}>
					{article.title}
				</Text>

				<View className="flex-row items-center mb-2">
					<MaterialIcons name="newspaper" size={16} color={colors.gray[500]} />
					<Text className="text-gray-500 text-sm ml-2">
						{article.publisher || 'Fonte desconhecida'}
					</Text>
				</View>

				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<MaterialIcons name="calendar-today" size={14} color={colors.gray[600]} />
						<Text className="text-gray-600 text-sm ml-1">
							{publishedDate || 'Data desconhecida'}
						</Text>
					</View>

					<View className="flex-row gap-1">
						{article.categories.slice(0, 2).map((cat) => (
							<View
								key={cat}
								className="px-2 py-1 rounded"
								style={{ backgroundColor: categoryColor(cat) + '20' }}
							>
								<Text
									className="text-xs"
									style={{ color: categoryColor(cat) }}
								>
									{categoryLabel(cat)}
								</Text>
							</View>
						))}
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)
}
