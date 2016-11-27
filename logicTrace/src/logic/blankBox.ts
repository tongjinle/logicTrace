import api from 'map2d';
import { boxType } from './types';
import Box from './box';

// 一个空格
export default class BlankBox extends Box {
	
	constructor() {
		super();
		this.type = boxType.blank;
	}
}