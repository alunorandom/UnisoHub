export interface RPGStat {
  name: string;
  value: number;
  icon: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  role?: string;
  skills?: string;
  strengths?: string;
  photoURL?: string;
  rpgStats?: RPGStat[];
  rpgSkills?: RPGStat[];
  isProfessor?: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  creatorId: string;
  bossName?: string;
  difficulty?: number; // 1 to 5
  createdAt: any;
}

export interface Group {
  id: string;
  classId: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  maxMembers: number;
  createdAt: any;
}

export interface Application {
  id: string;
  groupId: string;
  applicantId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: any;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}
