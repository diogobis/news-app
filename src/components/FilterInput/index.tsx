import { useEffect, useState } from 'react'
import { SearchInput } from './SearchInput'
import { DateFilter } from './DateFilter'
import { View } from 'react-native'

interface FilterInputProps {
	onFilterChange: (params: {
		search?: string
		publishedFrom?: string
		publishedTo?: string
	}) => void
	searchPlaceholder?: string
}

export const FilterInput = ({ onFilterChange, searchPlaceholder = 'Buscar...' }: FilterInputProps) => {
	const [searchText, setSearchText] = useState('')
	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

	useEffect(() => {
		const handler = setTimeout(() => {
			onFilterChange({
				search: searchText || undefined,
				publishedFrom: dateFrom ? dateFrom.toISOString().slice(0, 10) : undefined,
				publishedTo: dateTo ? dateTo.toISOString().slice(0, 10) : undefined,
			})
		}, 500)
		return () => clearTimeout(handler)
	}, [searchText, dateFrom, dateTo, onFilterChange])

	return (
		<View className="px-6">
			<SearchInput value={searchText} onChange={setSearchText} placeholder={searchPlaceholder} />
			<DateFilter
				dateFrom={dateFrom}
				dateTo={dateTo}
				onDateFromChange={setDateFrom}
				onDateToChange={setDateTo}
			/>
		</View>
	)
}
