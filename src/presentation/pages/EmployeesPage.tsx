import React from 'react';
import { Container } from '@mui/material';
import EmployeeTable from '../components/Employees/EmployeeTable';

const EmployeesPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <EmployeeTable />
    </Container>
  );
};

export default EmployeesPage;