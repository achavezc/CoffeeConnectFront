export class ReqOrdenServicio {
    constructor(
        OrdenServicioControlCalidadId: number,
        EmpresaId: number,
        EmpresaProcesadoraId: number,
        Numero: string,
        UnidadMedidaId: string,
        CantidadPesado: number,
        ProductoId: string,
        SubProductoId: string,
        TipoProduccionId: string,
        RendimientoEsperadoPorcentaje: number,
        UsuarioOrdenServicioControlCalidad: string) {
        if (OrdenServicioControlCalidadId != 0) {
            this.OrdenServicioControlCalidadId = OrdenServicioControlCalidadId
        }
        if (Numero != "") {
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
    CantidadPesado: number;
    ProductoId: string;
    SubProductoId: string;
    TipoProduccionId: string;
    RendimientoEsperadoPorcentaje: number;
    UsuarioOrdenServicioControlCalidad: string;

}