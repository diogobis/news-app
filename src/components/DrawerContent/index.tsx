import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useAuthContext } from '@/context/auth.context'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/shared/colors'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const items: { label: string; icon: keyof typeof MaterialIcons.glyphMap; name: string }[] = [
	{ label: 'Página Inicial', icon: 'home', name: 'Feed' },
	{ label: 'Favoritos', icon: 'favorite-outline', name: 'Favorites' },
	{ label: 'Ler Depois', icon: 'bookmark-outline', name: 'ReadLater' },
	{ label: 'Palavras Silenciadas', icon: 'volume-off', name: 'MutedKeywords' },
]

export const DrawerContent = ({ navigation, state }: DrawerContentComponentProps) => {
	const { handleLogout } = useAuthContext()
	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1 bg-background-primary">
			<View className="p-8 pb-6 border-b border-gray-800" style={{ paddingTop: insets.top + 32 }}>
				<View className="flex-row items-center gap-3">
					<MaterialIcons name="newspaper" size={32} color={colors['accent-brand']} />
					<Text className="text-white text-xl font-bold">News App</Text>
				</View>
			</View>

			<DrawerContentScrollView className="flex-1 px-4 pt-4">
				{items.map((item) => {
					const isActive = state.routeNames[state.index] === item.name
					return (
						<DrawerItem
							key={item.name}
							label={item.label}
							icon={({ size }) => (
								<MaterialIcons
									name={item.icon}
									size={size}
									color={isActive ? colors['accent-brand'] : colors.gray[500]}
								/>
							)}
							labelStyle={{
								color: isActive ? colors['accent-brand'] : colors.gray[500],
								fontWeight: isActive ? '700' : '400',
							}}
							style={isActive ? styles.activeItem : styles.inactiveItem}
							onPress={() => navigation.navigate(item.name as never)}
						/>
					)
				})}
			</DrawerContentScrollView>

			<View className="px-4 pb-8 border-t border-gray-800 pt-4">
				<DrawerItem
					label="Sair"
					icon={({ size }) => <MaterialIcons name="logout" size={size} color={colors['accent-red']} />}
					labelStyle={{ color: colors['accent-red'] }}
					style={styles.logoutItem}
					onPress={handleLogout}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	activeItem: {
		borderRadius: 12,
		marginBottom: 4,
		backgroundColor: colors['background-tertiary'],
	},
	inactiveItem: {
		borderRadius: 12,
		marginBottom: 4,
		backgroundColor: 'transparent',
	},
	logoutItem: {
		borderRadius: 12,
	},
})
