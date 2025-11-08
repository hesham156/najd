/**
 * أنواع نظام الشات - Najd Company
 * نظام شات هرمي: موظف -> مدير -> CEO
 */

import { Timestamp } from 'firebase/firestore';
import { UserRole, Department } from './user.types';

/**
 * نوع الشات
 */
export enum ChatType {
  DIRECT = 'direct',           // محادثة مباشرة بين شخصين
  GROUP = 'group',             // محادثة جماعية (مدير مع فريقه)
}

/**
 * حالة الرسالة
 */
export enum MessageStatus {
  SENT = 'sent',               // تم الإرسال
  DELIVERED = 'delivered',     // تم التوصيل
  READ = 'read',               // تم القراءة
}

/**
 * نوع الرسالة
 */
export enum MessageType {
  TEXT = 'text',               // رسالة نصية
  IMAGE = 'image',             // صورة
  FILE = 'file',               // ملف
  AUDIO = 'audio',             // تسجيل صوتي
  VOICE_CALL = 'voice_call',   // مكالمة صوتية
}

/**
 * بيانات المحادثة
 */
export interface Chat {
  id: string;                           // معرف المحادثة
  type: ChatType;                       // نوع المحادثة
  participants: string[];               // معرفات المشاركين (UIDs)
  participantsData: {                   // بيانات المشاركين
    [uid: string]: {
      uid: string;
      displayName: string;
      photoURL?: string;
      role: UserRole;
      department: Department;
      isHead: boolean;
    };
  };
  
  // آخر رسالة
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Timestamp;
    type: MessageType;
  };
  
  // عدد الرسائل غير المقروءة لكل مستخدم
  unreadCount: {
    [uid: string]: number;
  };
  
  // للمحادثات الجماعية فقط
  groupName?: string;                   // اسم المجموعة (مثل: "فريق التصميم")
  groupAdminId?: string;                // معرف مدير المجموعة (عادة رئيس القسم)
  department?: Department;              // القسم المسؤول عن المجموعة
  
  createdAt: Timestamp;                 // تاريخ الإنشاء
  updatedAt: Timestamp;                 // تاريخ آخر تحديث
  createdBy: string;                    // من أنشأ المحادثة
}

/**
 * بيانات الرسالة
 */
export interface Message {
  id: string;                           // معرف الرسالة
  chatId: string;                       // معرف المحادثة
  senderId: string;                     // معرف المرسل
  senderName: string;                   // اسم المرسل
  senderRole: UserRole;                 // دور المرسل
  senderPhotoURL?: string;              // صورة المرسل
  
  type: MessageType;                    // نوع الرسالة
  text?: string;                        // نص الرسالة (للنصوص)
  fileURL?: string;                     // رابط الملف (للصور/ملفات/صوت)
  fileName?: string;                    // اسم الملف
  fileSize?: number;                    // حجم الملف بالبايت
  
  status: MessageStatus;                // حالة الرسالة
  readBy: string[];                     // قائمة المستخدمين الذين قرأوا الرسالة
  
  // الرد على رسالة
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
  
  createdAt: Timestamp;                 // تاريخ الإرسال
  updatedAt?: Timestamp;                // تاريخ التعديل (إذا تم التعديل)
  editedAt?: Timestamp;                 // تاريخ آخر تعديل
  isEdited?: boolean;                   // هل تم تعديل الرسالة
  deletedFor?: string[];                // قائمة المستخدمين الذين حذفوا الرسالة عندهم
}

/**
 * بيانات الكتابة (Typing Indicator)
 */
export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Timestamp;
}

/**
 * قواعد الاتصال الهرمية
 */
export interface ChatAccessRules {
  canChatWith: string[];                // قائمة UIDs الذين يمكن التواصل معهم
  canCreateGroupWith?: Department[];    // الأقسام التي يمكن إنشاء مجموعات معها
}

/**
 * دالة لتحديد من يمكن للمستخدم التواصل معه
 * @param currentUser المستخدم الحالي
 * @param allUsers جميع المستخدمين في النظام
 */
export function getAllowedChatUsers(
  currentUser: {
    uid: string;
    role: UserRole;
    department: Department;
    isHead: boolean;
  },
  allUsers: Array<{
    uid: string;
    role: UserRole;
    department: Department;
    isHead: boolean;
    displayName: string;
    isActive: boolean;
  }>
): Array<{
  uid: string;
  displayName: string;
  role: UserRole;
  department: Department;
  isHead: boolean;
}> {
  // تصفية المستخدمين النشطين فقط واستبعاد المستخدم الحالي
  const activeUsers = allUsers.filter(
    (u) => u.isActive && u.uid !== currentUser.uid
  );

  // CEO: يتواصل مع جميع رؤساء الأقسام
  if (currentUser.role === UserRole.CEO) {
    return activeUsers.filter((u) => u.isHead && u.role !== UserRole.CEO);
  }

  // رئيس القسم: يتواصل مع CEO + جميع موظفي قسمه
  if (currentUser.isHead) {
    return activeUsers.filter(
      (u) =>
        // CEO
        u.role === UserRole.CEO ||
        // موظفي نفس القسم (غير الرؤساء)
        (u.department === currentUser.department && !u.isHead)
    );
  }

  // موظف عادي: يتواصل مع رئيس قسمه فقط
  return activeUsers.filter(
    (u) => u.department === currentUser.department && u.isHead
  );
}

/**
 * دالة للتحقق من إمكانية إنشاء محادثة بين مستخدمين
 */
export function canCreateChat(
  user1: {
    uid: string;
    role: UserRole;
    department: Department;
    isHead: boolean;
  },
  user2: {
    uid: string;
    role: UserRole;
    department: Department;
    isHead: boolean;
  }
): boolean {
  // لا يمكن للمستخدم التواصل مع نفسه
  if (user1.uid === user2.uid) return false;

  // CEO يتواصل مع رؤساء الأقسام فقط
  if (user1.role === UserRole.CEO) {
    return user2.isHead && user2.role !== UserRole.CEO;
  }
  if (user2.role === UserRole.CEO) {
    return user1.isHead === true;
  }

  // رئيس القسم يتواصل مع موظفي قسمه فقط
  if (user1.isHead && !user2.isHead) {
    return user1.department === user2.department;
  }
  if (user2.isHead && !user1.isHead) {
    return user2.department === user1.department;
  }

  // موظف عادي لا يتواصل مع موظفين آخرين مباشرة
  return false;
}

/**
 * دالة لإنشاء معرف محادثة فريد بين مستخدمين
 */
export function createChatId(uid1: string, uid2: string): string {
  // ترتيب المعرفات أبجدياً لضمان نفس المعرف بغض النظر عن الترتيب
  return [uid1, uid2].sort().join('_');
}

/**
 * حالة المكالمة الصوتية
 */
export enum CallStatus {
  INITIATING = 'initiating',     // بدء المكالمة
  RINGING = 'ringing',           // يرن
  ONGOING = 'ongoing',           // جارية
  ENDED = 'ended',               // انتهت
  MISSED = 'missed',             // فائتة
  REJECTED = 'rejected',         // مرفوضة
  FAILED = 'failed',             // فشلت
}

/**
 * بيانات المكالمة الصوتية
 */
export interface VoiceCall {
  id: string;                           // معرف المكالمة
  chatId: string;                       // معرف المحادثة
  callerId: string;                     // من اتصل
  callerName: string;                   // اسم المتصل
  receiverId: string;                   // المستقبل
  receiverName: string;                 // اسم المستقبل
  status: CallStatus;                   // حالة المكالمة
  startedAt?: Timestamp;                // وقت بدء المكالمة
  endedAt?: Timestamp;                  // وقت انتهاء المكالمة
  duration?: number;                    // مدة المكالمة بالثواني
  createdAt: Timestamp;                 // وقت الإنشاء
  
  // WebRTC data
  offer?: any;                          // SDP Offer
  answer?: any;                         // SDP Answer
  iceCandidates?: any[];                // ICE Candidates
}

/**
 * بيانات التسجيل الصوتي
 */
export interface AudioRecording {
  id: string;                           // معرف التسجيل
  url: string;                          // رابط التسجيل في Storage
  duration: number;                     // مدة التسجيل بالثواني
  size: number;                         // حجم الملف بالبايت
  mimeType: string;                     // نوع الملف (audio/webm, audio/mp4, etc.)
  waveform?: number[];                  // شكل الموجة (للعرض المرئي)
}

