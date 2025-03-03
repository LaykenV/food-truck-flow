import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/oauth-buttons";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
      
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
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Signing up..."
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Sign up
          </SubmitButton>
        </div>
        
        <FormMessage message={searchParams} />
      </form>
      
      <OAuthButtons mode="sign-up" />
      
      <div className="mt-6 text-center text-sm">
        <p>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
      
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}
