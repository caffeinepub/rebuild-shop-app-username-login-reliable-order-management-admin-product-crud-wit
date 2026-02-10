# Specification

## Summary
**Goal:** Allow any caller to create products and send purchase requests without backend/frontend authorization gating, and ensure all dialogs/menus/overlays render with solid (non-transparent) backgrounds.

**Planned changes:**
- Backend (Motoko): remove authorization/session/role checks that block `addProduct(...)` and `buyProduct(productName)`, while keeping existing non-auth validation/traps (e.g., product not found, sold out) and leaving other endpoints unchanged.
- Frontend: remove any admin/user authorization checks that prevent submitting the Create Product flow or sending a purchase request; surface backend errors in English as returned (no obsolete “Unauthorized/Please log in” substitutions).
- Frontend UI: audit dialogs/menus/overlays in Shop/Admin flows and make their content surfaces opaque (solid backgrounds) in both light and dark mode without editing `frontend/src/components/ui` source files.

**User-visible outcome:** Users can create products and send purchase requests regardless of login/admin status (subject to product existence/stock), and all dialogs/menus display with solid backgrounds so the page behind does not show through.
