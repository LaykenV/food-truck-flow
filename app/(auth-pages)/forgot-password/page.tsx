import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
      
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
          <SubmitButton 
            formAction={forgotPasswordAction}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Send Reset Link
          </SubmitButton>
        </div>
        
        <FormMessage message={searchParams} />
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Remember your password?{' '}
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
