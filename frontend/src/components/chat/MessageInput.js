import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './MessageInput.css';

/**
 * Message input component
 */
const MessageInput = ({ onSendMessage, disabled }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [message, setMessage] = useState('');
  const recordTimerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    // No text required: allow image or voice-only messages
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
      setSelectedPreview('');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setSelectedPreview(reader.result);
      reader.readAsDataURL(file);
    }
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    setSelectedPreview('');
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaRecorder not supported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          setAudioChunks((prev) => [...prev, ev.data]);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const payload = {
            text: message.trim(),
            media: reader.result,
            mediaType: 'audio/webm'
          };
          onSendMessage(payload).catch(() => {});
          setMessage('');
          setAudioChunks([]);
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const formatTime = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="message-input-wrapper">
      {selectedPreview && (
        <div className="media-preview">
          <img src={selectedPreview} alt="preview" className="media-preview-img" />
          <button
            type="button"
            className="media-preview-remove"
            onClick={clearSelectedImage}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}

      {isRecording && (
        <div className="recording-bar">
          <span className="recording-dot" />
          <span className="recording-time">{formatTime(recordSeconds)}</span>
          <span className="recording-label">Recording...</span>
        </div>
      )}

      <form className="message-input-container" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`icon-btn ${selectedFile ? 'icon-btn-active' : ''}`}
          onClick={handleFileSelect}
          disabled={disabled || isRecording}
          title="Send image"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        <button
          type="button"
          className={`icon-btn ${isRecording ? 'icon-btn-recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          title={isRecording ? 'Stop recording' : 'Record voice note'}
        >
          {isRecording ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          )}
        </button>

        <input
          type="text"
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? 'Recording voice note...' : 'Type a message...'}
          disabled={disabled || isRecording}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={disabled}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={(!message.trim() && !selectedFile && !audioChunks.length) || disabled}
          className="send-btn"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Button>
      </form>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default MessageInput;
