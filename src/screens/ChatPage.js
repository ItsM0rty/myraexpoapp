import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  ChevronRight, 
  MoreHorizontal, 
  Send 
} from 'lucide-react-native';

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  const chatList = [
    { 
      id: 1, 
      name: 'Alex', 
      username: 'alexfrommicrosoft',
      avatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'val??', 
      time: '2h ago',
      unread: true
    },
    { 
      id: 2, 
      name: 'Rohan', 
      username: 'rohan.05',
      avatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: 'wsggg', 
      time: '5h ago',
      unread: false
    },
    { 
      id: 3, 
      name: 'Kar', 
      username: 'karibs',
      avatar: 'https://i.pravatar.cc/150?img=8',
      lastMessage: 'sup big bro!', 
      time: '1d ago',
      unread: false
    },
  ];

  const messages = {
    1: [
      { id: 1, text: 'Hey, what are you up to?', sender: 'them', time: '10:30 AM' },
      { id: 2, text: 'Not much, just working on some code', sender: 'me', time: '10:32 AM' },
      { id: 3, text: 'val??', sender: 'them', time: '11:45 AM' },
    ],
    2: [
      { id: 1, text: 'Yo', sender: 'them', time: '9:00 AM' },
      { id: 2, text: 'wsggg', sender: 'them', time: '9:01 AM' },
    ],
    3: [
      { id: 1, text: 'Hey bro!', sender: 'them', time: 'Yesterday' },
      { id: 2, text: 'sup big bro!', sender: 'them', time: 'Yesterday' },
    ]
  };

  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      console.log(`Sending message to ${activeChat}: ${message}`);
      setMessage('');
    }
  };

  const getCurrentChat = () => {
    return chatList.find(c => c.id === activeChat);
  };

  const renderChatList = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity>
            <Text style={styles.newChatButton}>New Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.chatList}>
        {chatList.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={styles.chatItem}
            onPress={() => setActiveChat(chat.id)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: chat.avatar }} 
                style={styles.avatar}
              />
              {chat.unread && (
                <View style={styles.unreadBadge} />
              )}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatPreview}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unread && (
                  <View style={styles.unreadDot} />
                )}
              </View>
            </View>
            <ChevronRight color="#6B7280" size={20} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChatScreen = () => {
    const currentChat = getCurrentChat();
    
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveChat(null)}
          >
            <ChevronRight 
              color="#FFFFFF" 
              size={24} 
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Image 
            source={{ uri: currentChat.avatar }} 
            style={styles.chatHeaderAvatar}
          />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{currentChat.name}</Text>
            <Text style={styles.chatHeaderUsername}>@{currentChat.username}</Text>
          </View>
          <TouchableOpacity>
            <MoreHorizontal color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages[activeChat]?.map((msg) => (
            <View 
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'me' ? styles.messageRowRight : styles.messageRowLeft
              ]}
            >
              <View 
                style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myMessageBubble : styles.theirMessageBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.sender === 'me' ? styles.myMessageText : styles.theirMessageText
                ]}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  msg.sender === 'me' ? styles.myMessageTime : styles.theirMessageTime
                ]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Message..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity 
              onPress={handleSendMessage}
              disabled={!message.trim()}
              style={styles.sendButton}
            >
              <Send 
                color={message.trim() ? '#3B82F6' : '#6B7280'} 
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return !activeChat ? renderChatList() : renderChatScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newChatButton: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    marginRight: 8,
  },
  chatHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatHeaderUsername: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 12,
  },
  messageRowLeft: {
    alignSelf: 'flex-start',
  },
  messageRowRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#27272A',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#BFDBFE',
  },
  theirMessageTime: {
    color: '#6B7280',
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
});