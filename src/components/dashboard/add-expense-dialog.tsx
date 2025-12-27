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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Sparkles } from "lucide-react";
import { addExpense } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { useUser, useFirestore } from "@/firebase";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "../ui/textarea";
import { parseExpenseFromText } from "@/ai/flows/parse-expense-text";

type AddExpenseDialogProps = {
  onExpenseAdded: () => void;
};

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  category: z.string().min(1, "Category is required."),
  type: z.enum(["need", "want"]),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function AddExpenseDialog({ onExpenseAdded }: AddExpenseDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseText, setParseText] = useState("");
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      category: "",
      type: undefined,
    },
  });

  const handleParse = async () => {
    if (!parseText) {
      toast({
        variant: "destructive",
        title: "No text to parse",
        description: "Please paste transaction text into the text area.",
      });
      return;
    }
    setIsParsing(true);
    try {
      const result = await parseExpenseFromText({ text: parseText });
      if (result.description) form.setValue("description", result.description);
      if (result.amount) form.setValue("amount", result.amount);
      if (result.category) form.setValue("category", result.category);
      if (result.type) form.setValue("type", result.type);
      toast({
        title: "Parsing Complete",
        description: "The form has been pre-filled. Please review and save.",
      });
    } catch (error) {
      console.error("AI Parsing Error:", error);
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: "The AI could not parse the text. Please fill the form manually.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (values: ExpenseFormData) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }

    startTransition(async () => {
      try {
        await addExpense(firestore, user.uid, values);
        toast({
          title: "Success",
          description: "Expense added successfully.",
        });
        form.reset();
        setParseText("");
        setOpen(false);
        onExpenseAdded();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to add expense.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            form.reset();
            setParseText("");
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 text-sm text-primary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Have an SMS? Parse with AI
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <Textarea
                  placeholder="e.g., 'INR 550.00 spent on Zomato...'"
                  value={parseText}
                  onChange={(e) => setParseText(e.target.value)}
                  className="resize-none"
                />
                <Button type="button" onClick={handleParse} disabled={isParsing}>
                  {isParsing ? "Parsing..." : "Parse"}
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Lunch with friends" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Is it a need or a want?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="need">Need</SelectItem>
                      <SelectItem value="want">Want</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
