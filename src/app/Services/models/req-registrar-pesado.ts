export class ReqRegistrarPesado {
    constructor(
        GuiaRecepcionMateriaPrimaId:number,
        EmpresaId: number,
        TipoProvedorId: string,
        SocioId: number,
        TerceroId: number,
        IntermediarioId: number,
        ProductoId: string,
        SubProductoId: string,
        NumeroReferencia: string,
        FechaCosecha: Date,
        UsuarioPesado: string,
        UnidadMedidaIdPesado: string,
        CantidadPesado: number,
        KilosBrutosPesado: number,
        TaraPesado?: number,
        ObservacionPesado?: string,
        SocioFincaId?: number,
        TerceroFincaId?: number,
        IntermediarioFinca?: string,
        TipoProduccionId?: string,
        SocioFincaCertificacion?: string

        ) {
        this.GuiaRecepcionMateriaPrimaId = GuiaRecepcionMateriaPrimaId;
        this.EmpresaId = EmpresaId;
        this.TipoProvedorId = TipoProvedorId;
        this.SocioId = SocioId;
        this.TerceroId = TerceroId;
        this.IntermediarioId = IntermediarioId;
        this.ProductoId = ProductoId;
        this.SubProductoId = SubProductoId;
        this.NumeroReferencia = NumeroReferencia;
        this.FechaCosecha = FechaCosecha;
        this.UsuarioPesado = UsuarioPesado;
        this.UnidadMedidaIdPesado = UnidadMedidaIdPesado;
        this.CantidadPesado = CantidadPesado;
        this.KilosBrutosPesado = KilosBrutosPesado;
        this.TaraPesado = TaraPesado;
        this.ObservacionPesado = ObservacionPesado;
        this.SocioFincaId = SocioFincaId;
        this.TerceroFincaId = TerceroFincaId;
        this.IntermediarioFinca = IntermediarioFinca;
        this.TipoProduccionId = TipoProduccionId;
        this.SocioFincaCertificacion = SocioFincaCertificacion;
    }
    GuiaRecepcionMateriaPrimaId: number;
    EmpresaId: number;
    TipoProvedorId: string;
    SocioId: number;
    TerceroId: number;
    IntermediarioId: number;
    ProductoId: string;
    SubProductoId: string;
    NumeroReferencia: string;
    FechaCosecha: Date;
    UsuarioPesado: string;
    UnidadMedidaIdPesado: string;
    CantidadPesado: number;
    KilosBrutosPesado: number;
    TaraPesado?: number;
    ObservacionPesado?: string;
    SocioFincaId?: number;
    TerceroFincaId?: number;
    IntermediarioFinca?: string;
    TipoProduccionId?: string;
    SocioFincaCertificacion?: string;
}

export class tableAnalisisSensorial
{
    
}