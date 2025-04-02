'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { useSubscription } from '@supabase-cache-helpers/postgrest-react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Bell, CheckCircle2, Clock, CookingPot, Loader, PackageOpen, ShoppingBag, TimerOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getFoodTruck, getOrders } from '@/app/admin/clientQueries'
import { updateOrderStatus } from './actions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Types
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

// Animated components
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

// Status card component for order counters
const StatusCard = ({ 
  icon, 
  count, 
  label, 
  className = ""
}: { 
  icon: React.ReactNode,
  count: number,
  label: string,
  className?: string
}) => {
  return (
    <div className={`flex items-center p-3 rounded-lg bg-admin-card border border-admin-border ${className}`}>
      <div className="mr-3 p-2 rounded-full bg-admin-secondary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-admin-foreground">{count}</p>
        <p className="text-xs text-admin-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default function OrdersClient() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  // State for filters, notifications and active tab
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [pickupFilter, setPickupFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('active')
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)

  // Fetch food truck data with React Query
  const { 
    data: foodTruck,
    isLoading: isFoodTruckLoading
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  })

  // Fetch orders with React Query
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!foodTruck?.id
  })

  // Set up Supabase realtime subscription with supabase-cache-helper
  const { status } = useSubscription(
    supabase,
    `orders-realtime-${foodTruck?.id || 'none'}`,
    {
      event: '*',
      table: 'Orders',
      schema: 'public',
      filter: foodTruck?.id ? `food_truck_id=eq.${foodTruck.id}` : undefined,
    },
    ['id'], // Primary key for Orders table
    { 
      callback: (payload) => {
        // Handle different types of events
        if (payload.eventType === 'INSERT') {
          // Add notification for new order
          const newOrder = payload.new as Order
          const newNotification: OrderNotification = {
            id: crypto.randomUUID(),
            message: `New order from ${newOrder.customer_name}`,
            timestamp: new Date().toISOString(),
            type: 'new'
          }
          setNotifications(prev => [newNotification, ...prev])
          setHasUnreadNotifications(true)
        } 
        else if (payload.eventType === 'UPDATE') {
          // Only add notification for status changes
          const updatedOrder = payload.new as Order
          const oldOrder = payload.old as Order
          
          if (oldOrder.status !== updatedOrder.status) {
            const updateNotification: OrderNotification = {
              id: crypto.randomUUID(),
              message: `Order #${updatedOrder.id.substring(0, 8)} updated to ${updatedOrder.status}`,
              timestamp: new Date().toISOString(),
              type: 'update'
            }
            setNotifications(prev => [updateNotification, ...prev])
            setHasUnreadNotifications(true)
          }
        }
      }
    }
  )

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return updateOrderStatus(orderId, status)
    },
    // Use optimistic updates for a better UX
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches to avoid them overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] })
      
      // Save the previous orders
      const previousOrders = queryClient.getQueryData(['orders']) as Order[]
      
      // Optimistically update the order status
      queryClient.setQueryData(['orders'], (old: Order[] | undefined) => {
        if (!old) return []
        return old.map(order => 
          order.id === orderId 
            ? { ...order, status: status as 'preparing' | 'ready' | 'completed', updated_at: new Date().toISOString() } 
            : order
        )
      })
      
      // Return the previous orders to roll back if there's an error
      return { previousOrders }
    },
    onError: (err, variables, context) => {
      // Roll back to the previous orders if there's an error
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders)
      }
      toast.error(`Failed to update order: ${err instanceof Error ? err.message : 'Unknown error'}`)
      
      // Add error notification
      const errorNotification: OrderNotification = {
        id: crypto.randomUUID(),
        message: `Failed to update order #${variables.orderId.substring(0, 8)}`,
        timestamp: new Date().toISOString(),
        type: 'info'
      }
      setNotifications(prev => [errorNotification, ...prev])
    },
    onSettled: () => {
      // Always refetch after an update to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  // Filter orders based on status and pickup filters
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return []
    
    let filtered: Order[] = []
    
    // First, filter by status
    if (statusFilter === 'all') {
      filtered = [...orders]
    } else if (statusFilter === 'active') {
      filtered = orders.filter(order => order.status === 'preparing' || order.status === 'ready')
    } else if (statusFilter === 'completed') {
      filtered = orders.filter(order => order.status === 'completed')
    } else {
      filtered = orders.filter(order => order.status === statusFilter)
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
    
    // Sort orders based on status and time
    if (statusFilter === 'active' || statusFilter === 'preparing' || statusFilter === 'ready') {
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
    
    return filtered
  }, [orders, statusFilter, pickupFilter])

  // Handle order status updates
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus })
  }

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

  // Get status badge based on order status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="outline" className="bg-admin-secondary text-admin-foreground border-admin-border">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      case 'ready':
        return <Badge variant="outline" className="bg-admin-primary/20 text-admin-primary border-admin-primary/30">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-admin-muted text-admin-muted-foreground border-admin-border">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  // Handle notifications view
  const handleNotificationsView = () => {
    setHasUnreadNotifications(false)
  }

  // Loading state
  const isLoading = isFoodTruckLoading || isOrdersLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-admin-primary mr-2" />
        <span className="text-admin-foreground">Loading orders...</span>
      </div>
    )
  }

  if (ordersError) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
        <p>Failed to load orders. Please try again.</p>
        <p className="text-sm">{ordersError instanceof Error ? ordersError.message : 'Unknown error'}</p>
      </div>
    )
  }

  // Count orders by status for the status cards
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const readyCount = orders.filter(o => o.status === 'ready').length
  const asapCount = orders.filter(o => o.is_asap && (o.status === 'preparing' || o.status === 'ready')).length
  const scheduledCount = orders.filter(o => !o.is_asap && o.pickup_time && (o.status === 'preparing' || o.status === 'ready')).length

  return (
    <div className="space-y-6">
      {/* Notifications Accordion */}
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
        onValueChange={(value) => {
          if (value) handleNotificationsView()
        }}
      >
        <AccordionItem 
          value="notifications" 
          className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
        >
          <AccordionTrigger className="px-6 py-4 rounded-t-lg text-admin-foreground hover:no-underline hover:bg-admin-accent/40">
            <div className="flex items-center">
              <div className="relative mr-3">
                <Bell className="h-5 w-5 text-admin-muted-foreground" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </div>
              <span className="font-medium">Real-Time Notifications</span>
              {notifications.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-admin-primary/10 text-admin-primary border-admin-primary/30">
                  {notifications.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <ScrollArea className="h-[40vh]">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-admin-muted-foreground">No new notifications</p>
                </div>
              ) : (
                <AnimatedList>
                  {notifications.map((notification, index) => (
                    <AnimatedItem key={notification.id} index={index}>
                      <Card className={`w-full border-l-4 border-admin-border ${
                        notification.type === 'new' 
                          ? 'border-l-green-500' 
                          : notification.type === 'update' 
                            ? 'border-l-admin-primary' 
                            : 'border-l-gray-500'
                      }`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-full p-2 ${
                              notification.type === 'new' 
                                ? 'bg-green-100 text-green-500' 
                                : notification.type === 'update' 
                                  ? 'bg-admin-secondary text-admin-primary' 
                                  : 'bg-admin-muted text-admin-muted-foreground'
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
                              <p className="text-sm font-medium text-admin-foreground">{notification.message}</p>
                              <p className="text-xs text-admin-muted-foreground">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Order Management Card */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Manage and track all customer orders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Status Trackers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatusCard 
              icon={<CookingPot className="h-5 w-5 text-admin-primary" />}
              count={preparingCount}
              label="Preparing"
            />
            <StatusCard 
              icon={<PackageOpen className="h-5 w-5 text-admin-primary" />}
              count={readyCount}
              label="Ready for Pickup"
            />
            <StatusCard 
              icon={<TimerOff className="h-5 w-5 text-admin-primary" />}
              count={asapCount}
              label="ASAP Orders"
            />
            <StatusCard 
              icon={<Clock className="h-5 w-5 text-admin-primary" />}
              count={scheduledCount}
              label="Scheduled"
            />
          </div>
          
          <Tabs 
            defaultValue="active" 
            className="w-full"
            onValueChange={(value) => {
              setActiveTab(value)
              setStatusFilter(value)
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-admin-secondary">
              <TabsTrigger value="active" className="data-[state=active]:bg-admin-primary data-[state=active]:text-admin-primary-foreground">Active Orders</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-admin-primary data-[state=active]:text-admin-primary-foreground">Completed</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-admin-primary data-[state=active]:text-admin-primary-foreground">All Orders</TabsTrigger>
            </TabsList>
            
            {/* Pickup Filter */}
            <div className="flex items-center justify-end mt-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-admin-muted-foreground">Pickup:</span>
                <Select
                  value={pickupFilter}
                  onValueChange={(value) => setPickupFilter(value)}
                >
                  <SelectTrigger className="w-[180px] h-8 border-admin-border bg-admin-background text-admin-foreground">
                    <SelectValue placeholder="Filter by pickup" />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-popover text-admin-popover-foreground border-admin-border">
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
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-admin-muted-foreground">No active orders found</p>
                  </div>
                ) : (
                  <AnimatedList>
                    {filteredOrders.map((order, index) => (
                      <AnimatedItem key={order.id} index={index}>
                        <Card className={`overflow-hidden border-admin-border ${isApproachingPickupTime(order) ? 'border-orange-300 shadow-orange-100/50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-1 w-full sm:w-auto">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-medium text-admin-foreground">{order.customer_name}</h3>
                                  {getStatusBadge(order.status)}
                                  {isApproachingPickupTime(order) && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                      Pickup soon
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-admin-muted-foreground">{order.customer_email}</p>
                                <p className="text-sm text-admin-muted-foreground">Order #{order.id.substring(0, 8)}</p>
                                <p className="text-sm text-admin-muted-foreground">{formatDate(order.created_at)}</p>
                                
                                {/* Pickup Time */}
                                <div className="mt-1 flex items-center gap-1 text-sm">
                                  <Clock className="h-3.5 w-3.5 text-admin-muted-foreground" />
                                  <span className={`${order.is_asap && order.status !== 'completed' ? 'text-orange-600 font-medium' : 'text-admin-muted-foreground'}`}>
                                    {formatPickupTime(order.pickup_time, order.is_asap)}
                                    {!order.is_asap && order.pickup_time && order.status !== 'completed' && (
                                      <span className="ml-1 text-xs text-admin-muted-foreground">
                                        ({getTimeUntilPickup(order.pickup_time)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                <p className="font-medium text-admin-foreground">${order.total_amount.toFixed(2)}</p>
                                <div className="mt-2">
                                  {order.status === 'preparing' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                      disabled={updateOrderMutation.isPending}
                                      className="bg-admin-primary text-admin-primary-foreground border-admin-primary hover:bg-admin-primary/90"
                                    >
                                      {updateOrderMutation.isPending && updateOrderMutation.variables?.orderId === order.id ? (
                                        <>
                                          <Loader className="mr-2 h-3 w-3 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        'Mark as Ready'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'ready' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                      disabled={updateOrderMutation.isPending}
                                      className="bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground border-0 hover:opacity-90"
                                    >
                                      {updateOrderMutation.isPending && updateOrderMutation.variables?.orderId === order.id ? (
                                        <>
                                          <Loader className="mr-2 h-3 w-3 animate-spin" />
                                          Completing...
                                        </>
                                      ) : (
                                        'Complete Order'
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-admin-border">
                              <h4 className="text-sm font-medium mb-2 text-admin-foreground">Order Items</h4>
                              <ul className="space-y-2">
                                {order.items.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-admin-foreground">{item.quantity}x {item.name}</span>
                                      <span className="text-admin-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.notes && (
                                      <div className="mt-1 ml-4 text-xs italic text-admin-muted-foreground bg-admin-accent p-1.5 rounded-sm">
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
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-admin-muted-foreground">No completed orders found</p>
                  </div>
                ) : (
                  <AnimatedList>
                    {filteredOrders.map((order, index) => (
                      <AnimatedItem key={order.id} index={index}>
                        <Card className="overflow-hidden border-admin-border">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-admin-foreground">{order.customer_name}</h3>
                                  {getStatusBadge(order.status)}
                                </div>
                                <p className="text-sm text-admin-muted-foreground">{order.customer_email}</p>
                                <p className="text-sm text-admin-muted-foreground">Order #{order.id.substring(0, 8)}</p>
                                <p className="text-sm text-admin-muted-foreground">{formatDate(order.created_at)}</p>
                                
                                {/* Pickup Time */}
                                <div className="mt-1 flex items-center gap-1 text-sm">
                                  <Clock className="h-3.5 w-3.5 text-admin-muted-foreground" />
                                  <span className="text-admin-muted-foreground">
                                    {formatPickupTime(order.pickup_time, order.is_asap)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-admin-foreground">${order.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-admin-border">
                              <h4 className="text-sm font-medium mb-2 text-admin-foreground">Order Items</h4>
                              <ul className="space-y-2">
                                {order.items.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-admin-foreground">{item.quantity}x {item.name}</span>
                                      <span className="text-admin-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.notes && (
                                      <div className="mt-1 ml-4 text-xs italic text-admin-muted-foreground bg-admin-accent p-1.5 rounded-sm">
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
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-admin-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <AnimatedList>
                    {filteredOrders.map((order, index) => (
                      <AnimatedItem key={order.id} index={index}>
                        <Card className={`overflow-hidden border-admin-border ${isApproachingPickupTime(order) ? 'border-orange-300 shadow-orange-100/50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-medium text-admin-foreground">{order.customer_name}</h3>
                                  {getStatusBadge(order.status)}
                                  {isApproachingPickupTime(order) && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                      Pickup soon
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-admin-muted-foreground">{order.customer_email}</p>
                                <p className="text-sm text-admin-muted-foreground">Order #{order.id.substring(0, 8)}</p>
                                <p className="text-sm text-admin-muted-foreground">{formatDate(order.created_at)}</p>
                                
                                {/* Pickup Time */}
                                <div className="mt-1 flex items-center gap-1 text-sm">
                                  <Clock className="h-3.5 w-3.5 text-admin-muted-foreground" />
                                  <span className={`${order.is_asap && order.status !== 'completed' ? 'text-orange-600 font-medium' : 'text-admin-muted-foreground'}`}>
                                    {formatPickupTime(order.pickup_time, order.is_asap)}
                                    {!order.is_asap && order.pickup_time && order.status !== 'completed' && (
                                      <span className="ml-1 text-xs text-admin-muted-foreground">
                                        ({getTimeUntilPickup(order.pickup_time)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-admin-foreground">${order.total_amount.toFixed(2)}</p>
                                <div className="mt-2">
                                  {order.status === 'preparing' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                      disabled={updateOrderMutation.isPending}
                                      className="bg-admin-primary text-admin-primary-foreground border-admin-primary hover:bg-admin-primary/90"
                                    >
                                      Mark as Ready
                                    </Button>
                                  )}
                                  {order.status === 'ready' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                      disabled={updateOrderMutation.isPending}
                                      className="bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground border-0 hover:opacity-90"
                                    >
                                      Complete Order
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-admin-border">
                              <h4 className="text-sm font-medium mb-2 text-admin-foreground">Order Items</h4>
                              <ul className="space-y-2">
                                {order.items.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-admin-foreground">{item.quantity}x {item.name}</span>
                                      <span className="text-admin-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.notes && (
                                      <div className="mt-1 ml-4 text-xs italic text-admin-muted-foreground bg-admin-accent p-1.5 rounded-sm">
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
  )
} 