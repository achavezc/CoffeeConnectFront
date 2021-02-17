export class ReqNotaCompraConsultar {

    constructor(pNumero: string, pNroGuiaRecep: string, pNombreRZ: string,
        pTipDocId: string, pNroDoc: string, pCodSocio: string,
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
    }

    Numero: string;
    NumeroGuiaRecepcion: string;
    NombreRazonSocial: string;
    TipoDocumentoId: string;
    NumeroDocumento: string;
    CodigoSocio: string;
    EstadoId: string;
    TipoId: string;
    FechaInicio: Date;
    FechaFin: Date;
    EmpresaId: number;
}