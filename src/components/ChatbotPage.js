import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import './ChatbotPage.css';
import lightIcon from './light-icon.svg';
import darkIcon from './dark-icon.svg';
import discordIcon from './discord-icon.svg';
import logoutIcon from './logout-icon.svg';
import sendIcon from './send.svg';
import plusIcon from './plus.svg';
import profileIcon from './profile-icon.svg';
import arrowIcon from './arrow.svg';
import chatIcon from './chat-icon.svg';
import editIcon from './edit-icon.svg';
import removeIcon from './remove-icon.svg';

const ChatbotPage = () => {
  const [isLightMode, setIsLightMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return storedMode ? storedMode === 'light' : false;
  });
  
  useEffect(() => {
    localStorage.setItem('themeMode', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [chatLogs, setChatLogs] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
    const fetchChatLogs = async () => {
      const email = localStorage.getItem('email');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chatlogs/${email}`);
        const logs = response.data;
        setChatLogs(logs);
        if (logs.length > 0) {
          setCurrentChatId(logs[0].id);
          setMessages(logs[0].messages || []);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error('Error loading chat logs:', err);
        createNewChat();
      }
    };
    fetchChatLogs();
  }, []);

  useEffect(() => {
    localStorage.setItem('chatLogs', JSON.stringify(chatLogs));
  }, [chatLogs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: messages.length > 1 ? 'smooth' : 'auto'
    });
  }, [messages]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleLightMode = () => setIsLightMode(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login', { state: { successMessage: 'Successfully logged out' } });
  };

  const createNewChat = () => {
    const newChatId = uuidv4();
    const welcomeMessage = {
      text: "Hello! I'm your culinary assistant John. Ask me about any world cuisine, recipes, or cooking techniques!",
      sender: 'bot',
      isNewChat: true,
      timestamp: new Date().toISOString()
    };
    
    setCurrentChatId(newChatId);
    setMessages([welcomeMessage]);
    
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [welcomeMessage],
      createdAt: new Date().toISOString()
    };
    setChatLogs(prev => [newChat, ...prev]);
  };

  const handleNewChat = () => {
    setIsResetting(true);
    setMessages([]);
    setTimeout(() => {
      createNewChat();
      setIsResetting(false);
    }, 300);
  };

  const loadChat = (chatId) => {
    const chatToLoad = chatLogs.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setCurrentChatId(chatId);
      setMessages(chatToLoad.messages);
    }
  };

  const startEditing = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = (id) => {
    setChatLogs(prev => prev.map(chat => 
      chat.id === id ? { ...chat, title: editTitle } : chat
    ));
    setEditingChatId(null);
  };

  const removeChat = (id) => {
    setChatLogs(prev => prev.filter(chat => chat.id !== id));
    if (id === currentChatId) {
      createNewChat();
    }
  };

  const typeWriterEffect = (text, callback) => {
    let i = 0;
    const speed = 20;
    const typing = () => {
      if (i < text.length) {
        callback(text.substring(0, i + 1));
        i++;
        setTimeout(typing, speed);
      }
    };
    typing();
  };

  const generateRecipeImage = async (dishName) => {
    try {
      setIsGeneratingImage(true);
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(dishName)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
      );
      if (response.data.results.length > 0) {
        return {
          url: response.data.results[0].urls.regular,
          alt: dishName
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const extractDishName = (recipeText) => {
    const headingMatch = recipeText.match(/^##\s+(.+)$/m);
    if (headingMatch) return headingMatch[1];
    return message.split(' ').slice(0, 5).join(' ');
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject("Geolocation not supported by your browser.");
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject("Location access denied or unavailable.");
        }
      );
    });
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const lockedChatId = currentChatId; // Lock the chat ID at the time message is sent
  
    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
  
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setIsTyping(true);
  
    // Track GA4 event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'send_chat_message', {
        event_category: 'Chatbot',
        event_label: message,
      });
    }
  
    const isFirstMessage = newMessages.filter(msg => msg.sender === 'user').length === 1;
  
    try {
      const systemPrompt = {
        role: "system",
        content: "You are a knowledgeable culinary expert specializing in all world cuisines, cooking techniques, and food science. Use context from the conversation to answer follow-up questions accurately."
      };
  
      const contextMessages = newMessages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
  
      const textResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [systemPrompt, ...contextMessages],
        temperature: 0.7,
        max_tokens: 1000
      });
  
      let recipeText = textResponse.choices[0]?.message?.content ||
        "Sorry, I couldn't generate a response. Please try again with a culinary question.";
  
      let imageData = null;
      let nearbyRestaurants = '';
  
      if (!recipeText.includes("I specialize only in food-related topics")) {
        const dishName = extractDishName(recipeText);
        recipeText = recipeText.replace(/!\[.*\]\(.*\)/g, '');
  
        if (isFirstMessage) {
          imageData = await generateRecipeImage(dishName);
  
          try {
            const { lat, lng } = await getUserLocation();
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/restaurants/nearby`, {
              params: { dish: dishName, lat, lng }
            });
  
            const list = res.data?.restaurants || [];
            nearbyRestaurants = list.length
              ? `\n\n**Nearby Restaurants:**\n${list.slice(0, 5).map((r, i) => `${i + 1}. [${r.name}](${r.url}) - ${r.address}`).join('\n')}`
              : `\n\n*No nearby restaurants found for "${dishName}".*`;
          } catch (err) {
            console.warn("Restaurant fetch failed:", err);
            nearbyRestaurants = `\n\n*Could not retrieve nearby restaurants due to a location or server issue.*`;
          }
        }
      }
  
      recipeText += nearbyRestaurants;
  
      const botMessage = {
        text: recipeText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        markdown: true,
        image: imageData
      };
  
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
  
      typeWriterEffect(recipeText, (displayedText) => {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: displayedText
            };
          }
          return newMessages;
        });
      });
  
      const updatedChat = {
        id: lockedChatId,
        title: message.slice(0, 30) + (message.length > 30 ? '...' : '') || 'New Chat',
        messages: updatedMessages,
        createdAt: new Date().toISOString()
      };
  
      setChatLogs(prev => prev.map(chat => chat.id === lockedChatId ? updatedChat : chat));
  
      const email = localStorage.getItem('email');
      if (email) {
        await axios.post(`${process.env.REACT_APP_API_URL}/chatlogs/${email}`, {
          chatLogs: chatLogs.map(chat => chat.id === lockedChatId ? updatedChat : chat)
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, I encountered an error. Please try again with a different culinary question.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const redirectToDiscord = () => {
    window.open('https://discord.gg/ZkCwK9jp', '_blank');
  };

  return (
    <div className={`chatbot-container ${isResetting ? 'resetting' : ''} ${isLightMode ? 'light-mode' : ''}`}>
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-collapse" onClick={toggleSidebar}>
          <img src={arrowIcon} alt="Toggle sidebar" className={`collapse-icon ${isSidebarCollapsed ? 'rotated' : ''}`} />
        </div>
        {!isSidebarCollapsed && (
          <>
            <div className="new-chat-section">
              <button className="new-chat-button" onClick={handleNewChat}>
                <img src={plusIcon} alt="New Chat" className="plus-icon" />
                New Chat
              </button>
              <div className="chat-log-container">
                {chatLogs.map(chat => (
                  <div key={chat.id} className={`chat-log-item ${chat.id === currentChatId ? 'active' : ''}`} onClick={() => loadChat(chat.id)}>
                    <img src={chatIcon} alt="Chat" className="chat-log-icon" />
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => saveEdit(chat.id)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(chat.id)}
                        autoFocus
                        className="chat-log-edit-input"
                      />
                    ) : (
                      <span className="chat-log-title">{chat.title}</span>
                    )}
                    <div className="chat-log-actions">
                      <button onClick={(e) => { e.stopPropagation(); startEditing(chat); }} className="chat-log-action-btn">
                        <img src={editIcon} alt="Edit" className="chat-log-action-icon" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeChat(chat.id); }} className="chat-log-action-btn">
                        <img src={removeIcon} alt="Remove" className="chat-log-action-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-bottom">
              <ul className="sidebar-list">
                <div className="divider"></div>
                <li onClick={toggleLightMode}>
                  <img src={isLightMode ? darkIcon : lightIcon} alt="Theme toggle" className="sidebar-icon" />
                  {isLightMode ? 'Dark mode' : 'Light mode'}
                </li>
                <li onClick={redirectToDiscord}>
                  <img src={discordIcon} alt="Discord" className="sidebar-icon" />
                  YourHungry AI Discord
                </li>
                <li onClick={handleLogout}>
                  <img src={logoutIcon} alt="Log out" className="sidebar-icon" />
                  Log out
                </li>
              </ul>
              <div className="user-profile">
                <img src={profileIcon} alt="Profile" className="profile-icon" />
                <span className="user-email">
                  {localStorage.getItem('email') || "user@example.com"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="main-content">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'} ${msg.isNewChat ? 'new-chat-message' : ''}`}>
              {msg.image && (
                <div className="recipe-image-container">
                  <img src={msg.image.url} alt={msg.image.alt} className="recipe-image" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              {msg.markdown ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="message bot-message typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              {isGeneratingImage && <div className="image-generating-text">Generating image...</div>}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbar">
          <input
            type="text"
            placeholder="Ask about any cuisine, recipe, or cooking technique..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="send-button" disabled={!message.trim() || isTyping} onClick={handleSendMessage}>
            <img src={sendIcon} alt="Send" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;