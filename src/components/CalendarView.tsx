import { useState } from 'react';
import { JobApplication } from '@/lib/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  applications: JobApplication[];
}

export function CalendarView({ applications }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<JobApplication | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-500';
      case 'interviewing':
        return 'bg-yellow-500';
      case 'offered':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'accepted':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const events = applications.map(app => {
    const eventDate = app.interviewDate || app.appliedDate;
    
    if (eventDate) {
      return {
        id: app.id,
        title: `${app.position} at ${app.company} (${app.status})`,
        start: eventDate.toDate().toISOString().split('T')[0],
        extendedProps: {
          application: app,
        },
        color: getStatusColor(app.status).replace('bg-', '#').replace('-500', '500'),
      };
    }
    return null;
  }).filter(Boolean) as any[];

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps.application);
    setIsEventDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Application Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="auto"
        eventContent={(arg) => (
          <div className="text-xs truncate flex items-center">
            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: arg.backgroundColor }}></span>
            <span className="font-medium">{arg.event.title}</span>
          </div>
        )}
      />

      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.position} at {selectedEvent?.company}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3 text-sm">
              <p><strong>Status:</strong> <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge></p>
              <p><strong>Applied Date:</strong> {selectedEvent.appliedDate?.toDate().toLocaleDateString() ?? 'N/A'}</p>
              {selectedEvent.interviewDate && (
                <p><strong>Interview Date:</strong> {selectedEvent.interviewDate.toDate().toLocaleDateString()}</p>
              )}
              {selectedEvent.notes && (
                <p><strong>Notes:</strong> {selectedEvent.notes}</p>
              )}
              {selectedEvent.applicationUrl && (
                <p><strong>Application Link:</strong> <a href={selectedEvent.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Application</a></p>
              )}
              {selectedEvent.website && (
                <p><strong>Company Website:</strong> <a href={selectedEvent.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit Website</a></p>
              )}
            </div>
          )}
          <Button onClick={() => setIsEventDetailsOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
} 