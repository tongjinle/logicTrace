import api from 'map2d';
import { boxType } from './types';
import Box from './box';

export default class SourceBox extends Box {
	// 颜色
	color: number;
	// 产生的paintedBox的个数
	constructor(public paintedCount:number) {
		super();
		this.type = boxType.source;
	}
}