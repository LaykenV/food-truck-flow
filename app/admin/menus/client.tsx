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
import { PlusCircle, Edit, Trash2, Filter, Plus, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { addMenuItem, updateMenuItem, deleteMenuItem } from './actions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenuItems, getCategories, getFoodTruck } from '@/app/admin/clientQueries'

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  food_truck_id: string;
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
    image_url: ''
  })
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // React Query hooks for data fetching
  const { data: foodTruck, isLoading: isFoodTruckLoading } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  })

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
      image_url: string
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
        image_url: string
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    
    // Create preview URL
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }
  
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
        image_url: imageUrl
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
          image_url: imageUrl
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
      image_url: ''
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
      image_url: item.image_url || ''
    })
    setPreviewUrl(item.image_url || null)
    setSelectedFile(null)
    setEditingMenuItem(item)
    setShowMenuForm(true)
  }

  // Filter menu items by category
  const filteredMenuItems = categoryFilter
    ? menuItems.filter(item => item.category === categoryFilter)
    : menuItems

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

  // Loading state
  const isLoading = isFoodTruckLoading || isMenuLoading;
  const isSubmitting = addMenuItemMutation.isPending || updateMenuItemMutation.isPending;

  // Show error when food truck data cannot be retrieved
  if (!isFoodTruckLoading && !foodTruck) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">No food truck found</p>
          <p>Please complete your profile setup first before managing menu items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between">
          <span className="block">{error}</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setError(null)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex">
        <Button 
          onClick={() => {
            setEditingMenuItem(null)
            setMenuForm({
              name: '',
              description: '',
              price: '',
              category: '',
              image_url: ''
            })
            setShowMenuForm(true)
          }}
          className="ml-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>
      
      <Separator />
      
      {/* Category Filter */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Filter your menu by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={categoryFilter === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Badge>
            
            {categories.map((category) => (
              <Badge
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Menu Item Form Dialog */}
      <Dialog open={showMenuForm} onOpenChange={setShowMenuForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingMenuItem 
                ? 'Update the details of your menu item' 
                : 'Fill in the details to add a new menu item to your food truck'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                    placeholder="Taco Supreme"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                    placeholder="9.99"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                  placeholder="Delicious taco with all the fixings..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <Input
                    id="category"
                    list="category-suggestions"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                    placeholder="Enter or select a category"
                    required
                  />
                  <datalist id="category-suggestions">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image</Label>
                <div className="flex items-center gap-4">
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
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32 overflow-hidden relative">
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
                          className="absolute top-2 right-2 h-6 w-6"
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
                        className="flex flex-col items-center justify-center cursor-pointer h-full w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Click to upload image</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image for your menu item. Leave blank to use default image.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowMenuForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMenuItem}
              disabled={deleteMenuItemMutation.isPending}
            >
              {deleteMenuItemMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Menu Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Menu Items {categoryFilter ? `(${categoryFilter})` : ''}</span>
            {categoryFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCategoryFilter(null)}
                className="h-8"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filter
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {filteredMenuItems.length} items in your menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No menu items found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setEditingMenuItem(null)
                  setMenuForm({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    image_url: ''
                  })
                  setShowMenuForm(true)
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={item.image_url || "/placeholder-hero.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
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
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description || "No description provided"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEditing(item)}
                      disabled={updateMenuItemMutation.isPending || deleteMenuItemMutation.isPending}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => confirmDelete(item.id)}
                      disabled={updateMenuItemMutation.isPending || deleteMenuItemMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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