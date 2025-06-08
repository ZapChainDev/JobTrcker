import { JobApplication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ApplicationCardProps {
  application: JobApplication;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
  onStatusChange: (applicationId: string, newStatus: JobApplication['status']) => Promise<void>;
}

export function ApplicationCard({ application, onEdit, onDelete, onStatusChange }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-primary text-primary-foreground';
      case 'interview':
        return 'bg-yellow-500 text-white';
      case 'offer':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden bg-card text-card-foreground border border-border">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold mb-1">{application.jobTitle}</CardTitle>
          <p className="text-sm opacity-90">{application.companyName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={application.status}
            onChange={(e) => onStatusChange(application.id, e.target.value as JobApplication['status'])}
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
          >
            <option value="applied">Applied</option>
            <option value="interview">Interviewing</option>
            <option value="offer">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center"
              onClick={() => onEdit(application)}
            >
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive" 
              size="sm" 
              className="flex items-center"
              onClick={() => onDelete(application.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span className="font-medium">Applied:</span>
          <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
        </div>
        {application.notes && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">Notes:</span>
            <p className="mt-1 text-gray-600 leading-relaxed">{application.notes}</p>
          </div>
        )}
        {application.resumeLink && (
          <div className="text-sm">
            <a
              href={application.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-foreground font-medium flex items-center"
            >
              View Resume <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/> </svg>
            </a>
          </div>
        )}
        {application.websiteLink && (
          <div className="text-sm">
            <a
              href={application.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-foreground font-medium flex items-center"
            >
              View Website <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/> </svg>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 