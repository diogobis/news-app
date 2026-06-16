import { useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { DatePicker } from '@/components/DatePicker'

interface DateFilterBarProps {
	onFilterChange: (from?: string, to?: string) => void
}

export const DateFilterBar = ({ onFilterChange }: DateFilterBarProps) => {
	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
	const dateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const today = useMemo(() => new Date(), [])

	const fmt = (d: Date | undefined) => (d ? d.toISOString().slice(0, 10) : undefined)

	const scheduleFilteredFetch = (from: Date | undefined, to: Date | undefined) => {
		if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current)
		dateDebounceRef.current = setTimeout(() => {
			onFilterChange(fmt(from), fmt(to))
		}, 500)
	}

	const handleDateFromChange = (d: Date | undefined) => {
		setDateFrom(d)
		scheduleFilteredFetch(d, dateTo)
	}

	const handleDateToChange = (d: Date | undefined) => {
		setDateTo(d)
		scheduleFilteredFetch(dateFrom, d)
	}

	return (
		<View className="flex-row px-6 pb-3 gap-2">
			<DatePicker
				value={dateFrom}
				onChange={handleDateFromChange}
				placeholder="De"
				maxDate={dateTo ?? today}
			/>
			<DatePicker
				value={dateTo}
				onChange={handleDateToChange}
				placeholder="Até"
				minDate={dateFrom}
				maxDate={today}
			/>
		</View>
	)
}
