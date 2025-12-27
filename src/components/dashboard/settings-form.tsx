
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { UserProfile } from "@/lib/types";
import { updateUserSettings } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useState, useTransition, useEffect } from "react";
import { useUser, useFirestore } from "@/firebase";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

const settingsSchema = z.object({
    salary: z.coerce.number().min(0, "Salary must be a positive number."),
    taxRegime: z.enum(["old", "new"]),
    needs: z.coerce.number().min(0).max(100),
    wants: z.coerce.number().min(0).max(100),
    savings: z.coerce.number().min(0).max(100),
    hasBonus: z.boolean(),
    bonusAmount: z.coerce.number().optional(),
    bonusType: z.enum(["Promotion Hike", "Performance Bonus", "Joining Bonus", "Other"]).optional(),
}).refine(data => data.needs + data.wants + data.savings === 100, {
    message: "Budget percentages must add up to 100.",
    path: ["needs"],
}).refine(data => !data.hasBonus || (data.hasBonus && data.bonusAmount && data.bonusAmount > 0), {
    message: "Bonus amount is required.",
    path: ["bonusAmount"],
}).refine(data => !data.hasBonus || (data.hasBonus && data.bonusType), {
    message: "Bonus type is required.",
    path: ["bonusType"],
});

export default function SettingsForm({ user: initialUser }: { user: UserProfile }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const { user } = useUser();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            salary: initialUser.salary || 0,
            taxRegime: initialUser.taxRegime || 'new',
            needs: initialUser.budget?.needs || 50,
            wants: initialUser.budget?.wants || 30,
            savings: initialUser.budget?.savings || 20,
            hasBonus: !!initialUser.bonus,
            bonusAmount: initialUser.bonus?.amount || undefined,
            bonusType: initialUser.bonus?.type || undefined,
        },
    });

    const [needs, wants, savings, salary, hasBonus, bonusAmount] = form.watch([
        "needs", "wants", "savings", "salary", "hasBonus", "bonusAmount"
    ]);

    const annualIncome = (salary || 0) * 12;
    const revisedAnnualIncome = annualIncome + (hasBonus ? (bonusAmount || 0) : 0);

    function onSubmit(values: z.infer<typeof settingsSchema>) {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }
        
        startTransition(() => {
            const settingsData: Partial<UserProfile> = {
                salary: values.salary,
                taxRegime: values.taxRegime,
                budget: {
                    needs: values.needs,
                    wants: values.wants,
                    savings: values.savings,
                },
                bonus: values.hasBonus && values.bonusAmount && values.bonusType
                    ? { amount: values.bonusAmount, type: values.bonusType }
                    : undefined,
            };

            updateUserSettings(firestore, user.uid, settingsData)
                .then(() => {
                    toast({
                        title: "Success!",
                        description: "Your settings have been updated.",
                    });
                })
                .catch((error: any) => {
                    toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: error.message || "Failed to update settings.",
                    });
                });
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Salary (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 50000" {...field} />
                            </FormControl>
                            <FormDescription>
                                Your take-home salary per month.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Annual Income (₹): </span>
                    <span className="font-bold">₹{annualIncome.toLocaleString('en-IN')}</span>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Income (Optional)</h3>
                     <FormField
                        control={form.control}
                        name="hasBonus"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        I received a promotion or bonus
                                    </FormLabel>
                                    <FormDescription>
                                        This helps us give you more accurate savings and tax advice.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    {hasBonus && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <FormField
                                control={form.control}
                                name="bonusAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bonus Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 25000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="bonusType"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bonus Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Promotion Hike">Promotion Hike</SelectItem>
                                        <SelectItem value="Performance Bonus">Performance Bonus</SelectItem>
                                        <SelectItem value="Joining Bonus">Joining Bonus</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    )}
                    {hasBonus && (
                         <div className="text-sm pt-2">
                            <span className="font-medium text-muted-foreground">Revised Annual Income (₹): </span>
                            <span className="font-bold text-primary">₹{revisedAnnualIncome.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>

                <Separator />

                <FormField
                    control={form.control}
                    name="taxRegime"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tax Regime</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="new" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            New Tax Regime
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="old" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Old Tax Regime
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                             <FormDescription>
                                Select your income tax regime for more accurate advice.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <Separator />

                <div className="space-y-4">
                    <Label>Budget Allocation (50-30-20 Rule)</Label>
                     <p className="text-sm text-muted-foreground">Customize your budget split. The total must be 100%.</p>
                     <div className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="needs"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Needs %</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="wants"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Wants %</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="savings"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Savings %</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <Progress value={Number(needs) + Number(wants) + Number(savings)} className="w-full" />
                        <span className="text-sm font-medium min-w-12 text-right">
                           {Number(needs) + Number(wants) + Number(savings)}%
                        </span>
                     </div>
                     {form.formState.errors.needs && (
                         <p className="text-sm font-medium text-destructive">{form.formState.errors.needs.message}</p>
                     )}
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
