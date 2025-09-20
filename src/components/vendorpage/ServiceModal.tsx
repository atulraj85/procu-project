import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: (service: Partial<Service>) => void;
}

interface Service {
  id?: string;
  name: string;
  categoryId: string;
  description?: string;
  requiredCertifications?: string[];
  isActive: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onServiceCreated }) => {
  const [newService, setNewService] = useState<Service>({
    name: '',
    categoryId: '',
    description: '',
    requiredCertifications: [],
    isActive: true
  });

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/serviceCategory');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
      });

      if (!response.ok) {
        throw new Error('Service creation failed');
      }

      const createdService = await response.json();
      onServiceCreated(createdService);
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/serviceCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) {
        throw new Error('Category creation failed');
      }

      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setNewService(prev => ({ ...prev, categoryId: createdCategory.id }));
      setIsAddingCategory(false);
      setNewCategory({ name: '', description: '', isActive: true });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Service</h2>
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name *</label>
            <Input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({...newService, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            {!isAddingCategory ? (
              <div className="flex items-center space-x-2">
                <Select 
                  value={newService.categoryId} 
                  onValueChange={(value) => setNewService({...newService, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingCategory(true)}
                >
                  Add New
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddCategory} className="space-y-2">
                <Input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                />
                <Input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  />
                  <span>Is Active</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    variant="default"
                  >
                    Create Category
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAddingCategory(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({...newService, description: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newService.isActive}
              onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
              className="mr-2"
            />
            <span>Is Active</span>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default"
            >
              Create Service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;