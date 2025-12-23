
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { Goal } from "lucide-react";
import { addSavingsGoal } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { useUser, useFirestore } from "@/firebase";

type AddGoalDialogProps = {
    onGoalAdded: () => void;
};

export default function AddGoalDialog({ onGoalAdded }: AddGoalDialogProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to add a goal." });
        return;
    }

    const formData = new FormData(event.currentTarget);
    const goalData = {
        name: formData.get('name') as string,
        targetAmount: parseFloat(formData.get('targetAmount') as string),
        deadline: new Date(formData.get('deadline') as string),
        category: formData.get('category') as 'Emergency' | 'Gold' | 'Investments' | 'Other',
    };

    try {
        await addSavingsGoal(firestore, user.uid, goalData);
        toast({
            title: "Success",
            description: "Savings goal added successfully.",
        });
        formRef.current?.reset();
        setOpen(false);
        onGoalAdded(); // Callback to refetch data
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to add savings goal.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Goal className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Savings Goal</DialogTitle>
          <DialogDescription>
            Set a new financial goal to track your progress.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Goal Name
            </Label>
            <Input id="name" name="name" className="col-span-3" placeholder="e.g., Vacation Fund" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAmount" className="text-right">
              Target (₹)
            </Label>
            <Input id="targetAmount" name="targetAmount" type="number" step="100" className="col-span-3" required/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input id="deadline" name="deadline" type="date" className="col-span-3" required/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select name="category" required>
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
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    