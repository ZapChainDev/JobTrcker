import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  id?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  age?: string;
  course?: string;
  motivation?: string;
  name?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  appliedDate: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
  website?: string;
  location?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  interviewDate?: Timestamp;
  offerDate?: Timestamp;
  startDate?: Timestamp;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  companyDescription?: string;
  jobDescription?: string;
  applicationUrl?: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  attachments?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  source?: string;
  referral?: string;
  followUpDate?: Timestamp;
  nextSteps?: string;
  feedback?: string;
  rejectionReason?: string;
  offerDetails?: {
    salary: string;
    benefits: string[];
    startDate: Timestamp;
    endDate?: Timestamp;
    notes?: string;
  };
}

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
  websiteLink: string;
  statusHistory: StatusChange[];
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  motivation: string;
}

export type { StatusChange, JobApplication, UserProfile }; 