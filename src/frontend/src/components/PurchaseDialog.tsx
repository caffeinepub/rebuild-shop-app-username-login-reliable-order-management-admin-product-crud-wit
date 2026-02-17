import { Product, ProductStatus } from '../backend';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Info, Loader2, Image as ImageIcon } from 'lucide-react';
import { useBuyProduct } from '../hooks/useQueries';
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
      console.error('Kauffehler:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Produktdetails und Kaufinformationen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 rounded-lg overflow-hidden flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-24 h-24 text-muted-foreground/30" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preis</span>
              <span className="text-2xl font-bold text-primary">
                €{product.price.toFixed(2)}
              </span>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Ihre Kaufanfrage wird zur Genehmigung an den Administrator gesendet.
            </AlertDescription>
          </Alert>

          {isSoldOut && (
            <Alert variant="destructive">
              <AlertDescription>
                Dieses Produkt ist derzeit ausverkauft und kann nicht gekauft werden.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={buyProduct.isPending}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={buyProduct.isPending || isSoldOut}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            {buyProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              'Kaufanfrage senden'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
