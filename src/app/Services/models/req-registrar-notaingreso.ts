import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ReqRegistrarPesadoNotaIngreso {
    constructor(
        NotaIngresoPlantaId:number,
        EmpresaId: number,
        Numero: string,
        NumeroGuiaRemision: string,
        FechaGuiaRemision: Date,
        EmpresaOrigenId: number,
        TipoProduccionId: string,
        ProductoId: string,
        SubProductoId: string,
        CertificacionId: string,
        EntidadCertificadoraId: string,
        MotivoIngresoId: string,
        EmpaqueId: string,
        KilosBrutos: number,
        KilosNetos: number,
        Tara: number,
        CalidadId: string,
        GradoId: string,
        CantidadDefectos: number,
        PesoPorSaco: number,
        TipoId: string,
        Cantidad: number,
        HumedadPorcentaje: number,
        RendimientoPorcentaje: number,
        RucEmpresaTransporte: string,
        RazonEmpresaTransporte: string,
        PlacaTractorEmpresaTransporte: string,
        ConductorEmpresaTransporte: string,
        LicenciaConductorEmpresaTransporte: string,
        ObservacionPesado: string,
        EstadoId: string,
        FechaRegistro: Date,
        UsuarioPesado: string,
        FechaPesado: Date,
        Direccion : string

        ) {
        this.NotaIngresoPlantaId = NotaIngresoPlantaId;
        this.EmpresaId = EmpresaId;
        this.Numero = Numero;
        this.NumeroGuiaRemision = NumeroGuiaRemision;
        this.FechaGuiaRemision = FechaGuiaRemision;
        this.EmpresaOrigenId = EmpresaOrigenId;
        this.TipoProduccionId = TipoProduccionId;
        this.ProductoId = ProductoId;
        this.SubProductoId = SubProductoId;
        this.CertificacionId = CertificacionId;
        this.EntidadCertificadoraId = EntidadCertificadoraId;
        this.MotivoIngresoId = MotivoIngresoId;
        this.EmpaqueId = EmpaqueId;
        this.KilosBrutos = KilosBrutos;
        this.KilosNetos = KilosNetos;
        this.Tara = Tara;
        this.CalidadId = CalidadId;
        this.GradoId = GradoId;
        this.CantidadDefectos = CantidadDefectos;
        this.PesoPorSaco = PesoPorSaco;
        this.TipoId = TipoId;
        this.Cantidad = Cantidad;
        this.HumedadPorcentaje = HumedadPorcentaje;
        this.RendimientoPorcentaje = RendimientoPorcentaje;
        this.RucEmpresaTransporte = RucEmpresaTransporte;
        this.RazonEmpresaTransporte = RazonEmpresaTransporte;
        this.PlacaTractorEmpresaTransporte = PlacaTractorEmpresaTransporte;
        this.ConductorEmpresaTransporte = ConductorEmpresaTransporte;
        this.LicenciaConductorEmpresaTransporte = LicenciaConductorEmpresaTransporte;
        this.ObservacionPesado = ObservacionPesado;
        this.EstadoId = EstadoId;
        this.FechaRegistro = FechaRegistro;
        this.UsuarioPesado = UsuarioPesado;
        this.FechaPesado = FechaPesado;
        this.Direccion = Direccion;
    }
    NotaIngresoPlantaId:number;
    EmpresaId: number;
    Numero: string;
    NumeroGuiaRemision: string;
    FechaGuiaRemision: Date;
    EmpresaOrigenId: number;
    TipoProduccionId: string;
    ProductoId: string;
    SubProductoId: string;
    CertificacionId: string;
    EntidadCertificadoraId: string;
    MotivoIngresoId: string;
    EmpaqueId: string;
    KilosBrutos: number;
    KilosNetos: number;
    Tara: number;
    CalidadId: string;
    GradoId: string;
    CantidadDefectos: number;
    PesoPorSaco: number;
    TipoId: string;
    Cantidad: number;
    HumedadPorcentaje: number;
    RendimientoPorcentaje: number;
    RucEmpresaTransporte: string;
    RazonEmpresaTransporte: string;
    PlacaTractorEmpresaTransporte: string;
    ConductorEmpresaTransporte: string;
    LicenciaConductorEmpresaTransporte: string;
    ObservacionPesado: string;
    EstadoId: string;
    FechaRegistro: Date;
    UsuarioPesado: string;
    FechaPesado: Date;
    Direccion: string;

}
