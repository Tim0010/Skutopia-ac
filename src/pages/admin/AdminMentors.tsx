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
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Book, 
  DollarSign,
  GraduationCap,
  Award,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useMentors, { Mentor } from "@/hooks/useMentors";

const AdminMentors = () => {
  const { 
    fetchMentors, 
    addMentor, 
    editMentor, 
    removeMentor,
    loading 
  } = useMentors();
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState<Partial<Mentor>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  // Load mentors on component mount
  useEffect(() => {
    const loadMentors = async () => {
      const data = await fetchMentors();
      setMentors(data);
      setInitialLoading(false);
    };

    loadMentors();
  }, [fetchMentors]);

  // Filter mentors based on search term
  const filteredMentors = mentors.filter(mentor => 
    (mentor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (mentor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMentor = async () => {
    if (!formData.name || !formData.specialization) {
      toast.error('Name and specialization are required');
      return;
    }
    
    // Set default values for new mentor
    const newMentorData = {
      name: formData.name,
      specialization: formData.specialization,
      avatar_url: formData.avatar_url || '',
      bio: formData.bio || '',
      subjects: formData.subjects || [],
      hourly_rate: formData.hourly_rate || 0,
      currency: formData.currency || 'USD',
      availability: formData.availability || 'Flexible',
      education: [],
      experience: [],
      resources: []
    };
    
    const newMentor = await addMentor(newMentorData);
    
    if (newMentor) {
      setMentors([...mentors, newMentor]);
      setIsAddDialogOpen(false);
      setFormData({});
    }
  };

  const handleEditMentor = async () => {
    if (!currentMentor) return;
    
    const updatedMentor = await editMentor(currentMentor.id, formData);
    
    if (updatedMentor) {
      setMentors(mentors.map(mentor => 
        mentor.id === currentMentor.id ? { ...mentor, ...formData } : mentor
      ));
      setIsEditDialogOpen(false);
      setCurrentMentor(null);
      setFormData({});
    }
  };

  const handleDeleteMentor = async () => {
    if (!currentMentor) return;
    
    const success = await removeMentor(currentMentor.id);
    
    if (success) {
      setMentors(mentors.filter(mentor => mentor.id !== currentMentor.id));
      setIsDeleteDialogOpen(false);
      setCurrentMentor(null);
    }
  };

  const openEditDialog = (mentor: Mentor) => {
    setCurrentMentor(mentor);
    setFormData(mentor);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (mentor: Mentor) => {
    setCurrentMentor(mentor);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subjects = e.target.value.split(',').map(subject => subject.trim());
    setFormData({ ...formData, subjects });
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
          <h1 className="text-3xl font-bold">Manage Mentors</h1>
          <p className="text-muted-foreground mt-1">Add, edit or remove mentors</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4 sm:mt-0">
          <Plus size={18} className="mr-2" />
          Add New Mentor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Mentor Management</CardTitle>
          <CardDescription>
            Manage all mentors in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
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
                  <TableHead>Specialization</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img src={mentor.avatar_url} alt={mentor.name} className="h-full w-full object-cover" />
                        </div>
                        <span>{mentor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{mentor.specialization}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{mentor.sessions_completed}</TableCell>
                    <TableCell>
                      {mentor.currency} {mentor.hourly_rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(mentor)}
                        title="Edit mentor"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDialog(mentor)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete mentor"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMentors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No mentors found. Try a different search term or add a new mentor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Mentor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Mentor</DialogTitle>
            <DialogDescription>
              Create a new mentor profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url || ""}
                  onChange={handleInputChange}
                  placeholder="Enter avatar URL"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization || ""}
                  onChange={handleInputChange}
                  placeholder="Enter specialization"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Enter mentor bio"
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="subjects">Subjects (comma separated)</Label>
                <Input
                  id="subjects"
                  name="subjects"
                  value={formData.subjects ? formData.subjects.join(', ') : ""}
                  onChange={handleSubjectsChange}
                  placeholder="E.g. Math, Physics, Chemistry"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  name="availability"
                  value={formData.availability || ""}
                  onChange={handleInputChange}
                  placeholder="E.g. Weekdays, Evenings"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <Input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate || ""}
                  onChange={handleInputChange}
                  placeholder="Enter hourly rate"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  name="currency" 
                  value={formData.currency || "USD"} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="ZMW">ZMW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleAddMentor} disabled={loading}>
              {loading ? "Adding..." : "Add Mentor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>
              Make changes to mentor details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-avatar_url">Avatar URL</Label>
                <Input
                  id="edit-avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-specialization">Specialization</Label>
                <Input
                  id="edit-specialization"
                  name="specialization"
                  value={formData.specialization || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-subjects">Subjects (comma separated)</Label>
                <Input
                  id="edit-subjects"
                  name="subjects"
                  value={formData.subjects ? formData.subjects.join(', ') : ""}
                  onChange={handleSubjectsChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-availability">Availability</Label>
                <Input
                  id="edit-availability"
                  name="availability"
                  value={formData.availability || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-hourly_rate">Hourly Rate</Label>
                <Input
                  id="edit-hourly_rate"
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-currency">Currency</Label>
                <Select 
                  name="currency" 
                  value={formData.currency || "USD"} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="ZMW">ZMW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleEditMentor} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Mentor Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentMentor?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMentor} 
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Mentor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMentors;
