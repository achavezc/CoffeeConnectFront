export interface Login {
    Result: result;
  }

  interface result {
    Success: boolean;
    ErrCode: string;
    Message: string;
    Meta: meta;
    Data: data;
    Opciones: Opciones[];
  }
  interface data
  {
    IdUsuario: string;
    NombreUsuario: string;
    NombreCompletoUsuario: string;
    RazonSocialEmpresa: string;
    RucEmpresa: string;
    DireccionEmpresa: string;
    LogoEmpresa: string;
  }
  interface Opciones
  {
    Path: string;
    Title: string;
    Icon: string;
    Class: string;
    Badge: string;
    IsExternalLink: string;
  }
  interface meta
  {
    Total: number;
    Identificador: string;
  }