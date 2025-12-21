"use server";

import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { UserProfile, Expense, SavingsGoal } from "@/lib/types";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

const db = getFirestore(getApp());
const auth = getAuth(getApp());

export async function getUser(): Promise<UserProfile | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const querySnapshot = await getDocs(expensesRef);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  } catch (error) {
    console.error("Error getting expenses:", error);
    return [];
  }
}

export async function addExpense(formData: FormData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const expenseData = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      type: formData.get('type') as 'need' | 'want',
      date: serverTimestamp(),
      userId: user.uid,
    };

    const expensesRef = collection(db, "users", user.uid, "expenses");
    await addDoc(expensesRef, expenseData);

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
  } catch (error) {
    console.error("Error adding expense:", error);
    return { error: "Failed to add expense." };
  }
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const goalsRef = collection(db, "users", user.uid, "savingsGoals");
    const querySnapshot = await getDocs(goalsRef);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingsGoal));
  } catch (error) {
    console.error("Error getting savings goals:", error);
    return [];
  }
}

export async function addSavingsGoal(formData: FormData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      const goalData = {
        name: formData.get('name') as string,
        targetAmount: parseFloat(formData.get('targetAmount') as string),
        category: formData.get('category') as 'Emergency' | 'Gold' | 'Investments' | 'Other',
        currentAmount: 0,
        userId: user.uid,
      };
  
      const goalsRef = collection(db, "users", user.uid, "savingsGoals");
      await addDoc(goalsRef, goalData);
  
      revalidatePath("/dashboard");
      revalidatePath("/goals");
    } catch (error) {
      console.error("Error adding savings goal:", error);
      return { error: "Failed to add savings goal." };
    }
  }

export async function updateUserSettings(formData: FormData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const salary = formData.get('salary');
        const taxRegime = formData.get('taxRegime');
        const needs = formData.get('needs');
        const wants = formData.get('wants');
        const savings = formData.get('savings');

        const userRef = doc(db, 'users', user.uid);
        const updateData: Partial<UserProfile> = {};

        if (salary) updateData.salary = parseFloat(salary as string);
        if (taxRegime) updateData.taxRegime = taxRegime as 'old' | 'new';
        if (needs && wants && savings) {
            updateData.budget = {
                needs: parseInt(needs as string, 10),
                wants: parseInt(wants as string, 10),
                savings: parseInt(savings as string, 10),
            }
        }
        
        await setDoc(userRef, updateData, { merge: true });

        revalidatePath('/settings');
        revalidatePath('/dashboard');

    } catch (error) {
        console.error('Error updating user settings: ', error);
        return { error: 'Failed to update settings.'}
    }
}
