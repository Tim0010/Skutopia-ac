
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Search, Filter, UserPlus, Lock, X, Check, Shield, User } from "lucide-react";
import { toast } from "sonner";
import useUsers, { UserProfile } from "@/hooks/useUsers";

const AdminUsers = () => {
  const { getUsers, createUser, updateUser, deleteUser, loading } = useUsers();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile> & {password?: string}>({});
  const [initialLoading, setInitialLoading] = useState(true);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      const data = await getUsers();
      setUsers(data);
      setInitialLoading(false);
    };

    loadUsers();
  }, [getUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    const { password, ...userData } = formData;
    
    const newUser = await createUser(
      formData.email!, 
      password!, 
      {
        name: userData.name,
        role: userData.role || 'student',
        avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
      }
    );
    
    if (newUser) {
      setUsers([...users, newUser]);
      setIsAddDialogOpen(false);
      setFormData({});
    }
  };

  const handleEditUser = async () => {
    if (!currentUser) return;
    
    const updatedUser = await updateUser(currentUser.id, formData);
    
    if (updatedUser) {
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData } : user
      ));
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      setFormData({});
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    if (currentUser.role === "admin") {
      toast.error("Cannot delete admin user!");
      setIsDeleteDialogOpen(false);
      return;
    }
    
    const success = await deleteUser(currentUser.id);
    
    if (success) {
      setUsers(users.filter(user => user.id !== currentUser.id));
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const updatedUser = await updateUser(user.id, { status: newStatus });
    
    if (updatedUser) {
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
      
      toast.success(`User ${user.name} is now ${newStatus}`);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setCurrentUser(user);
    setFormData(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "mentor":
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show loading state
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-skutopia-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Add, edit or remove users</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4 sm:mt-0">
          <UserPlus size={18} className="mr-2" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage all user accounts in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                        title={user.status === "active" ? "Deactivate user" : "Activate user"}
                      >
                        {user.status === "active" ? <X size={16} /> : <Check size={16} />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete user"
                        disabled={user.role === "admin"}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found. Try a different search term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role || "student"}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                  Email Address (Cannot be changed)
                </label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  id="edit-role"
                  name="role"
                  value={formData.role || "student"}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-3">
              {currentUser && (
                <>
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img src={currentUser.avatar_url} alt={currentUser.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                  </div>
                </>
              )}
            </div>
            
            {currentUser?.role === "admin" && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                <p className="text-sm font-medium">Admin users cannot be deleted</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={loading || currentUser?.role === "admin"}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
