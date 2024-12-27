import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';

const ChatDialog = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      visualize();
    } else {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const handleSend = async () => {
    if (message.trim()) {
      // Добавляем сообщение пользователя
      setChatHistory(prev => [...prev, { text: message, sender: 'user' }]);
      setIsLoading(true);

      try {
        const response = await axios.post('http://localhost:8090/get_LLM_answer', {
          user_id: "1",
          query: message,
          top_k: 1
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.model_answer) {
          setChatHistory(prev => [...prev, { text: response.data.model_answer, sender: 'bot' }]);
        } else {
          alert('Не удалось получить ответ от модели.');
        }
      } catch (error) {
        console.error('Ошибка при получении ответа от модели:', error);
        alert('Произошла ошибка при получении ответа от модели.');
      } finally {
        setIsLoading(false);
        setMessage('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartRecording = async () => {
    if (!isRecording) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Ваш браузер не поддерживает голосовую запись.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        // Настройка Web Audio API для визуализации
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        source.connect(analyserRef.current);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsLoading(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.wav');

          try {
            const response = await axios.post('http://localhost:8000/transcribe', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (response.data.text) {
              setChatHistory(prev => [...prev, { text: response.data.text, sender: 'user' }]);
            } else {
              alert('Не удалось получить транскрипцию.');
            }
          } catch (error) {
            console.error('Ошибка транскрипции:', error);
            alert('Произошла ошибка при транскрипции голоса.');
          } finally {
            cancelAnimationFrame(animationIdRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close();
            }
            setIsLoading(false);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        alert('Не удалось получить доступ к микрофону.');
      }
    } else {
      // Остановка записи
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const visualize = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#4f46e5';

      canvasCtx.beginPath();

      const sliceWidth = (WIDTH * 1.0) / analyserRef.current.fftSize;
      let x = 0;

      for (let i = 0; i < analyserRef.current.fftSize; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '400px',
          height: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>Чат с помощником</DialogTitle>
      <DialogContent sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {chatHistory.map((msg, index) => (
            <Paper
              key={index}
              sx={{
                p: 1,
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                wordBreak: 'break-word', // Добавлено
                overflowWrap: 'break-word', // Добавлено
                '& > p': { // Добавлено
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }
              }}
            >
              <Typography 
                color={msg.sender === 'user' ? 'white' : 'text.primary'}
                sx={{ 
                  whiteSpace: 'pre-wrap', // Добавлено
                  wordBreak: 'break-word', // Добавлено
                }}
              >
                {msg.text}
              </Typography>
            </Paper>
          ))}
        </Box>
        {/* Добавляем Canvas для визуализации */}
        {isRecording && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <canvas ref={canvasRef} width={360} height={100} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          sx={{ mr: 1 }}
        />
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <IconButton 
            color={isRecording ? 'error' : 'primary'}
            onClick={handleStartRecording}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        )}
        <Button 
          onClick={handleSend}
          variant="contained"
          endIcon={<SendIcon />}
          color="primary"
          sx={{ 
            color: 'white' // Add white color for text
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;