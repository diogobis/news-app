import { TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/shared/colors'

interface SearchInputProps {
	value: string
	onChange: (text: string) => void
	placeholder: string
}

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => (
	<View className="flex-row items-center bg-background-tertiary rounded-xl px-3 h-10">
		<MaterialIcons name="search" size={16} color={colors.gray[600]} />
		<TextInput
			className="flex-1 text-white text-sm ml-2"
			placeholder={placeholder}
			placeholderTextColor={colors.gray[600]}
			value={value}
			onChangeText={onChange}
		/>
	</View>
)
