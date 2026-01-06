import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudent } from "../../hooks/useStudents";
import { useStudentParents, useAddParentToStudent, useRemoveParentFromStudent } from "../../hooks/useManageParentStudent";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ChevronLeft, UserPlus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase";
import { RelationshipType } from "../../types";

const ManageParentsPage: React.FC = () => {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const navigate = useNavigate();
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("mother");
  const [isSearching, setIsSearching] = useState(false);

  const { data: student, isLoading: isLoadingStudent } = useStudent(studentId);
  const { data: parents, isLoading: isLoadingParents } = useStudentParents(studentId);
  const addParentMutation = useAddParentToStudent();
  const removeParentMutation = useRemoveParentFromStudent();

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !parentEmail) return;

    setIsSearching(true);
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", parentEmail)
        .single();

      if (userError || !userData) {
        toast.error("Parent not found. They must have an account first.");
        setIsSearching(false);
        return;
      }

      await addParentMutation.mutateAsync({
        studentId,
        parentId: userData.id,
        relationship,
      });

      toast.success("Parent linked successfully!");
      setParentEmail("");
    } catch (error) {
      toast.error("Failed to link parent. They might already be linked.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveParent = async (parentId: string) => {
    if (!studentId) return;
    if (window.confirm("Are you sure you want to remove this parent link?")) {
      try {
        await removeParentMutation.mutateAsync({ studentId, parentId });
        toast.success("Parent link removed");
      } catch (error) {
        toast.error("Failed to remove parent link");
      }
    }
  };

  if (isLoadingStudent || isLoadingParents) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!student) {
    return <div className="container mx-auto py-8 text-center text-destructive">Student not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2" 
        onClick={() => navigate(`/teacher/classes/${classId}`)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Class
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Parents: {student.first_name} {student.last_name}</CardTitle>
            <CardDescription>
              Link parent accounts to this student to allow them to view reports and receive messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-4">Linked Parents</h3>
            <div className="space-y-4">
              {parents && parents.length > 0 ? (
                parents.map((p) => (
                  <div key={p.parent_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{p.parent.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {p.parent.email} &bull; {p.relationship}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleRemoveParent(p.parent_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-2">No parents linked yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Link a Parent</CardTitle>
            <CardDescription>Search for an existing parent by their email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddParent} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Parent Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={parentEmail} 
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select 
                  id="relationship" 
                  value={relationship} 
                  onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSearching || !parentEmail}>
                {isSearching ? "Searching..." : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Link Parent
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageParentsPage;
