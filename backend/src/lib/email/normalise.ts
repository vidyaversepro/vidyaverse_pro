/**
 * Canonical email normalisation.
 *
 * MySQL's `utf8mb4_unicode_ci` collation compares case-insensitively, so today
 * `Foo@Bar.com` and `foo@bar.com` are the same address as far as every lookup and
 * unique constraint is concerned. **Postgres does not do this.** On a plain
 * `varchar` column the same two strings are distinct values, which would mean:
 *
 *   - a user who registered as `Foo@Bar.com` cannot sign in as `foo@bar.com`, and
 *   - better-auth's link-by-email would MISS the existing account and provision a
 *     duplicate instead of linking — stranding that user's library, annotations
 *     and subscription on an orphan row.
 *
 * The primary defence on Postgres is the `citext` column type, which restores the
 * case-insensitive comparison at the database level (verified: a unique constraint
 * on citext rejects a case-variant duplicate, while varchar accepts it). This
 * helper is the second line: normalising at write keeps the stored data canonical
 * so behaviour does not depend on which column types were remembered.
 *
 * Only case and surrounding whitespace are touched. We deliberately do NOT strip
 * dots or `+tags` — those are Gmail-specific conventions, and treating
 * `a.b@example.com` as `ab@example.com` would merge genuinely distinct addresses
 * at other providers.
 */
export function normaliseEmail(email: string): string {
    return email.trim().toLowerCase();
}

/** Null-safe variant for optional columns (parent_email, contact_email, …). */
export function normaliseEmailOrNull(email: string | null | undefined): string | null {
    if (email == null) return null;
    const trimmed = normaliseEmail(email);
    return trimmed.length === 0 ? null : trimmed;
}
