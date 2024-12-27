// src/components/Navbar.js
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { authenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h4" 
          component={Link} 
          to="/dashboard" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            fontFamily: "'Dancing Script', cursive",
            fontSize: '2.5rem',
            letterSpacing: '2px'
          }}
        >
          ProjectMind
        </Typography>
        {authenticated ? (
          <>
            <Button 
              color="inherit" 
              component={Link} 
              to="/create"
              sx={{ mr: 2 }}
            >
              Новый проект
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Войти
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Регистрация
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;