import { useNewsContext } from '@/context/news.context'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CategoryTag } from '@/components/CategoryTag'

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
	const hasMounted = useRef(false)
	const fetchNewsRef = useRef(fetchNews)
	const handleLoadingsRef = useRef(handleLoadings)

	const handleSelectCategory = async (category: string | null) => {
		try {
			handleLoadings({ key: 'initial', value: true })
			setSelectedCategory(category)
			await fetchNews({ page: 1 })
		} finally {
			handleLoadings({ key: 'initial', value: false })
		}
	}

	useEffect(() => {
		fetchNewsRef.current = fetchNews
		handleLoadingsRef.current = handleLoadings
	}, [fetchNews, handleLoadings])

	useEffect(() => {
		// Evita duplicar a busca inicial feita pela tela.
		if (!hasMounted.current) {
			hasMounted.current = true
			return
		}

		// Atualiza noticias toda vez que selectedCategory mudar
		(async () => {
			try {
				handleLoadingsRef.current({ key: 'initial', value: true })
				await fetchNewsRef.current({ page: 1 })
			} finally {
				handleLoadingsRef.current({ key: 'initial', value: false })
			}
		})()
	}, [selectedCategory])

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="py-4 pl-6"
			style={styles.scroll}
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
				<CategoryTag
					key={category}
					category={category}
					isActive={selectedCategory === category}
					onPress={() => handleSelectCategory(category)}
				/>
			))}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	scroll: {
		flexGrow: 0,
		height: 56,
	},
})
