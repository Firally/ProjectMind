import React from 'react';
import ProjectList from './ProjectList';

const Dashboard = ({ projects, onDelete }) => {
  return <ProjectList projects={projects} onDelete={onDelete} />;
};

export default Dashboard;