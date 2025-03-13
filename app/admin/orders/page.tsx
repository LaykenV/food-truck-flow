'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Clock, CookingPot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Define types based on the database schema
type Order = {
  id: string
  food_truck_id: string
  customer_name: string
  customer_email: string
  items: OrderItem[]
  total_amount: number
  status: 'preparing' | 'ready' | 'completed'
  created_at: string
  updated_at: string
  pickup_time: string | null
  is_asap: boolean
}

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
}

type OrderNotification = {
  id: string
  message: string
  timestamp: string
  type: 'new' | 'update' | 'info'
}

// Create new animated components
const AnimatedItem = ({ children, index = 0 }: { children: React.ReactNode, index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 40,
        delay: index * 0.05 // Stagger effect
      }}
      layout
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode, 
  className?: string 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [pickupFilter, setPickupFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [activeTab, setActiveTab] = useState('active')
  const supabase = createClient()

  // Function to apply filter - moved up to avoid reference issues
  const applyFilter = (status: string, ordersList: Order[]) => {
    let filtered: Order[] = []
    
    // First, filter by status
    if (status === 'all') {
      filtered = [...ordersList]
    } else if (status === 'active') {
      filtered = ordersList.filter(order => order.status === 'preparing' || order.status === 'ready')
    } else if (status === 'completed') {
      filtered = ordersList.filter(order => order.status === 'completed')
    } else {
      filtered = ordersList.filter(order => order.status === status)
    }
    
    // Then, filter by pickup time
    if (pickupFilter !== 'all') {
      if (pickupFilter === 'asap') {
        filtered = filtered.filter(order => order.is_asap)
      } else if (pickupFilter === 'scheduled') {
        filtered = filtered.filter(order => !order.is_asap && order.pickup_time)
      } else if (pickupFilter === 'upcoming') {
        const now = new Date()
        filtered = filtered.filter(order => {
          if (order.is_asap) return false
          if (!order.pickup_time) return false
          const pickupDate = new Date(order.pickup_time)
          return pickupDate > now
        })
      }
    }
    
    // Sort active orders by pickup time (ASAP first, then by pickup time)
    if (status === 'active' || status === 'preparing' || status === 'ready') {
      filtered.sort((a, b) => {
        // ASAP orders come first
        if (a.is_asap && !b.is_asap) return -1
        if (!a.is_asap && b.is_asap) return 1
        
        // If both have pickup times, sort by time
        if (a.pickup_time && b.pickup_time) {
          return new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
        }
        
        // Fall back to created_at for consistent sorting
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    } else {
      // For completed or all orders, sort by created_at (newest first)
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    
    setFilteredOrders(filtered)
  }

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get the current user's food truck ID
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.error('User not authenticated')
          setLoading(false)
          return
        }
        
        // Get the food truck ID for the current user
        const { data: foodTrucks, error: foodTruckError } = await supabase
          .from('FoodTrucks')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (foodTruckError || !foodTrucks) {
          console.error('Error fetching food truck:', foodTruckError)
          setLoading(false)
          return
        }
        
        // Fetch orders for this food truck
        const { data, error } = await supabase
          .from('Orders')
          .select('*')
          .eq('food_truck_id', foodTrucks.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching orders:', error)
        } else {
          const ordersData = data || []
          setOrders(ordersData)
          applyFilter(statusFilter, ordersData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchOrders:', error)
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [supabase, statusFilter, pickupFilter])

  // Modify the real-time subscription handler:
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setupSubscription = async () => {
      try {
        // Get the current user's food truck ID
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return
        
        const { data: foodTrucks, error: foodTruckError } = await supabase
          .from('FoodTrucks')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (foodTruckError || !foodTrucks) return
        
        console.log('Setting up real-time subscription for food truck:', foodTrucks.id)
        
        // First, make sure any existing channel is removed
        if (channel) {
          await supabase.removeChannel(channel)
        }
        
        // Create a unique channel name with a timestamp to avoid conflicts
        const channelName = `orders-changes-${foodTrucks.id}-${Date.now()}`
        console.log('Creating channel:', channelName)
        
        // Make sure realtime is enabled for the Orders table in Supabase
        channel = supabase
          .channel(channelName, {
            config: {
              broadcast: {
                self: false // Change to false to not receive our own updates
              }
            }
          })
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Orders',
              filter: `food_truck_id=eq.${foodTrucks.id}`
            },
            (payload) => {
              console.log('Change received:', payload)
              
              // Handle different types of changes
              if (payload.eventType === 'INSERT') {
                const newOrder = payload.new as Order
                
                // Check if order already exists to prevent duplicates
                setOrders(prevOrders => {
                  if (prevOrders.some(order => order.id === newOrder.id)) {
                    console.log('Duplicate order detected, skipping:', newOrder.id)
                    return prevOrders;
                  }
                  
                  console.log('Adding new order to state:', newOrder.id)
                  const updatedOrders = [newOrder, ...prevOrders]
                  // Update filtered orders based on current filter
                  applyFilter(statusFilter, updatedOrders)
                  return updatedOrders
                })
                
                // Add notification for new order
                const newNotification: OrderNotification = {
                  id: crypto.randomUUID(),
                  message: `New order from ${newOrder.customer_name}`,
                  timestamp: new Date().toISOString(),
                  type: 'new'
                }
                setNotifications(prev => [newNotification, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedOrder = payload.new as Order
                const oldOrder = payload.old as Order
                
                console.log('Updating order in state:', updatedOrder.id)
                
                // Update the orders state
                setOrders(prevOrders => {
                  // Check if the order exists in our state
                  if (!prevOrders.some(order => order.id === updatedOrder.id)) {
                    console.log('Order not found in state, adding it:', updatedOrder.id)
                    const newOrders = [updatedOrder, ...prevOrders]
                    applyFilter(statusFilter, newOrders)
                    return newOrders
                  }
                  
                  const updatedOrders = prevOrders.map(order => 
                    order.id === updatedOrder.id ? updatedOrder : order
                  )
                  // Update filtered orders based on current filter
                  applyFilter(statusFilter, updatedOrders)
                  return updatedOrders
                })
                
                // Only add notification for status changes
                if (oldOrder.status !== updatedOrder.status) {
                  const updateNotification: OrderNotification = {
                    id: crypto.randomUUID(),
                    message: `Order #${updatedOrder.id.substring(0, 8)} updated to ${updatedOrder.status}`,
                    timestamp: new Date().toISOString(),
                    type: 'update'
                  }
                  setNotifications(prev => [updateNotification, ...prev])
                }
              } else if (payload.eventType === 'DELETE') {
                const deletedOrderId = payload.old.id
                
                console.log('Deleting order from state:', deletedOrderId)
                setOrders(prevOrders => {
                  const updatedOrders = prevOrders.filter(order => order.id !== deletedOrderId)
                  // Update filtered orders based on current filter
                  applyFilter(statusFilter, updatedOrders)
                  return updatedOrders
                })
              }
            }
          )
        
        // Subscribe and handle connection status
        channel.subscribe(async (status) => {
          console.log('Subscription status:', status)
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates')
            
            // Refresh orders after subscription to ensure we have the latest data
            const { data, error } = await supabase
              .from('Orders')
              .select('*')
              .eq('food_truck_id', foodTrucks.id)
              .order('created_at', { ascending: false })
            
            if (!error && data) {
              console.log('Refreshed orders after subscription:', data.length)
              setOrders(data)
              applyFilter(statusFilter, data)
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error, attempting to reconnect...')
            // Attempt to reconnect after a delay
            setTimeout(setupSubscription, 5000)
          }
        })
      } catch (error) {
        console.error('Error setting up subscription:', error)
      }
    }
    
    setupSubscription()
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up subscription')
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, statusFilter, pickupFilter])

  // Simplify the updateOrderStatus function to not handle notifications locally
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Show optimistic UI update for better UX
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as 'preparing' | 'ready' | 'completed', updated_at: new Date().toISOString() } 
            : order
        )
        // Update filtered orders based on current filter
        applyFilter(statusFilter, updatedOrders)
        return updatedOrders
      })
      
      // Update in database - this will trigger the real-time subscription
      const { error } = await supabase
        .from('Orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      if (error) {
        console.error('Error updating order status:', error)
        // Revert optimistic update if there was an error
        const { data } = await supabase
          .from('Orders')
          .select('*')
          .eq('id', orderId)
          .single()
          
        if (data) {
          setOrders(prevOrders => {
            const revertedOrders = prevOrders.map(order => 
              order.id === orderId ? data : order
            )
            applyFilter(statusFilter, revertedOrders)
            return revertedOrders
          })
          
          // Add error notification
          const errorNotification: OrderNotification = {
            id: crypto.randomUUID(),
            message: `Failed to update order #${orderId.substring(0, 8)}`,
            timestamp: new Date().toISOString(),
            type: 'info'
          }
          setNotifications(prev => [errorNotification, ...prev])
        }
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
    }
  }

  // Update filtered orders when tab changes
  useEffect(() => {
    applyFilter(activeTab, orders)
    setStatusFilter(activeTab)
  }, [activeTab, orders])

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }
  
  // Format pickup time with relative time if it's today
  const formatPickupTime = (pickupTime: string | null, isAsap: boolean) => {
    if (isAsap) {
      return 'As soon as possible'
    }
    
    if (!pickupTime) {
      return 'Not specified'
    }
    
    const pickupDate = new Date(pickupTime)
    const now = new Date()
    
    // If it's today, show relative time (e.g., "Today at 2:30 PM")
    if (pickupDate.toDateString() === now.toDateString()) {
      return `Today at ${format(pickupDate, 'h:mm a')}`
    }
    
    // Otherwise show full date and time
    return format(pickupDate, 'MMM d, yyyy h:mm a')
  }

  // Check if an order is approaching its pickup time (within 15 minutes)
  const isApproachingPickupTime = (order: Order) => {
    if (order.is_asap || !order.pickup_time || order.status === 'completed') {
      return false
    }
    
    const pickupDate = new Date(order.pickup_time)
    const now = new Date()
    const diffMinutes = Math.floor((pickupDate.getTime() - now.getTime()) / (1000 * 60))
    
    // Return true if pickup time is within 15 minutes
    return diffMinutes >= 0 && diffMinutes <= 15
  }
  
  // Get time remaining until pickup
  const getTimeUntilPickup = (pickupTime: string) => {
    const pickupDate = new Date(pickupTime)
    const now = new Date()
    const diffMinutes = Math.floor((pickupDate.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffMinutes < 0) {
      return 'Overdue'
    } else if (diffMinutes < 1) {
      return 'Less than a minute'
    } else if (diffMinutes === 1) {
      return '1 minute'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  // Get status icon based on order status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <CookingPot className="h-4 w-4 text-blue-500" />
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Get status badge based on order status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      case 'ready':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {orders.filter(o => o.status === 'preparing').length} Preparing
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {orders.filter(o => o.status === 'ready').length} Ready
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {orders.filter(o => o.is_asap && (o.status === 'preparing' || o.status === 'ready')).length} ASAP
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {orders.filter(o => !o.is_asap && o.pickup_time && (o.status === 'preparing' || o.status === 'ready')).length} Scheduled
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Order Management</CardTitle>
              </div>
              <CardDescription>
                Manage and track all your customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="active" 
                className="w-full"
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active Orders</TabsTrigger>
                  <TabsTrigger value="completed">Completed Orders</TabsTrigger>
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                </TabsList>
                
                {/* Pickup Filter */}
                <div className="flex items-center justify-end mt-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Pickup:</span>
                    <Select
                      value={pickupFilter}
                      onValueChange={(value) => setPickupFilter(value)}
                    >
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Filter by pickup" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="asap">ASAP only</SelectItem>
                        <SelectItem value="scheduled">Scheduled only</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <TabsContent value="active" className="mt-0">
                  <ScrollArea className="h-[60vh]">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-[150px]" />
                                  <Skeleton className="h-3 w-[100px]" />
                                </div>
                                <Skeleton className="h-6 w-[80px]" />
                              </div>
                              <div className="mt-4 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No active orders found</p>
                      </div>
                    ) : (
                      <AnimatedList>
                        {filteredOrders.map((order, index) => (
                          <AnimatedItem key={order.id} index={index}>
                            <Card className={`overflow-hidden ${isApproachingPickupTime(order) ? 'border-amber-300 shadow-amber-100' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium">{order.customer_name}</h3>
                                      {getStatusBadge(order.status)}
                                      {isApproachingPickupTime(order) && (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                          Pickup soon
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                                    <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    
                                    {/* Pickup Time */}
                                    <div className="mt-1 flex items-center gap-1 text-sm">
                                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                                      <span className={`${order.is_asap && order.status !== 'completed' ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                                        {formatPickupTime(order.pickup_time, order.is_asap)}
                                        {!order.is_asap && order.pickup_time && order.status !== 'completed' && (
                                          <span className="ml-1 text-xs text-gray-500">
                                            ({getTimeUntilPickup(order.pickup_time)})
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                    <div className="mt-2">
                                      {order.status === 'preparing' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'ready')}
                                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                                        >
                                          Mark as Ready
                                        </Button>
                                      )}
                                      {order.status === 'ready' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'completed')}
                                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                                        >
                                          Complete Order
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                  <ul className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <li key={index} className="text-sm">
                                        <div className="flex justify-between">
                                          <span>{item.quantity}x {item.name}</span>
                                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        {item.notes && (
                                          <div className="mt-1 ml-4 text-xs italic text-gray-500 bg-gray-50 p-1.5 rounded-sm">
                                            "{item.notes}"
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </AnimatedItem>
                        ))}
                      </AnimatedList>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  <ScrollArea className="h-[60vh]">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-[150px]" />
                                  <Skeleton className="h-3 w-[100px]" />
                                </div>
                                <Skeleton className="h-6 w-[80px]" />
                              </div>
                              <div className="mt-4 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No completed orders found</p>
                      </div>
                    ) : (
                      <AnimatedList>
                        {filteredOrders.map((order, index) => (
                          <AnimatedItem key={order.id} index={index}>
                            <Card className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium">{order.customer_name}</h3>
                                      {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                                    <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    
                                    {/* Pickup Time */}
                                    <div className="mt-1 flex items-center gap-1 text-sm">
                                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                                      <span className="text-gray-600">
                                        {formatPickupTime(order.pickup_time, order.is_asap)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                  <ul className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <li key={index} className="text-sm">
                                        <div className="flex justify-between">
                                          <span>{item.quantity}x {item.name}</span>
                                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        {item.notes && (
                                          <div className="mt-1 ml-4 text-xs italic text-gray-500 bg-gray-50 p-1.5 rounded-sm">
                                            "{item.notes}"
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </AnimatedItem>
                        ))}
                      </AnimatedList>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="all" className="mt-0">
                  <ScrollArea className="h-[60vh]">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-[150px]" />
                                  <Skeleton className="h-3 w-[100px]" />
                                </div>
                                <Skeleton className="h-6 w-[80px]" />
                              </div>
                              <div className="mt-4 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No orders found</p>
                      </div>
                    ) : (
                      <AnimatedList>
                        {filteredOrders.map((order, index) => (
                          <AnimatedItem key={order.id} index={index}>
                            <Card className={`overflow-hidden ${isApproachingPickupTime(order) ? 'border-amber-300 shadow-amber-100' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium">{order.customer_name}</h3>
                                      {getStatusBadge(order.status)}
                                      {isApproachingPickupTime(order) && (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                          Pickup soon
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                                    <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    
                                    {/* Pickup Time */}
                                    <div className="mt-1 flex items-center gap-1 text-sm">
                                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                                      <span className={`${order.is_asap && order.status !== 'completed' ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                                        {formatPickupTime(order.pickup_time, order.is_asap)}
                                        {!order.is_asap && order.pickup_time && order.status !== 'completed' && (
                                          <span className="ml-1 text-xs text-gray-500">
                                            ({getTimeUntilPickup(order.pickup_time)})
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                    <div className="mt-2">
                                      {order.status === 'preparing' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'ready')}
                                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                                        >
                                          Mark as Ready
                                        </Button>
                                      )}
                                      {order.status === 'ready' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'completed')}
                                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                                        >
                                          Complete Order
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                  <ul className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <li key={index} className="text-sm">
                                        <div className="flex justify-between">
                                          <span>{item.quantity}x {item.name}</span>
                                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        {item.notes && (
                                          <div className="mt-1 ml-4 text-xs italic text-gray-500 bg-gray-50 p-1.5 rounded-sm">
                                            "{item.notes}"
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </AnimatedItem>
                        ))}
                      </AnimatedList>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Real-Time Notifications</CardTitle>
              <CardDescription>
                Live updates for new orders and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                ) : (
                  <AnimatedList>
                    {notifications.map((notification, index) => (
                      <AnimatedItem key={notification.id} index={index}>
                        <Card className={`w-full border-l-4 ${
                          notification.type === 'new' 
                            ? 'border-l-green-500' 
                            : notification.type === 'update' 
                              ? 'border-l-blue-500' 
                              : 'border-l-gray-500'
                        }`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-full p-2 ${
                                notification.type === 'new' 
                                  ? 'bg-green-50 text-green-500' 
                                  : notification.type === 'update' 
                                    ? 'bg-blue-50 text-blue-500' 
                                    : 'bg-gray-50 text-gray-500'
                              }`}>
                                {notification.type === 'new' ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : notification.type === 'update' ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <AlertCircle className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{notification.message}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </AnimatedItem>
                    ))}
                  </AnimatedList>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 