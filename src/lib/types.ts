import { Timestamp } from 'firebase/firestore';

interface StatusChange {
  status: 'applied' | 'interviewing' | 'rejected' | 'offer';
  timestamp: Timestamp;
}

interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offer';
  notes: string;
  resumeLink: string;
  websiteLink?: string;
  statusHistory: StatusChange[];
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  motivation: string;
  themeColor?: string;
}

export type { StatusChange, JobApplication, UserProfile }; 