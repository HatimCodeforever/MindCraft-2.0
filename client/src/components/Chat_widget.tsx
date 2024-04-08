import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faTimes,
  faPaperPlane,
  faMicrophone,
  faMicrophoneAltSlash,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../assets/chat_widget.css'; // Import your styles

const ChatWidget: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const audioChunks = useRef<Array<Blob>>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Send the audioBlob to the server
        sendAudioToServer(audioBlob);
        audioChunks.current = [];
      };

      mediaRecorder.current.start();
    });
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();

      // Ensure the stop method is called after a short delay
      setTimeout(() => {
        // Reset the microphone stream
        const stream = mediaRecorder.current?.stream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }, 100);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      setLoading(true);

      // Create a FormData object and append the audioBlob with a key
      const formData = new FormData();
      formData.append('voice', audioBlob, 'voice.wav');

      // Send the FormData to the Flask route using axios
      const response = await axios.post("/api/voice-chat", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUserMessage(response.data.chatbotResponse);
    } catch (error) {
      console.error('Error sending audio to server:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSendMessage = async () => {
    let newChatHistory = [...chatHistory];
    newChatHistory.push({ role: 'user', message: userMessage });
    let index = localStorage.getItem('active_index');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userdata: userMessage, index_no: index }),
      });

      const data = await response.json();

      const chatbotResponse = data.chatbotResponse;

      const newChatHistoryWithResponse = [
        ...newChatHistory,
        { role: 'chatbot', message: chatbotResponse },
      ];
      setChatHistory(newChatHistoryWithResponse);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
    } finally {
      setLoading(false);
    }

    setUserMessage('');
  };



  const handleStartVoiceInput = () => {
    startRecording();
    setListening(true);
  };

  const handleStopVoiceInput = () => {
    stopRecording();
    setListening(false);
  };

  const parseMessage = (message) => {
    const parts = message.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        // Not bold part
        return parseNewlines(parseLinks(part));
      } else {
        // Bold part
        return <strong key={index}>{part}</strong>;
      }
    });
  };
  
  const parseNewlines = (text) => {
    if (Array.isArray(text)) {
      return text; // Return as it is if it's already an array
    }
  
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };
  const parseLinks = (text) => {
    console.log(typeof text)
    if (typeof text !== 'string') {
      return text; // Return as it is if it's not a string
    }
  
    // Regular expression to find links in the format [link text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    let result = [];
    let lastIndex = 0;
    let match;
  
    // Iterate over all matches
    while ((match = linkRegex.exec(text)) !== null) {
      // Push text before the link
      result.push(text.substring(lastIndex, match.index));
  
      // Push the link
      result.push(
        <a key={match.index} style={{color: "blue"}} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
  
      lastIndex = match.index + match[0].length;
    }
  
    // Push the remaining text after the last link
    result.push(text.substring(lastIndex));
    return result;
  };
  
  

  return (
    <div>
      <div className="floating-chatbot-button" onClick={() => setShowChatbot(!showChatbot)}>
        <FontAwesomeIcon icon={faRobot} />
      </div>
      {showChatbot && (
        <div className={`chatbot-interface ${showChatbot ? 'opened' : ''}`}>
          <button className="close-button" onClick={() => setShowChatbot(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="chat-history">
            {chatHistory.map((item, index) => (
              <div key={index} className={`message ${item.role}`}>
                {item.role === 'user' ? (
                  <div>
                    <strong>User:</strong><br></br> {item.message}
                  </div>
                ) : (
                  <div>
                    <strong>Chatbot:</strong><br></br>
                     {parseMessage(item.message)}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="loading-dots">Loading...</div>}
          </div>
          <div className="user-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button onClick={handleSendMessage} style={{ marginRight: '10px' }}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <button onClick={listening ? handleStopVoiceInput : handleStartVoiceInput}>
              <FontAwesomeIcon icon={listening ? faMicrophoneAltSlash : faMicrophone} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
