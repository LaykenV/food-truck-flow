import { Metadata } from 'next'
import OrdersClient from './client'

export const metadata: Metadata = {
  title: 'Orders | Food Truck Flow',
  description: 'Manage and track your food truck orders',
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <OrdersClient />
    </div>
  )
} 