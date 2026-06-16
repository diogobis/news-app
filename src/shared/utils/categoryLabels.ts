export const CATEGORIES: Record<string, { label: string; color: string }> = {
	politics:  { label: 'Política',   color: '#4F6EF7' },
	world:     { label: 'Mundo',      color: '#5A86F7' },
	business:  { label: 'Negócios',   color: '#14B8A6' },
	technology:{ label: 'Tecnologia', color: '#F75A68' },
	science:   { label: 'Ciência',    color: '#9B59B6' },
	gaming:    { label: 'Games',      color: '#F39C12' },
	education: { label: 'Educação',   color: '#F1C40F' },
	travel:    { label: 'Viagem',     color: '#1ABC9C' },
	sports:    { label: 'Esportes',   color: '#E91E63' },
}

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
	Object.entries(CATEGORIES).map(([slug, { label }]) => [slug, label]),
)

export const categoryLabel = (slug: string): string =>
	CATEGORIES[slug]?.label ?? slug

export const categoryColor = (slug: string): string =>
	CATEGORIES[slug]?.color ?? '#7C7C8A'
