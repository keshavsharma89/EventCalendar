import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		if(args === undefined) return value;
		return value.filter(function(value){
			return value.title.toLowerCase().includes(args.toLowerCase());
		})
	}

}
