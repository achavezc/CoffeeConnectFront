export class ReqAduanas {
    constructor(
        EmpresaId: number,
        AduanaId: number,
        Numero: string,
        ContratoId: number,
        EmpresaAgenciaAduaneraId: number,
        EmpresaExportadoraId: number,
        EmpresaProductoraId: number,
        NumeroContratoInternoProductor: string,
        NumeroContenedores: number,
        FechaEnvioMuestra: Date,
        FechaRecepcionMuestra: Date,
        EstadoMuestraId: string,
        Courier: string,
        NumeroSeguimientoMuestra: string,
        Observacion: string,
        FechaEnvioDocumentos: Date,
        FechaLlegadaDocumentos: Date,        
        Certificaciones: Certificaciones[],
        
        Detalle: Detalle[],
        Usuario: string,
        Cargamentos: Cargamento[]
        ) {
            
        if (AduanaId != 0) {
            this.AduanaId = AduanaId
        }
        if (Numero != "") {
            this.Numero = Numero
        }
        this.EmpresaId = EmpresaId;
        this.ContratoId = ContratoId;
        this.EmpresaExportadoraId = EmpresaExportadoraId;
        this.EmpresaProductoraId = EmpresaProductoraId;
        this.NumeroContratoInternoProductor = NumeroContratoInternoProductor;
        this.NumeroContenedores = NumeroContenedores;
        this.FechaRecepcionMuestra = FechaRecepcionMuestra;
        this.Courier = Courier;
        this.FechaEnvioMuestra = FechaEnvioMuestra;
        this.NumeroSeguimientoMuestra = NumeroSeguimientoMuestra;
        this.EstadoMuestraId = EstadoMuestraId;
        this.FechaRecepcionMuestra = FechaRecepcionMuestra;
        this.Observacion = Observacion;
        this.FechaEnvioDocumentos = FechaEnvioDocumentos;
        this.FechaLlegadaDocumentos = FechaLlegadaDocumentos;
        this.Certificaciones = Certificaciones;
        this.Usuario = Usuario;
        this.EmpresaAgenciaAduaneraId = EmpresaAgenciaAduaneraId;
        this.Detalle = Detalle;
        this.Cargamentos = Cargamentos;
        
    }

    EmpresaId: number;
    AduanaId: number;
    Numero: string;
    ContratoId: number;
    EmpresaAgenciaAduaneraId: number;
    EmpresaExportadoraId: number;
    EmpresaProductoraId: number;
    NumeroContratoInternoProductor: string;
    NumeroContenedores: number
    EstadoSeguimientoId: string;
    FechaEstampado: Date;
    FechaEnvioMuestra: Date;
    FechaRecepcionMuestra: Date;
    Courier: string;
    NumeroSeguimientoMuestra: string;
    EstadoMuestraId: string;
    Observacion: string;
    FechaEnvioDocumentos :Date;
    FechaLlegadaDocumentos :Date;
    Certificaciones: Certificaciones[];    
    Usuario: string;    
    Detalle: Detalle[];
    Cargamentos : Cargamento[];
    
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

export class Cargamento {
    AduanaId: Number;
    Cantidad: number;
    PesoPorSacoKilos: number;
    TotalKilosNetos: number;
    NumeroContenedorEmbarcar: string;
    FechaSalidaPlanta: Date;
    FechaZarpeNave: Date;
    FechaFacturacion: Date;
    Puerto: string;
    Marca: string;
    PO: string;
    EstadoSeguimientoId: string;
    FechaEstampado : number;
}
