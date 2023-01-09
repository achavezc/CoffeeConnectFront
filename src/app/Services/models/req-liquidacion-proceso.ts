export class ReqLiquidacionProceso {
    constructor(
        LiquidacionProcesoPlantaId: number,
        OrdenProcesoPlantaId: number,
        Numero: string,
        EmpresaId: number,
        Observacion: string,
        EnvasesProductos: string,
        CertificacionId: string,
        TrabajosRealizados: string,
        EstadoId: string,
        Usuario: string,
        LiquidacionProcesoPlantaDetalle : LiquidacionProcesoPlantaDetalle[],
        LiquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[],
        NumeroDefectos: number)
         {
        if (LiquidacionProcesoPlantaId != 0) {
            this.LiquidacionProcesoPlantaId = LiquidacionProcesoPlantaId
        }
        if (OrdenProcesoPlantaId != 0)
        {
            this.OrdenProcesoPlantaId = OrdenProcesoPlantaId
        }
        if (Numero != "") {
            this.Numero = Numero
        }
        this.EmpresaId = EmpresaId;
        this.Observacion = Observacion;
        this.EnvasesProductos = EnvasesProductos;
        this.CertificacionId = CertificacionId;
        
        this.TrabajosRealizados = TrabajosRealizados;
        this.EstadoId = EstadoId;
        this. Usuario = Usuario;
        this.LiquidacionProcesoPlantaDetalle = LiquidacionProcesoPlantaDetalle;
        this.LiquidacionProcesoPlantaResultado = LiquidacionProcesoPlantaResultado;
        this.NumeroDefectos = NumeroDefectos;
    }

    LiquidacionProcesoPlantaId: number;
    OrdenProcesoPlantaId: number;
    Numero: string;
    EmpresaId: number;
    Observacion: string;
    EnvasesProductos: string;
    TrabajosRealizados: string;
    EstadoId: string;
    CertificacionId: string;
    
    Usuario: string;
    LiquidacionProcesoPlantaDetalle : LiquidacionProcesoPlantaDetalle[];
    LiquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[];
    NumeroDefectos: number;

}

export class LiquidacionProcesoPlantaDetalle 
{
    constructor(
    
    NotaIngresoAlmacenPlantaId: number,
    Descripcion: string,
    PorcentajeHumedad: number,
    Cantidad: number,
    KilosNetos: number,
    KilosBrutos: number,
    LiquidacionProcesoPlantaDetalleId?: number,
    LiquidacionProcesoPlantaId?: number,

    )
    {
        this.LiquidacionProcesoPlantaDetalleId = LiquidacionProcesoPlantaDetalleId;
        this.LiquidacionProcesoPlantaId = LiquidacionProcesoPlantaId;
        this.NotaIngresoAlmacenPlantaId = NotaIngresoAlmacenPlantaId;
        this.Descripcion = Descripcion;
        this.PorcentajeHumedad = PorcentajeHumedad;
        this.KilosBrutos = KilosBrutos;
        this.Cantidad = Cantidad;
        this.KilosNetos = KilosNetos;
    }
    LiquidacionProcesoPlantaDetalleId: number;
    LiquidacionProcesoPlantaId: number;
    NotaIngresoAlmacenPlantaId: number;
    Descripcion: string;
    PorcentajeHumedad: number;
    Cantidad: number;
    KilosNetos: number;
    KilosBrutos: number;
}

export class LiquidacionProcesoPlantaResultado 
{
    constructor(
    ReferenciaId: string,
    CantidadSacos: number,
    KGN: number,
    KilosNetos: number,
    KilosBrutos: number,
    Tara: number,
    Porcentaje: number,
    EmpaqueId: string,
    TipoId: string,
    LiquidacionProcesoPlantaResultadoId?: number,
    LiquidacionProcesoPlantaId?: number,
    )
    {   
        if (LiquidacionProcesoPlantaResultadoId != 0)
        {
        this.LiquidacionProcesoPlantaResultadoId = LiquidacionProcesoPlantaResultadoId;
        }
        if (LiquidacionProcesoPlantaId != 0)
        {
        this.LiquidacionProcesoPlantaId = LiquidacionProcesoPlantaId;
        }
        this.ReferenciaId = ReferenciaId;
        this.CantidadSacos = CantidadSacos;
        this.KGN = KGN;
        this.KilosNetos = KilosNetos;
        this.KilosBrutos = KilosBrutos;
        this.Tara = Tara;
        this.Porcentaje = Porcentaje;
        this.EmpaqueId = EmpaqueId;
        this.TipoId = TipoId;
         
    }
    LiquidacionProcesoPlantaResultadoId: number;
    LiquidacionProcesoPlantaId: number;
    ReferenciaId: string;
    CantidadSacos: number;
    KGN: number;
    KilosNetos: number;
    Porcentaje: number;
    KilosBrutos: number;
    Tara: number;
    EmpaqueId: string;
    TipoId: string;

}