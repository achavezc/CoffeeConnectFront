import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'listFilter' })
export class ListFilterPipe implements PipeTransform {

    transform(list: any[], filterText: string): any {
        let result = [];
        if (list && filterText) {
            result = list.filter(item => item.name.search(new RegExp(filterText, 'i')) > -1)
        }
        return result;
    }
}