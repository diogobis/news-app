import { Text, TouchableOpacity, View } from 'react-native'
import clsx from 'clsx'
import { categoryLabel, categoryColor } from '@/shared/utils/categoryLabels'

interface CategoryTagProps {
	category: string
	isActive?: boolean
	onPress?: () => void
	size?: 'sm' | 'md'
}

export const CategoryTag = ({ category, isActive, onPress, size = 'md' }: CategoryTagProps) => {
	const color = categoryColor(category)
	const sizeClass = size === 'sm' ? 'px-3 py-1' : 'px-4 py-2'

	if (onPress) {
		return (
			<TouchableOpacity
				onPress={onPress}
				className={clsx('rounded-full mr-2', sizeClass, !isActive && 'bg-background-tertiary')}
				style={isActive ? { backgroundColor: color } : undefined}
			>
				<Text className={clsx('text-sm', isActive ? 'text-white' : 'text-gray-500')}>
					{categoryLabel(category)}
				</Text>
			</TouchableOpacity>
		)
	}

	return (
		<View className={clsx('rounded', sizeClass)} style={{ backgroundColor: color + '20' }}>
			<Text className="text-sm" style={{ color }}>
				{categoryLabel(category)}
			</Text>
		</View>
	)
}
