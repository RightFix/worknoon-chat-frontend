import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatWindow } from '../components/Chat/ChatWindow';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  return <ChatWindow />;
};

export default Chat;