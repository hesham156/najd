/**
 * شاشة الشات - Mobile App
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Chat,
  Message,
  MessageType,
  createChatId,
  getAllowedChatUsers,
} from '@shared/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ChatScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // جلب جميع المحادثات
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatsData: Chat[] = [];
        snapshot.forEach((doc) => {
          chatsData.push({
            id: doc.id,
            ...doc.data(),
          } as Chat);
        });
        setChats(chatsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching chats:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateChat = async (otherUser: any) => {
    if (!user) return;

    const chatId = createChatId(user.uid, otherUser.uid);

    try {
      // التحقق من وجود المحادثة
      const chatDoc = await getDocs(
        query(collection(db, 'chats'), where('__name__', '==', chatId))
      );

      if (chatDoc.empty) {
        // إنشاء محادثة جديدة
        const newChat: Omit<Chat, 'id'> = {
          type: 'direct',
          participants: [user.uid, otherUser.uid],
          participantsData: {
            [user.uid]: {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: user.role as any,
              department: user.department as any,
              isHead: user.isHead,
            },
            [otherUser.uid]: {
              uid: otherUser.uid,
              displayName: otherUser.displayName,
              photoURL: otherUser.photoURL,
              role: otherUser.role,
              department: otherUser.department,
              isHead: otherUser.isHead,
            },
          },
          unreadCount: {
            [user.uid]: 0,
            [otherUser.uid]: 0,
          },
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          createdBy: user.uid,
        };

        await addDoc(collection(db, 'chats'), newChat);
      }

      // فتح المحادثة
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
      setShowNewChatModal(false);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (selectedChat) {
    return (
      <ChatWindow
        chat={selectedChat}
        currentUserId={user!.uid}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المحادثات</Text>
        <TouchableOpacity
          onPress={() => setShowNewChatModal(true)}
          style={styles.newChatButton}
        >
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* قائمة المحادثات */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            currentUserId={user!.uid}
            onPress={() => setSelectedChat(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chat-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>لا توجد محادثات</Text>
            <Text style={styles.emptySubText}>ابدأ محادثة جديدة</Text>
          </View>
        }
      />

      {/* Modal لإنشاء محادثة جديدة */}
      <NewChatModal
        visible={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectUser={handleCreateChat}
      />
    </View>
  );
}

// مكون عنصر في قائمة المحادثات
function ChatListItem({
  chat,
  currentUserId,
  onPress,
}: {
  chat: Chat;
  currentUserId: string;
  onPress: () => void;
}) {
  const otherUserId = chat.participants.find((p) => p !== currentUserId);
  const otherUser = otherUserId ? chat.participantsData[otherUserId] : null;
  const unreadCount = chat.unreadCount?.[currentUserId] || 0;

  if (!otherUser) return null;

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.chatItemContent}>
        {/* صورة المستخدم */}
        <View style={styles.avatarContainer}>
          {otherUser.photoURL ? (
            <Image
              source={{ uri: otherUser.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {otherUser.displayName.charAt(0)}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* معلومات المحادثة */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{otherUser.displayName}</Text>
            {chat.lastMessage && (
              <Text style={styles.chatTime}>
                {formatDistanceToNow(chat.lastMessage.timestamp.toDate(), {
                  addSuffix: true,
                  locale: ar,
                })}
              </Text>
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage?.text || 'لا توجد رسائل'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// مكون نافذة المحادثة
function ChatWindow({
  chat,
  currentUserId,
  onBack,
}: {
  chat: Chat;
  currentUserId: string;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const otherUserId = chat.participants.find((p) => p !== currentUserId);
  const otherUser = otherUserId ? chat.participantsData[otherUserId] : null;

  // جلب الرسائل
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((doc) => {
          messagesData.push({
            id: doc.id,
            ...doc.data(),
          } as Message);
        });
        setMessages(messagesData);
        setLoading(false);

        // التمرير للأسفل
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chat.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !user) return;

    setSending(true);
    try {
      const newMessage: Omit<Message, 'id'> = {
        chatId: chat.id,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: user.role as any,
        senderPhotoURL: user.photoURL,
        type: 'text',
        text: messageText.trim(),
        status: 'sent',
        readBy: [user.uid],
        createdAt: serverTimestamp() as Timestamp,
      };

      await addDoc(collection(db, 'chats', chat.id, 'messages'), newMessage);

      // تحديث آخر رسالة
      const chatRef = doc(db, 'chats', chat.id);
      await updateDoc(chatRef, {
        lastMessage: {
          text: messageText.trim(),
          senderId: user.uid,
          senderName: user.displayName,
          timestamp: serverTimestamp(),
          type: 'text',
        },
        updatedAt: serverTimestamp(),
      });

      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!otherUser) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-right" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherUser.displayName}</Text>
          <Text style={styles.headerSubtitle}>
            {getRoleLabel(otherUser.role)}
          </Text>
        </View>
      </View>

      {/* الرسائل */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.senderId === currentUserId}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#1E40AF" />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد رسائل</Text>
              <Text style={styles.emptySubText}>ابدأ المحادثة الآن!</Text>
            </View>
          )
        }
      />

      {/* نموذج الإرسال */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="اكتب رسالتك..."
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Icon name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// مكون فقاعة الرسالة
function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <View
      style={[
        styles.messageBubble,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <Text
        style={[styles.messageText, isOwn && styles.ownMessageText]}
      >
        {message.text}
      </Text>
      <Text
        style={[styles.messageTime, isOwn && styles.ownMessageTime]}
      >
        {message.createdAt &&
          formatDistanceToNow(message.createdAt.toDate(), {
            addSuffix: true,
            locale: ar,
          })}
      </Text>
    </View>
  );
}

// مكون Modal لإنشاء محادثة جديدة
function NewChatModal({
  visible,
  onClose,
  onSelectUser,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
}) {
  const { user } = useAuth();
  const [allowedUsers, setAllowedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!visible || !user) return;

    const fetchAllowedUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('isActive', '==', true));
        const snapshot = await getDocs(q);

        const allUsers = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        const allowed = getAllowedChatUsers(
          {
            uid: user.uid,
            role: user.role as any,
            department: user.department as any,
            isHead: user.isHead,
          },
          allUsers as any
        );

        setAllowedUsers(allowed);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoading(false);
      }
    };

    fetchAllowedUsers();
  }, [visible, user]);

  const filteredUsers = allowedUsers.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>محادثة جديدة</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="بحث عن موظف..."
          />
        </View>

        {/* قائمة المستخدمين */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => onSelectUser(item)}
            >
              {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.displayName.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName}</Text>
                <Text style={styles.userRole}>
                  {getRoleLabel(item.role)} - {getDepartmentLabel(item.department)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color="#1E40AF" />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'لا توجد نتائج' : 'لا يوجد مستخدمين متاحين'}
                </Text>
              </View>
            )
          }
        />
      </View>
    </Modal>
  );
}

// دوال مساعدة
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ceo: 'المدير التنفيذي',
    sales: 'مبيعات',
    sales_head: 'مدير المبيعات',
    design: 'مصمم',
    design_head: 'مدير التصميم',
    printing: 'طباعة',
    printing_head: 'مدير الطباعة',
    accounting: 'محاسب',
    accounting_head: 'مدير الحسابات',
    dispatch: 'إرسال',
    dispatch_head: 'مدير الإرسال',
  };
  return labels[role] || role;
}

function getDepartmentLabel(department: string): string {
  const labels: Record<string, string> = {
    management: 'الإدارة',
    sales: 'المبيعات',
    design: 'التصميم',
    printing: 'الطباعة',
    accounting: 'الحسابات',
    dispatch: 'الإرسال',
  };
  return labels[department] || department;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  headerInfo: {
    flex: 1,
  },
  newChatButton: {
    padding: 8,
  },
  backButton: {
    marginLeft: 12,
  },
  chatItem: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatTime: {
    fontSize: 12,
    color: '#64748B',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E40AF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
  },
  ownMessageText: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#BFDBFE',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748B',
  },
});


