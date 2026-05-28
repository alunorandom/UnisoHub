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

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  classId?: string;
  className?: string;
  likesCount: number;
  likedBy: string[]; // List of user UIDs who liked/upvoted this topic
  replyCount: number;
  createdAt: any;
}

export interface ForumReply {
  id: string;
  topicId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: any;
}

export interface AcademicSummary {
  id: string;
  title: string;
  description: string;
  pdfUrl?: string; // Simulado ou URL real
  pdfName?: string; // Nome original do arquivo simula o upload de PDF
  pdfSize?: string; // Tamanho em KB/MB simulado
  subjectId: string; // ID da matéria/masmorra ou 'geral'
  subjectName: string;
  likesCount: number; // Avaliações positivas (Bom)
  dislikesCount: number; // Avaliações negativas (Ruim)
  likedBy: string[]; // Lista de quem achou 'Bom'
  dislikedBy: string[]; // Lista de quem achou 'Ruim'
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  commentCount: number;
  createdAt: any;
}

export interface SummaryComment {
  id: string;
  summaryId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: any;
}


