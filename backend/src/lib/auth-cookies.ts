/**
 * Session cookie naming — single source of truth for Vidyaverse.
 *
 * All three apps in the trio currently use better-auth's default (`better-auth.*`).
 * That is harmless while cookies stay host-scoped, but single logout requires the
 * apps to share a `.vinstitution.com` parent, and three identically-named cookies
 * would collide there. Vidyaverse is the identity provider, so its cookie is the
 * one that most needs to stay unambiguous.
 *
 * NOTE: changing AUTH_COOKIE_PREFIX invalidates every existing session — better-auth
 * will not recognise a cookie stored under the old name. Deploy it deliberately, and
 * remember that logging users out of the IdP logs them out of the whole trio.
 */

/** Must match `advanced.cookiePrefix` in lib/auth.ts. */
export const AUTH_COOKIE_PREFIX = 'better-auth';

export const SESSION_COOKIE = `${AUTH_COOKIE_PREFIX}.session_token`;
export const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;
