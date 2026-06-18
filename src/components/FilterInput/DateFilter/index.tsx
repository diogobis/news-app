import { useMemo } from 'react'
import { View } from 'react-native'
import { DatePicker } from '@/components/DatePicker'

interface DateFilterProps {
	dateFrom: Date | undefined
	dateTo: Date | undefined
	onDateFromChange: (d: Date | undefined) => void
	onDateToChange: (d: Date | undefined) => void
}

export const DateFilter = ({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateFilterProps) => {
	const today = useMemo(() => new Date(), [])

	return (
		<View className="flex-row px-6 p-0 m-0 pb-3 gap-2 mt-2 justify-between">
			<DatePicker
				value={dateFrom}
				onChange={onDateFromChange}
				placeholder="De"
				maxDate={dateTo ?? today}
			/>
			<DatePicker
				value={dateTo}
				onChange={onDateToChange}
				placeholder="Até"
				minDate={dateFrom}
				maxDate={today}
			/>
		</View>
	)
}
