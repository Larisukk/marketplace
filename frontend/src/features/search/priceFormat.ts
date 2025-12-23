// frontend/src/features/search/priceFormat.ts

// You can narrow the unit type later ( 'KG' | 'PIECE' | ... )
export function formatPrice(
    priceCents?: number,
    currency?: string,
    unit?: string
): string | null {
    if (priceCents == null) return null;

    const value = priceCents / 100;

    const amount = new Intl.NumberFormat("ro-RO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);

    const currencyLabel = (currency && currency.trim()) || "RON";
    const unitLabel = unit ? unit.toUpperCase() : undefined;

    if (unitLabel) {
        // e.g. 12,50 RON / KG
        return `${amount} ${currencyLabel} / ${unitLabel}`;
    }

    // e.g. 12,50 RON
    return `${amount} ${currencyLabel}`;
}
