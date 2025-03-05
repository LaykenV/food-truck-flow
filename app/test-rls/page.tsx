// app/test-rls/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function TestRLSPage() {
  const [foodTrucks, setFoodTrucks] = useState<any[] | null>(null)
  const [menus, setMenus] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {

      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("userData", userData);
      console.log("userError", userError);

      // Test fetching food trucks (should only get user's own)
      const { data: foodTrucksData, error: foodTrucksError } = await supabase
        .from('FoodTrucks')
        .select('*')
      
      if (foodTrucksError) {
        setError(foodTrucksError.message)
        return
      }
      console.log("foodTrucksData", foodTrucksData);
      setFoodTrucks(foodTrucksData)
      
      // Try to fetch all menus (should only get user's own)
      const { data: menusData, error: menusError } = await supabase
        .from('Menus')
        .select('*')
      
      if (menusError) {
        setError(menusError.message)
        return
      }
      
      setMenus(menusData)
    }
    
    fetchData()
  }, [supabase])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RLS Test Page</h1>
      
      {error && (
        <div className="bg-red-100 p-4 mb-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Food Trucks:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(foodTrucks, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Menus:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(menus, null, 2)}
        </pre>
      </div>
    </div>
  )
}