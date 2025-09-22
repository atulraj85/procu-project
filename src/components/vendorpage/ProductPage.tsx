import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageCropper from '../shared/imagecrop/Imagecrop';
import { toast } from '../ui/use-toast';

// Interfaces for type safety
interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
 

}

interface ProductCategory {
  id: string;
  name: string;
  
}

interface VendorProduct {
  productId: string;
  categoryId?: string;
  vendorId?: string;
  image?:string;
  experienceYears: number;
  clientCount?: number;
  description?: string;
  specifications?: string;
  stock?: number;
  pricingModel?: string;
  price?: string;
  currency: string;
  isActive: boolean;
  photos?: string[];
}
interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => void;
  }

interface VendorProductFormProps {
  vendorId?: string;
  
  data: {
    products?: VendorProduct[];
  };
  updateData: (newData: Partial<VendorProductFormProps['data']>) => void;
}

const VendorProductForm: React.FC<VendorProductFormProps> = ({ 
  vendorId, 
  data, 
  updateData 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [showProductModal, setShowProductModal] = useState(() => {
    const stored = localStorage.getItem('showProductModal');
    return stored ? JSON.parse(stored) : false;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(() => {
    const stored = localStorage.getItem('showCategoryModal');
    return stored ? JSON.parse(stored) : false;
  });
  const [productForm, setProductForm] = useState<VendorProduct>(() => {
    const stored = localStorage.getItem('productForm');
    return stored ? JSON.parse(stored) : {
      productId: '',
      categoryId: '',
      vendorId: vendorId,
      experienceYears: 0,
      description: '',
      specifications: '',
      stock: undefined,
      pricingModel: '',
      price: '',
      currency: 'USD',
      isActive: true,
      photos: [],
    };
  });

  // Save modal states to localStorage
  useEffect(() => {
    localStorage.setItem('showProductModal', JSON.stringify(showProductModal));
  }, [showProductModal]);

  useEffect(() => {
    localStorage.setItem('showCategoryModal', JSON.stringify(showCategoryModal));
  }, [showCategoryModal]);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('productForm', JSON.stringify(productForm));
  }, [productForm]);

  // Modal close handlers with cleanup
  const handleCloseProductModal = (show: boolean) => {
    setShowProductModal(show);
    if (!show) {
      localStorage.removeItem('showProductModal');
      localStorage.removeItem('productModalName');
      localStorage.removeItem('productModalCategoryId');
      localStorage.removeItem('productModalDescription');
      localStorage.removeItem('productModalImage');
    }
  };

  const handleCloseCategoryModal = (show: boolean) => {
    setShowCategoryModal(show);
    if (!show) {
      localStorage.removeItem('showCategoryModal');
      localStorage.removeItem('categoryModalName');
      localStorage.removeItem('categoryModalDescription');
      localStorage.removeItem('categoryModalLogo');
    }
  };

  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Create new product method
  const handleCreateProduct = async (name: string, categoryId: string, description:string, image :string) => {
    try {
     
      
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          categoryId,
          description,
          image
        })
      });

      if (!response.ok) throw new Error('Failed to create product');

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setProductForm(prev => ({ ...prev, productId: newProduct.id }));
      setShowProductModal(false);
      toast({ 
        title: 'Product created successfully', 
        variant: 'default' 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({ 
        title: 'Error creating product', 
        variant: 'destructive' 
      });
    }
  };

  // Create new category method
  const handleCreateCategory = async (name: string, description: string, logo: string) => {
    try {
      const response = await fetch('/api/productCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          logo
        })
      });

      if (!response.ok) throw new Error('Failed to create category');

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setProductForm(prev => ({ ...prev, categoryId: newCategory.id }));
      setShowCategoryModal(false);
      toast({ 
        title: 'Category created successfully', 
        variant: 'default' 
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({ 
        title: 'Error creating category', 
        variant: 'destructive' 
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch('/api/productCategory');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({ 
          title: 'Error fetching categories', 
          variant: 'destructive' 
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!productForm.categoryId) {
        setProducts([]);
        return;
      }

      try {
        const productsResponse = await fetch(`/api/product?categoryId=${productForm.categoryId}`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({ 
          title: 'Error fetching products', 
          variant: 'destructive' 
        });
      }
    };
    
    fetchProducts();
  }, [productForm.categoryId]);

  // Image handling methods
  const handleImageUpload = async (file: File) => {
    if (productForm.photos && productForm.photos.length >= 4) {
      toast({ 
        title: 'Maximum 4 images allowed', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/media/upload', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const { url } = await response.json();
      const newPhotos = [...(productForm.photos || []), url];
      setProductForm(prev => ({ ...prev, photos: newPhotos }));
      
      toast({ 
        title: 'Image uploaded', 
        variant: 'default' 
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({ 
        title: 'Error uploading image', 
        variant: 'destructive' 
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newPhotos = (productForm.photos || []).filter((_, index) => index !== indexToRemove);
    setProductForm(prev => ({ ...prev, photos: newPhotos }));
  };

  // Product management methods
  const addProduct = () => {
    if (productForm.productId) {
      const products = [...(data.products || []), productForm];
      updateData({ products });
      
      setProductForm({
        productId: '',
        categoryId: '',
        vendorId: vendorId,
        experienceYears: 0,
       
        description: '',
        specifications: '',
        stock: undefined,
        pricingModel: '',
        price: '',
        currency: 'USD',
        isActive: true,
        photos: [],
      });
    }
  };

  const removeProduct = (indexToRemove: number) => {
    const products = (data.products || []).filter((_, index) => index !== indexToRemove);
    updateData({ products });
  };

  // Modal components
 
  interface ProductModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    categories: ProductCategory[];
    selectedCategoryId:any;
    onSubmit: (name: string, categoryId: string, description: string, image: string) => void;
  }
  const ProductModal: React.FC<ProductModalProps> = ({
    showModal,
    setShowModal,
    categories,
    onSubmit,
    selectedCategoryId , // Add this new prop
  }) => {
    // Initialize form state from localStorage
    const [name, setName] = useState(() => localStorage.getItem('productModalName') || '');
    const [description, setDescription] = useState(() => localStorage.getItem('productModalDescription') || '');
    const [image, setImage] = useState(() => localStorage.getItem('productModalImage') || '');

    // Find the selected category name
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

    // Save form state to localStorage
    useEffect(() => {
      localStorage.setItem('productModalName', name);
      localStorage.setItem('productModalDescription', description);
      localStorage.setItem('productModalImage', image);
    }, [name, description, image]);

    const handleSubmit = () => {
      onSubmit(name, selectedCategoryId, description, image);
      // Clear form and localStorage
      setName('');
      setDescription('');
      setImage('');
      localStorage.removeItem('productModalName');
      localStorage.removeItem('productModalDescription');
      localStorage.removeItem('productModalImage');
    }

    const handleCroppedImage = (croppedImage: string) => {
      setImage(croppedImage);
    };

    const handleRemoveImage = () => {
      setImage('');
      localStorage.removeItem('productModalImage');
    };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product with details and featured image to your catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="p-2 bg-gray-50 border rounded-md">
              {selectedCategory?.name || 'Unknown Category'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="space-y-3">
              <ImageCropper
                onImageCropped={handleCroppedImage}
                type="logo"
              />
              {image && (
                <div className="relative w-32 group">
                  <img
                    src={image}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the product"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !image}
          >
            Create Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

 
  
  interface CategoryModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onSubmit: (name: string, description: string, logo: string) => void;
  }
  
  const CategoryModal: React.FC<CategoryModalProps> = ({
    showModal,
    setShowModal,
    onSubmit
  }) => {
    const [name, setName] = useState(() => localStorage.getItem('categoryModalName') || '');
    const [description, setDescription] = useState(() => localStorage.getItem('categoryModalDescription') || '');
    const [logo, setLogo] = useState(() => localStorage.getItem('categoryModalLogo') || '');

    useEffect(() => {
      localStorage.setItem('categoryModalName', name);
      localStorage.setItem('categoryModalDescription', description);
      localStorage.setItem('categoryModalLogo', logo);
    }, [name, description, logo]);
  
    const handleSubmit = () => {
      onSubmit(name, description, logo);
      // Reset form
      setName('');
      setDescription('');
      setLogo('');
    };
  
    const handleCroppedImage = (croppedImage: string) => {
      setLogo(croppedImage);
    };
  
    const handleRemoveImage = () => {
      setLogo('');
    };
  
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new product category with details and logo.
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
  
            <div className="space-y-2">
              <Label>Category Logo</Label>
              <div className="space-y-3">
                <ImageCropper
                  onImageCropped={handleCroppedImage}
                  type="logo"
                />
                {logo && (
                  <div className="relative w-32 group">
                    <img
                      src={logo}
                      alt="Category logo"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                               opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
  
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name.trim() || !logo}
              type="button"
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
        <ProductModal
  showModal={showProductModal}
  setShowModal={setShowProductModal}
  categories={categories}
  onSubmit={handleCreateProduct}
  selectedCategoryId ={productForm.categoryId}
/>

<CategoryModal
  showModal={showCategoryModal}
  setShowModal={setShowCategoryModal}
  onSubmit={handleCreateCategory}
/>

      <h2 className="text-2xl font-bold">Products</h2>
      
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Category *</label>
          <div className="flex items-center">
            <select
              className="w-full p-2 border rounded mr-2"
              value={productForm.categoryId}
              onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="text-blue-500 hover:text-blue-600"
              title="Add New Category"
            >
              <PlusCircle />
            </button>
          </div>
        </div>
        
        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Product *</label>
          <div className="flex items-center">
            <select
              className="w-full p-2 border rounded mr-2"
              value={productForm.productId}
              onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })}
              disabled={!productForm.categoryId}
            >
              <option value="">Select Product</option>
              {products
                .filter(product => product.categoryId === productForm.categoryId)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
            </select>
            <button 
              onClick={() => setShowProductModal(true)}
              className="text-blue-500 hover:text-blue-600"
              title="Add New Product"
              disabled={!productForm.categoryId}
            >
              <PlusCircle />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* <div>
          <label className="block text-sm font-medium mb-1">Experience Years *</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={productForm.experienceYears}
            onChange={(e) => setProductForm({ ...productForm, experienceYears: parseInt(e.target.value) })}
          />
        </div> */}

   

        {/* <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={productForm.stock || ''}
            onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Pricing Model</label>
          <select
            className="w-full p-2 border rounded"
            value={productForm.pricingModel}
            onChange={(e) => setProductForm({ ...productForm, pricingModel: e.target.value })}
          >
            <option value="">Select Model</option>
            <option value="Fixed Price">Fixed Price</option>
            <option value="Per Unit">Per Unit</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Subscription">Subscription</option>
          </select>
        </div> */}
        
        <div>
          <label className="block text-sm font-medium mb-1">Rate (Price)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={productForm.price || ''}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          />
        </div>
        
        {/* <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            maxLength={3}
            value={productForm.currency}
            onChange={(e) => setProductForm({ ...productForm, currency: e.target.value.toUpperCase() })}
          />
        </div> */}

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={productForm.description || ''}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Specifications</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={productForm.specifications || ''}
            onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
          />
        </div>
        
        <div className="col-span-2 flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={productForm.isActive}
              onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
            />
            <span className="text-sm font-medium">Is Active</span>
          </label>
        </div>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Images</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {productForm.photos?.map((photoUrl, index) => (
            <div key={index} className="relative">
              <img 
                src={photoUrl} 
                alt={`Uploaded ${index + 1}`} 
                className="w-full h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {(!productForm.photos || productForm.photos.length < 4) && (
            <label className="cursor-pointer flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-md">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <span className="text-gray-400">+ Add Image</span>
            </label>
          )}
        </div>
        {productForm.photos && productForm.photos.length > 0 && (
          <p className="text-sm text-gray-500">
            {productForm.photos.length}/4 images uploaded
          </p>
        )}
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addProduct}
        disabled={!productForm.productId}
      >
        Add Product
      </button>

      {/* Added list of products with remove option */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Added Products</h3>
        {data.products?.map((product, index) => {
          const selectedProductName = products.find(p => p.id === product.productId)?.name || 'Unknown Product';
          const selectedCategoryName = categories.find(c => c.id === product.categoryId)?.name || 'Unknown Category';

          return (
            <div key={index} className="p-4 border rounded mt-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="font-medium">{selectedProductName}</div>
                  <div className="text-sm text-gray-600">
                    Category: {selectedCategoryName}
                  </div>
                  {product.stock !== undefined && (
                    <div className="text-sm">Stock: {product.stock}</div>
                  )}
                  {product.description && (
                    <div className="text-sm">Description: {product.description}</div>
                  )}
                  {product.specifications && (
                    <div className="text-sm">Specifications: {product.specifications}</div>
                  )}
                  <div className="text-sm">
                    Price: {product.price} {product.currency}
                    {product.pricingModel && ` (${product.pricingModel})`}
                  </div>
                </div>
                <button
                  onClick={() => removeProduct(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove Product"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Product Photos */}
              {product.photos && product.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.photos.map((photoUrl, photoIndex) => (
                    <div key={photoIndex} className="relative">
                      <img 
                        src={photoUrl} 
                        alt={`Product Photo ${photoIndex + 1}`} 
                        className="w-full h-20 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorProductForm;