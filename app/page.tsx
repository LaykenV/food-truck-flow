
export default async function Home() {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Welcome to FoodTruckFlow</h1>
      <p className="text-xl mb-8">B2B SaaS platform for food truck owners</p>
      <div className="flex gap-4">
        <a href="/sign-in" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</a>
        <a href="/signup" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Sign Up</a>
      </div>
    </main>
  )
}
