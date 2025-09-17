// infrastructure/api/EmployeeApiRepository.ts
import { EmployeeRepository } from '../../core/ports/EmployeeRepository';
import { Employee, EmployeeResponse } from '../../core/domain/Employee';
import { PaginationParams } from '../../core/domain/ApiConfig';
import { HttpClient } from '../../core/ports/HttpClient';

export class EmployeeApiRepository implements EmployeeRepository {
  constructor(private httpClient: HttpClient) {}

  // Server-side (si alguna vez lo necesitas)
  async getAllEmployees(params: PaginationParams, cfg?: { signal?: AbortSignal }): Promise<EmployeeResponse> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    const raw = await this.httpClient.get<any>(`/api/Employees?${query.toString()}`, { signal: cfg?.signal });
    return normalizeEmployeeResponse(raw);
  }

  // Client-side: trae TODO
  async getAllEmployeesClient(cfg?: { signal?: AbortSignal }): Promise<Employee[]> {
    // Asumiendo que /api/Employees sin query devuelve un array plano
    const raw = await this.httpClient.get<any>(`/api/Employees`, { signal: cfg?.signal });
    if (Array.isArray(raw)) return raw as Employee[];

    // Si tu API envía { employees:[], totalCount } u otra forma
    const norm = normalizeEmployeeResponse(raw);
    return norm.employees;
  }

  async getEmployeeById(id: string, cfg?: { signal?: AbortSignal }): Promise<Employee> {
    return await this.httpClient.get<Employee>(`/api/Employees/${id}`, { signal: cfg?.signal });
  }

  async getEmployeeByDocumentNumber(documentNumber: string, cfg?: { signal?: AbortSignal }): Promise<Employee> {
    return await this.httpClient.get<Employee>(`/api/Employees/document/${documentNumber}`, { signal: cfg?.signal });
  }
}

function normalizeEmployeeResponse(raw: any): any {
  if (Array.isArray(raw)) return { employees: raw as Employee[], totalCount: raw.length };
  if (Array.isArray(raw?.employees)) return { employees: raw.employees, totalCount: raw.totalCount ?? raw.employees.length };
  if (Array.isArray(raw?.items)) return { employees: raw.items, totalCount: raw.total ?? raw.items.length };
  if (Array.isArray(raw?.data)) return { employees: raw.data, totalCount: raw.total ?? raw.data.length };
  return { employees: [], totalCount: 0 };
}
