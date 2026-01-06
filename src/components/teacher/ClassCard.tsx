import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, Edit, Trash2, ExternalLink } from "lucide-react";
import type { Class } from "../../types";

interface ClassCardProps {
  classData: Class & { studentCount?: number };
  onDelete?: (id: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classData, onDelete }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: classData.color || "hsl(var(--primary))" }} 
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{classData.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {classData.grade && (
              <Badge variant="outline">{classData.grade}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {classData.academic_year}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/teacher/classes/${classData.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete?.(classData.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          {classData.studentCount ?? 0} Students
        </div>
        {classData.school_name && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {classData.school_name}
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        <Button className="w-full" asChild>
          <Link to={`/teacher/classes/${classData.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Class
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
