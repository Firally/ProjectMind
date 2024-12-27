// src/pages/ProjectList.js
import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Typography, 
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProjectList({ projects, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    status: 'active',
  });

  const handleProjectClick = (id) => {
    navigate(`/project/${id}`);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setEditFormData({
      description: project.description,
      status: project.status,
    });
    setEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    if (projectToDelete) {
      try {
        console.log(`Удаление проекта: ${projectToDelete.title}`);
        await axios.delete(`http://localhost:8090/delete_project`, {
          params: {
            user_id: "1", // Замените на нужный user_id
            project_name: projectToDelete.title
          }
        });
        onDelete(projectToDelete.id);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Ошибка при удалении проекта:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleEditSubmit = () => {
    if (projectToEdit) {
      const updatedProject = {
        ...projectToEdit,
        description: editFormData.description,
        status: editFormData.status,
      };
      onUpdate(updatedProject);
      setEditDialogOpen(false);
      setProjectToEdit(null);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setProjectToEdit(null);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, color: 'text.primary' }}>
        Проекты
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card 
              sx={{ 
                position: 'relative',
                backgroundColor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  '& .delete-button': {
                    opacity: 1,
                  },
                  '& .edit-button': {
                    opacity: 1,
                  },
                  '& .folder-icon': { // Добавляем селектор для иконки папки
                    color: 'primary.main', // Используем фиолетовый цвет из темы
                  }
                },
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => handleProjectClick(project.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FolderIcon 
                    className="folder-icon" // Добавляем класс для иконки
                    sx={{ 
                      fontSize: 40, 
                      color: 'text.secondary',
                      mr: 2,
                      transition: 'color 0.3s ease', // Добавляем плавный переход для цвета
                    }} 
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {project.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={project.status}
                    color={
                      project.status === 'active' ? 'success' : 
                      project.status === 'frozen' ? 'warning' : 
                      'default'
                    }
                    size="small"
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton 
                  className="edit-button"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 40,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }
                  }}
                  onClick={(e) => handleEditClick(e, project)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  className="delete-button"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }
                  }}
                  onClick={(e) => handleDeleteClick(e, project)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Удалить проект</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить проект "{projectToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
      >
        <DialogTitle>Редактировать проект</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={editFormData.description}
            onChange={handleEditChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Статус"
            name="status"
            value={editFormData.status}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="active">Активный</MenuItem>
            <MenuItem value="frozen">Заморожен</MenuItem>
            <MenuItem value="completed">Завершен</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Отмена</Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProjectList;