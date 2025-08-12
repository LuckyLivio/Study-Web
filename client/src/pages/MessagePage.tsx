import React from 'react';
import MessageBoard from '../components/messages/MessageBoard';

const MessagePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MessageBoard />
    </div>
  );
};

export default MessagePage;