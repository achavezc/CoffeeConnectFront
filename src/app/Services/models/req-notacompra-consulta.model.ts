export class ReqNotaCompraConsultar {

    constructor(pNumero: string, pNroGuiaRecep: string, pNombreRZ: string,
        pTipDocId: string, productoId: string, pNroDoc: string, pCodSocio: string,
        pEstadoId: string, pTipoId: string, pFecInicio: Date, pFecFin: Date,
        pEmpresaId: number) {

        this.Numero = pNumero;
        this.NumeroGuiaRecepcion = pNroGuiaRecep;
        this.NombreRazonSocial = pNombreRZ;
        this.TipoDocumentoId = pTipDocId;
        this.NumeroDocumento = pNroDoc;
        this.CodigoSocio = pCodSocio;
        this.EstadoId = pEstadoId;
        this.TipoId = pTipoId;
        this.FechaInicio = pFecInicio;
        this.FechaFin = pFecFin;
        this.EmpresaId = pEmpresaId;
        this.ProductoId = productoId;
    }

    Numero: string;
    NumeroGuiaRecepcion: string;
    NombreRazonSocial: string;
    TipoDocumentoId: string;
    ProductoId: string;
    NumeroDocumento: string;
    CodigoSocio: string;
    EstadoId: string;
    TipoId: string;
    FechaInicio: Date;
    FechaFin: Date;
    EmpresaId: number;
}