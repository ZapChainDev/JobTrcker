import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivationalText, setMotivationalText] = useState('');
  const [isUpdatingText, setIsUpdatingText] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (currentUser?.uid !== 'iIqPkeXnwrd2MhlhLuAtxqBWIq02') {
        navigate('/');
        return;
      }

      try {
        // Get total users and user data
        const usersSnapshot = await getDocs(collection(db, 'userProfiles'));
        const userData = usersSnapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        })) as UserProfile[];
        setUsers(userData);
        const totalUsers = usersSnapshot.size;

        // Get total applications
        const applicationsSnapshot = await getDocs(collection(db, 'applications'));
        const totalApplications = applicationsSnapshot.size;

        // Get active users (users who have applied in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsersQuery = query(
          collection(db, 'applications'),
          where('createdAt', '>=', thirtyDaysAgo)
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);
        const activeUserIds = new Set(activeUsersSnapshot.docs.map(doc => doc.data().userId));
        const activeUsers = activeUserIds.size;

        // Get motivational text
        const motivationalDoc = await getDoc(doc(db, 'admin', 'motivationalText'));
        if (motivationalDoc.exists()) {
          setMotivationalText(motivationalDoc.data().text || '');
        }

        setStats({
          totalUsers,
          totalApplications,
          activeUsers,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [currentUser, navigate]);

  const handleUpdateMotivationalText = async () => {
    if (!motivationalText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsUpdatingText(true);
    try {
      await setDoc(doc(db, 'admin', 'motivationalText'), {
        text: motivationalText,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid
      });
      toast.success('Motivational text updated successfully');
    } catch (error) {
      console.error('Error updating motivational text:', error);
      toast.error('Failed to update motivational text');
    } finally {
      setIsUpdatingText(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle regular Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      // Handle timestamp number
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleDateString();
      }
      // Handle ISO string
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
      }
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalApplications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.activeUsers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Motivational Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter motivational text that will appear in users' dashboard..."
              value={motivationalText}
              onChange={(e) => setMotivationalText(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleUpdateMotivationalText}
              disabled={isUpdatingText}
            >
              {isUpdatingText ? 'Updating...' : 'Update Text'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.name || user.displayName || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.course || 'N/A'}</TableCell>
                  <TableCell>{user.age || 'N/A'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 