import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Edit, Trash2, UserCog, UserPlus } from "lucide-react";
import type { Student } from "../../types";

interface StudentTableProps {
  students: Student[];
  onDelete?: (id: string) => void;
  onManageParents?: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onDelete,
  onManageParents,
}) => {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No students added yet.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="add-student">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.first_name} {student.last_name}
              </TableCell>
              <TableCell>{student.email || "-"}</TableCell>
              <TableCell>{student.date_of_birth || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Manage Parents"
                    onClick={() => onManageParents?.(student)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`students/${student.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(student.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
