import { useState } from 'react';
import { 
  useGetPendingPurchases, 
  useGetConfirmedPurchases, 
  useAcceptPurchase, 
  useDeclinePurchase, 
  useDeleteConfirmedPurchase,
  useGetAllProducts,
  useCreateProduct,
  useDeleteProduct
} from '../hooks/useQueries';
import { usePurchaseRequestVisibility } from '../hooks/usePurchaseRequestVisibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle, XCircle, Trash2, Package, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { Category, ProductStatus } from '../backend';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { getProductImageSrc } from '../lib/productImage';

export default function AdminPage() {
  const { data: pendingPurchases, isLoading: pendingLoading } = useGetPendingPurchases();
  const { data: confirmedPurchases, isLoading: confirmedLoading } = useGetConfirmedPurchases();
  const { data: allProducts, isLoading: productsLoading } = useGetAllProducts();
  const acceptPurchase = useAcceptPurchase();
  const declinePurchase = useDeclinePurchase();
  const deleteConfirmedPurchase = useDeleteConfirmedPurchase();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const { hiddenPurchaseIds, hidePurchase } = usePurchaseRequestVisibility();

  // Product creation form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<Category>(Category.normal);
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei (JPEG oder PNG)');
      return;
    }

    setImageFileName(file.name);

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewProductImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      alert('Bitte geben Sie einen Produktnamen ein');
      return;
    }

    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price < 0) {
      alert('Bitte geben Sie einen gültigen Preis ein');
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: newProductName.trim(),
        price,
        category: newProductCategory,
        imageData: newProductImage,
      });

      // Reset form
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory(Category.normal);
      setNewProductImage(null);
      setImageFileName('');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Produkts:', error);
    }
  };

  const handleDecline = async (purchaseId: bigint) => {
    // Hide immediately in UI
    hidePurchase(purchaseId);
    // Then call backend
    await declinePurchase.mutateAsync(purchaseId);
  };

  // Filter out hidden purchases
  const visiblePendingPurchases = pendingPurchases?.filter(
    (item) => !hiddenPurchaseIds.has(item.id.toString())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Admin-Dashboard
        </h1>
        <p className="text-muted-foreground">Kaufanfragen und Produkte verwalten</p>
      </div>

      {/* Products Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produkte
              </CardTitle>
              <CardDescription>Verwalten Sie Ihren Produktkatalog</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Produkt erstellen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Neues Produkt erstellen</DialogTitle>
                  <DialogDescription>Fügen Sie ein neues Produkt zu Ihrem Katalog hinzu</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Produktname</Label>
                    <Input
                      id="product-name"
                      placeholder="Produktname eingeben"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Preis</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Kategorie</Label>
                    <Select
                      value={newProductCategory}
                      onValueChange={(value) => setNewProductCategory(value as Category)}
                    >
                      <SelectTrigger id="product-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value={Category.normal}>Normal</SelectItem>
                        <SelectItem value={Category.kostenlos}>Kostenlos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-image">Produktbild (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      {imageFileName && (
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {imageFileName}
                        </span>
                      )}
                    </div>
                    {newProductImage && (
                      <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                        <img
                          src={newProductImage}
                          alt="Vorschau"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleCreateProduct}
                    disabled={createProduct.isPending}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    {createProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird erstellt...
                      </>
                    ) : (
                      'Produkt erstellen'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allProducts && allProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts.map((product) => {
                const imageSrc = getProductImageSrc(product);
                return (
                  <div
                    key={product.name}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 rounded-lg overflow-hidden flex items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant={product.status === ProductStatus.available ? 'default' : 'secondary'}>
                          {product.status === ProductStatus.available ? 'Verfügbar' : 'Ausverkauft'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          €{product.price.toFixed(2)}
                        </span>
                        <Badge variant="outline">
                          {product.category === Category.normal ? 'Normal' : 'Kostenlos'}
                        </Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => deleteProduct.mutate(product.name)}
                        disabled={deleteProduct.isPending}
                      >
                        {deleteProduct.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wird gelöscht...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Keine Produkte vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Purchase Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Ausstehende Kaufanfragen</CardTitle>
          <CardDescription>Anfragen prüfen und genehmigen oder ablehnen</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : visiblePendingPurchases.length > 0 ? (
            <div className="space-y-4">
              {visiblePendingPurchases.map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{item.purchase.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Benutzer: {item.purchase.username}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      €{item.purchase.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => acceptPurchase.mutate(item.id)}
                      disabled={acceptPurchase.isPending || declinePurchase.isPending}
                    >
                      {acceptPurchase.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Annehmen
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDecline(item.id)}
                      disabled={acceptPurchase.isPending || declinePurchase.isPending}
                    >
                      {declinePurchase.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Ablehnen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Keine ausstehenden Anfragen
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Confirmed Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Bestätigte Käufe</CardTitle>
          <CardDescription>Genehmigte Kaufanfragen verwalten</CardDescription>
        </CardHeader>
        <CardContent>
          {confirmedLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : confirmedPurchases && confirmedPurchases.length > 0 ? (
            <div className="space-y-4">
              {confirmedPurchases.map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-green-50 dark:bg-green-950/20"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{item.purchase.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Benutzer: {item.purchase.username}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      €{item.purchase.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteConfirmedPurchase.mutate(item.id)}
                    disabled={deleteConfirmedPurchase.isPending}
                  >
                    {deleteConfirmedPurchase.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Keine bestätigten Käufe
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
