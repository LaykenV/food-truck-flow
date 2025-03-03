import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/oauth-buttons";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">Login to FoodTruckFlow</h1>
      
      <form className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
            <Link
              className="text-xs text-blue-600 hover:text-blue-500 underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign in
          </SubmitButton>
        </div>
        
        <FormMessage message={searchParams} />
      </form>
      
      <OAuthButtons mode="sign-in" />
      
      <div className="mt-6 text-center text-sm">
        <p>
          Don't have an account?{' '}
          <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
