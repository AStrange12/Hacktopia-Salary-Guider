
"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  Firestore,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { UserProfile, Expense, SavingsGoal, Investment } from "@/lib/types";

export async function createUserProfile(firestore: Firestore, user: User) {
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        const newUserProfile: Omit<UserProfile, 'uid'> = {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp() as Timestamp,
            salary: 0,
            taxRegime: 'new',
            budget: {
                needs: 50,
                wants: 30,
                savings: 20,
            },
        };
        await setDoc(userRef, newUserProfile);
    }
}


export async function getUser(firestore: Firestore, uid: string): Promise<UserProfile | null> {
  try {
    if (!uid) return null;

    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return { uid, ...userDoc.data() } as UserProfile;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function getExpenses(firestore: Firestore, userId: string): Promise<Expense[]> {
  try {
    if (!userId) return [];

    const expensesRef = collection(firestore, "users", userId, "expenses");
    const querySnapshot = await getDocs(expensesRef);

    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Expense)
    ).sort((a, b) => b.date.toMillis() - a.date.toMillis());
  } catch (error) {
    console.error("Error getting expenses:", error);
    return [];
  }
}

export async function addExpense(firestore: Firestore, userId: string, expenseData: Omit<Expense, 'id' | 'userId' | 'date'>) {
    if (!userId) throw new Error("User not authenticated");
    
    const expensePayload = {
      ...expenseData,
      date: serverTimestamp(),
      userId: userId,
    };

    const expensesRef = collection(firestore, "users", userId, "expenses");
    return addDoc(expensesRef, expensePayload);
}

export async function updateExpense(firestore: Firestore, userId: string, expenseId: string, expenseData: Partial<Omit<Expense, 'id' | 'userId' | 'date'>>) {
    if (!userId) throw new Error("User not authenticated");
    const expenseRef = doc(firestore, "users", userId, "expenses", expenseId);
    return updateDoc(expenseRef, expenseData);
}

export async function deleteExpense(firestore: Firestore, userId: string, expenseId: string) {
    if (!userId) throw new Error("User not authenticated");
    const expenseRef = doc(firestore, "users", userId, "expenses", expenseId);
    return deleteDoc(expenseRef);
}

export async function getSavingsGoals(firestore: Firestore, userId: string): Promise<SavingsGoal[]> {
  try {
    if (!userId) return [];

    const goalsRef = collection(firestore, "users", userId, "savingsGoals");
    const querySnapshot = await getDocs(goalsRef);

    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as SavingsGoal)
    );
  } catch (error) {
    console.error("Error getting savings goals:", error);
    return [];
  }
}

export async function addSavingsGoal(firestore: Firestore, userId: string, goalData: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount'> & { deadline: Date }) {
    if (!userId) throw new Error("User not authenticated");

    const newGoalData = {
        ...goalData,
        deadline: Timestamp.fromDate(goalData.deadline),
        currentAmount: 0,
        userId: userId,
    };

    const goalsRef = collection(firestore, "users", userId, "savingsGoals");
    return addDoc(goalsRef, newGoalData);
}

export async function updateSavingsGoal(firestore: Firestore, userId: string, goalId: string, goalData: Partial<Omit<SavingsGoal, 'id' | 'userId'>> & { deadline?: Date }) {
    if (!userId) throw new Error("User not authenticated");

    const goalRef = doc(firestore, "users", userId, "savingsGoals", goalId);
    const updateData: any = { ...goalData };

    if (goalData.deadline) {
        updateData.deadline = Timestamp.fromDate(goalData.deadline);
    }
    
    return updateDoc(goalRef, updateData);
}

export async function deleteSavingsGoal(firestore: Firestore, userId: string, goalId: string) {
    if (!userId) throw new Error("User not authenticated");
    const goalRef = doc(firestore, "users", userId, "savingsGoals", goalId);
    return deleteDoc(goalRef);
}


export async function updateUserSettings(firestore: Firestore, userId: string, settingsData: Partial<UserProfile>) {
    if (!userId) throw new Error("User not authenticated");

    const userRef = doc(firestore, "users", userId);
    return setDoc(userRef, settingsData, { merge: true });
}

export async function getInvestments(firestore: Firestore, userId: string): Promise<Investment[]> {
  try {
    if (!userId) return [];

    const investmentsRef = collection(firestore, "users", userId, "investments");
    const querySnapshot = await getDocs(investmentsRef);

    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Investment)
    ).sort((a, b) => b.purchaseDate.toMillis() - a.purchaseDate.toMillis());
  } catch (error) {
    console.error("Error getting investments:", error);
    return [];
  }
}

export async function addInvestment(firestore: Firestore, userId: string, investmentData: Omit<Investment, 'id' | 'userId' | 'purchaseDate'> & { purchaseDate: Date }) {
    if (!userId) throw new Error("User not authenticated");

    const newInvestmentData = {
        ...investmentData,
        purchaseDate: Timestamp.fromDate(investmentData.purchaseDate),
        userId: userId,
    };

    const investmentsRef = collection(firestore, "users", userId, "investments");
    return addDoc(investmentsRef, newInvestmentData);
}

export async function updateInvestment(firestore: Firestore, userId: string, investmentId: string, investmentData: Partial<Omit<Investment, 'id' | 'userId'>> & { purchaseDate?: Date }) {
    if (!userId) throw new Error("User not authenticated");

    const investmentRef = doc(firestore, "users", userId, "investments", investmentId);
    const updateData: any = { ...investmentData };

    if (investmentData.purchaseDate) {
        updateData.purchaseDate = Timestamp.fromDate(investmentData.purchaseDate);
    }
    
    return updateDoc(investmentRef, updateData);
}

export async function deleteInvestment(firestore: Firestore, userId: string, investmentId: string) {
    if (!userId) throw new Error("User not authenticated");
    const investmentRef = doc(firestore, "users", userId, "investments", investmentId);
    return deleteDoc(investmentRef);
}
