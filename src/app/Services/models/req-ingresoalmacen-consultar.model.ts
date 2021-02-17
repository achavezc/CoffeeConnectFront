export class ReqIngresoAlmacenConsultar {
    constructor(pNumero: string,
        pNombreRazonSocial: string,
        pTipoDocumentoId: string,
        pProductoId: string,
        pSubProductoId: string,
        pNumeroDocumento: string,
        pCodigoSocio: string,
        pEstadoId: string,
        pFechaInicio: Date,
        pFechaFin: Date,
        pEmpresaId: number,
        pAlmacenId?: number) {
        this.Numero = pNumero;
        this.NombreRazonSocial = pNombreRazonSocial;
        this.TipoDocumentoId = pTipoDocumentoId;
        this.ProductoId = pProductoId;
        this.SubProductoId = pSubProductoId;
        this.NumeroDocumento = pNumeroDocumento;
        this.CodigoSocio = pCodigoSocio;
        this.EstadoId = pEstadoId;
        this.FechaInicio = pFechaInicio;
        this.FechaFin = pFechaFin;
        this.EmpresaId = pEmpresaId;
        this.AlmacenId = pAlmacenId;
    }

    Numero: string;
    NombreRazonSocial: string;
    TipoDocumentoId: string;
    ProductoId: string;
    SubProductoId: string;
    NumeroDocumento: string;
    CodigoSocio: string;
    EstadoId: string;
    FechaInicio: Date;
    FechaFin: Date;
    EmpresaId: number;
    AlmacenId?: number;
}