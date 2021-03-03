export interface ILogin {
    Result: result;
  }

  interface result {
    Success: boolean;
    ErrCode: string;
    Message: string;
    Meta: meta;
    Data: data;
    ProductoPreciosDia: ProductoPreciosDia;
    
  }
  interface data
  {
    IdUsuario: string;
    EmpresaId: number;
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
  interface ProductoPreciosDia
  {
    TotaProductoIdl: string;
    SubProductoId: string;
    PrecioDia: number;
  }
