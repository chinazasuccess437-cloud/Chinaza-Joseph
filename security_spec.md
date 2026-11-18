# Firestore Security Specification

## Data Invariants
1. Every document in `/perspectives/{perspectiveId}` must belong to an authenticated user with `request.auth.token.email_verified == true` and `authorUid == request.auth.uid`.
2. Every perspective MUST include a non-empty `photoUrl` (either `https://...` or compressed `data:image/(jpeg|jpg|png|webp);base64,...` within 150KB) so the contributor's picture is always shown.
3. No PII (email, phone, address) may ever be stored in `/perspectives/{perspectiveId}`.
4. `createdAt` and `updatedAt` must equal `request.time` on create; `authorUid` and `createdAt` are immutable on update.
5. Only the original author (`authorUid == request.auth.uid`) or verified portfolio admin (`chinazajoseph952@gmail.com` with `email_verified == true`) may update or delete a perspective.

## Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated create to `/perspectives/p1` -> `PERMISSION_DENIED`.
2. Unverified email (`email_verified: false`) create -> `PERMISSION_DENIED`.
3. Identity spoofing (`authorUid != request.auth.uid`) -> `PERMISSION_DENIED`.
4. Missing `photoUrl` or empty string -> `PERMISSION_DENIED`.
5. Invalid `photoUrl` scheme (`javascript:alert(1)` or `http://`) -> `PERMISSION_DENIED`.
6. Oversized `photoUrl` (> 150,000 chars) -> `PERMISSION_DENIED`.
7. Shadow/ghost field injection (`isAdmin: true`, `email: "..."`) -> `PERMISSION_DENIED` (`hasOnly` blocks).
8. Forged client timestamp (`createdAt != request.time`) -> `PERMISSION_DENIED`.
9. Oversized document ID (> 128 chars or invalid regex) -> `PERMISSION_DENIED`.
10. Cross-user update/delete by another signed-in user -> `PERMISSION_DENIED`.
11. Mutating immutable `authorUid` or `createdAt` on update -> `PERMISSION_DENIED`.
12. Admin email spoofing with `email_verified: false` -> `PERMISSION_DENIED`.
