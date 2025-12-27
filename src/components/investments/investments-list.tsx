
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import type { Investment } from "@/lib/types";
import { MoreVertical, Pencil, Trash2, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import EditInvestmentDialog from "./edit-investment-dialog";
import { useUser, useFirestore } from "@/firebase";
import { deleteInvestment } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";

type InvestmentsListProps = {
  investments: Investment[];
  onInvestmentChange: () => void;
};

export default function InvestmentsList({ investments, onInvestmentChange }: InvestmentsListProps) {
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async (investmentId: string) => {
    if (!user || !firestore) return;
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        await deleteInvestment(firestore, user.uid, investmentId);
        toast({ title: "Success", description: "Investment deleted." });
        onInvestmentChange();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete investment.",
        });
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return 'N/A';
  }

  return (
    <>
      {investments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => {
            const gainLoss = investment.currentValue - investment.purchasePrice;
            const isProfit = gainLoss >= 0;
            return (
              <Card key={investment.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{investment.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingInvestment(investment)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(investment.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    <Badge variant="outline">{investment.type}</Badge>
                    <span className="ml-2 text-xs">Purchased: {formatDate(investment.purchaseDate)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <div className="text-sm">
                        <span className="font-medium">Invested: </span>
                        <span className="text-muted-foreground">₹{investment.purchasePrice.toLocaleString('en-IN')}</span>
                         {investment.quantity && <span className="text-muted-foreground text-xs"> ({investment.quantity} units)</span>}
                    </div>
                     <div className="text-sm">
                        <span className="font-medium">Current Value: </span>
                        <span className="text-muted-foreground">₹{investment.currentValue.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                    {isProfit ? <TrendingUp className="h-5 w-5 text-green-500"/> : <TrendingDown className="h-5 w-5 text-red-500" />}
                    <span className={`font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                       {isProfit ? '+' : ''}₹{gainLoss.toLocaleString('en-IN')}
                    </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg mt-4">
          <Landmark className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No investments yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add Investment" to get started.</p>
        </div>
      )}

      {editingInvestment && (
        <EditInvestmentDialog
          investment={editingInvestment}
          isOpen={!!editingInvestment}
          onClose={() => setEditingInvestment(null)}
          onInvestmentUpdated={() => {
            setEditingInvestment(null);
            onInvestmentChange();
          }}
        />
      )}
    </>
  );
}
