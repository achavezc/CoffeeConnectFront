export class ReqOrdenServicio
{
    constructor(
        OrdenServicioControlCalidadId: number,
        EmpresaId: number,
        EmpresaProcesadoraId: number,
        Numero: string,
        UnidadMedidaId: string,
        CantidadPesado : number,
        ProductoId: string,
        SubProductoId: string,
        TipoProduccionId: string,
        RendimientoEsperadoPorcentaje: number,
        EstadoId: string,
        UsuarioOrdenServicioControlCalidad: string)
    {
        if(EstadoId)
        {
        this.EstadoId = EstadoId
        }
        if(OrdenServicioControlCalidadId != 0)
            {
            this.OrdenServicioControlCalidadId = OrdenServicioControlCalidadId
            }
            if(Numero != "")
            {
            this.Numero = Numero
            }
          
           this.EmpresaId = EmpresaId;
           this.EmpresaProcesadoraId = EmpresaProcesadoraId;
           this.UnidadMedidaId = UnidadMedidaId;
           this.CantidadPesado = CantidadPesado;
           this.ProductoId = ProductoId;
           this.SubProductoId = SubProductoId;
           this.TipoProduccionId = TipoProduccionId;
           this.RendimientoEsperadoPorcentaje = RendimientoEsperadoPorcentaje;
           this.UsuarioOrdenServicioControlCalidad = UsuarioOrdenServicioControlCalidad;
    }

    OrdenServicioControlCalidadId: number;
    EmpresaId: number;
    EmpresaProcesadoraId: number;
    Numero: string;
    UnidadMedidaId: string;
    CantidadPesado : number;
    ProductoId: string;
    SubProductoId: string;
    TipoProduccionId: string;
    RendimientoEsperadoPorcentaje: number;
    EstadoId: string;
    UsuarioOrdenServicioControlCalidad: string;
    
}