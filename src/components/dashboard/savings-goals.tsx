
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/lib/types";
import { MoreVertical, Pencil, Target, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import EditGoalDialog from "../goals/edit-goal-dialog";
import { useUser, useFirestore } from "@/firebase";
import { deleteSavingsGoal } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type SavingsGoalsProps = {
  goals: SavingsGoal[];
  onGoalChange: () => void;
};

export default function SavingsGoals({ goals, onGoalChange }: SavingsGoalsProps) {
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
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Track your progress towards your financial goals.</CardDescription>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center">
                        <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                        {goal.name} ({goal.category})
                      </span>
                       <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
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
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                      <span>
                        ₹{goal.currentAmount.toLocaleString("en-IN")}
                      </span>
                      <span>
                        ₹{goal.targetAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No savings goals set yet.</p>
              <p className="text-sm">Click "Add Goal" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
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

    