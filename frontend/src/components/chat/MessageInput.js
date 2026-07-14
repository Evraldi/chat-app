import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './MessageInput.css';

/**
 * Message input component
 */
const MessageInput = ({ onSendMessage, disabled }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    // allow sending when there is text, image, or recorded audio
    if (!message.trim() && !selectedFile && audioChunks.length === 0) {
      return;
    }
    let media = '';
    let mediaType = '';
    if (selectedFile) {
      media = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      mediaType = selectedFile.type;
    }
    const payload = {
      text: message.trim(),
      media,
      mediaType
    };
    try {
      await onSendMessage(payload);
      setMessage('');
      setSelectedFile(null);
      setAudioChunks([]);
    } catch (error) {
      // silent fail - error handled by parent
    }
    return;
  };
    

    const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaRecorder not supported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const mediaData = reader.result;
          const payload = {
            text: message.trim(),
            media: mediaData,
            mediaType: 'audio/webm'
          };
          onSendMessage(payload).catch(() => {});
          setMessage('');
        };
        reader.readAsDataURL(blob);
        setAudioChunks([]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
            <input
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => setSelectedFile(e.target.files[0])}
        disabled={disabled}
      />
      <Button type="button" variant="secondary" className="secondary-button" onClick={handleFileSelect} disabled={disabled}>Image</Button>
      <Button type="button" variant="secondary" className="secondary-button" onClick={isRecording ? stopRecording : startRecording} disabled={disabled}>
        {isRecording ? 'Stop' : 'Record'}
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={(!message.trim() && !selectedFile && !audioChunks.length) || disabled}
      >
        Send
      </Button>
    </form>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default MessageInput;
