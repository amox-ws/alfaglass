import { cms, productThickness, type Category, type Product } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { materialOfProduct } from "@/lib/machine";

/**
 * The thicknesses (`thickness.json`) and the machine's stock (`STOCKED`) are keyed by the Greek product slugs; the English content has the
 * same products under English slugs and the same ids. These helpers go from a product of either language to the Greek slug, so a gauge and
 * the CNC link work on both.
 */
const el = cms("el");
const greekSlugById = new Map(Object.values(el.products).map((p) => [p.id, p.slug]));

export const greekSlug = (product: Product) => greekSlugById.get(product.id) ?? product.slug;

/** The product of `lang` that has the given Greek slug. */
export function productByGreekSlug(lang: Lang, slug: string): Product | undefined {
  const id = el.products[slug]?.id;
  return Object.values(cms(lang).products).find((p) => p.id === id);
}

export const thicknessOfProduct = (product: Product) => productThickness(greekSlug(product));

export const materialOf = (product: Product) => materialOfProduct(greekSlug(product));

/**
 * A family's thicknesses: the union of its products', shown only when at least half of them have values (otherwise the gauge would speak
 * for products it knows nothing about). The same rule as `familyThickness`, for either language.
 */
export function thicknessOfFamily(lang: Lang, category: Category): number[] {
  const products = cms(lang).productsOf(category);
  const withValues = products.filter((p) => thicknessOfProduct(p).length > 0);
  if (withValues.length === 0 || withValues.length * 2 < products.length) return [];
  return [...new Set(withValues.flatMap(thicknessOfProduct))].sort((a, b) => a - b);
}
