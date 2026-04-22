export interface IClassProfessor {
  userId: string;
  name: string;
  email: string;
}

export interface IClass {
  classId: string;
  code: number;
  name: string;
  professorId: string;
  professor: IClassProfessor;
  createdAt: string;
  updatedAt: string;
}

export interface IClassListItem {
  classId: string;
  code: number;
  name: string;
  professorId: string;
  professor: IClassProfessor;
  createdAt: string;
}

export interface IGetClassesResponse {
  data: IClassListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IMyClassesResponse {
  classes: IClassListItem[];
  total: number;
}

export interface IStudentClassPermissionRequest {
  classId: string;
  studentId: string;
  message: string | null;
  createdAt: string;
  class: {
    classId: string;
    name: string;
    code: number;
    professor: IClassProfessor;
  };
}
