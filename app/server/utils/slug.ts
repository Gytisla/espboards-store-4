/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

/**
 * Generate a unique slug for a product group
 * Checks the product_groups table for existing slugs with the same marketplace_id
 */
export async function generateUniqueGroupSlug(
  supabase: any,
  title: string,
  marketplaceId: string
): Promise<string> {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  // Keep trying until we find a unique slug for this marketplace
  while (true) {
    const { data, error } = await supabase
      .from('product_groups')
      .select('id')
      .eq('marketplace_id', marketplaceId)
      .eq('slug', slug)
      .single()

    // If no match found, slug is unique
    if (error?.code === 'PGRST116' || !data) {
      return slug
    }

    // If match found, try with a counter
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
