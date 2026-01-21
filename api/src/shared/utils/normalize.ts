export function normalizeString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}
