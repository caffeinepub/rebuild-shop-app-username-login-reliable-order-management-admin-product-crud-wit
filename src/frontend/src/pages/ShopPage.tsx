import { useState, useEffect } from 'react';
import { Category } from '../backend';
import { useGetProductsByCategory } from '../hooks/useQueries';
import { useCustomAuth } from '../hooks/useCustomAuth';
import ProductCard from '../components/ProductCard';
import PurchaseDialog from '../components/PurchaseDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Product } from '../backend';
import { Package } from 'lucide-react';

export default function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { username } = useCustomAuth();
  const { 
    data: normalProducts, 
    isLoading: normalLoading,
    refetch: refetchNormal
  } = useGetProductsByCategory(Category.normal);
  const { 
    data: kostenlosProducts, 
    isLoading: kostenlosLoading,
    refetch: refetchKostenlos
  } = useGetProductsByCategory(Category.kostenlos);

  // Auto-refetch products when dialog closes to ensure fresh data
  useEffect(() => {
    if (!selectedProduct) {
      refetchNormal();
      refetchKostenlos();
    }
  }, [selectedProduct, refetchNormal, refetchKostenlos]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Welcome, {username}!
        </h1>
        <p className="text-muted-foreground">Browse our exclusive collection</p>
      </div>

      <Tabs defaultValue="normal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="normal">Products</TabsTrigger>
          <TabsTrigger value="kostenlos">Free Items</TabsTrigger>
        </TabsList>

        <TabsContent value="normal" className="space-y-6">
          {normalLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : !normalProducts || normalProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No products available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kostenlos" className="space-y-6">
          {kostenlosLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading free items...</p>
            </div>
          ) : !kostenlosProducts || kostenlosProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No free items available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kostenlosProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <PurchaseDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
