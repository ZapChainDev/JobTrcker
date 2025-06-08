import { useState, useEffect } from 'react';
import { doc, setDoc, Timestamp, collection, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JobApplication } from '@/lib/types';

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: JobApplication;
  onSuccess?: () => void;
}

interface ApplicationFormData {
  position: string;
  company: string;
  appliedDate: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offered' | 'accepted';
  notes: string;
  applicationUrl: string;
  website: string;
}

export default function ApplicationForm({ open, onOpenChange, application, onSuccess }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    position: '',
    company: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'applied',
    notes: '',
    applicationUrl: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (application) {
      setFormData({
        position: application.position || '',
        company: application.company || '',
        appliedDate: application.appliedDate ? application.appliedDate.toDate().toISOString().split('T')[0] : '',
        status: application.status || 'applied',
        notes: application.notes || '',
        applicationUrl: application.applicationUrl || '',
        website: application.website || '',
      });
    } else {
      setFormData({
        position: '',
        company: '',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: '',
        applicationUrl: '',
        website: '',
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
        appliedDate: Timestamp.fromDate(new Date(formData.appliedDate)),
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

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <Input
              id="position"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <Input
              id="company"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">
              Application Date
            </label>
            <Input
              id="appliedDate"
              type="date"
              required
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
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
                <SelectItem value="offered">Offer</SelectItem>
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
            <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700">
              Application Link
            </label>
            <Input
              id="applicationUrl"
              type="url"
              value={formData.applicationUrl}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Company Website
            </label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : application ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 