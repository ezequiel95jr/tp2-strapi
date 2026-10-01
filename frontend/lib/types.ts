export type Estado = "abierto" | "en_curso" | "cerrado";

export type Categoria = {
  id: number;
  documentId: string;
  nombre: string;
  slug: string;
  descripcion: string;
};

export type Zona = {
  id: number;
  documentId: string;
  nombre: string;
  slug: string;
};

export type Reporte = {
  id: number;
  documentId: string;
  descripcion: string;
  fecha: string;
};

export type Incidente = {
  id: number;
  documentId: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  estado: Estado;
  fechaApertura: string;
  fechaCierre: string | null;
  categoria: Categoria | null;
  zona: Zona | null;
  reportes: Reporte[];
};

export type Paginacion = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type RespuestaPaginada<T> = {
  data: T[];
  meta: { pagination: Paginacion };
};
