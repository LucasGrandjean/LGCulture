export const defaultCategories = [
	"lucas",
	"lucas2"
]

export function getRandomCategory(categories: Array<string> | undefined = defaultCategories): string | undefined {
	if (categories.length === 0) categories = defaultCategories
	const index: number = Math.floor(Math.random() * categories.length)
	return categories[index]
}
