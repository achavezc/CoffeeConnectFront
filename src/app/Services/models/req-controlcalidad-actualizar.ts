export class ReqControlCalidad {
    constructor(
    EmpresaId: number,
    GuiaRecepcionMateriaPrimaId: number,
    ExportableGramosAnalisisFisico: number,
    ExportablePorcentajeAnalisisFisico: number,
    DescarteGramosAnalisisFisico: number,
    DescartePorcentajeAnalisisFisico: number,
    CascarillaGramosAnalisisFisico: number,
    CascarillaPorcentajeAnalisisFisico: number,
    TotalGramosAnalisisFisico: number,
    TotalPorcentajeAnalisisFisico: number,
    HumedadPorcentajeAnalisisFisico: number,
    ObservacionAnalisisFisico: string,
    UsuarioCalidad: string,
    ObservacionRegistroTostado: string,
    ObservacionAnalisisSensorial: string,
    AnalisisFisicoOlorDetalleList: AnalisisFisicoOlorDetalleList[],
    AnalisisFisicoColorDetalleList: AnalisisFisicoColorDetalleList[],
    AnalisisFisicoDefectoPrimarioDetalleList: AnalisisFisicoDefectoPrimarioDetalleList[],
    AnalisisFisicoDefectoSecundarioDetalleList: AnalisisFisicoDefectoSecundarioDetalleList[],
    RegistroTostadoIndicadorDetalleList: RegistroTostadoIndicadorDetalleList[],
    AnalisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[],
    AnalisisSensorialAtributoDetalleList: AnalisisSensorialAtributoDetalleList[])
    {
        this.EmpresaId = EmpresaId,
        this.GuiaRecepcionMateriaPrimaId = GuiaRecepcionMateriaPrimaId,
        this.ExportableGramosAnalisisFisico= ExportableGramosAnalisisFisico,
        this.ExportablePorcentajeAnalisisFisico = ExportablePorcentajeAnalisisFisico,
        this.DescarteGramosAnalisisFisico= DescarteGramosAnalisisFisico,
        this.DescartePorcentajeAnalisisFisico= DescartePorcentajeAnalisisFisico
        this.CascarillaGramosAnalisisFisico = CascarillaGramosAnalisisFisico
        this.CascarillaPorcentajeAnalisisFisico = CascarillaPorcentajeAnalisisFisico,
        this.TotalGramosAnalisisFisico = TotalGramosAnalisisFisico,
        this.TotalPorcentajeAnalisisFisico = TotalPorcentajeAnalisisFisico,
        this.HumedadPorcentajeAnalisisFisico = HumedadPorcentajeAnalisisFisico
        this.ObservacionAnalisisFisico = ObservacionAnalisisFisico
        this.UsuarioCalidad = UsuarioCalidad,
        this.ObservacionRegistroTostado = ObservacionRegistroTostado,
        this.ObservacionAnalisisSensorial = ObservacionAnalisisSensorial,
        this.AnalisisFisicoOlorDetalleList = AnalisisFisicoOlorDetalleList,
        this.AnalisisFisicoColorDetalleList = AnalisisFisicoColorDetalleList,
        this.AnalisisFisicoDefectoPrimarioDetalleList = AnalisisFisicoDefectoPrimarioDetalleList,
        this.AnalisisFisicoDefectoSecundarioDetalleList = AnalisisFisicoDefectoSecundarioDetalleList,
        this.RegistroTostadoIndicadorDetalleList = RegistroTostadoIndicadorDetalleList,
        this.AnalisisSensorialDefectoDetalleList = AnalisisSensorialDefectoDetalleList,
        this.AnalisisSensorialAtributoDetalleList = AnalisisSensorialAtributoDetalleList
        

    }
    EmpresaId: number;
    GuiaRecepcionMateriaPrimaId: number;
    ExportableGramosAnalisisFisico: number;
    ExportablePorcentajeAnalisisFisico: number;
    DescarteGramosAnalisisFisico: number;
    DescartePorcentajeAnalisisFisico: number;
    CascarillaGramosAnalisisFisico: number;
    CascarillaPorcentajeAnalisisFisico: number;
    TotalGramosAnalisisFisico: number;
    TotalPorcentajeAnalisisFisico: number;
    HumedadPorcentajeAnalisisFisico: number;
    ObservacionAnalisisFisico: string;
    UsuarioCalidad: string;
    ObservacionRegistroTostado: string;
    ObservacionAnalisisSensorial: string;
    AnalisisFisicoOlorDetalleList: AnalisisFisicoOlorDetalleList[];
    AnalisisFisicoColorDetalleList: AnalisisFisicoColorDetalleList[];
    AnalisisFisicoDefectoPrimarioDetalleList: AnalisisFisicoDefectoPrimarioDetalleList[];
    AnalisisFisicoDefectoSecundarioDetalleList: AnalisisFisicoDefectoSecundarioDetalleList[];
    RegistroTostadoIndicadorDetalleList: RegistroTostadoIndicadorDetalleList[];
    AnalisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[];
    AnalisisSensorialAtributoDetalleList: AnalisisSensorialAtributoDetalleList[]
   
}

 export class DefectosPrimarios
{
    DefectoDetalleId : string;
    DefectoDetalleDescripcion: string;
    DefectoDetalleEquivalente: string;
    Valor: string;

}

export class AnalisisFisicoColorDetalleList
{
    ColorDetalleId : string;
    ColorDetalleDescripcion: string;
    Valor: boolean;

}
export class AnalisisFisicoOlorDetalleList
{
    OlorDetalleId : string;
    OlorDetalleDescripcion: string;
    Valor: boolean;

}
export class AnalisisFisicoDefectoPrimarioDetalleList
{
    DefectoDetalleId : string;
    DefectoDetalleDescripcion: string;
    DefectoDetalleEquivalente: string;
    Valor: number;

}
export class AnalisisFisicoDefectoSecundarioDetalleList
{
    DefectoDetalleId : string;
    DefectoDetalleDescripcion: string;
    DefectoDetalleEquivalente: string;
    Valor: number;

}

export class RegistroTostadoIndicadorDetalleList
{
    IndicadorDetalleId: string;
    IndicadorDetalleDescripcion: string;
    Valor: number;
}

export class AnalisisSensorialDefectoDetalleList
{
    DefectoDetalleId: string;
    DefectoDetalleDescripcion: string;
    Valor: number;
}

export class AnalisisSensorialAtributoDetalleList
{
    AtributoDetalleId: string;
    AtributoDetalleDescripcion: string;
    Valor: number;
}

