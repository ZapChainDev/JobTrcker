import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication } from '../lib/types';
import { ApplicationCard } from '../components/ApplicationCard';

export function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobApplication['status'] | 'all'>('all');

  const fetchApplications = async () => {
    if (!user) return;
    
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    const applications = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as JobApplication;
    });
    
    setApplications(applications);
    setFilteredApplications(applications);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const applicationRef = doc(db, 'applications', id);
    const applicationDoc = await getDoc(applicationRef);
    
    if (applicationDoc.exists()) {
      const application = applicationDoc.data() as JobApplication;
      if (application.userId === user.uid) {
        await deleteDoc(applicationRef);
        fetchApplications();
      }
    }
  };

  const handleEdit = (application: JobApplication) => {
    // Implement edit functionality
    console.log('Edit application:', application);
  };

  const handleStatusChange = async (applicationId: string, newStatus: JobApplication['status']) => {
    if (!user) return;
    
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationDoc = await getDoc(applicationRef);
    
    if (applicationDoc.exists()) {
      const application = applicationDoc.data() as JobApplication;
      if (application.userId === user.uid) {
        await updateDoc(applicationRef, {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
        fetchApplications();
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobApplication['status'] | 'all')}
          className="border rounded p-2"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
} 