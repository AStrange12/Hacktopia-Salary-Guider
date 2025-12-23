
"use client";

import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';


async function createUserProfile(firestore: any, user: User) {
    if (!firestore || !user) return;
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        const userProfile: Omit<UserProfile, 'uid'> = {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp() as any,
            salary: 50000, // default value
            taxRegime: 'new', // default value
            budget: { // default 50-30-20
                needs: 50,
                wants: 30,
                savings: 20,
            }
        };
        // Use setDoc with merge:true to avoid overwriting data if it was created between getDoc and setDoc
        await setDoc(userRef, userProfile, { merge: true });
    }
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    // Single global auth listener from useUser hook is the source of truth.
    // This effect redirects if the user is not logged in after the initial auth check.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    
    // Create user profile document on first login.
    if (user && firestore) {
      createUserProfile(firestore, user);
    }
  }, [user, isUserLoading, firestore, router]);


  if (isUserLoading || !user) {
    // Show a loading spinner while the auth state is being determined.
    // This prevents a flash of the login page for already authenticated users.
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Once the user is confirmed, render the dashboard layout.
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
