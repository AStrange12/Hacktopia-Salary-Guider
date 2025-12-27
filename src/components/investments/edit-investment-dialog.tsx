
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
import { updateInvestment } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { useUser, useFirestore } from "@/firebase";
import { Investment } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

type EditInvestmentDialogProps = {
  investment: Investment;
  isOpen: boolean;
  onClose: () => void;
  onInvestmentUpdated: () => void;
};

const investmentSchema = z.object({
  name: z.string().min(1, "Investment name is required."),
  type: z.enum(["Stock", "Crypto", "Fixed Deposit", "Mutual Fund", "Other"]),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid date is required",
  }),
  quantity: z.coerce.number().optional(),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0."),
  currentValue: z.coerce.number().min(0, "Current value must be a positive number."),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function EditInvestmentDialog({
  investment,
  isOpen,
  onClose,
  onInvestmentUpdated,
}: EditInvestmentDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment.name,
      type: investment.type,
      purchaseDate: investment.purchaseDate.toDate().toISOString().split("T")[0],
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      currentValue: investment.currentValue,
    },
  });

  const handleSubmit = (values: InvestmentFormData) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }

    startTransition(async () => {
      try {
        await updateInvestment(firestore, user.uid, investment.id, {
            ...values,
            purchaseDate: new Date(values.purchaseDate)
        });
        toast({ title: "Investment updated successfully" });
        onInvestmentUpdated();
        onClose();
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: err?.message,
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
          <DialogDescription>Update the details of your investment.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Stock">Stock</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
