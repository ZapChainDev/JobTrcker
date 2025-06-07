import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, Timestamp, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ApplicationForm from '../components/ApplicationForm';
import { JobApplication, StatusChange } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '../components/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function Dashboard() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | undefined>(undefined);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Calculate analytics
  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, { applied: 0, interviewing: 0, rejected: 0, offer: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(
          applicationsRef,
          where('userId', '==', user.uid),
          orderBy('applicationDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const apps: JobApplication[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as JobApplication);
        });
        setApplications(apps);
        setFilteredApplications(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.jobTitle.toLowerCase().includes(query) ||
          app.companyName.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, searchQuery]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedApplication(undefined); // Clear selected application when form closes
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
          orderBy('applicationDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const apps: JobApplication[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as JobApplication);
        });
        setApplications(apps);
        setFilteredApplications(apps);
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
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg rounded-lg p-4 text-center">
              <CardTitle className="text-lg font-semibold text-gray-700">Total Applications</CardTitle>
              <CardContent className="text-4xl font-bold text-blue-600 mt-2">
                {totalApplications}
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
                {statusCounts.offer}
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
                <SelectItem value="offer">Offer</SelectItem>
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

          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No applications yet. Add your first job application!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold mb-1">{app.jobTitle}</CardTitle>
                      <p className="text-sm opacity-90">{app.companyName}</p>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-700">
                      <span className="font-medium">Applied:</span>
                      <span>{new Date(app.applicationDate).toLocaleDateString()}</span>
                    </div>
                    {app.notes && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span>
                        <p className="mt-1 text-gray-600 leading-relaxed">{app.notes}</p>
                      </div>
                    )}
                    {app.resumeLink && (
                      <div className="text-sm">
                        <a
                          href={app.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
                        >
                          View Resume <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/> </svg>
                        </a>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Dialog open={isFormOpen && selectedApplication?.id === app.id} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-100 flex items-center" onClick={() => setSelectedApplication(app)}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Application</DialogTitle>
                          </DialogHeader>
                          <ApplicationForm
                            isOpen={isFormOpen && selectedApplication?.id === app.id}
                            onClose={handleCloseForm}
                            application={selectedApplication}
                            onSuccess={handleFormSuccess}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600 text-white flex items-center"
                        onClick={() => handleDelete(app.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                    <p className="text-sm">Status: {app.status}</p>
                    {/* Status History */}
                    {app.statusHistory && app.statusHistory.length > 0 && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Status History:</span>
                        <p className="mt-1 text-gray-600 leading-relaxed">
                          {app.statusHistory
                            .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime())
                            .map((entry, index) => (
                              <span key={index}>
                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                {index < app.statusHistory.length - 1 && ' → '}
                              </span>
                            ))}
                        </p>
                      </div>
                    )}
                    {app.notes && (
                      <p className="text-sm text-muted-foreground">
                        {app.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView applications={applications} />
        </TabsContent>
      </Tabs>

      {isFormOpen && selectedApplication === undefined && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ApplicationForm
              isOpen={isFormOpen && selectedApplication === undefined}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
} 