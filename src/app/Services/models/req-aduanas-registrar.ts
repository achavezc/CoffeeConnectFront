export class ReqAduanas {
    constructor(
        AduanaId: number,
        ContratoId: number,
        EmpresaExportadoraId: number,
        EmpresaProductoraId: number,
        EmpresaId: number,
        Numero: string,
        Marca: string,
        PO: string,
        LaboratorioId: string,
        FechaEnvioMuestra: Date,
        NumeroSeguimientoMuestra: string,
        EstadoMuestraId: string,
        FechaRecepcionMuestra: Date,
        NavieraId: string,
        Observacion: string,
        Courier: string,
        Certificaciones: Certificaciones[],
        FechaEmbarque: Date,
        FechaFacturacion: Date,
        Usuario: string,
        EmpresaAgenciaAduaneraId: number,
        Detalle: Detalle[],
        EstadoSeguimientoId: string) {
            
        if (AduanaId != 0) {
            this.AduanaId = AduanaId
        }
        if (Numero != "") {
            this.Numero = Numero
        }

        this.ContratoId = ContratoId;
        this.EmpresaExportadoraId = EmpresaExportadoraId;
        this.EmpresaProductoraId = EmpresaProductoraId;
        this.EmpresaId = EmpresaId;
        this.Marca = Marca;
        this.PO = PO;
        this.LaboratorioId = LaboratorioId;
        this.FechaEnvioMuestra = FechaEnvioMuestra;
        this.NumeroSeguimientoMuestra = NumeroSeguimientoMuestra;
        this.EstadoMuestraId = EstadoMuestraId;
        this.FechaRecepcionMuestra = FechaRecepcionMuestra;
        this.NavieraId = NavieraId;
        this.Observacion = Observacion;
        this.Courier = Courier;
        this.Certificaciones = Certificaciones;
        this.FechaEmbarque = FechaEmbarque;
        this.FechaFacturacion = FechaFacturacion;
        this.Usuario = Usuario;
        this.EmpresaAgenciaAduaneraId = EmpresaAgenciaAduaneraId;
        this.Detalle = Detalle;
        this.EstadoSeguimientoId = EstadoSeguimientoId;
    }

    AduanaId: number;
    ContratoId: number;
    EmpresaExportadoraId: number;
    EmpresaProductoraId: number;
    EmpresaId: number;
    Numero: string;
    Marca: string;
    PO: string;
    LaboratorioId: string;
    FechaEnvioMuestra: Date;
    NumeroSeguimientoMuestra: string;
    EstadoMuestraId: string;
    FechaRecepcionMuestra: Date;
    NavieraId: string;
    Observacion: string;
    Courier: string;
    Certificaciones: Certificaciones[];
    FechaEmbarque: Date;
    FechaFacturacion: Date;
    Usuario: string;
    EmpresaAgenciaAduaneraId: number;
    Detalle: Detalle[];
    EstadoSeguimientoId: string;
}

export class Certificaciones {
    EmpresaProveedoraAcreedoraId: number;
    TipoCertificacionId: string;
    CodigoCertificacion: string;
    TipoId: string;
}

export class Detalle {
    NroNotaIngresoPlanta: string;
    CantidadSacos: number;
    NumeroLote: string;
    KilosNetos: number;
}
