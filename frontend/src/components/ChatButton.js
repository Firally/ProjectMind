import React, { useState } from 'react';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatDialog from './ChatDialog';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Fab 
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s'
        }}
      >
        <ChatIcon />
      </Fab>
      <ChatDialog 
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ChatButton;