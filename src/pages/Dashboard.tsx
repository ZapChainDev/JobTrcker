import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle } from '../components/ui/card';
import ApplicationForm from '@/components/ApplicationForm';
import { JobApplication } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '../components/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ApplicationCard } from '../components/ApplicationCard';
import Profile from './Profile';
import { MovingText } from '@/components/MovingText';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | undefined>(undefined);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [statusCounts, setStatusCounts] = useState({
    applied: 0,
    interviewing: 0,
    rejected: 0,
    offered: 0,
    accepted: 0,
  });

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedApplications: JobApplication[] = [];
      const newStatusCounts = {
        applied: 0,
        interviewing: 0,
        rejected: 0,
        offered: 0,
        accepted: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const application = {
          id: doc.id,
          ...data
        } as JobApplication;
        
        fetchedApplications.push(application);
        
        console.log("Application status fetched: ", application.status);

        // Update status counts
        switch (application.status) {
          case 'applied':
            newStatusCounts.applied++;
            break;
          case 'interviewing':
            newStatusCounts.interviewing++;
            break;
          case 'rejected':
            newStatusCounts.rejected++;
            break;
          case 'offered':
            newStatusCounts.offered++;
            break;
          case 'accepted':
            newStatusCounts.accepted++;
            break;
        }
      });
      
      setApplications(fetchedApplications);
      setFilteredApplications(fetchedApplications);
      setStatusCounts(newStatusCounts); // Update the state with new counts
      setIsLoading(false);
    };

    fetchApplications();
  }, [currentUser]);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.position.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, searchQuery]);

  const handleEdit = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'applications', id));
        // Refresh applications after deletion
        setApplications(prevApps => prevApps.filter(app => app.id !== id));
        setFilteredApplications(prevApps => prevApps.filter(app => app.id !== id));
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedApplication(undefined);
    // Refresh applications
    const user = auth.currentUser;
    if (user) {
      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(
          applicationsRef,
          where('userId', '==', user.uid),
          orderBy('appliedDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const applications: JobApplication[] = [];
        const newStatusCounts = {
          applied: 0,
          interviewing: 0,
          rejected: 0,
          offered: 0,
          accepted: 0,
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const application = {
            id: doc.id,
            ...data
          } as JobApplication;
          
          applications.push(application);
          
          console.log("Application status fetched: ", application.status);

          // Update status counts
          switch (application.status) {
            case 'applied':
              newStatusCounts.applied++;
              break;
            case 'interviewing':
              newStatusCounts.interviewing++;
              break;
            case 'rejected':
              newStatusCounts.rejected++;
              break;
            case 'offered':
              newStatusCounts.offered++;
              break;
            case 'accepted':
              newStatusCounts.accepted++;
              break;
          }
        });
        setApplications(applications);
        setFilteredApplications(applications);
        setStatusCounts(newStatusCounts);
      } catch (error) {
        console.error('Error refreshing applications:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MovingText />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">JobTrackr Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
                <CardTitle className="text-lg font-semibold text-gray-700">Total Applications</CardTitle>
                <CardContent className="text-4xl font-bold text-blue-600 mt-2">
                  {applications.length}
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
                <CardTitle className="text-lg font-semibold text-gray-700">Applied</CardTitle>
                <CardContent className="text-4xl font-bold text-blue-600 mt-2">
                  {statusCounts.applied}
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
                <CardTitle className="text-lg font-semibold text-gray-700">Interviewing</CardTitle>
                <CardContent className="text-4xl font-bold text-yellow-600 mt-2">
                  {statusCounts.interviewing}
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
                <CardTitle className="text-lg font-semibold text-gray-700">Offer</CardTitle>
                <CardContent className="text-4xl font-bold text-green-600 mt-2">
                  {statusCounts.offered}
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
                <CardTitle className="text-lg font-semibold text-gray-700">Accepted</CardTitle>
                <CardContent className="text-4xl font-bold text-purple-600 mt-2">
                  {statusCounts.accepted}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md md:flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] p-2 border border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="offered">Offer</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Applications</h2>
              <Button onClick={() => {
                setSelectedApplication(undefined);
                setIsFormOpen(true);
              }}>Add Application</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView applications={applications} />
          </TabsContent>

          <TabsContent value="profile">
            <Profile />
          </TabsContent>
        </Tabs>

        <ApplicationForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen}
          application={selectedApplication}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
} 