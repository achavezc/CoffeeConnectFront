export class ReqControlCalidad {
    constructor() {
        
    }
    AnalisisFisicoDefectoPrimarioDetalleList: DefectosPrimarios[];
   
}

class DefectosPrimarios
{
    DefectoDetalleId : string;
    DefectoDetalleDescripcion: string;
    DefectoDetalleEquivalente: string;
    Valor: string;

}