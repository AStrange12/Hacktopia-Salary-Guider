
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/lib/types";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState } from "react";
import EditExpenseDialog from "../expenses/edit-expense-dialog";
import { useUser, useFirestore } from "@/firebase";
import { deleteExpense } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type RecentExpensesProps = {
  expenses: Expense[];
  onExpenseChange: () => void;
};

export default function RecentExpenses({ expenses, onExpenseChange }: RecentExpensesProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
    return 'N/A';
  }

  const handleDelete = async (expenseId: string) => {
    if (!user || !firestore) return;
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(firestore, user.uid, expenseId);
        toast({ title: "Success", description: "Expense deleted." });
        onExpenseChange();
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  return (
    <>
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of your most recent expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="font-medium">{expense.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-right">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No expenses recorded yet.</p>
              <p className="text-sm">Click "Add Expense" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onExpenseUpdated={() => {
            setEditingExpense(null);
            onExpenseChange();
          }}
        />
      )}
    </>
  );
}

    