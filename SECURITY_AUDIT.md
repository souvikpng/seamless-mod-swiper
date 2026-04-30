# Security & Feature Audit (April 30, 2026)

## High-priority security findings

1. **No runtime origin allowlist for remote images (privacy/tracking vector).**
   - Remote `picture_url` values from API are rendered directly (`safeImageUrl` fallback still permits external URLs), and images are preloaded and shown in several places.
   - Even with `referrerPolicy="no-referrer"`, attackers can use image beacons for user IP/time correlation and payload churn.
   - Recommendation:
     - Enforce strict hostname allowlist (e.g., Nexus CDN domains only) in `safeImageUrl`.
     - Optionally proxy images through a controlled endpoint in hosted deployments.
     - Add a user toggle for "Load external images" defaulting to off in privacy mode.

2. **CSP uses `style-src 'unsafe-inline'` (XSS blast-radius increase).**
   - Inline styles are permitted in CSP via `<meta http-equiv="Content-Security-Policy">`.
   - While React escapes by default, this weakens defense-in-depth against future DOM XSS bugs or 3rd-party injection.
   - Recommendation:
     - Move CSP to response headers where possible.
     - Remove `'unsafe-inline'` by using hashed/nonced styles or CSS classes only.

3. **No explicit Trusted Types / strict anti-DOM-XSS policy.**
   - Current architecture is mostly safe, but no browser-enforced guardrails exist to prevent future unsafe sinks.
   - Recommendation:
     - Add `require-trusted-types-for 'script'` (where supported) and a minimal Trusted Types policy if any dynamic HTML use is introduced later.

## Medium-priority robustness/security findings

1. **Potential localStorage quota failures are not handled on writes.**
   - `saveProgressForGame` writes directly with no try/catch. Quota exceeded or storage-disabled contexts can throw and break UX.
   - Recommendation: wrap writes with error handling and surface a non-fatal user warning.

2. **Aggressive API fan-out may amplify key abuse/rate depletion if key is leaked.**
   - Bulk fetch can request many IDs/details plus curated endpoints.
   - Recommendation:
     - Add per-session hard cap slider and safer defaults for non-premium users.
     - Add optional exponential backoff on 429 and jitter.

3. **No Subresource Integrity (SRI) needed currently, but document deployment assumptions.**
   - App is mostly self-hosted static assets. If CDN-hosted scripts/styles are introduced later, SRI must be mandatory.

## Low-priority / hygiene findings

1. **Decorative noise background references external domain URL in CSS utility class.**
   - This introduces an outbound request and potential supply-chain/privacy concern in restrictive environments.
   - Recommendation: vendor the asset locally.

2. **README is explicitly outdated.**
   - Security notes can drift from implementation.
   - Recommendation: align README security section with current controls and known limitations.

## Overlooked product additions/features (non-security)

1. **Per-game profile presets and queue strategy controls.**
   - Add user-selectable strategy: newest-first, high-endorsement-first, category-weighted random.

2. **Duplicate/mod family collapsing.**
   - Group obvious forks/variants and show one representative card with expand-on-demand.

3. **Conflict-awareness helpers.**
   - Lightweight hints from tags/category overlap and file replacements (without full mod manager scope).

4. **Rate-limit intelligent mode.**
   - Auto-detect low quota and switch to cache-only or "lite" endpoint mode with UI notice.

5. **Offline-first browsing session.**
   - Let users continue swiping through cached cards when network fails, with deferred metadata hydration.

6. **Data portability improvements.**
   - Add signed export format versioning and optional encryption-at-rest for exported lists.

## Quick wins checklist

- [ ] Add URL allowlist enforcement in `safeImageUrl`.
- [ ] Handle localStorage write exceptions in progress persistence.
- [ ] Move CSP to response header and reduce/remove `'unsafe-inline'`.
- [ ] Self-host decorative noise asset.
- [ ] Add a "privacy mode" settings toggle (blocks remote images + preloading).
- [ ] Add low-quota adaptive fetch mode.
