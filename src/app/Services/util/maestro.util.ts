import { MaestroService, Maestro } from '../../services/maestro.service';
import { Observable } from 'rxjs';


export class MaestroUtil {


  constructor(private maestroService: MaestroService) {
  }

  obtenerMaestro(codigoTabla: string, empresaId: number ){
    this.maestroService.obtenerMaestros(codigoTabla,empresaId)
    .subscribe(res => {
        if (res.Result.Success)
        {
           return res.Result.Data;
        }
      },
      err => {
        console.error(err);
      }
    );
}
}