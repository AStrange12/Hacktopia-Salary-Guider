
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateExpense } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useUser, useFirestore } from "@/firebase";
import { Expense } from "@/lib/types";

type EditExpenseDialogProps = {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated: () => void;
};

export default function EditExpenseDialog({ expense, isOpen, onClose, onExpenseUpdated }: EditExpenseDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const expenseData = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      type: formData.get('type') as 'need' | 'want',
    };

    try {
      await updateExpense(firestore, user.uid, expense.id, expenseData);
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
      onExpenseUpdated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update expense.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the details of your transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" name="description" className="col-span-3" defaultValue={expense.description} required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (₹)
            </Label>
            <Input id="amount" name="amount" type="number" step="0.01" className="col-span-3" defaultValue={expense.amount} required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select name="category" defaultValue={expense.category} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="EMI">EMI</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select name="type" defaultValue={expense.type} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Is it a need or a want?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="need">Need</SelectItem>
                <SelectItem value="want">Want</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    