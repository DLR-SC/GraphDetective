import React, { createContext, useState } from 'react';
import MessageAlert from '../components/message_components/MessageAlert';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
    const [messageOpen, setMessageOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info')
    const autoHideDuration = 6000;

    // severity<"warning"|"info"|"error"|"success">
    const displayUserMessage = (message, severity) => {
        setMessage(message);
        setMessageOpen(true);
        setSeverity(severity);
    };

    const handleCloseMessage = () => {
        setMessageOpen(false);
        setMessage('');
    };

    return (
        <MessageContext.Provider value={{ displayUserMessage }}>
            {children}
            <MessageAlert
                open={messageOpen}
                message={message}
                onClose={handleCloseMessage}
                severity={severity}
                autoHideDuration={autoHideDuration}
            />
        </MessageContext.Provider>
    );
};

export { MessageContext, MessageProvider };
