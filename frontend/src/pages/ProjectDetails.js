// src/pages/ProjectDetails.js
import React, { useState, useRef, useEffect } from 'react'; // Импорт useRef и useEffect
import { useParams } from 'react-router-dom';
import { 
  Container,
  Typography,
  Paper,
  Chip,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Drawer,
  CircularProgress,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic'; // Уже добавлен
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'; // Добавлено
import axios from 'axios'; // Добавьте этот импорт
import { styled } from '@mui/material/styles'; // Добавлено

// Добавьте стилизованный компонент для Canvas
const Canvas = styled('canvas')({
  width: '100%',
  height: '100px',
  backgroundColor: 'transparent',
});

function ProjectDetails({ projects, onAddTask, onUpdateTask }) {
  const { id } = useParams();
  const project = projects.find(p => p.id === Number(id));

  // СНАЧАЛА ВСЕ useState / useRef / useEffect
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    content: '',
    fileName: '',
    fileUrl: '',
    file: null
  });
  const [isRecording, setIsRecording] = useState(false); // Уже добавлено
  const [isLoading, setIsLoading] = useState(false); // Добавлено
  
  const mediaRecorderRef = useRef(null); // Реф для MediaRecorder
  const audioChunksRef = useRef([]); // Реф для хранения аудио данных
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);
  const canvasRef = useRef(null);

  // useEffect ВСЕГДА НА ВЕРХНЕМ УРОВНЕ
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

  if (!project) {
    return <Container>Project not found</Container>;
  }

  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  const handleTaskSubmit = () => {
    const newTask = {
      id: Date.now(),
      ...taskForm,
      createdAt: new Date().toISOString(),
    };
    onAddTask(project.id, newTask);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium' });
    setIsAddingTask(false);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleCloseNoteDialog = () => {
    setIsAddingNote(false);
    setNoteForm({ content: '', fileName: '', fileUrl: '' });
  };

  const handleNoteSubmit = async () => {
    // Создаём локальную заметку (для отображения в UI)
    const newNote = {
      id: Date.now(),
      ...noteForm,
      createdAt: new Date().toISOString(),
    };

    // Обновляем задачу в локальном состоянии
    const updatedTask = {
      ...selectedTask,
      notes: [...(selectedTask.notes || []), newNote]
    };
    onUpdateTask(project.id, updatedTask);
    setSelectedTask(updatedTask);

    // Отправляем запрос на сервер для сохранения в базе данных
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", "1"); // Замените на нужный user_id
      formData.append("project_name", project.title);
      formData.append("task_name", selectedTask?.title || "");
      formData.append("note_text", noteForm.content);

      // Если пользователь прикрепил файл
      if (noteForm.file) {
        formData.append("file", noteForm.file);
      }

      console.log("Отправляемые данные:", Object.fromEntries(formData.entries()));

      await axios.post("http://localhost:8090/create_task", formData);
      // create_task автоматически запускает update_faiss_index в фоновом режиме
    } catch (error) {
      console.error("Ошибка при сохранении заметки в RAG_service:", error);
    } finally {
      setIsLoading(false);
      handleCloseNoteDialog();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNoteForm({
        ...noteForm,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        file: file,
      });
    }
  };

  const handleStartRecording = async () => {
    if (!isRecording) {
      // Проверка поддержки браузером
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
          setIsLoading(true); // Установить загрузку
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.wav');

          try {
            // Отправка аудио на сервер для транскрипции
            const response = await axios.post('http://localhost:8000/transcribe', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (response.data.text) {
              setNoteForm((prev) => ({
                ...prev,
                content: prev.content ? `${prev.content} ${response.data.text}` : response.data.text,
              }));
            } else {
              alert('Не удалось получить транскрипцию.');
            }
          } catch (error) {
            console.error('Ошибка транскрипции:', error);
            alert('Произошла ошибка при транскрипции голоса.');
          } finally {
            // Остановка визуализации
            cancelAnimationFrame(animationIdRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close();
            }
            setIsLoading(false); // Сбросить загрузку
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

  // Функция для визуализации звуковых волн
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
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4">{project.title}</Typography>
          <Button variant="contained" color="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Box>
        
        <Chip 
          label={project.status}
          color={
            project.status === 'active' ? 'success' : 
            project.status === 'frozen' ? 'warning' : 
            'default'
          }
          sx={{ mb: 2 }}
        />

        <Typography variant="body1" sx={{ mb: 4 }}>
          {project.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>
          <TextField
            select
            label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Tasks</Typography>
        
        <List>
          {project.tasks?.filter(task => statusFilter === 'all' || task.status === statusFilter)
            .filter(task => priorityFilter === 'all' || task.priority === priorityFilter)
            .map(task => (
              <ListItem 
                key={task.id}
                onClick={() => handleTaskClick(task)}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer'
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      {task.description}
                      <Typography variant="caption" color="textSecondary" display="block">
                        Priority: {task.priority}
                      </Typography>
                    </>
                  }
                />
                <Chip
                  label={task.status}
                  color={
                    task.status === 'done' ? 'success' :
                    task.status === 'in_progress' ? 'warning' :
                    'default'
                  }
                  size="small"
                />
              </ListItem>
            ))}
        </List>

        <Dialog open={isAddingTask} onClose={() => setIsAddingTask(false)}>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
              sx={{ mb: 2 }}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddingTask(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleTaskSubmit}>Add Task</Button>
          </DialogActions>
        </Dialog>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <Box sx={{ width: 400, p: 2 }}>
            <Typography variant="h6">{selectedTask?.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedTask?.description}
            </Typography>

            <Typography variant="subtitle1">Notes:</Typography>
            <List>
              {selectedTask?.notes?.map((note) => (
                <ListItem key={note.id}>
                  <ListItemText primary={note.content} />
                  {note.fileName && (
                    <Button href={note.fileUrl} download={note.fileName}>
                      {note.fileName}
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>

            <Button variant="contained" onClick={handleAddNote} sx={{ mt: 2 }}>
              Add Note
            </Button>

            {/* Dialog for adding a new note */}
            <Dialog open={isAddingNote} onClose={handleCloseNoteDialog}>
              <DialogTitle>New Note</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Note Content"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      color={isRecording ? "error" : "primary"}
                      onClick={handleStartRecording}
                      startIcon={<MicIcon />}
                      sx={{ mr: isRecording ? 1 : 0 }}
                    >
                      {isRecording ? "Stop" : "Record Voice"}
                    </Button>
                    {isRecording && <FiberManualRecordIcon color="error" />} {/* Добавлено */}
                  </Box>
                </Box>

                {/* Добавляем Canvas для визуализации */}
                {isRecording && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Canvas ref={canvasRef} width={600} height={100} />
                  </Box>
                )}

                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
                <Button variant="contained" component="label">
                  Attach File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
                {noteForm.fileName && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {noteForm.fileName}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseNoteDialog}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={handleNoteSubmit}
                  disabled={isLoading} // Отключить кнопку во время загрузки
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Drawer>

        {/* Добавить индикатор загрузки */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

      </Paper>
    </Container>
  );
}

export default ProjectDetails;