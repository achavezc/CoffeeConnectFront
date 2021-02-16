export class ReqNotaCompraConsultar {

    constructor(private pNumero: string, private pNroGuiaRecep: string,
        private pNombreRZ: string, private pTipDocId: string,
        private pProductoId: string, private pNroDoc: string,
        private pCodSocio: string, private pEstadoId: string,
        private pTipoId: string, private pFecInicio: Date,
        private pFecFin: Date, private pEmpresaId: number) {

        this.Numero = pNumero;
        this.NumeroGuiaRecepcion = pNroGuiaRecep;
        this.NombreRazonSocial = pNombreRZ;
        this.TipoDocumentoId = pTipDocId;
        this.ProductoId = pProductoId;
        this.NumeroDocumento = pNroDoc;
        this.CodigoSocio = pCodSocio;
        this.EstadoId = pEstadoId;
        this.TipoId = pTipoId;
        this.FechaInicio = pFecInicio;
        this.FechaFin = pFecFin;
        this.EmpresaId = pEmpresaId;
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