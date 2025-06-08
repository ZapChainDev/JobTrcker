import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { JobApplication } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarViewProps {
  applications: JobApplication[];
}

export function CalendarView({ applications }: CalendarViewProps) {
  const [value, setValue] = useState<Value>(new Date());

  // Create a map of dates to application counts
  const applicationDates = applications.reduce((acc, app) => {
    const date = new Date(app.applicationDate).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get applications for the selected date
  const selectedDate = value instanceof Date ? value : null;
  const selectedDateApplications = selectedDate
    ? applications.filter(
        (app) =>
          new Date(app.applicationDate).toDateString() ===
          selectedDate.toDateString()
      )
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Application Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <Calendar
                onChange={setValue}
                value={value}
                tileContent={({ date }) => {
                  const dateStr = date.toDateString();
                  const count = applicationDates[dateStr];
                  return count ? (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ) : null;
                }}
                className="w-full border rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2">
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Applications on {selectedDate.toLocaleDateString()}
                  </h3>
                  {selectedDateApplications.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateApplications.map((app) => (
                        <Card key={app.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{app.companyName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {app.jobTitle}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  app.status === 'applied'
                                    ? 'default'
                                    : app.status === 'interviewing'
                                    ? 'secondary'
                                    : app.status === 'offer'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {app.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No applications on this date
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 