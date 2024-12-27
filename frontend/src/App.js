import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import ChatButton from './components/ChatButton';
import { AuthProvider } from './context/AuthContext';
import { theme } from './theme'; // Import custom theme

const initialProjects = [];

// Компонент-обертка для ChatButton
const ChatButtonWrapper = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage) return null;
  return <ChatButton />;
};

function App() {
  const [projects, setProjects] = useState(() => {
    const existingProjects = localStorage.getItem('projects');
    return existingProjects ? JSON.parse(existingProjects) : initialProjects;
  });

  const handleDeleteProject = (id) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleAddTask = (projectId, task) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: [...(project.tasks || []), task]
            }
          : project
      )
    );
  };

  const handleUpdateTask = (projectId, updatedTask) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
              )
            }
          : project
      )
    );
  };

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ProjectList projects={projects} onDelete={handleDeleteProject} onUpdate={handleUpdateProject} />
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <PrivateRoute>
                  <ProjectDetails
                    projects={projects}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                  />
                </PrivateRoute>
              }
            />
            <Route 
              path="/create" 
              element={
                <PrivateRoute>
                  <CreateProject setProjects={setProjects} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" />} 
            />
          </Routes>
          <ChatButtonWrapper />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
