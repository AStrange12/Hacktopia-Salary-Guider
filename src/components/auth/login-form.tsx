"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.2 109.8 20 244 20c74.8 0 140.6 30.3 187.9 78.4l-75.5 75.5c-28.2-26.8-68.9-43-112.4-43-85.5 0-155.3 69.3-155.3 154.5s69.8 154.5 155.3 154.5c97.3 0 131.5-69.2 136-103.3H244v-92.4h241.4c2.5 12.6 3.6 26.4 3.6 41.2z" />
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: "Could not sign you in with Google. Please try again.",
      })
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleSignIn}>
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        ) : (
          <GoogleIcon />
        )}
        <span className="ml-2">Continue with Google</span>
      </Button>
    </div>
  );
}
