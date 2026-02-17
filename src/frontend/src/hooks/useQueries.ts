import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, Product, UserProfile, Purchase } from '../backend';
import { toast } from 'sonner';
import { UserRole } from '../backend';

export function useGetProductsByCategory(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.buyProduct(productName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Kaufanfrage gesendet', {
        description: 'Ihre Anfrage wird vom Administrator geprüft.',
      });
    },
    onError: (error: any) => {
      console.error('Kauffehler:', error);
      toast.error('Kaufanfrage fehlgeschlagen', {
        description: error?.message || 'Ein unbekannter Fehler ist aufgetreten',
      });
    },
  });
}

type PurchaseWithId = {
  id: bigint;
  purchase: Purchase;
};

export function useGetPendingPurchases() {
  const { actor, isFetching } = useActor();

  return useQuery<PurchaseWithId[]>({
    queryKey: ['purchases', 'pending'],
    queryFn: async () => {
      if (!actor) return [];
      const tuples = await actor.getPendingPurchases();
      return tuples.map(([id, purchase]) => ({ id, purchase }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConfirmedPurchases() {
  const { actor, isFetching } = useActor();

  return useQuery<PurchaseWithId[]>({
    queryKey: ['purchases', 'confirmed'],
    queryFn: async () => {
      if (!actor) return [];
      const tuples = await actor.getConfirmedPurchases();
      return tuples.map(([id, purchase]) => ({ id, purchase }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAcceptPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.acceptPurchase(purchaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Kaufanfrage angenommen', {
        description: 'Die Anfrage wurde erfolgreich bestätigt.',
      });
    },
    onError: (error: any) => {
      console.error('Fehler beim Annehmen:', error);
      toast.error('Fehler beim Annehmen der Anfrage', {
        description: 'Wenn dieser Fehler wiederholt auftritt, lehnen Sie die Anfrage bitte ab, um sie zu löschen. Sie ist wahrscheinlich fehlerhaft.',
      });
    },
  });
}

export function useDeclinePurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.declinePurchase(purchaseId);
    },
    onMutate: async (purchaseId: bigint) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['purchases', 'pending'] });

      // Snapshot previous value
      const previousPurchases = queryClient.getQueryData<PurchaseWithId[]>(['purchases', 'pending']);

      // Optimistically remove the purchase
      queryClient.setQueryData<PurchaseWithId[]>(['purchases', 'pending'], (old) => {
        if (!old) return [];
        return old.filter((item) => item.id !== purchaseId);
      });

      return { previousPurchases };
    },
    onSuccess: () => {
      // Still invalidate to ensure backend state is synced
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Kaufanfrage abgelehnt', {
        description: 'Die Anfrage wurde entfernt.',
      });
    },
    onError: (error: any, purchaseId, context) => {
      // Do NOT rollback - keep the purchase removed from UI
      console.error('Fehler beim Ablehnen (wird trotzdem ausgeblendet):', error);
      
      // Still try to refresh to clean up any backend state
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast.info('Anfrage wurde ausgeblendet', {
        description: 'Die Anfrage wurde aus der Ansicht entfernt.',
      });
    },
  });
}

export function useDeleteConfirmedPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.deleteConfirmedPurchase(purchaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Kauf gelöscht', {
        description: 'Der bestätigte Kauf wurde entfernt.',
      });
    },
    onError: (error: any) => {
      console.error('Fehler beim Löschen:', error);
      
      // Refresh lists even on error to handle missing product gracefully
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      const errorMessage = error?.message || 'Ein unbekannter Fehler ist aufgetreten';
      toast.error('Fehler beim Löschen', {
        description: errorMessage,
      });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      price: number;
      category: Category;
      imageData: string | null;
    }) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.addProduct(params.name, params.price, params.category, params.imageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produkt erstellt', {
        description: 'Das neue Produkt wurde hinzugefügt.',
      });
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen:', error);
      toast.error('Fehler beim Erstellen des Produkts', {
        description: error?.message || 'Ein unbekannter Fehler ist aufgetreten',
      });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.deleteProduct(productName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produkt gelöscht', {
        description: 'Das Produkt wurde entfernt.',
      });
    },
    onError: (error: any) => {
      console.error('Fehler beim Löschen:', error);
      toast.error('Fehler beim Löschen des Produkts', {
        description: error?.message || 'Ein unbekannter Fehler ist aufgetreten',
      });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profil gespeichert', {
        description: 'Ihr Profil wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: any) => {
      console.error('Fehler beim Speichern des Profils:', error);
      toast.error('Fehler beim Speichern des Profils', {
        description: error?.message || 'Ein unbekannter Fehler ist aufgetreten',
      });
    },
  });
}

export function useLoginWithUsername() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (username: string): Promise<UserRole> => {
      if (!actor) throw new Error('Actor nicht verfügbar');
      return actor.login(username);
    },
  });
}
