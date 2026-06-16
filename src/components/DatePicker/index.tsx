import { useState, useRef } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/shared/colors'

type DatePickerProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder: string
  minDate?: Date
  maxDate?: Date
}

export const DatePicker = ({ value, onChange, placeholder, minDate, maxDate }: DatePickerProps) => {
  const [show, setShow] = useState(false)
  const webInputRef = useRef<HTMLInputElement>(null)

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 flex-row items-center bg-background-tertiary rounded-xl px-3 h-10">
        <MaterialIcons name="date-range" size={16} color={colors.gray[600]} />
        <input
          ref={webInputRef}
          type="date"
          value={value ? format(value, 'yyyy-MM-dd') : ''}
          min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
          max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
          onChange={(e) => {
            const val = e.target.value
            onChange(val ? new Date(val + 'T00:00:00') : undefined)
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: value ? colors.white : colors.gray[600],
            fontSize: 14,
            marginLeft: 8,
            fontFamily: 'inherit',
            minHeight: 40,
          }}
        />
        {value && (
          <TouchableOpacity onPress={() => onChange(undefined)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={16} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const formatted = value ? format(value, 'dd/MM/yyyy') : ''

  return (
    <>
      <TouchableOpacity
        className="flex-1 flex-row items-center bg-background-tertiary rounded-xl px-3 h-10"
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="date-range" size={16} color={colors.gray[600]} />
        <Text className={`flex-1 text-sm ml-2 ${value ? 'text-white' : 'text-gray-600'}`}>
          {formatted || placeholder}
        </Text>
        {value && (
          <TouchableOpacity
            onPress={() => onChange(undefined)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={16} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(_, selectedDate) => {
            setShow(false)
            if (selectedDate) {
              onChange(selectedDate)
            }
          }}
        />
      )}
    </>
  )
}
