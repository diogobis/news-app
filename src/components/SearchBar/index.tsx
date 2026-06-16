import { useRef, useState } from 'react'
import { TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/shared/colors'

interface SearchBarProps {
	placeholder: string
	onSearch: (text: string) => void
}

export const SearchBar = ({ placeholder, onSearch }: SearchBarProps) => {
	const [input, setInput] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleChange = (text: string) => {
		setInput(text)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => onSearch(text), 500)
	}

	return (
		<View className="flex-row items-center bg-background-tertiary rounded-xl px-4 h-12">
			<MaterialIcons name="search" size={20} color={colors.gray[600]} />
			<TextInput
				className="flex-1 text-white text-base ml-2"
				placeholder={placeholder}
				placeholderTextColor={colors.gray[600]}
				value={input}
				onChangeText={handleChange}
			/>
		</View>
	)
}
