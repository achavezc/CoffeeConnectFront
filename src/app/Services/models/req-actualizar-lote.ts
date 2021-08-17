export class ReqActualizarLote {
    constructor(
       
    LoteId: number,
    AlmacenId:string,
    Usuario: string,
    Cantidad: number,
    TotalKilosNetosPesado:number,
    TotalKilosBrutosPesado: number,
    NotasIngresoAlmacenId:  IdsAccion[],
   )
    {
        
       
        this.LoteId = LoteId,
        this.AlmacenId = AlmacenId,
        this.Usuario = Usuario,       
        this.Cantidad = Cantidad ,
        this.TotalKilosNetosPesado = TotalKilosNetosPesado,
        this.TotalKilosBrutosPesado = TotalKilosBrutosPesado,
        this.NotasIngresoAlmacenId = NotasIngresoAlmacenId
    }
    LoteId: number;
    AlmacenId:string;
    Usuario: string;
    Cantidad: number;
    TotalKilosNetosPesado:number;
    TotalKilosBrutosPesado: number;
    NotasIngresoAlmacenId:  IdsAccion[];
}

 export class IdsAccion
{
    Id : number;
    Accion: string;

}
