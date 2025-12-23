
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/lib/types";
import { MoreVertical, Pencil, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import EditGoalDialog from "./edit-goal-dialog";
import { useUser, useFirestore } from "@/firebase";
import { deleteSavingsGoal } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GoalsListProps = {
  goals: SavingsGoal[];
  onGoalChange: () => void;
};

export default function GoalsList({ goals, onGoalChange }: GoalsListProps) {
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async (goalId: string) => {
    if (!user || !firestore) return;
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteSavingsGoal(firestore, user.uid, goalId);
        toast({ title: "Success", description: "Savings goal deleted." });
        onGoalChange();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete goal.",
        });
      }
    }
  };

  return (
    <>
      {goals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{goal.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(goal.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{goal.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Progress value={progress} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      ₹{goal.currentAmount.toLocaleString("en-IN")}
                    </span>
                    <span>
                      ₹{goal.targetAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg mt-4">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No savings goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add Goal" to create your first one.</p>
        </div>
      )}

      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          onGoalUpdated={() => {
            setEditingGoal(null);
            onGoalChange();
          }}
        />
      )}
    </>
  );
}

    