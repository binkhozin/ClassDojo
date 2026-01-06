import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import type { BehaviorWithDetails } from "../../types";

interface BehaviorLogProps {
  behaviors: BehaviorWithDetails[];
  onDelete?: (id: string) => void;
}

export const BehaviorLog: React.FC<BehaviorLogProps> = ({
  behaviors,
  onDelete,
}) => {
  if (behaviors.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No behaviors logged yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Behavior</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {behaviors.map((behavior) => (
            <TableRow key={behavior.id}>
              <TableCell className="font-medium">
                {behavior.student?.first_name} {behavior.student?.last_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {behavior.category?.icon && (
                    <span>{behavior.category.icon}</span>
                  )}
                  {behavior.category?.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={behavior.points > 0 ? "default" : "destructive"}
                >
                  {behavior.points > 0 ? "+" : ""}{behavior.points}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(behavior.created_at!), "MMM d, h:mm a")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {behavior.note || "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete?.(behavior.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
