import { Injectable } from '@angular/core';


@Injectable()
export class NumeroUtil {
 
  constructor(){  }
numerosDecimales()
  {
    return '^[+-]?[0-9]{1,9}(?:.[0-9]{1,2})?$';
  }
}