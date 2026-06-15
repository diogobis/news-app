import { TransactionTypes } from "@/shared/enums/transactionTypes";
import { TransactionCardType } from "..";
import { colors } from "@/shared/colors";
import { MaterialIcons } from "@expo/vector-icons";

interface IconsData {
	name: keyof typeof MaterialIcons.glyphMap;
	color: string;
}

export const ICONS: Record<TransactionCardType, IconsData> = {
	[TransactionTypes.revenue]: {
		color: colors["accent-brand-light"],
		name: "arrow-circle-up",
	},
	[TransactionTypes.expense]: {
		color: colors["accent-red"],
		name: "arrow-circle-down",
	},
	total: {
		name: "attach-money",
		color: colors.white,
	},
};
