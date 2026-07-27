/**
 * Resolves Vidyaverse-specific OIDC claims for the ID token and /userinfo
 * response. See docs/identity-federation-design.md §6, §9 for the contract.
 *
 * Claims emitted (when in requested scopes):
 *   - global_role         (scope 'profile' or 'memberships')
 *   - memberships[]       (scope 'memberships' or 'profile')
 *   - entitlements_url    (scope 'entitlements' — RPs back-channel for live values)
 *
 * Phase-3 follow-up: when InstitutionRole gains a `parent` value, attach the
 * guardian's linked children under the membership by matching
 * User.phone == Guardian.whatsappNumber within the same institution.
 */
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';

interface OidcUser {
  id: string;
  email: string;
  name: string;
  globalRole?: string | null;
}

interface MembershipClaim {
  institution_id: string;
  institution_code: string;
  institution_name: string;
  institution_type: string;
  role: string;
  assigned_classes: unknown;
  assigned_sections: unknown;
  subscription_tier: string;
  subscription_status: string;
}

export async function resolveOidcClaims(
  user: OidcUser & Record<string, unknown>,
  scopes: string[],
  _client: { clientId: string; name: string } & Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const claims: Record<string, unknown> = {};

  const wantsMemberships = scopes.includes('memberships') || scopes.includes('profile');
  const wantsEntitlements = scopes.includes('entitlements');

  if (wantsMemberships) {
    claims.global_role = user.globalRole ?? null;

    const memberships = await prisma.userInstitutionRole.findMany({
      where: { userId: user.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            institutionType: true,
            subscriptionTier: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    claims.memberships = memberships.map<MembershipClaim>((m) => ({
      institution_id: m.institutionId,
      institution_code: m.institution.code,
      institution_name: m.institution.name,
      institution_type: m.institution.institutionType,
      role: m.role,
      assigned_classes: m.assignedClasses ?? null,
      assigned_sections: m.assignedSections ?? null,
      subscription_tier: m.institution.subscriptionTier,
      subscription_status: m.institution.subscriptionStatus,
    }));
  }

  if (wantsEntitlements) {
    const issuer = env.VIDYAVERSE_ISSUER || env.BETTER_AUTH_URL;
    claims.entitlements_url = `${issuer.replace(/\/$/, '')}/api/v1/entitlements/me`;
  }

  return claims;
}
