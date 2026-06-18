import { ScrollView, StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors } from '@/shared/colors'
import { CategoryTag } from '@/components/CategoryTag'
import { ArticleDetail as ArticleDetailType } from '@/shared/interfaces/news/article-detail.interface'
import { Comments } from '../Comments'

interface ArticleContentProps {
	article: ArticleDetailType
}

export const ArticleContent = ({ article }: ArticleContentProps) => {
	const { width } = useWindowDimensions()
	const authors = article.authors ?? []

	const publishedDate = article.publishedAt
		? format(new Date(article.publishedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
		: null

	return (
		<View style={styles.container}>
			<ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
				<Text className="text-white text-2xl font-bold mb-4">{article.title}</Text>

				<View className="flex-row items-center mb-4">
					<MaterialIcons name="newspaper" size={16} color={colors.gray[500]} />
					<Text className="text-gray-500 text-base ml-2">
						{article.publisher || 'Fonte desconhecida'}
					</Text>
				</View>

				{publishedDate && (
					<View className="flex-row items-center mb-4">
						<MaterialIcons name="calendar-today" size={16} color={colors.gray[600]} />
						<Text className="text-gray-600 text-base ml-2">{publishedDate}</Text>
					</View>
				)}

				<View className="flex-row flex-wrap gap-2 mb-6">
					{article.categories.map((cat) => (
						<CategoryTag key={cat} category={cat} size="sm" />
					))}
				</View>

				<View className="h-60 bg-background-secondary rounded-xl mb-6 overflow-hidden items-center justify-center">
					{article.thumbnail ? (
						<Image source={{ uri: article.thumbnail }} className="w-full h-full" resizeMode="cover" />
					) : (
						<MaterialIcons name="image" size={64} color={colors.gray[600]} />
					)}
				</View>

				{authors.length > 0 && (
					<View className="flex-row items-center mb-4">
						<MaterialIcons name="person" size={16} color={colors.gray[500]} />
						<Text className="text-gray-500 text-base ml-2">{authors.join(', ')}</Text>
					</View>
				)}

				{article.body ? (
					<RenderHtml
						contentWidth={width}
						source={{ html: `<body style="color:#9CA3AF;font-size:16px;line-height:1.6">${article.body}</body>` }}
						baseStyle={{ color: '#9CA3AF', fontSize: 16, lineHeight: 26 }}
					/>
				) : (
					<Text className="text-gray-600 text-base italic mb-8">
						Conteúdo não disponível
					</Text>
				)}

				<Comments articleUuid={article.uuid} />
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		minHeight: 0,
	},
})
