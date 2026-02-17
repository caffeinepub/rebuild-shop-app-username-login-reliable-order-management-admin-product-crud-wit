import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PurchaseVisibilityState {
  hiddenPurchaseIds: Set<string>;
  hidePurchase: (id: bigint) => void;
  clearHidden: () => void;
}

export const usePurchaseRequestVisibility = create<PurchaseVisibilityState>()(
  persist(
    (set) => ({
      hiddenPurchaseIds: new Set<string>(),
      hidePurchase: (id: bigint) =>
        set((state) => ({
          hiddenPurchaseIds: new Set(state.hiddenPurchaseIds).add(id.toString()),
        })),
      clearHidden: () => set({ hiddenPurchaseIds: new Set<string>() }),
    }),
    {
      name: 'purchase-visibility-storage',
      partialize: (state) => ({
        hiddenPurchaseIds: Array.from(state.hiddenPurchaseIds),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        hiddenPurchaseIds: new Set(persistedState?.hiddenPurchaseIds || []),
      }),
    }
  )
);
