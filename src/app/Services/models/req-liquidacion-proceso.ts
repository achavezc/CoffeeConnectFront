export class ReqLiquidacionProceso {
    constructor(
        LiquidacionProcesoPlantaId: number,
        OrdenProcesoPlantaId: number,
        Numero: string,
        EmpresaId: number,
        Observacion: string,
        EnvasesProductos: string,
        TrabajosRealizados: string,
        EstadoId: string,
        Usuario: string,
        LiquidacionProcesoPlantaDetalle : LiquidacionProcesoPlantaDetalle[],
        LiquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[])
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
        this.TrabajosRealizados = TrabajosRealizados;
        this.EstadoId = EstadoId;
        this. Usuario = Usuario;
        this.LiquidacionProcesoPlantaDetalle = LiquidacionProcesoPlantaDetalle;
        this.LiquidacionProcesoPlantaResultado = LiquidacionProcesoPlantaResultado;
    }

    LiquidacionProcesoPlantaId: number;
    OrdenProcesoPlantaId: number;
    Numero: string;
    EmpresaId: number;
    Observacion: string;
    EnvasesProductos: string;
    TrabajosRealizados: string;
    EstadoId: string;
    Usuario: string;
    LiquidacionProcesoPlantaDetalle : LiquidacionProcesoPlantaDetalle[];
    LiquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[];

}

export class LiquidacionProcesoPlantaDetalle 
{
    constructor(
    
    NotaIngresoPlantaId: string,
    LiquidacionProcesoPlantaDetalleId?: number,
    LiquidacionProcesoPlantaId?: number
    )
    {
        this.LiquidacionProcesoPlantaDetalleId = LiquidacionProcesoPlantaDetalleId;
        this.LiquidacionProcesoPlantaId = LiquidacionProcesoPlantaId;
        this.NotaIngresoPlantaId = NotaIngresoPlantaId;
    }
    LiquidacionProcesoPlantaDetalleId: number;
    LiquidacionProcesoPlantaId: number;
    NotaIngresoPlantaId: string;
}

export class LiquidacionProcesoPlantaResultado 
{
    constructor(
    ReferenciaId: string,
    CantidadSacos: number,
    KGN: number,
    KilosNetos: number,
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
    }
    LiquidacionProcesoPlantaResultadoId: number;
    LiquidacionProcesoPlantaId: number;
    ReferenciaId: string;
    CantidadSacos: number;
    KGN: number;
    KilosNetos: number;

}