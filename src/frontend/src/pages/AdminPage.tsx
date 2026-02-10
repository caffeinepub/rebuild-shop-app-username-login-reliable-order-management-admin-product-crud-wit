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
      alert('Please select an image file (JPEG or PNG)');
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
      alert('Please enter a product name');
      return;
    }

    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
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
      console.error('Failed to create product:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage purchase requests and products</p>
      </div>

      {/* Products Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>Add a new product to your catalog</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      placeholder="Enter product name"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price</Label>
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
                    <Label htmlFor="product-category">Category</Label>
                    <Select
                      value={newProductCategory}
                      onValueChange={(value) => setNewProductCategory(value as Category)}
                    >
                      <SelectTrigger id="product-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value={Category.normal}>Normal</SelectItem>
                        <SelectItem value={Category.kostenlos}>Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-image">Product Image (optional)</Label>
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
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProduct}
                    disabled={createProduct.isPending}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    {createProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Product'
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
                              fallback.innerHTML = '<svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge
                          variant={product.status === ProductStatus.soldOut ? 'destructive' : 'default'}
                          className={product.status === ProductStatus.available ? 'bg-gradient-to-r from-orange-500 to-amber-600' : ''}
                        >
                          {product.status === ProductStatus.soldOut ? 'Sold Out' : 'Available'}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        ${product.price.toFixed(2)}
                      </p>
                      <Badge variant="outline">
                        {product.category === Category.kostenlos ? 'Free' : 'Normal'}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProduct.mutate(product.name)}
                        disabled={deleteProduct.isPending}
                        className="w-full"
                      >
                        {deleteProduct.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No products available</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Pending Purchases Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Purchase Requests</CardTitle>
          <CardDescription>Review and approve purchase requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingPurchases && pendingPurchases.length > 0 ? (
            <div className="space-y-4">
              {pendingPurchases.map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{item.purchase.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested by: {item.purchase.username}
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ${item.purchase.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptPurchase.mutate(item.id)}
                      disabled={acceptPurchase.isPending}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {acceptPurchase.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => declinePurchase.mutate(item.id)}
                      disabled={declinePurchase.isPending}
                    >
                      {declinePurchase.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending requests</p>
          )}
        </CardContent>
      </Card>

      {/* Confirmed Purchases Section */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmed Purchases</CardTitle>
          <CardDescription>View and manage confirmed purchases</CardDescription>
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
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-green-50 dark:bg-green-950"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{item.purchase.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Purchased by: {item.purchase.username}
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ${item.purchase.price.toFixed(2)}
                    </p>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600">
                      Confirmed
                    </Badge>
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
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No confirmed purchases</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
