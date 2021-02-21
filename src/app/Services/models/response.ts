export interface Response {
    Result: result;
  }

  interface result {
    Success: boolean;
    ErrCode: string;
    Message: string;
    Meta: meta;
    Data: any[];
    
  }
  interface meta
  {
    Total: number;
    Identificador: string;
  }
