import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  Calendar, 
  TrendingUp, 
  BarChart, 
  Activity 
} from "lucide-react";
import { fetchMentorStats, MentorStats } from "@/services/adminMentorService";

// Simple bar chart component for displaying top subjects
const SubjectBarChart: React.FC<{ data: { subject: string; count: number }[] }> = ({ data }) => {
  // Find the maximum count for scaling
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.subject}</span>
            <span className="font-medium">{item.count}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariant()}`}>
      {status}
    </span>
  );
};

const MentorDashboard: React.FC = () => {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchMentorStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError("Failed to load mentor statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mentor Analytics Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mentors</p>
                <h3 className="text-2xl font-bold">{stats?.totalMentors}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeMentors} active in last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <h3 className="text-2xl font-bold">{stats?.totalBookings}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all mentors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  From completed sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Star className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <h3 className="text-2xl font-bold">{stats?.averageRating.toFixed(1)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on all feedback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Subjects */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Top Subjects
            </CardTitle>
            <CardDescription>
              Most popular subjects offered by mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topSubjects && stats.topSubjects.length > 0 ? (
              <SubjectBarChart data={stats.topSubjects} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No subject data available</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Bookings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
            <CardDescription>
              Latest mentor session bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.mentor_name}</TableCell>
                      <TableCell>{booking.student_name}</TableCell>
                      <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent bookings</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Mentor Performance Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators for the mentoring program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Session Completion Rate</h4>
              <p className="text-2xl font-bold mt-2">
                {stats?.totalBookings ? 
                  `${Math.round((stats.recentBookings.filter(b => b.status === 'completed').length / stats.totalBookings) * 100)}%` : 
                  '0%'}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium">Mentor Retention</h4>
              <p className="text-2xl font-bold mt-2">
                {stats?.totalMentors ? 
                  `${Math.round((stats.activeMentors / stats.totalMentors) * 100)}%` : 
                  '0%'}
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mb-2" />
              <h4 className="font-medium">Avg. Revenue per Mentor</h4>
              <p className="text-2xl font-bold mt-2">
                ${stats?.totalMentors && stats.totalMentors > 0 ? 
                  (stats.totalRevenue / stats.totalMentors).toFixed(2) : 
                  '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorDashboard;
