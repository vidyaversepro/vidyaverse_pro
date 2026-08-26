import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, UserX, Loader2 } from "lucide-react";
import { useSearchUsers, useLinkStudentUser } from "@/lib/queries/student/student-queries";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

interface StudentLinkUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; name: string; userId?: string | null; linkedUserName?: string | null };
  institutionId: string;
}

export function StudentLinkUserModal({ isOpen, onClose, student, institutionId }: StudentLinkUserModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading: isSearching } = useSearchUsers(debouncedQuery, institutionId);
  const { mutate: linkUser, isPending: isLinking } = useLinkStudentUser();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedUserId(null);
    }
  }, [isOpen]);

  const handleLink = (userId: string | null) => {
    linkUser(
      { studentId: student.id, userId },
      {
        onSuccess: () => {
          toast.success(userId ? "Account linked" : "Account unlinked");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update user link");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link User Account</DialogTitle>
          <DialogDescription>
            Link a user account to student <strong>{student.name}</strong> so they can log in to the Student Portal.
          </DialogDescription>
        </DialogHeader>

        {student.userId ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border p-4 bg-muted/50 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Currently Linked</div>
                <div className="text-sm text-muted-foreground mt-1">
                  User ID: {student.userId}
                </div>
              </div>
              <Badge className="pill-green border-transparent">Linked</Badge>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full" 
              disabled={isLinking}
              onClick={() => handleLink(null)}
            >
              {isLinking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
              Unlink Account
            </Button>
            
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or Overwrite Link</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email (min 2 chars)..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[200px] border rounded-md p-2">
            {isSearching ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching...
              </div>
            ) : debouncedQuery.length < 2 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                Type at least 2 characters to search
              </div>
            ) : users && users.length > 0 ? (
              <div className="flex flex-col gap-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted ${
                      selectedUserId === user.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    {selectedUserId === user.id && <UserCheck className="w-4 h-4 text-primary ml-2 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                No users found
              </div>
            )}
          </ScrollArea>

          <Button
            className="w-full"
            disabled={!selectedUserId || isLinking}
            onClick={() => handleLink(selectedUserId)}
          >
            {isLinking ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4 mr-2" />
            )}
            Confirm Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
