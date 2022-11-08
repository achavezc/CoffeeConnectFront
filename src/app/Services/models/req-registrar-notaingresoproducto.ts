import { DecimalPipe } from '@angular/common';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ReqRegistrarNotaIngresoProducto {
    constructor(
        NotaIngresoProductoTerminadoAlmacenPlantaId:number,
        Usuario: string,
        AlmacenId: string,
        
        ) {
        this.NotaIngresoProductoTerminadoAlmacenPlantaId = NotaIngresoProductoTerminadoAlmacenPlantaId;
        this.Usuario = Usuario;
        this.AlmacenId = AlmacenId;
   
       
    }
    NotaIngresoProductoTerminadoAlmacenPlantaId:number;
    Usuario: string;
    AlmacenId: string;


}
