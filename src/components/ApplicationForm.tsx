import { useState, useEffect } from 'react';
import { doc, setDoc, Timestamp, collection, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JobApplication, StatusChange } from '@/lib/types';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  application?: JobApplication;
  onSuccess?: () => void;
}

interface ApplicationFormData {
  jobTitle: string;
  companyName: string;
  applicationDate: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offer';
  notes: string;
  resumeLink: string;
}

export default function ApplicationForm({ isOpen, onClose, application, onSuccess }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    jobTitle: '',
    companyName: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'applied',
    notes: '',
    resumeLink: '',
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (application) {
      setFormData({
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        applicationDate: application.applicationDate,
        status: application.status,
        notes: application.notes,
        resumeLink: application.resumeLink,
      });
    } else {
      setFormData({
        jobTitle: '',
        companyName: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: '',
        resumeLink: '',
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const commonData = {
        ...formData,
        userId: currentUser.uid,
      };

      if (application) {
        const updatedData: any = { ...commonData, updatedAt: Timestamp.now() };

        if (formData.status !== application.status) {
          updatedData.statusHistory = arrayUnion({
            status: formData.status,
            timestamp: Timestamp.now(),
          });
        }

        await setDoc(doc(db, 'applications', application.id), updatedData, { merge: true });
      } else {
        const newDocRef = doc(collection(db, 'applications'));
        await setDoc(newDocRef, {
          ...commonData,
          createdAt: Timestamp.now(),
          statusHistory: [
            { status: formData.status, timestamp: Timestamp.now() }
          ],
        });
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <Input
              id="jobTitle"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <Input
              id="companyName"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700">
              Application Date
            </label>
            <Input
              id="applicationDate"
              type="date"
              required
              value={formData.applicationDate}
              onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="resumeLink" className="block text-sm font-medium text-gray-700">
              Resume Link
            </label>
            <Input
              id="resumeLink"
              type="url"
              value={formData.resumeLink}
              onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : application ? 'Update' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 