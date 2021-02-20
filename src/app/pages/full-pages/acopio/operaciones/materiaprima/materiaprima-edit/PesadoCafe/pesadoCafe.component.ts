import { Component, OnInit} from '@angular/core';
import { AlertUtil } from '../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-pesadoCafe',
  templateUrl: './pesadoCafe.component.html',
  styleUrls: ['./pesadoCafe.component.scss']
})
export class PesadoCafeComponent implements OnInit {

    

    ngOnInit(): void {
    }

    guardar(){
      new AlertUtil().alertOk("Correcto","Se ha guardado correctamente")
      
    }

}
