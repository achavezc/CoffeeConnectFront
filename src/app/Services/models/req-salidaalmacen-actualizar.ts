

export class ReqNotaSalida
{
    constructor(
        NotaSalidaAlmacenId: number,
        EmpresaId: number,
        AlmacenId: string,
        Numero: string,
        MotivoTrasladoId: string,
        MotivoTrasladoReferencia: string,
        EmpresaIdDestino: number,
        EmpresaTransporteId: number,
        TransporteId: number,
        NumeroConstanciaMTC: string,
        MarcaTractorId: string,
        PlacaTractor: string,
        MarcaCarretaId: string,
        PlacaCarreta: string,
        Conductor: string,
        Licencia: string,
        Observacion: string,
        CantidadLotes: number,
        PesoKilosBrutos: number,
        PromedioPorcentajeRendimiento: number,
        EstadoId: string,
        UsuarioNotaSalidaAlmacen: string,
        ListNotaSalidaAlmacenDetalle: NotaSalidaAlmacenDetalleDTO[],
        CantidadTotal: number)
        {
            this.NotaSalidaAlmacenId = NotaSalidaAlmacenId,
            this.EmpresaId = EmpresaId,
            this.AlmacenId = AlmacenId,
            this.Numero = Numero,
            this.MotivoTrasladoId = MotivoTrasladoId,
            this.MotivoTrasladoReferencia = MotivoTrasladoReferencia,
            this.EmpresaIdDestino = EmpresaIdDestino,
            this.EmpresaTransporteId = EmpresaTransporteId,
            this.TransporteId = TransporteId,
            this.NumeroConstanciaMTC = NumeroConstanciaMTC,
            this.MarcaTractorId = MarcaTractorId,
            this.PlacaTractor = PlacaTractor,
            this.MarcaCarretaId = MarcaCarretaId,
            this.PlacaCarreta = PlacaCarreta,
            this.Conductor = Conductor,
            this.Licencia = Licencia,
            this.Observacion = Observacion,
            this.CantidadLotes = CantidadLotes,
            this.PesoKilosBrutos = PesoKilosBrutos,
            this.PromedioPorcentajeRendimiento = PromedioPorcentajeRendimiento,
            this.EstadoId = EstadoId,
            this.UsuarioNotaSalidaAlmacen = UsuarioNotaSalidaAlmacen,
            this.ListNotaSalidaAlmacenDetalle = ListNotaSalidaAlmacenDetalle,
            this.CantidadTotal = CantidadTotal


    }

    NotaSalidaAlmacenId: number;
    EmpresaId: number;
    AlmacenId: string;
    Numero: string;
    MotivoTrasladoId: string;
    MotivoTrasladoReferencia: string;
    EmpresaIdDestino: number;
    EmpresaTransporteId: number;
    TransporteId: number;
    NumeroConstanciaMTC: string;
    MarcaTractorId: string;
    PlacaTractor: string;
    MarcaCarretaId: string;
    PlacaCarreta: string;
    Conductor: string;
    Licencia: string;
    Observacion: string;
    CantidadLotes: number;
    PesoKilosBrutos: number;
    PromedioPorcentajeRendimiento: number;
    EstadoId: string;
    UsuarioNotaSalidaAlmacen: string;
    ListNotaSalidaAlmacenDetalle: NotaSalidaAlmacenDetalleDTO[];
    CantidadTotal: number;
}

 export class  NotaSalidaAlmacenDetalleDTO{

    LoteId: number;
    NotaSalidaAlmacenDetalleId: number;
}