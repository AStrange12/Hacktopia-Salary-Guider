
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Chrome, Eye, EyeOff } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createUserProfile } from "@/app/actions";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormProps = {
  isRegister?: boolean;
}

export function LoginForm({ isRegister = false }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const passwordValue = form.watch("password");

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth || !firestore) return;
    setLoading(true);

    try {
        if (isRegister) {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await createUserProfile(firestore, userCredential.user);
        } else {
            await signInWithEmailAndPassword(auth, values.email, values.password);
        }
        router.push("/dashboard");
    } catch (error: any) {
        console.error("Authentication Error:", error);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const additionalInfo = getAdditionalUserInfo(result);
        if (additionalInfo?.isNewUser) {
            await createUserProfile(firestore, result.user);
        }
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : error.message,
        });
    } finally {
        setLoading(false);
    }
  };
  

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...field}
                      disabled={loading}
                    />
                    {passwordValue && (
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
            )}
            {isRegister ? "Register" : "Sign In"}
          </Button>
        </form>
      </Form>
       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleSignIn}>
        {loading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
        Google
      </Button>
    </div>
  );
}
