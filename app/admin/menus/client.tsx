'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, Edit, Trash2, Filter, Plus, X, Image as ImageIcon, Check, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { addMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemActiveState } from './actions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenuItems, getCategories, getFoodTruck } from '@/app/admin/clientQueries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createFilePreview, revokeFilePreview, isBlobUrl } from '@/utils/file-utils'
import { ImageEditorModal } from '@/app/components/ImageEditorModal'

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  food_truck_id: string;
  active: boolean;
}

export default function MenuClient() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Form states
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null)
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    active: true
  })
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Active toggle confirmation
  const [showActiveDialog, setShowActiveDialog] = useState(false)
  const [itemToToggle, setItemToToggle] = useState<{id: string, active: boolean} | null>(null)

  // Add new state variables for the image editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingFileUrl, setEditingFileUrl] = useState<string | null>(null);

  // React Query hooks for data fetching
  const { data: foodTruck, isLoading: isFoodTruckLoading } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  })

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      if (editingFileUrl && editingFileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editingFileUrl);
      }
    };
  }, [previewUrl, editingFileUrl]);

  const { 
    data: menuItems = [], 
    isLoading: isMenuLoading,
    error: menuError
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
    enabled: !!foodTruck?.id
  })

  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: getCategories,
    enabled: !!foodTruck?.id
  })

  // React Query mutations
  const addMenuItemMutation = useMutation({
    mutationFn: (menuData: {
      name: string,
      description: string,
      price: number,
      category: string,
      image_url: string,
      active: boolean
    }) => addMenuItem(menuData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
      toast.success('Menu item added successfully')
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`Error adding menu item: ${error.message || 'Unknown error'}`)
      setError(error.message || 'An unknown error occurred')
    }
  })

  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, menuData }: { 
      id: string, 
      menuData: {
        name: string,
        description: string,
        price: number,
        category: string,
        image_url: string,
        active: boolean
      }
    }) => updateMenuItem(id, menuData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
      toast.success('Menu item updated successfully')
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`Error updating menu item: ${error.message || 'Unknown error'}`)
      setError(error.message || 'An unknown error occurred')
    }
  })

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
      toast.success('Menu item deleted successfully')
      setItemToDelete(null)
      setShowDeleteDialog(false)
    },
    onError: (error: any) => {
      toast.error(`Error deleting menu item: ${error.message || 'Unknown error'}`)
      setError(error.message || 'An unknown error occurred')
    }
  })

  const updateActiveStateMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => 
      updateMenuItemActiveState(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      toast.success('Menu item visibility updated')
      setItemToToggle(null)
      setShowActiveDialog(false)
    },
    onError: (error: any) => {
      toast.error(`Error updating menu item visibility: ${error.message || 'Unknown error'}`)
      setError(error.message || 'An unknown error occurred')
    }
  })

  // Handle file selection with image editor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    if (file) {
      // Clean up previous preview URL if exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Open the image editor
      const filePreviewUrl = createFilePreview(file);
      setEditingFile(file);
      setEditingFileUrl(filePreviewUrl);
      setIsEditorOpen(true);
      
      // Clear file input value so same file can be selected again
      e.target.value = '';
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }
  
  // Add handler for saving cropped image
  const handleSaveCrop = (croppedImageBlob: Blob) => {
    if (!editingFile) return;
    
    // Create a File object from the Blob
    const croppedFile = new File([croppedImageBlob], editingFile.name, {
      type: croppedImageBlob.type,
    });
    
    // Create a new preview URL for the cropped file
    const croppedPreviewUrl = createFilePreview(croppedFile);
    
    // Update state with the cropped image
    setSelectedFile(croppedFile);
    setPreviewUrl(croppedPreviewUrl);
    
    // Revoke the original (uncropped) preview URL
    if (editingFileUrl) {
      revokeFilePreview(editingFileUrl);
    }
    
    // Reset editor state
    setIsEditorOpen(false);
    setEditingFile(null);
    setEditingFileUrl(null);
    
    toast.success('Image cropped successfully');
  };
  
  // Add handler for canceling crop
  const handleCancelCrop = () => {
    if (editingFileUrl) {
      revokeFilePreview(editingFileUrl);
    }
    setIsEditorOpen(false);
    setEditingFile(null);
    setEditingFileUrl(null);
  };
  
  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${fileName}`
      
      // Use the existing bucket - don't try to create it
      const bucketName = 'menu-images'
      
      // Upload the file
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)
      
      return urlData.publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
    }
  }

  // Add a new menu item
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form
      if (!menuForm.name || !menuForm.price || !menuForm.category) {
        setError('Name, price, and category are required')
        return
      }
      
      // Upload image if selected
      let imageUrl = menuForm.image_url
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }
      
      // Add the new menu item using mutation
      addMenuItemMutation.mutate({
        name: menuForm.name,
        description: menuForm.description,
        price: parseFloat(menuForm.price),
        category: menuForm.category,
        image_url: imageUrl,
        active: menuForm.active
      })
    } catch (err: any) {
      console.error('Error adding menu item:', err)
      setError(err.message || 'An unknown error occurred')
    }
  }

  // Update an existing menu item
  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingMenuItem) return
    
    try {
      // Validate form
      if (!menuForm.name || !menuForm.price || !menuForm.category) {
        setError('Name, price, and category are required')
        return
      }
      
      // Upload image if selected
      let imageUrl = menuForm.image_url
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }
      
      // Update the menu item using mutation
      updateMenuItemMutation.mutate({
        id: editingMenuItem.id,
        menuData: {
          name: menuForm.name,
          description: menuForm.description,
          price: parseFloat(menuForm.price),
          category: menuForm.category,
          image_url: imageUrl,
          active: menuForm.active
        }
      })
    } catch (err: any) {
      console.error('Error updating menu item:', err)
      setError(err.message || 'Failed to update menu item')
    }
  }

  // Reset form state
  const resetForm = () => {
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      active: true
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setEditingMenuItem(null)
    setShowMenuForm(false)
  }

  // Start editing a menu item
  const startEditing = (item: MenuItemType) => {
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      active: item.active
    })
    setPreviewUrl(item.image_url || null)
    setSelectedFile(null)
    setEditingMenuItem(item)
    setShowMenuForm(true)
  }

  // Filter menu items by category and active state
  const filteredMenuItems = menuItems
    .filter(item => categoryFilter ? item.category === categoryFilter : true)
    .filter(item => activeFilter !== null ? item.active === activeFilter : true)

  // Open delete confirmation dialog
  const confirmDelete = (id: string) => {
    setItemToDelete(id)
    setShowDeleteDialog(true)
  }

  // Handle delete confirmation
  const handleDeleteMenuItem = () => {
    if (!itemToDelete) return
    deleteMenuItemMutation.mutate(itemToDelete)
  }

  // Open active toggle confirmation dialog
  const confirmActiveToggle = (id: string, currentActive: boolean) => {
    setItemToToggle({ id, active: !currentActive })
    setShowActiveDialog(true)
  }

  // Handle active toggle confirmation
  const handleActiveToggle = () => {
    if (!itemToToggle) return
    updateActiveStateMutation.mutate(itemToToggle)
  }

  // Loading state
  const isLoading = isFoodTruckLoading || isMenuLoading;
  const isSubmitting = addMenuItemMutation.isPending || updateMenuItemMutation.isPending;

  // Show error when food truck data cannot be retrieved
  if (!isFoodTruckLoading && !foodTruck) {
    return (
      <div className="space-y-6">
        <Card className="border border-admin-border bg-admin-card text-admin-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>No Food Truck Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please complete your profile setup first before managing menu items.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-md px-4 py-3 relative flex items-center justify-between">
          <span className="block">{error}</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setError(null)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Category Filter */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-card-foreground">Filter Options</CardTitle>
          <CardDescription className="text-admin-muted-foreground">
            Filter your menu by category and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-admin-muted-foreground mb-2 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-ring cursor-pointer ${
                    categoryFilter === null 
                      ? 'bg-admin-primary text-admin-primary-foreground border-transparent' 
                      : 'border border-admin-border bg-transparent text-admin-card-foreground hover:bg-admin-accent/50'
                  }`}
                  onClick={() => setCategoryFilter(null)}
                >
                  All
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-ring cursor-pointer ${
                      categoryFilter === category 
                        ? 'bg-admin-primary text-admin-primary-foreground border-transparent' 
                        : 'border border-admin-border bg-transparent text-admin-card-foreground hover:bg-admin-accent/50'
                    }`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-admin-muted-foreground mb-2 block">Status</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-ring cursor-pointer ${
                    activeFilter === null 
                      ? 'bg-admin-primary text-admin-primary-foreground border-transparent' 
                      : 'border border-admin-border bg-transparent text-admin-card-foreground hover:bg-admin-accent/50'
                  }`}
                  onClick={() => setActiveFilter(null)}
                >
                  All
                </button>
                <button
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-ring cursor-pointer ${
                    activeFilter === true 
                      ? 'bg-admin-primary text-admin-primary-foreground border-transparent' 
                      : 'border border-admin-border bg-transparent text-admin-card-foreground hover:bg-admin-accent/50'
                  }`}
                  onClick={() => setActiveFilter(true)}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Active
                </button>
                <button
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-ring cursor-pointer ${
                    activeFilter === false 
                      ? 'bg-admin-primary text-admin-primary-foreground border-transparent' 
                      : 'border border-admin-border bg-transparent text-admin-card-foreground hover:bg-admin-accent/50'
                  }`}
                  onClick={() => setActiveFilter(false)}
                >
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hidden
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Menu Item Form Dialog */}
      <Dialog open={showMenuForm} onOpenChange={setShowMenuForm}>
        <DialogContent className="sm:max-w-[600px] bg-admin-card border-admin-border text-admin-card-foreground shadow-lg backdrop-blur-sm bg-opacity-95">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              {editingMenuItem 
                ? 'Update the details of your menu item. Images will be cropped to a square format.' 
                : 'Fill in the details to add a new menu item to your food truck. Images will be cropped to a square format.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}>
            <div className="grid gap-4 py-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-admin-card-foreground">Name</Label>
                  <Input
                    id="name"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                    placeholder="Taco Supreme"
                    required
                    className="bg-transparent text-admin-card-foreground border-admin-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-admin-card-foreground">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                    placeholder="9.99"
                    required
                    className="bg-transparent text-admin-card-foreground border-admin-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-admin-card-foreground">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                  placeholder="Delicious taco with all the fixings..."
                  className="bg-transparent text-admin-card-foreground border-admin-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-admin-card-foreground">Category</Label>
                <div className="space-y-2">
                  {showCustomCategoryInput ? (
                    <div className="flex gap-2 relative animate-in slide-in-from-right-2 duration-200">
                      <Input
                        id="custom-category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter a new category"
                        className="bg-transparent text-admin-card-foreground border-admin-border flex-1"
                        autoFocus
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-admin-border text-admin-card-foreground hover:bg-admin-accent/20"
                        onClick={(e) => {
                          // Prevent event from bubbling up to parent elements
                          e.preventDefault();
                          e.stopPropagation();
                          if (customCategory.trim()) {
                            // Update local categories list with the new category and set it as selected
                            if (!categories.includes(customCategory.trim())) {
                              queryClient.setQueryData(['menuCategories'], [...categories, customCategory.trim()]);
                            }
                            setMenuForm({...menuForm, category: customCategory.trim()});
                            setShowCustomCategoryInput(false);
                          }
                        }}
                      >
                        Add
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCustomCategoryInput(false);
                        }}
                        className="h-10 px-3 rounded-md inline-flex items-center justify-center bg-transparent text-admin-destructive hover:text-white hover:bg-admin-destructive/90 transition-all duration-200 border border-admin-destructive"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select 
                        value={menuForm.category}
                        onValueChange={(value) => setMenuForm({...menuForm, category: value})}
                      >
                        <SelectTrigger className="bg-transparent text-admin-card-foreground border-admin-border w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-admin-card text-admin-card-foreground border-admin-border">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-admin-border text-admin-card-foreground hover:bg-admin-accent/20 transition-all duration-200 group"
                        onClick={(e) => {
                          // Prevent event from bubbling up to parent elements
                          e.preventDefault();
                          e.stopPropagation();
                          setCustomCategory('')
                          setShowCustomCategoryInput(true)
                        }}
                        // Prevent the mousedown event from closing the select dropdown
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1 transition-transform group-hover:rotate-90" />
                        New
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-admin-card-foreground">Image</Label>
                <div className="flex flex-col items-center gap-2">
                  <Input
                    id="image_url"
                    value={menuForm.image_url}
                    onChange={(e) => setMenuForm({...menuForm, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-full max-w-[200px] mx-auto">
                    <div className="flex items-center justify-center border-2 border-dashed border-admin-border rounded-md aspect-square overflow-hidden relative">
                      {previewUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 bg-admin-destructive text-admin-destructive-foreground"
                            onClick={() => {
                              setSelectedFile(null)
                              setPreviewUrl(null)
                              setMenuForm({...menuForm, image_url: ''})
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center cursor-pointer h-full w-full p-4"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-8 w-8 text-admin-muted-foreground" />
                          <p className="text-sm text-admin-muted-foreground mt-2 text-center">Click to upload image</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-admin-muted-foreground text-center mt-1">
                    Upload a square image for your menu item. Images will be cropped to 1:1 ratio.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-state"
                  checked={menuForm.active}
                  onCheckedChange={(checked) => setMenuForm({...menuForm, active: checked})}
                  className={menuForm.active ? 'bg-admin-primary' : 'bg-admin-muted'}
                />
                <Label htmlFor="active-state" className="text-admin-card-foreground">
                  {menuForm.active ? 'Item is active and visible to customers' : 'Item is hidden from customers'}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowMenuForm(false)}
                className="border-admin-border text-admin-card-foreground hover:bg-admin-accent hover:text-admin-accent-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    {editingMenuItem ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingMenuItem ? 'Update Item' : 'Add Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-card-foreground shadow-lg backdrop-blur-sm bg-opacity-95">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-admin-border text-admin-card-foreground hover:bg-admin-accent hover:text-admin-accent-foreground"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMenuItem}
              disabled={deleteMenuItemMutation.isPending}
              className="bg-admin-destructive text-admin-destructive-foreground"
            >
              {deleteMenuItemMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Active Toggle Confirmation Dialog */}
      <Dialog open={showActiveDialog} onOpenChange={setShowActiveDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-card-foreground shadow-lg backdrop-blur-sm bg-opacity-95">
          <DialogHeader>
            <DialogTitle>
              {itemToToggle?.active ? 'Activate Menu Item' : 'Deactivate Menu Item'}
            </DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              {itemToToggle?.active 
                ? 'This item will be visible to customers. Do you want to proceed?' 
                : 'This item will be hidden from customers. Do you want to proceed?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowActiveDialog(false)}
              className="border-admin-border text-admin-card-foreground hover:bg-admin-accent hover:text-admin-accent-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleActiveToggle}
              disabled={updateActiveStateMutation.isPending}
              className={itemToToggle?.active 
                ? "bg-admin-primary text-admin-primary-foreground hover:bg-admin-primary/90" 
                : "bg-admin-destructive text-admin-destructive-foreground hover:bg-admin-destructive/90"}
            >
              {updateActiveStateMutation.isPending 
                ? 'Updating...' 
                : itemToToggle?.active 
                  ? 'Activate' 
                  : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Render the ImageEditorModal */}
      {editingFileUrl && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={handleCancelCrop}
          imageSrc={editingFileUrl}
          aspect={1} // Force square aspect ratio (1:1)
          circularCrop={false}
          onSave={handleSaveCrop}
        />
      )}
      
      {/* Menu Items Section */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-admin-card-foreground">
              Menu Items {categoryFilter ? `(${categoryFilter})` : ''}{activeFilter !== null ? ` (${activeFilter ? 'Active' : 'Hidden'})` : ''}
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              {filteredMenuItems.length} items in your menu
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(categoryFilter || activeFilter !== null) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setCategoryFilter(null)
                  setActiveFilter(null)
                }}
                className="h-8 text-admin-muted-foreground hover:text-admin-card-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <Button 
              onClick={() => {
                setEditingMenuItem(null)
                setMenuForm({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  image_url: '',
                  active: true
                })
                setShowMenuForm(true)
              }}
              className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white hover:shadow-lg transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-8 text-admin-muted-foreground">
              <p>No menu items found</p>
              <Button 
                variant="outline" 
                className="mt-4 border-admin-border hover:bg-admin-accent hover:text-admin-accent-foreground"
                onClick={() => {
                  setEditingMenuItem(null)
                  setMenuForm({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    image_url: '',
                    active: true
                  })
                  setShowMenuForm(true)
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden border ${item.active ? 'border-admin-border' : 'border-admin-destructive/30'} bg-admin-card hover:shadow-md transition-all duration-200 ${!item.active ? 'opacity-70' : ''}`}
                >
                  <div className="relative w-full aspect-square">
                    {!item.active && (
                      <div className="absolute top-0 right-0 z-10 m-2">
                        <Badge variant="destructive" className="bg-admin-destructive text-admin-destructive-foreground">
                          <EyeOff className="h-3 w-3 mr-1" /> Hidden
                        </Badge>
                      </div>
                    )}
                    <Image
                      src={item.image_url || "/placeholder-hero.jpg"}
                      alt={item.name}
                      fill
                      className={`object-cover ${!item.active ? 'grayscale' : ''}`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-hero.jpg";
                      }}
                    />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-admin-card-foreground">{item.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 border-admin-border">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-admin-primary">${item.price.toFixed(2)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-admin-muted-foreground line-clamp-2">
                      {item.description || "No description provided"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-admin-muted-foreground">
                        {item.active ? 'Active' : 'Hidden'}
                      </div>
                      <Switch
                        checked={item.active}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling
                          confirmActiveToggle(item.id, item.active);
                        }}
                        className={item.active ? 'bg-admin-primary' : 'bg-admin-muted'}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startEditing(item)}
                        disabled={updateMenuItemMutation.isPending || deleteMenuItemMutation.isPending}
                        className="border-admin-border text-admin-card-foreground hover:bg-admin-accent hover:text-admin-accent-foreground"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(item.id)}
                        disabled={updateMenuItemMutation.isPending || deleteMenuItemMutation.isPending}
                        className="bg-admin-destructive text-admin-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 