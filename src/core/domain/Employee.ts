export interface Employee {
  id: string;
  name: string;
  documentNumber: string;
  salary: number;
  age: number;
  profile: string;
  admissionDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeeResponse {
  employees: Employee[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}


export class EmployeeModel implements Employee {
  constructor(
    public id: string,
    public name: string,
    public documentNumber: string,
    public salary: number,
    public age: number,
    public profile: string,
    public admissionDate: string,
    public createdAt: string,
    public updatedAt?: string
  ) {}

  get formattedAdmissionDate(): string {
    return new Date(this.admissionDate).toLocaleDateString('es-ES');
  }

  get formattedSalary(): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(this.salary);
  }

  get formattedCreatedAt(): string {
    return new Date(this.createdAt).toLocaleDateString('es-ES');
  }
}