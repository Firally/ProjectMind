// src/pages/CreateProject.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem
} from '@mui/material';

function CreateProject({ setProjects }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prevProjects => [...prevProjects, newProject]);

    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Новый проект</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            sx={{ mb: 3 }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="frozen">Frozen</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" fullWidth>
            Создать новый проект
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateProject;