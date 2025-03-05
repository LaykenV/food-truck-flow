"use client";

import { useState } from "react";
import { signInAction, signUpAction, signInWithOAuthAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";

interface AuthModalProps {
  initialView?: "sign-in" | "sign-up";
  trigger?: React.ReactNode;
  message?: Message;
}

export function AuthModals({ initialView = "sign-in", trigger, message }: AuthModalProps) {
  const [view, setView] = useState<"sign-in" | "sign-up">(initialView);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Sign In</Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {view === "sign-in" ? "Login to FoodTruckFlow" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {view === "sign-in" 
              ? "Enter your credentials to access your account" 
              : "Join FoodTruckFlow to grow your food truck business"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-1 py-4">
          {view === "sign-in" ? (
            <SignInForm message={message} onClose={() => setOpen(false)} />
          ) : (
            <SignUpForm message={message} onClose={() => setOpen(false)} />
          )}
          
          <div className="mt-6 text-center text-sm">
            {view === "sign-in" ? (
              <p>
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium text-primary" 
                  onClick={() => setView("sign-up")}
                >
                  Sign up
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium text-primary" 
                  onClick={() => setView("sign-in")}
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AuthFormProps {
  message?: Message;
  onClose: () => void;
}

function SignInForm({ message, onClose }: AuthFormProps) {
  return (
    <>
      <form className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              className="text-xs text-primary hover:underline"
              href="/forgot-password"
              onClick={onClose}
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
            className="mt-1 w-full"
          />
        </div>
        
        <div>
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full"
          >
            Sign in
          </SubmitButton>
        </div>
        
        {message && <FormMessage message={message} />}
      </form>
      
      <OAuthButtons mode="sign-in" />
    </>
  );
}

function SignUpForm({ message, onClose }: AuthFormProps) {
  return (
    <>
      <form className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            minLength={6}
            required
            className="mt-1 w-full"
          />
        </div>
        
        <div>
          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Signing up..."
            className="w-full"
          >
            Sign up
          </SubmitButton>
        </div>
        
        {message && <FormMessage message={message} />}
      </form>
      
      <OAuthButtons mode="sign-up" />
    </>
  );
} 