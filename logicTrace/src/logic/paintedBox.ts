import api from 'map2d';
import { boxType } from './types';
import Box from './box';
import SourceBox from './sourceBox';


export default class PaintedBox extends Box {
	// 是否已经被涂抹
	isPainted: boolean = false;
	constructor(public sourceId:number) {
		super();
		this.type = boxType.painted;
	}
}