# Specification

## Summary
**Goal:** Remove all backend authorization/permission checks so every backend canister method is callable without authentication.

**Planned changes:**
- Delete AccessControl-based guards and remove any "Unauthorized" traps across backend methods that currently enforce caller identity/roles (including purchase admin actions, product admin actions, and user profile methods).
- Keep existing Candid method names and parameter/return types compatible with the current frontend, ensuring the canister still builds and the frontend can call the same methods without type mismatches.

**User-visible outcome:** Any user (regardless of identity) can call backend methods like acceptPurchase/declinePurchase/deleteConfirmedPurchase/addProduct/deleteProduct/getCallerUserProfile/getUserProfile/saveCallerUserProfile without receiving "Unauthorized" errors.
