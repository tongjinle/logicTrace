import * as _ from 'underscore';
import api from 'map2d';
import { boxType } from './types';
import SourceBox from './sourceBox';
import BlankBox from './BlankBox';
import UndefBox from './UndefBox';
import PaintedBox from './PaintedBox';

class Box {
	// 编号
	id: number;
	// 坐标
	posi: api.IPosition;
	// 格子类型
	type: boxType;
	constructor() {
		this.id = parseInt(_.uniqueId());
	}

	static create(type: boxType, opts?: any): Box {
		let bo: Box;
		if (type == boxType.source) {
			bo = new SourceBox(opts.paintedCount);
		} else if (type == boxType.blank) {
			bo = new BlankBox();
		} else if (type == boxType.painted) {
			bo = new PaintedBox(opts.sourceId);
		} else if (type == boxType.undef) {
			bo = new UndefBox();
		}

		bo.posi = _.clone(opts.posi);

		return bo;
	}
}


export default Box;