import { Product, ProductStatus } from '../backend';
import { useBuyProduct } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Info, Loader2, Package } from 'lucide-react';
import { getProductImageSrc } from '../lib/productImage';

interface PurchaseDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PurchaseDialog({ product, open, onOpenChange }: PurchaseDialogProps) {
  const buyProduct = useBuyProduct();
  const isSoldOut = product.status === ProductStatus.soldOut;
  const imageSrc = getProductImageSrc(product);

  const handlePurchase = async () => {
    try {
      await buyProduct.mutateAsync(product.name);
      onOpenChange(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Review product details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center';
                    fallback.innerHTML = '<svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
              Your purchase request will be sent to the admin for approval. The product will become unavailable only after the admin accepts your request.
            </AlertDescription>
          </Alert>

          {isSoldOut && (
            <Alert variant="destructive">
              <AlertDescription>
                This product is currently sold out and cannot be purchased.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={buyProduct.isPending || isSoldOut}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            {buyProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Purchase Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
