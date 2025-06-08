import { JobApplication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ApplicationCardProps {
  application: JobApplication;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
}

export function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-500';
      case 'interview':
        return 'bg-yellow-500';
      case 'offer':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold mb-1">{application.jobTitle}</CardTitle>
          <p className="text-sm opacity-90">{application.companyName}</p>
        </div>
        <Badge className={getStatusColor(application.status)}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </Badge>
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
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
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
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              View Job Posting <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/> </svg>
            </a>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-600 hover:bg-gray-100 flex items-center"
              onClick={() => onEdit(application)}
            >
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive" 
              size="sm" 
              className="bg-red-500 hover:bg-red-600 text-white flex items-center"
              onClick={() => onDelete(application.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 