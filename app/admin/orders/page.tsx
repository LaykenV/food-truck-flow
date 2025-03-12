'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { AnimatedList } from '@/components/ui/animated-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle2, Clock, CookingPot } from 'lucide-react'

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
}

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type OrderNotification = {
  id: string
  message: string
  timestamp: string
  type: 'new' | 'update' | 'info'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const supabase = createClient()

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
          setOrders(data || [])
          setFilteredOrders(data || [])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchOrders:', error)
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [supabase])

  // Set up real-time subscription for new orders
  useEffect(() => {
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
        
        // Subscribe to changes in the Orders table for this food truck
        const channel = supabase
          .channel('orders-changes')
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
                setOrders(prevOrders => [newOrder, ...prevOrders])
                applyFilter(statusFilter, [...orders, newOrder])
                
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
                
                setOrders(prevOrders => 
                  prevOrders.map(order => 
                    order.id === updatedOrder.id ? updatedOrder : order
                  )
                )
                
                applyFilter(statusFilter, orders.map(order => 
                  order.id === updatedOrder.id ? updatedOrder : order
                ))
                
                // Add notification for status update
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
                setOrders(prevOrders => 
                  prevOrders.filter(order => order.id !== deletedOrderId)
                )
                applyFilter(statusFilter, orders.filter(order => order.id !== deletedOrderId))
              }
            }
          )
          .subscribe()
        
        // Clean up subscription when component unmounts
        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error('Error setting up subscription:', error)
      }
    }
    
    setupSubscription()
  }, [supabase, orders, statusFilter])

  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      if (error) {
        console.error('Error updating order status:', error)
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
    }
  }

  // Function to apply filter
  const applyFilter = (status: string, ordersList = orders) => {
    setStatusFilter(status)
    
    if (status === 'all') {
      setFilteredOrders(ordersList)
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === status))
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (error) {
      return dateString
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {orders.filter(o => o.status === 'preparing').length} Preparing
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {orders.filter(o => o.status === 'ready').length} Ready
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
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                  <TabsTrigger value="preparing">Preparing</TabsTrigger>
                  <TabsTrigger value="ready">Ready</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
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
                        <p className="text-gray-500">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <Card key={order.id} className="overflow-hidden">
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
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                  <div className="mt-2">
                                    {order.status === 'preparing' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                      >
                                        Mark as Ready
                                      </Button>
                                    )}
                                    {order.status === 'ready' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                      >
                                        Complete Order
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                <ul className="space-y-1">
                                  {order.items.map((item, index) => (
                                    <li key={index} className="text-sm flex justify-between">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="preparing" className="mt-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {orders.filter(o => o.status === 'preparing').length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No orders being prepared</p>
                        </div>
                      ) : (
                        orders.filter(o => o.status === 'preparing').map((order) => (
                          <Card key={order.id} className="overflow-hidden">
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
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                  >
                                    Mark as Ready
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                <ul className="space-y-1">
                                  {order.items.map((item, index) => (
                                    <li key={index} className="text-sm flex justify-between">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="ready" className="mt-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {orders.filter(o => o.status === 'ready').length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No orders ready for pickup</p>
                        </div>
                      ) : (
                        orders.filter(o => o.status === 'ready').map((order) => (
                          <Card key={order.id} className="overflow-hidden">
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
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                  >
                                    Complete Order
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-2">Order Items</h4>
                                <ul className="space-y-1">
                                  {order.items.map((item, index) => (
                                    <li key={index} className="text-sm flex justify-between">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
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
                  <AnimatedList className="w-full" delay={300}>
                    {notifications.map((notification) => (
                      <Card key={notification.id} className={`w-full border-l-4 ${
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