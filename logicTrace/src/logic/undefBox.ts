import api from 'map2d';
import { boxType } from './types';
import Box from './box';


export default class UndefBox extends Box {

	constructor() {
		super();
		this.type = boxType.undef;
	}
}