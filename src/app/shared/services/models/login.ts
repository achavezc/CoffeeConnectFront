export interface ILogin {
    Result: result;
  }

  interface result {
    Success: boolean;
    ErrCode: string;
    Message: string;
    Meta: meta;
    Data: data;
    
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
    Opciones: Opciones[];
  }
  interface Opciones
  {
    Path: string;
    Title: string;
    Icon: string;
    Class: string;
    Badge: number;
    BadgeClass: string;
    IsExternalLink: boolean;
    Submenu: string[];
  }
  interface meta
  {
    Total: number;
    Identificador: string;
  }

  export const LoginTest: Opciones[] =
  [{
    Path: "",
    Title: "Test",
    Icon: "ft-arrow-right submenu-icon",
    Class: "",
    Badge: 2,
    BadgeClass: "badge badge-pill badge-danger float-right mr-1 mt-1",
    IsExternalLink: false,
    Submenu: []
  }]