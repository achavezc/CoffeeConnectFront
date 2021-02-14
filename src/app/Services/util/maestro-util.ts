import { MaestroService } from '../maestro.service';
import { Injectable } from '@angular/core';

@Injectable()
export class MaestroUtil {
 
  constructor(private maestroService: MaestroService )
  {
    
  }

  obtenerMaestros(codigoTabla: string, callback) {
    this.maestroService.obtenerMaestros(codigoTabla)
    .subscribe(res => {
       callback(res)
    },
      err => {
        console.error(err);
      }
    );

  }
}