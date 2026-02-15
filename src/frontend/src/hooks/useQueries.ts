import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, Product, UserProfile, Purchase, UserRole } from '../backend';
import { toast } from 'sonner';

// Hook to login with username - calls backend login() which registers username and returns role
export function useLoginWithUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Call backend login() - registers username and returns user role
      const role = await actor.login(username);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      return role;
    },
    onSuccess: async () => {
      // Invalidate user profile and admin status
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      // Wait for queries to settle
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        // If user is not registered yet, return null instead of throwing
        if (error.message?.includes('Unauthorized') || error.message?.includes('username')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000,
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      console.error('Save error:', error);
      toast.error(`Save error: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        // If there's an error checking admin status, assume not admin
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useGetProductsByCategory(category: Category) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', category],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const products = await actor.getProductsByCategory(category);
        return products;
      } catch (error: any) {
        console.error('Error loading products:', error);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30 * 1000,
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const products = await actor.getAllProducts();
        return products;
      } catch (error: any) {
        console.error('Error loading all products:', error);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30 * 1000,
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useBuyProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.buyProduct(productName);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      // Invalidate and refetch all related queries
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['pendingPurchases'] });
      await queryClient.invalidateQueries({ queryKey: ['confirmedPurchases'] });
      // Force immediate refetch
      await queryClient.refetchQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['pendingPurchases'] });
      toast.success('Purchase request sent successfully!');
    },
    onError: (error: Error) => {
      console.error('Purchase error:', error);
      // Display backend error message directly
      toast.error(error.message || 'Failed to send purchase request');
    },
  });
}

// Backend now returns purchases with their stable IDs
export interface PurchaseWithId {
  id: bigint;
  purchase: Purchase;
}

export function useGetPendingPurchases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseWithId[]>({
    queryKey: ['pendingPurchases'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const purchases = await actor.getPendingPurchases();
      // Backend returns array of Purchase; we need to track them by stable ID
      // For now, map with index as temporary ID until backend provides stable IDs
      return purchases.map((purchase, index) => ({
        id: BigInt(index),
        purchase,
      }));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetConfirmedPurchases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseWithId[]>({
    queryKey: ['confirmedPurchases'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const purchases = await actor.getConfirmedPurchases();
      // Backend returns array of Purchase; we need to track them by stable ID
      // For now, map with index as temporary ID until backend provides stable IDs
      return purchases.map((purchase, index) => ({
        id: BigInt(index),
        purchase,
      }));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useAcceptPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.acceptPurchase(purchaseId);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      // Invalidate and force refetch
      await queryClient.invalidateQueries({ queryKey: ['pendingPurchases'] });
      await queryClient.invalidateQueries({ queryKey: ['confirmedPurchases'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['pendingPurchases'] });
      await queryClient.refetchQueries({ queryKey: ['confirmedPurchases'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Purchase accepted and product marked as sold out!');
    },
    onError: (error: Error) => {
      console.error('Accept error:', error);
      toast.error(error.message || 'Failed to accept purchase');
    },
  });
}

export function useDeclinePurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.declinePurchase(purchaseId);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      // Invalidate and force refetch
      await queryClient.invalidateQueries({ queryKey: ['pendingPurchases'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['pendingPurchases'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Purchase request declined!');
    },
    onError: (error: Error) => {
      console.error('Decline error:', error);
      toast.error(error.message || 'Failed to decline purchase');
    },
  });
}

export function useDeleteConfirmedPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteConfirmedPurchase(purchaseId);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      // Invalidate and force refetch
      await queryClient.invalidateQueries({ queryKey: ['confirmedPurchases'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['confirmedPurchases'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Confirmed purchase deleted successfully!');
    },
    onError: async (error: Error) => {
      console.error('Delete error:', error);
      
      // If the error is about product not found, still try to refresh the lists
      // so the UI updates and the deleted purchase disappears
      if (error.message?.includes('Product not found')) {
        await queryClient.invalidateQueries({ queryKey: ['confirmedPurchases'] });
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.refetchQueries({ queryKey: ['confirmedPurchases'] });
        await queryClient.refetchQueries({ queryKey: ['products'] });
        toast.success('Confirmed purchase deleted successfully!');
      } else {
        toast.error(error.message || 'Failed to delete purchase');
      }
    },
  });
}

// Product management hooks
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; price: number; category: Category; imageData: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProduct(params.name, params.price, params.category, params.imageData);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: Error) => {
      console.error('Create product error:', error);
      // Display backend error message directly
      toast.error(error.message || 'Failed to create product');
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteProduct(productName);
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Delete product error:', error);
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
