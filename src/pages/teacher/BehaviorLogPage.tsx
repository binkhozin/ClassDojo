import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Checkbox } from "../../components/ui/checkbox";
import { useStudents } from "../../hooks/useStudents";
import { useBehaviorCategories } from "../../hooks/useBehaviorCategories";
import { useBehaviorHistory } from "../../hooks/useBehaviorHistory";
import { useDeleteBehavior } from "../../hooks/useBehaviors";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";

export const BehaviorLogPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [filters, setFilters] = useState({
    studentId: "",
    categoryId: "",
    behaviorType: "",
    startDate: "",
    endDate: "",
    searchTerm: "",
  });
  const [page, setPage] = useState(1);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const { data: students } = useStudents(classId);
  const { data: categories } = useBehaviorCategories(classId);
  const { data: behaviors, count, totalPages, isLoading } = useBehaviorHistory(classId, filters, page);
  const { mutate: deleteBehavior } = useDeleteBehavior();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleDelete = (id: string) => {
    deleteBehavior(id, {
      onSuccess: () => {
        toast.success("Behavior deleted successfully");
        setSelectedBehaviors(prev => prev.filter(bid => bid !== id));
      },
      onError: (error) => {
        toast.error("Failed to delete behavior: " + error.message);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedBehaviors.length === 0) return;

    // In a real app, you'd want to confirm this action
    selectedBehaviors.forEach(id => {
      deleteBehavior(id);
    });
    
    toast.success(`${selectedBehaviors.length} behaviors deleted`);
    setSelectedBehaviors([]);
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedBehaviors([]);
    } else {
      setSelectedBehaviors(behaviors.map(b => b.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectBehavior = (id: string) => {
    setSelectedBehaviors(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Reset select all when behaviors change
    setSelectAll(false);
    setSelectedBehaviors([]);
  }, [behaviors]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading behavior history...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Behavior History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <Select 
              onValueChange={(value) => handleFilterChange("studentId", value)} 
              value={filters.studentId}
              options={[
                { value: "", label: "All Students" },
                ...(students?.map(student => ({
                  value: student.id,
                  label: `${student.first_name} ${student.last_name}`
                })) || [])
              ]}
              placeholder="All Students"
            />

            <Select 
              onValueChange={(value) => handleFilterChange("categoryId", value)} 
              value={filters.categoryId}
              options={[
                { value: "", label: "All Categories" },
                ...(categories?.map(category => ({
                  value: category.id,
                  label: category.name
                })) || [])
              ]}
              placeholder="All Categories"
            />

            <Select 
              onValueChange={(value) => handleFilterChange("behaviorType", value)} 
              value={filters.behaviorType}
              options={[
                { value: "", label: "All Types" },
                { value: "positive", label: "Positive" },
                { value: "negative", label: "Negative" }
              ]}
              placeholder="All Types"
            />

            <Input 
              type="date" 
              placeholder="Start Date" 
              value={filters.startDate} 
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />

            <Input 
              type="date" 
              placeholder="End Date" 
              value={filters.endDate} 
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Input 
              placeholder="Search by student name..." 
              value={filters.searchTerm} 
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Bulk Actions */}
          {selectedBehaviors.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Checkbox 
                checked={selectAll} 
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                {selectedBehaviors.length} selected
              </label>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                disabled={selectedBehaviors.length === 0}
              >
                Delete Selected
              </Button>
            </div>
          )}

          {/* Behavior Table */}
          {behaviors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No behaviors found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectAll && selectedBehaviors.length === behaviors.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
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
                      <TableCell>
                        <Checkbox 
                          checked={selectedBehaviors.includes(behavior.id)}
                          onCheckedChange={() => toggleSelectBehavior(behavior.id)}
                          aria-label="Select behavior"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={behavior.student?.avatar_url || undefined} />
                            <AvatarFallback>
                              {behavior.student?.first_name.charAt(0)}{behavior.student?.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{behavior.student?.first_name} {behavior.student?.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {behavior.category?.icon && (
                            <span>{behavior.category.icon}</span>
                          )}
                          <span>{behavior.category?.name}</span>
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
                        {format(new Date(behavior.created_at!), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {behavior.note || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          onClick={() => handleDelete(behavior.id)}
                        >
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(prev => Math.max(1, prev - 1));
                      }}
                      isActive={page > 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(prev => Math.min(totalPages, prev + 1));
                      }}
                      isActive={page < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {behaviors.length} of {count} behaviors
          </div>
        </CardContent>
      </Card>
    </div>
  );
};