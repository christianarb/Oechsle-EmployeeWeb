import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { EmployeeApiRepository } from '../../../infrastructure/api/EmployeeApiRepository';
import { AxiosHttpClient } from '../../../infrastructure/http/AxiosHttpClient';
import { Employee } from '../../../core/domain/Employee';

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Instancias estables
  const httpClient = useMemo(() => new AxiosHttpClient(), []);
  const employeeRepo = useMemo(() => new EmployeeApiRepository(httpClient), [httpClient]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Trae TODO; la grilla pagina en memoria
        const all = await employeeRepo.getAllEmployeesClient({ signal: controller.signal });
        if (controller.signal.aborted) return;

        setEmployees(all);
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.name === 'CanceledError') return;
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching employees:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [employeeRepo]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'documentNumber', headerName: 'N° Documento', width: 150 },
    {
      field: 'salary',
      headerName: 'Salario',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(params.value)}
        </Typography>
      ),
    },
    { field: 'age', headerName: 'Edad', width: 100 },
    {
      field: 'profile',
      headerName: 'Perfil',
      width: 150,
      renderCell: (params) => <Chip label={params.value} size="small" color="primary" variant="outlined" />,
    },
    {
      field: 'admissionDate',
      headerName: 'Fecha Ingreso',
      width: 150,
      renderCell: (p) => <Typography variant="body2">{new Date(p.value).toLocaleDateString('es-ES')}</Typography>,
    },
    {
      field: 'createdAt',
      headerName: 'Creado En',
      width: 150,
      renderCell: (p) => <Typography variant="body2">{new Date(p.value).toLocaleDateString('es-ES')}</Typography>,
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>Error al cargar empleados: {error}</Alert>;
  }

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>Gestión de Empleados</Typography>
        <Typography variant="body2" color="textSecondary">Lista de empleados registrados en el sistema</Typography>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employees}
          columns={columns}
          // 👇 Client-side
          paginationMode="client"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          loading={loading}
          disableRowSelectionOnClick
          // Si tu entidad no se llama 'id', define el id único aquí
          getRowId={(row) => row.id}
          sx={{ '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.main', color: 'white' } }}
        />
      </Box>
    </Paper>
  );
};

export default EmployeeTable;
