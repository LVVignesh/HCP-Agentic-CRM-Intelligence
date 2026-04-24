import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addChatMessage, setTypingStatus, updateMultipleFields } from '../features/interactionSlice';

const ChatComponent = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { chatHistory, isTyping } = useSelector((state) => state.interaction);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to Redux
    dispatch(addChatMessage({ role: 'user', content: userMessage }));
    dispatch(setTypingStatus(true));

    try {
      // In production, this URL should come from an environment variable
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, thread_id: 'session-123' }),
      });

      const data = await response.json();

      // Add AI response to Redux
      dispatch(addChatMessage({ role: 'assistant', content: data.response }));
      
      // Sync extracted data to form
      if (data.extracted_data && Object.keys(data.extracted_data).length > 0) {
        dispatch(updateMultipleFields(data.extracted_data));
      }
    } catch (error) {
      console.error('Error communicating with AI agent:', error);
      dispatch(addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }));
    } finally {
      dispatch(setTypingStatus(false));
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between">
        <h2 className="text-white font-medium flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          AI Assistant
        </h2>
        <span className="bg-green-400 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm">Hi! I'm your AI assistant.</p>
            <p className="text-xs mt-1 text-gray-400">Describe your interaction to automatically log it.</p>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-100 border-transparent rounded-full pl-4 pr-12 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Type your notes here..."
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;
