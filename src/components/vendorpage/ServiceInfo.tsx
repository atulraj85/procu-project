import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { toast } from '../ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import ImageCropper from '../shared/imagecrop/Imagecrop';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Updated VendorService interface to match API
interface VendorService {
  serviceId: string;
  categoryId?: string;
  vendorId?: string;
  price?: string;
  location?: string;
  description?: string;
  modeOfService?: 'online' | 'offline';
  pricingModel?: string;
  currency: string;
  isActive: boolean;
  photos?: string[];
}

// Other interfaces remain the same
interface Service {
  id: string;
  name: string;
  categoryId: string;
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface VendorServiceFormProps {
  vendorId?: string;
  data: {
    services?: VendorService[];
  };
  updateData: (newData: Partial<VendorServiceFormProps['data']>) => void;
}

const  VendorServiceForm: React.FC<VendorServiceFormProps> = ({ 
  vendorId, 
  data, 
  updateData,
 
  
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(() => {
    const stored = localStorage.getItem('showServiceModal');
    return stored ? JSON.parse(stored) : false;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(() => {
    const stored = localStorage.getItem('showCategoryModal');
    return stored ? JSON.parse(stored) : false;
  });
  const [serviceForm, setServiceForm] = useState<VendorService>(() => {
    const stored = localStorage.getItem('serviceForm');
    return stored ? JSON.parse(stored) : {
      serviceId: '',
      categoryId: '',
      vendorId: vendorId,
      price: '',
      location: '',
      description: '',
      modeOfService: undefined,
      pricingModel: '',
      currency: 'USD',
      isActive: true,
      photos: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('showServiceModal', JSON.stringify(showServiceModal));
  }, [showServiceModal]);

  useEffect(() => {
    localStorage.setItem('showCategoryModal', JSON.stringify(showCategoryModal));
  }, [showCategoryModal]);

  // Update localStorage when form data changes
  useEffect(() => {
    localStorage.setItem('serviceForm', JSON.stringify(serviceForm));
  }, [serviceForm]);

    // Clear localStorage when dialogs are closed
    const handleCloseServiceModal = (show: boolean) => {
      setShowServiceModal(show);
      if (!show) {
        localStorage.removeItem('showServiceModal');
      }
    };
  
    const handleCloseCategoryModal = (show: boolean) => {
      setShowCategoryModal(show);
      if (!show) {
        localStorage.removeItem('showCategoryModal');
      }
    };
    const ServiceModal = ({ 
      showModal, 
      setShowModal, 
      categories,
      onSubmit,
      selectedCategoryId 
    }: {
      showModal: boolean;
      setShowModal: (show: boolean) => void;
      categories: ServiceCategory[];
      onSubmit: (name: string, categoryId: string, description: string, image: string) => void;
      selectedCategoryId: any; // Required prop now
    }) => {
      const [name, setName] = useState(() => {
        const stored = localStorage.getItem('serviceModalName');
        return stored || '';
      });
      const [description, setDescription] = useState(() => {
        const stored = localStorage.getItem('serviceModalDescription');
        return stored || '';
      });
      const [image, setImage] = useState(() => {
        const stored = localStorage.getItem('serviceModalImage');
        return stored || '';
      });
    
      // Find the selected category name
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    
      // Update localStorage when form fields change
      useEffect(() => {
        localStorage.setItem('serviceModalName', name);
        localStorage.setItem('serviceModalDescription', description);
        localStorage.setItem('serviceModalImage', image);
      }, [name, description, image]);
    
      const handleSubmit = () => {
        onSubmit(name, selectedCategoryId, description, image);
        // Clear form and localStorage
        setName('');
        setDescription('');
        setImage('');
        localStorage.removeItem('serviceModalName');
        localStorage.removeItem('serviceModalDescription');
        localStorage.removeItem('serviceModalImage');
      };
    
      const handleCroppedImage = (croppedImage: string) => {
        setImage(croppedImage);
      };
    
      const handleRemoveImage = () => {
        setImage('');
      };
    
      return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service with details and featured image to your catalog.
              </DialogDescription>
            </DialogHeader>
    
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  placeholder="Enter service name"
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
                <Label>Service Image</Label>
                <div className="space-y-3">
                  <ImageCropper
                    onImageCropped={handleCroppedImage}
                    type="logo"
                  />
                  {image && (
                    <div className="relative w-32 group">
                      <img
                        src={image}
                        alt="Service"
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
                  placeholder="Describe the service"
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
                disabled={!name.trim() || !image}
                type="button"
              >
                Create Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };


  // Create new category method
  const createNewCategory = async (name: string, description: string, logo: string) => {
    if (!name || !logo) {
      toast({ 
        title: 'Category name and logo are required', 
        variant: 'destructive' 
      });
      return;
    }
  
    try {
      const response = await fetch('/api/serviceCategory', {
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
      setServiceForm(prev => ({ 
        ...prev, 
        categoryId: newCategory.id 
      }));
  
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

// Fetch services and categories on component mount
useEffect(() => {
  const fetchData = async () => {
    try {
      const categoriesResponse = await fetch('/api/serviceCategory');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
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
  const fetchServices = async () => {
    // Only fetch services if a category is selected
    if (!serviceForm.categoryId) {
      setServices([]);
      return;
    }

    try {
      const servicesResponse = await fetch(`/api/service?categoryId=${serviceForm.categoryId}`);
      if (!servicesResponse.ok) {
        throw new Error('Failed to fetch services');
      }
      const servicesData = await servicesResponse.json();
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({ 
        title: 'Error fetching services', 
        variant: 'destructive' 
      });
    }
  };
  
  fetchServices();
}, [serviceForm.categoryId]); // Trigger fetch when category changes

const createNewService = async (name: string, categoryId: string, description: string, image: string) => {
  console.log(name , categoryId, description, image)
  if (!name || !categoryId || !image) {
    toast({ 
      title: 'Service name, category, and image are required', 
      variant: 'destructive' 
    });
    return;
  }

  try {
    const response = await fetch('/api/service', {
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
    

    if (!response.ok) throw new Error('Failed to create service');

    const newService = await response.json();
    console.log(newService)
    setServices([...services, newService]);
    setServiceForm(prev => ({ 
      ...prev, 
      serviceId: newService.id 
    }));

    setShowServiceModal(false);
    toast({ 
      title: 'Service created successfully', 
      variant: 'default' 
    });
  } catch (error) {
    console.error('Error creating service:', error);
    toast({ 
      title: 'Error creating service', 
      variant: 'destructive' 
    });
  }
};
// Image upload handler
const handleImageUpload = async (file: File) => {
  if (serviceForm.photos && serviceForm.photos.length >= 4) {
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
    
    // Update form state with new photo
    const newPhotos = [...(serviceForm.photos || []), url];
    setServiceForm(prev => ({ ...prev, photos: newPhotos }));
    
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

// Remove image handler
const removeImage = (indexToRemove: number) => {
  const newPhotos = (serviceForm.photos || []).filter((_, index) => index !== indexToRemove);
  setServiceForm(prev => ({ ...prev, photos: newPhotos }));
};

// Add service to the list
const addService = () => {
  if (serviceForm.serviceId) {  // Only check for serviceId
    const services = [...(data.services || []), serviceForm];
    updateData({ services });
    
    // Reset form
    setServiceForm({
      serviceId: '',
      categoryId: '',
      vendorId: vendorId,
      price: '',
      location: '',
      description: '',
      modeOfService: undefined,
      pricingModel: '',
      currency: 'USD',
      isActive: true,
      photos: [],
    });
  } else {
    toast({ 
      title: 'Please select a service', 
      variant: 'destructive' 
    });
  }
};

// Remove service from the list

  const removeService = (indexToRemove: number) => {
    const services = (data.services || []).filter((_, index) => index !== indexToRemove);
    updateData({ services });
  };

  
  
  // Separate Category Modal Component
  const CategoryModal = ({ 
    showModal, 
    setShowModal, 
    onSubmit 
  }: {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onSubmit: (name: string, description: string, logo: string) => void;
  }) => {
    // Store form state in localStorage
    const [name, setName] = useState(() => {
      const stored = localStorage.getItem('categoryModalName');
      return stored || '';
    });
    const [description, setDescription] = useState(() => {
      const stored = localStorage.getItem('categoryModalDescription');
      return stored || '';
    });
    const [logo, setLogo] = useState(() => {
      const stored = localStorage.getItem('categoryModalLogo');
      return stored || '';
    });

    // Update localStorage when form fields change
    useEffect(() => {
      localStorage.setItem('categoryModalName', name);
      localStorage.setItem('categoryModalDescription', description);
      localStorage.setItem('categoryModalLogo', logo);
    }, [name, description, logo]);

    const handleSubmit = () => {
      onSubmit(name, description, logo);
      // Clear form and localStorage
      setName('');
      setDescription('');
      setLogo('');
      localStorage.removeItem('categoryModalName');
      localStorage.removeItem('categoryModalDescription');
      localStorage.removeItem('categoryModalLogo');
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
              Add a new service category with details and logo to organize your services.
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
      {/* Service and Category Modals */}
      <ServiceModal 
        showModal={showServiceModal}
        setShowModal={handleCloseServiceModal}
        categories={categories}
        onSubmit={createNewService}
        selectedCategoryId ={ serviceForm.categoryId}

      />
      
      <CategoryModal 
        showModal={showCategoryModal}
        setShowModal={handleCloseCategoryModal}
        onSubmit={createNewCategory}
      />

      <h2 className="text-2xl font-bold">Services</h2>
      
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Category *</label>
          <div className="flex items-center">
            <select
              className="w-full p-2 border rounded mr-2"
              value={serviceForm.categoryId}
              onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* <button 
              onClick={() => setShowCategoryModal(true)}
              className="text-blue-500 hover:text-blue-600"
              title="Add New Category"
            >
              <PlusCircle />
            </button> */}
          </div>
        </div>

        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Service *</label>
          <div className="flex items-center">
            <select
              className="w-full p-2 border rounded mr-2"
              value={serviceForm.serviceId}
              onChange={(e) => setServiceForm({ ...serviceForm, serviceId: e.target.value })}
              disabled={!serviceForm.categoryId}
            >
              <option value="">Select Service</option>
              {services
                .filter(service => service.categoryId === serviceForm.categoryId)
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
            </select>
            {/* <button 
              onClick={() => setShowServiceModal(true)}
              className="text-blue-500 hover:text-blue-600"
              title="Add New Service"
              disabled={!serviceForm.categoryId}
            >
              <PlusCircle />
            </button> */}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4">
        

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={serviceForm.price || ''}
            onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={serviceForm.location || ''}
            onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
          />
        </div>

       
        
     
        
        

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={serviceForm.description || ''}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={serviceForm.isActive}
              onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
            />
            <span className="text-sm font-medium">Is Active</span>
          </label>
        </div>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Service Images</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {serviceForm.photos?.map((photoUrl, index) => (
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
          
          {(!serviceForm.photos || serviceForm.photos.length < 4) && (
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
      </div>

      <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={addService}
      disabled={!serviceForm.serviceId}  // Only check for serviceId
    >
      Add Service
    </button>

      {/* Added Services List */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Added Services</h3>
        {data.services?.map((service, index) => {
          const selectedServiceName = services.find(s => s.id === service.serviceId)?.name || 'Unknown Service';
          const selectedCategoryName = categories.find(c => c.id === service.categoryId)?.name || 'Unknown Category';

          return (
            <div key={index} className="p-4 border rounded mt-2 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">{selectedServiceName}</div>
                  <div className="text-sm text-gray-600">
                    Category: {selectedCategoryName} | 
                   
                    Mode: {service.modeOfService || 'N/A'} |
                    Price: {service.price ? `${service.currency} ${service.price}` : 'N/A'}
                  </div>
                  {service.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      Description: {service.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeService(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove Service"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Service Photos */}
              {service.photos && service.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {service.photos.map((photoUrl, photoIndex) => (
                    <div key={photoIndex} className="relative">
                      <img 
                        src={photoUrl} 
                        alt={`Service Photo ${photoIndex + 1}`} 
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

export default VendorServiceForm;


// import React, { useState, useEffect } from 'react';
// import { PlusCircle, Search, Trash2, X } from 'lucide-react';
// import { toast } from '../ui/use-toast';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '../ui/button';
// import { Textarea } from '../ui/textarea';
// import { Label } from '../ui/label';
// import { Input } from '../ui/input';
// import ImageCropper from '../shared/imagecrop/Imagecrop';
// import debounce from 'lodash/debounce';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// // Updated VendorService interface to match API
// interface VendorService {
//   serviceId: string;
//   categoryId?: string;
//   vendorId?: string;
//   price?: string;
//   location?: string;
//   description?: string;
//   modeOfService?: 'online' | 'offline';
//   pricingModel?: string;
//   currency: string;
//   isActive: boolean;
//   photos?: string[];
// }

// // Other interfaces remain the same
// interface Service {
//   id: string;
//   name: string;
//   categoryId: string;
// }

// interface ServiceCategory {
//   id: string;
//   name: string;
// }

// interface VendorServiceFormProps {
//   vendorId?: string;
//   data: {
//     services?: VendorService[];
//   };
//   updateData: (newData: Partial<VendorServiceFormProps['data']>) => void;
// }

// const  VendorServiceForm: React.FC<VendorServiceFormProps> = ({ 
//   vendorId, 
//   data, 
//   updateData,
 
  
// }) => {
//   const [services, setServices] = useState<Service[]>([]);
//   const [categories, setCategories] = useState<ServiceCategory[]>([]);
//   const [showServiceModal, setShowServiceModal] = useState(() => {
//     const stored = localStorage.getItem('showServiceModal');
//     return stored ? JSON.parse(stored) : false;
//   });
//   const [showCategoryModal, setShowCategoryModal] = useState(() => {
//     const stored = localStorage.getItem('showCategoryModal');
//     return stored ? JSON.parse(stored) : false;
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchResults, setSearchResults] = useState<Service[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [selectedService, setSelectedService] = useState<Service | null>(null);

//   const [serviceForm, setServiceForm] = useState<VendorService>(() => {
//     const stored = localStorage.getItem('serviceForm');
//     return stored ? JSON.parse(stored) : {
//       serviceId: '',
//       categoryId: '',
//       vendorId: vendorId,
//       price: '',
//       location: '',
//       description: '',
//       modeOfService: undefined,
//       pricingModel: '',
//       currency: 'USD',
//       isActive: true,
//       photos: [],
//     };
//   });


//   useEffect(() => {
//     localStorage.setItem('showServiceModal', JSON.stringify(showServiceModal));
//   }, [showServiceModal]);

//   useEffect(() => {
//     localStorage.setItem('showCategoryModal', JSON.stringify(showCategoryModal));
//   }, [showCategoryModal]);

//   // Update localStorage when form data changes
//   useEffect(() => {
//     localStorage.setItem('serviceForm', JSON.stringify(serviceForm));
//   }, [serviceForm]);

//     // Clear localStorage when dialogs are closed
//     const handleCloseServiceModal = (show: boolean) => {
//       setShowServiceModal(show);
//       if (!show) {
//         localStorage.removeItem('showServiceModal');
//       }
//     };
  
//     const handleCloseCategoryModal = (show: boolean) => {
//       setShowCategoryModal(show);
//       if (!show) {
//         localStorage.removeItem('showCategoryModal');
//       }
//     };

//     const debouncedSearch = debounce(async (term: string) => {
//       if (!term.trim()) {
//         setSearchResults([]);
//         setIsSearching(false);
//         return;
//       }
  
//       setIsSearching(true);
//       try {
//         const response = await fetch(`/api/service/search?term=${encodeURIComponent(term)}`);
//         if (!response.ok) throw new Error('Search failed');
        
//         const results = await response.json();
//         setSearchResults(results);
//       } catch (error) {
//         console.error('Search error:', error);
//         toast({ 
//           title: 'Error searching services', 
//           variant: 'destructive' 
//         });
//       } finally {
//         setIsSearching(false);
//       }
//     }, 300);
  
//     // Handle search input change
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const term = e.target.value;
//       setSearchTerm(term);
//       debouncedSearch(term);
//     };
  
//     // Handle service selection from search results
//     const handleServiceSelect = async (service: Service) => {
//       setSelectedService(service);
      
//       try {
//         // Fetch the full service details if needed
//         const response = await fetch(`/api/service/${service.id}`);
//         if (!response.ok) throw new Error('Failed to fetch service details');
        
//         const serviceDetails = await response.json();
        
//         // Update the form with the selected service details
//         setServiceForm(prev => ({
//           ...prev,
//           serviceId: service.id,
//           categoryId: service.categoryId,
//           // Preserve other form fields if they're already filled
//           price: prev.price,
//           location: prev.location,
//           description: prev.description || serviceDetails.description,
//           photos: prev.photos
//         }));
        
//         // Clear search
//         setSearchTerm('');
//         setSearchResults([]);
//       } catch (error) {
//         console.error('Error fetching service details:', error);
//         toast({ 
//           title: 'Error loading service details', 
//           variant: 'destructive' 
//         });
//       }
//     };
//     const ServiceModal = ({ 
//       showModal, 
//       setShowModal, 
//       categories,
//       onSubmit,
//       selectedCategoryId 
//     }: {
//       showModal: boolean;
//       setShowModal: (show: boolean) => void;
//       categories: ServiceCategory[];
//       onSubmit: (name: string, categoryId: string, description: string, image: string) => void;
//       selectedCategoryId: any; // Required prop now
//     }) => {
//       const [name, setName] = useState(() => {
//         const stored = localStorage.getItem('serviceModalName');
//         return stored || '';
//       });
//       const [description, setDescription] = useState(() => {
//         const stored = localStorage.getItem('serviceModalDescription');
//         return stored || '';
//       });
//       const [image, setImage] = useState(() => {
//         const stored = localStorage.getItem('serviceModalImage');
//         return stored || '';
//       });
    
//       // Find the selected category name
//       const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    
//       // Update localStorage when form fields change
//       useEffect(() => {
//         localStorage.setItem('serviceModalName', name);
//         localStorage.setItem('serviceModalDescription', description);
//         localStorage.setItem('serviceModalImage', image);
//       }, [name, description, image]);
    
//       const handleSubmit = () => {
//         onSubmit(name, selectedCategoryId, description, image);
//         // Clear form and localStorage
//         setName('');
//         setDescription('');
//         setImage('');
//         localStorage.removeItem('serviceModalName');
//         localStorage.removeItem('serviceModalDescription');
//         localStorage.removeItem('serviceModalImage');
//       };
    
//       const handleCroppedImage = (croppedImage: string) => {
//         setImage(croppedImage);
//       };
    
//       const handleRemoveImage = () => {
//         setImage('');
//       };
    
//       return (
//         <Dialog open={showModal} onOpenChange={setShowModal}>
//           <DialogContent className="sm:max-w-[525px]">
//             <DialogHeader>
//               <DialogTitle>Create New Service</DialogTitle>
//               <DialogDescription>
//                 Add a new service with details and featured image to your catalog.
//               </DialogDescription>
//             </DialogHeader>
    
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Service Name</Label>
//                 <Input
//                   id="name"
//                   placeholder="Enter service name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                 />
//               </div>
    
//               <div className="space-y-2">
//                 <Label>Category</Label>
//                 <div className="p-2 bg-gray-50 border rounded-md">
//                   {selectedCategory?.name || 'Unknown Category'}
//                 </div>
//               </div>
    
//               <div className="space-y-2">
//                 <Label>Service Image</Label>
//                 <div className="space-y-3">
//                   <ImageCropper
//                     onImageCropped={handleCroppedImage}
//                     type="logo"
//                   />
//                   {image && (
//                     <div className="relative w-32 group">
//                       <img
//                         src={image}
//                         alt="Service"
//                         className="w-32 h-32 object-cover rounded-lg shadow-md"
//                       />
//                       <button
//                         onClick={handleRemoveImage}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
//                                  opacity-0 group-hover:opacity-100 transition-opacity"
//                         type="button"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
    
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Describe the service"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   rows={4}
//                 />
//               </div>
//             </div>
    
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowModal(false)}
//                 type="button"
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleSubmit}
//                 disabled={!name.trim() || !image}
//                 type="button"
//               >
//                 Create Service
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       );
//     };


//   // Create new category method
//   const createNewCategory = async (name: string, description: string, logo: string) => {
//     if (!name || !logo) {
//       toast({ 
//         title: 'Category name and logo are required', 
//         variant: 'destructive' 
//       });
//       return;
//     }
  
//     try {
//       const response = await fetch('/api/serviceCategory', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           name,
//           description,
//           logo
//         })
//       });
  
//       if (!response.ok) throw new Error('Failed to create category');
  
//       const newCategory = await response.json();
//       setCategories([...categories, newCategory]);
//       setServiceForm(prev => ({ 
//         ...prev, 
//         categoryId: newCategory.id 
//       }));
  
//       setShowCategoryModal(false);
//       toast({ 
//         title: 'Category created successfully', 
//         variant: 'default' 
//       });
//     } catch (error) {
//       console.error('Error creating category:', error);
//       toast({ 
//         title: 'Error creating category', 
//         variant: 'destructive' 
//       });
//     }
//   };

// // Fetch services and categories on component mount
// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const categoriesResponse = await fetch('/api/serviceCategory');
//       if (!categoriesResponse.ok) {
//         throw new Error('Failed to fetch categories');
//       }
//       const categoriesData = await categoriesResponse.json();
//       setCategories(categoriesData);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       toast({ 
//         title: 'Error fetching categories', 
//         variant: 'destructive' 
//       });
//     }
//   };
//   fetchData();
// }, []);

// useEffect(() => {
//   const fetchServices = async () => {
//     // Only fetch services if a category is selected
//     if (!serviceForm.categoryId) {
//       setServices([]);
//       return;
//     }

//     try {
//       const servicesResponse = await fetch(`/api/service?categoryId=${serviceForm.categoryId}`);
//       if (!servicesResponse.ok) {
//         throw new Error('Failed to fetch services');
//       }
//       const servicesData = await servicesResponse.json();
//       setServices(servicesData);
//     } catch (error) {
//       console.error('Error fetching services:', error);
//       toast({ 
//         title: 'Error fetching services', 
//         variant: 'destructive' 
//       });
//     }
//   };
  
//   fetchServices();
// }, [serviceForm.categoryId]); // Trigger fetch when category changes

// const createNewService = async (name: string, categoryId: string, description: string, image: string) => {
//   if (!name || !categoryId || !image) {
//     toast({ 
//       title: 'Service name, category, and image are required', 
//       variant: 'destructive' 
//     });
//     return;
//   }

//   try {
//     const response = await fetch('/api/service', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         name,
//         categoryId,
//         description,
//         image
//       })
//     });

//     if (!response.ok) throw new Error('Failed to create service');

//     const newService = await response.json();
//     setServices([...services, newService]);
//     setServiceForm(prev => ({ 
//       ...prev, 
//       serviceId: newService.id 
//     }));

//     setShowServiceModal(false);
//     toast({ 
//       title: 'Service created successfully', 
//       variant: 'default' 
//     });
//   } catch (error) {
//     console.error('Error creating service:', error);
//     toast({ 
//       title: 'Error creating service', 
//       variant: 'destructive' 
//     });
//   }
// };
// // Image upload handler
// const handleImageUpload = async (file: File) => {
//   if (serviceForm.photos && serviceForm.photos.length >= 4) {
//     toast({ 
//       title: 'Maximum 4 images allowed', 
//       variant: 'destructive' 
//     });
//     return;
//   }

//   try {
//     const formData = new FormData();
//     formData.append('image', file);
    
//     const response = await fetch('/api/media/upload', { 
//       method: 'POST', 
//       body: formData 
//     });
    
//     if (!response.ok) throw new Error('Upload failed');
    
//     const { url } = await response.json();
    
//     // Update form state with new photo
//     const newPhotos = [...(serviceForm.photos || []), url];
//     setServiceForm(prev => ({ ...prev, photos: newPhotos }));
    
//     toast({ 
//       title: 'Image uploaded', 
//       variant: 'default' 
//     });
//   } catch (error) {
//     console.error('Image upload error:', error);
//     toast({ 
//       title: 'Error uploading image', 
//       variant: 'destructive' 
//     });
//   }
// };

// // Remove image handler
// const removeImage = (indexToRemove: number) => {
//   const newPhotos = (serviceForm.photos || []).filter((_, index) => index !== indexToRemove);
//   setServiceForm(prev => ({ ...prev, photos: newPhotos }));
// };

// // Add service to the list
// const addService = () => {
//   if (serviceForm.serviceId) {  // Only check for serviceId
//     const services = [...(data.services || []), serviceForm];
//     updateData({ services });
    
//     // Reset form
//     setServiceForm({
//       serviceId: '',
//       categoryId: '',
//       vendorId: vendorId,
//       price: '',
//       location: '',
//       description: '',
//       modeOfService: undefined,
//       pricingModel: '',
//       currency: 'USD',
//       isActive: true,
//       photos: [],
//     });
//   } else {
//     toast({ 
//       title: 'Please select a service', 
//       variant: 'destructive' 
//     });
//   }
// };

// // Remove service from the list

//   const removeService = (indexToRemove: number) => {
//     const services = (data.services || []).filter((_, index) => index !== indexToRemove);
//     updateData({ services });
//   };

  
  
//   // Separate Category Modal Component
//   const CategoryModal = ({ 
//     showModal, 
//     setShowModal, 
//     onSubmit 
//   }: {
//     showModal: boolean;
//     setShowModal: (show: boolean) => void;
//     onSubmit: (name: string, description: string, logo: string) => void;
//   }) => {
//     // Store form state in localStorage
//     const [name, setName] = useState(() => {
//       const stored = localStorage.getItem('categoryModalName');
//       return stored || '';
//     });
//     const [description, setDescription] = useState(() => {
//       const stored = localStorage.getItem('categoryModalDescription');
//       return stored || '';
//     });
//     const [logo, setLogo] = useState(() => {
//       const stored = localStorage.getItem('categoryModalLogo');
//       return stored || '';
//     });

//     // Update localStorage when form fields change
//     useEffect(() => {
//       localStorage.setItem('categoryModalName', name);
//       localStorage.setItem('categoryModalDescription', description);
//       localStorage.setItem('categoryModalLogo', logo);
//     }, [name, description, logo]);

//     const handleSubmit = () => {
//       onSubmit(name, description, logo);
//       // Clear form and localStorage
//       setName('');
//       setDescription('');
//       setLogo('');
//       localStorage.removeItem('categoryModalName');
//       localStorage.removeItem('categoryModalDescription');
//       localStorage.removeItem('categoryModalLogo');
//     };
  
//     const handleCroppedImage = (croppedImage: string) => {
//       setLogo(croppedImage);
//     };
  
//     const handleRemoveImage = () => {
//       setLogo('');
//     };
  
//     return (
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[525px]">
//           <DialogHeader>
//             <DialogTitle>Create New Category</DialogTitle>
//             <DialogDescription>
//               Add a new service category with details and logo to organize your services.
//             </DialogDescription>
//           </DialogHeader>
  
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Category Name</Label>
//               <Input
//                 id="name"
//                 placeholder="Enter category name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </div>
  
//             <div className="space-y-2">
//               <Label>Category Logo</Label>
//               <div className="space-y-3">
//                 <ImageCropper
//                   onImageCropped={handleCroppedImage}
                 
//                   type="logo"
//                 />
//                 {logo && (
//                   <div className="relative w-32 group">
//                     <img
//                       src={logo}
//                       alt="Category logo"
//                       className="w-32 h-32 object-cover rounded-lg shadow-md"
//                     />
//                     <button
//                       onClick={handleRemoveImage}
//                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
//                                opacity-0 group-hover:opacity-100 transition-opacity"
//                       type="button"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
  
//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 placeholder="Describe the category"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 rows={4}
//               />
//             </div>
//           </div>
  
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowModal(false)}
//               type="button"
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleSubmit}
//               disabled={!name.trim() || !logo}
//               type="button"
//             >
//               Create Category
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {/* Service and Category Modals */}
//       <ServiceModal 
//         showModal={showServiceModal}
//         setShowModal={handleCloseServiceModal}
//         categories={categories}
//         onSubmit={createNewService}
//         selectedCategoryId={serviceForm.categoryId}
//       />
      
//       <CategoryModal 
//         showModal={showCategoryModal}
//         setShowModal={handleCloseCategoryModal}
//         onSubmit={createNewCategory}
//       />

//       <h2 className="text-2xl font-bold">Services</h2>
      
//       <div className="flex items-center space-x-2">
//         <div className="flex-grow">
//           <label className="block text-sm font-medium mb-1">Category *</label>
//           <div className="flex items-center">
//             <select
//               className="w-full p-2 border rounded mr-2"
//               value={serviceForm.categoryId}
//               onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
//             >
//               <option value="">Select Category</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//             <button 
//               onClick={() => setShowCategoryModal(true)}
//               className="text-blue-500 hover:text-blue-600"
//               title="Add New Category"
//             >
//               <PlusCircle />
//             </button>
//           </div>
//         </div>

//         <div className="flex-grow">
//           <label className="block text-sm font-medium mb-1">Search Service *</label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               className="w-full pl-10 p-2 border rounded"
//               placeholder="Search for a service..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             {isSearching && (
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
//               </div>
//             )}
//           </div>
          
//           {/* Search Results Dropdown */}
//           {searchResults.length > 0 && searchTerm && (
//             <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
//               {searchResults.map((service) => (
//                 <div
//                   key={service.id}
//                   className="p-2 hover:bg-gray-100 cursor-pointer"
//                   onClick={() => handleServiceSelect(service)}
//                 >
//                   <div className="font-medium">{service.name}</div>
//                   <div className="text-sm text-gray-600">
//                     {categories.find(c => c.id === service.categoryId)?.name}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           {/* No Results Message with Add Service Button */}
//           {searchTerm && !isSearching && searchResults.length === 0 && (
//             <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4">
//               <p className="text-gray-600 mb-2">No services found</p>
//               <Button
//                 onClick={() => {
//                   setShowServiceModal(true);
//                   setSearchTerm('');
//                 }}
//                 className="w-full"
//               >
//                 <PlusCircle className="w-4 h-4 mr-2" />
//                 Add New Service
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>


//       <div className="grid grid-cols-2 gap-4">
        

//         <div>
//           <label className="block text-sm font-medium mb-1">Price</label>
//           <input
//             type="text"
//             className="w-full p-2 border rounded"
//             value={serviceForm.price || ''}
//             onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Location</label>
//           <input
//             type="text"
//             className="w-full p-2 border rounded"
//             value={serviceForm.location || ''}
//             onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
//           />
//         </div>

       
        
     
        
        

//         <div className="col-span-2">
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <textarea
//             className="w-full p-2 border rounded"
//             rows={3}
//             value={serviceForm.description || ''}
//             onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
//           />
//         </div>
        
//         <div className="flex items-center">
//           <label className="flex items-center">
//             <input
//               type="checkbox"
//               className="mr-2"
//               checked={serviceForm.isActive}
//               onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
//             />
//             <span className="text-sm font-medium">Is Active</span>
//           </label>
//         </div>
//       </div>

//       {/* Image Upload Section */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Service Images</label>
//         <div className="grid grid-cols-4 gap-2 mb-4">
//           {serviceForm.photos?.map((photoUrl, index) => (
//             <div key={index} className="relative">
//               <img 
//                 src={photoUrl} 
//                 alt={`Uploaded ${index + 1}`} 
//                 className="w-full h-20 object-cover rounded-md"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(index)}
//                 className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           ))}
          
//           {(!serviceForm.photos || serviceForm.photos.length < 4) && (
//             <label className="cursor-pointer flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-md">
//               <input
//                 type="file"
//                 className="hidden"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (file) handleImageUpload(file);
//                 }}
//               />
//               <span className="text-gray-400">+ Add Image</span>
//             </label>
//           )}
//         </div>
//       </div>

//       <button
//       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       onClick={addService}
//       disabled={!serviceForm.serviceId}  // Only check for serviceId
//     >
//       Add Service
//     </button>

//       {/* Added Services List */}
//       <div className="mt-4">
//         <h3 className="text-lg font-semibold">Added Services</h3>
//         {data.services?.map((service, index) => {
//           const selectedServiceName = services.find(s => s.id === service.serviceId)?.name || 'Unknown Service';
//           const selectedCategoryName = categories.find(c => c.id === service.categoryId)?.name || 'Unknown Category';

//           return (
//             <div key={index} className="p-4 border rounded mt-2 bg-gray-50">
//               <div className="flex justify-between items-center mb-2">
//                 <div>
//                   <div className="font-medium">{selectedServiceName}</div>
//                   <div className="text-sm text-gray-600">
//                     Category: {selectedCategoryName} | 
                   
//                     Mode: {service.modeOfService || 'N/A'} |
//                     Price: {service.price ? `${service.currency} ${service.price}` : 'N/A'}
//                   </div>
//                   {service.description && (
//                     <div className="text-sm text-gray-600 mt-1">
//                       Description: {service.description}
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => removeService(index)}
//                   className="text-red-500 hover:text-red-700"
//                   title="Remove Service"
//                 >
//                   <Trash2 size={20} />
//                 </button>
//               </div>

//               {/* Service Photos */}
//               {service.photos && service.photos.length > 0 && (
//                 <div className="grid grid-cols-4 gap-2 mt-2">
//                   {service.photos.map((photoUrl, photoIndex) => (
//                     <div key={photoIndex} className="relative">
//                       <img 
//                         src={photoUrl} 
//                         alt={`Service Photo ${photoIndex + 1}`} 
//                         className="w-full h-20 object-cover rounded-md"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default VendorServiceForm;