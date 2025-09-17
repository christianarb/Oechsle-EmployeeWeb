import { Employee, EmployeeResponse } from '../domain/Employee';
import { PaginationParams } from '../domain/ApiConfig';
export interface EmployeeRepository {
  getAllEmployees(params: PaginationParams): Promise<EmployeeResponse>;
  getEmployeeById(id: string): Promise<Employee>;
  getEmployeeByDocumentNumber(documentNumber: string): Promise<Employee>;
}