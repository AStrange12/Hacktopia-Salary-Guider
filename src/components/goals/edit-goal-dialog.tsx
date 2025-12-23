
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
import { updateSavingsGoal } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { SavingsGoal } from "@/lib/types";

type EditGoalDialogProps = {
  goal: SavingsGoal;
  isOpen: boolean;
  onClose: () => void;
  onGoalUpdated: () => void;
};

export default function EditGoalDialog({ goal, isOpen, onClose, onGoalUpdated }: EditGoalDialogProps) {
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
    
    const goalData = {
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      currentAmount: parseFloat(formData.get('currentAmount') as string),
      deadline: new Date(formData.get('deadline') as string),
      category: formData.get('category') as 'Emergency' | 'Gold' | 'Investments' | 'Other',
    };

    try {
      await updateSavingsGoal(firestore, user.uid, goal.id, goalData);
      toast({
        title: "Success",
        description: "Savings goal updated successfully.",
      });
      onGoalUpdated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update goal.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const deadlineDate = goal.deadline?.toDate ? goal.deadline.toDate().toISOString().split('T')[0] : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Savings Goal</DialogTitle>
          <DialogDescription>
            Update your financial goal details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Goal Name
            </Label>
            <Input id="name" name="name" className="col-span-3" defaultValue={goal.name} required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAmount" className="text-right">
              Target (₹)
            </Label>
            <Input id="targetAmount" name="targetAmount" type="number" step="100" className="col-span-3" defaultValue={goal.targetAmount} required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentAmount" className="text-right">
              Current (₹)
            </Label>
            <Input id="currentAmount" name="currentAmount" type="number" step="100" className="col-span-3" defaultValue={goal.currentAmount} required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input id="deadline" name="deadline" type="date" className="col-span-3" defaultValue={deadlineDate} required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select name="category" defaultValue={goal.category} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a savings category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Emergency">Emergency Fund</SelectItem>
                <SelectItem value="Investments">Investments</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
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
