import { Product, ProductStatus } from '../backend';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Image as ImageIcon } from 'lucide-react';
import { getProductImageSrc } from '../lib/productImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const isSoldOut = product.status === ProductStatus.soldOut;
  const imageSrc = getProductImageSrc(product);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Ausverkauft
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-2xl font-bold text-primary">
            €{product.price.toFixed(2)}
          </p>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          onClick={() => onSelect(product)}
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Ausverkauft' : 'Ansehen'}
        </Button>
      </CardContent>
    </Card>
  );
}
