import { useNewsContext } from '@/context/news.context'
import { colors } from '@/shared/colors'
import clsx from 'clsx'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { categoryLabel, categoryColor } from '@/shared/utils/categoryLabels'

const CATEGORIES = [
	'politics',
	'world',
	'business',
	'technology',
	'science',
	'gaming',
	'education',
	'travel',
	'sports',
]

export const CategoryChips = () => {
	const { selectedCategory, setSelectedCategory, fetchNews, handleLoadings } = useNewsContext()

	const handleSelectCategory = async (category: string | null) => {
		try {
			handleLoadings({ key: 'initial', value: true })
			setSelectedCategory(category)
			await fetchNews({ page: 1, category: category ?? undefined })
		} finally {
			handleLoadings({ key: 'initial', value: false })
		}
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="py-4 pl-6"
		>
			<TouchableOpacity
				className={clsx(
					'px-4 py-2 rounded-full mr-2',
					selectedCategory === null ? 'bg-accent-brand' : 'bg-background-tertiary',
				)}
				onPress={() => handleSelectCategory(null)}
			>
				<Text
					className={clsx(
						'text-sm',
						selectedCategory === null ? 'text-white' : 'text-gray-500',
					)}
				>
					Todas
				</Text>
			</TouchableOpacity>

			{CATEGORIES.map((category) => (
				<TouchableOpacity
					key={category}
					className={clsx(
						'px-4 py-2 rounded-full mr-2',
						selectedCategory === category ? '' : 'bg-background-tertiary',
					)}
					style={selectedCategory === category ? { backgroundColor: categoryColor(category) } : undefined}
					onPress={() => handleSelectCategory(category)}
				>
					<Text
						className={clsx(
							'text-sm',
							selectedCategory === category ? 'text-white' : 'text-gray-500',
						)}
				>
					{categoryLabel(category)}
				</Text>
				</TouchableOpacity>
			))}
		</ScrollView>
	)
}
