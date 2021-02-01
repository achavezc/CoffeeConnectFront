export class AppError {
    constructor(public originalError?: any){
      console.error(originalError);
    }
}
