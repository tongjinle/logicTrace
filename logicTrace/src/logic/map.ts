namespace Logic {

    export class Map {
        boxList: Box[][];
        insertMax = 100;
        mergeMax = 100;
        constructor(public width: number, public height: number) {
            let boxList = this.boxList = [];
            this.visit((bo, x, y, list) => {
                list[y][x] = Box.create(boxType.undef, { posi: { x, y } });
                return true;
            });

            let count = 100;
            // 判断所有undefBox周围没有可以延伸的
            while (1) {
                let allUn = this.findAllUndef();
                let tryAgain: boolean = false;
                allUn.some(un => {
                    let extendList: map2d.IPosition[] = this.findExtendList(un.posi);
                    if (extendList.length) {
                        tryAgain = true;
                        return true;
                    }
                });
                if (!tryAgain) {
                    break;
                }

                this.insertMax = 100;
                while (this.insert());
            }
            console.log("count:", count);
            while (this.merge());

            this.clearOneBox();


        }

        process(action: string, sourceId: number, posiList: map2d.IPosition[]) {
            let so = this.findSource(sourceId);

            posiList
                .map(posi => this.boxList[posi.y][posi.x])
                .forEach((pa: PaintedBox) => {
                    if (action == 'add') {
                        pa.isPainted = true;
                        pa.dragSourceId = sourceId;

                        so.paintIdList.push(pa.id);
                    } else if (action == 'sub') {
                        pa.isPainted = false;
                        pa.dragSourceId = undefined;

                        so.paintIdList = so.paintIdList.filter(paId => paId != pa.id);
                    }
                });
        }

        drag(from: map2d.IPosition, to: map2d.IPosition): { err: string, action?: string, sourceId?: number, posiList?: map2d.IPosition[] } {
            // 不在一个方向
            if (map2d.getDirection(from, to) === undefined) {
                return { err: 'NOT in same line' };
            }

            // 两点重合
            if (map2d.isPositionEqual(from, to)) {
                return { err: 'from point EQUAL to point' };
            }



            let action: string;
            let fpo = this.boxList[from.y][from.x];
            if (fpo.type == boxType.source) {
                action = 'add';
                let so = fpo as SourceBox;
                let between = map2d.getBetween(from, to);
                let dist = Math.max(Math.min(so.paintedCount - so.paintIdList.length, between.length + 1), 0);
                let posiList = map2d.lineRange(from, dist, map2d.getDirection(to, from));

                if (this.checkCross(posiList)) {
                    return {
                        err: 'path CROSS'
                    };
                }
                posiList.forEach(posi => {
                    this.paint('add', posi, so.id);
                });


                return {
                    action,
                    posiList,
                    sourceId: so.id,
                    err: undefined
                };
            } else if (fpo.type == boxType.painted) {
                let pa = fpo as PaintedBox;

                //如果这个paintedBox没有被paint过,则无效
                if (!pa.isPainted) {
                    return { err: 'paintBox is NOT painted' };
                }

                // sourceBox不能在from和to中间
                let so = this.findSource(pa.dragSourceId);
                // if (map2d.getDirection(from, so.posi) != map2d.getDirection(to, so.posi)) {
                //  return { err: 'soureceBox is BETWEEN from and to' };
                // }
                if (map2d.getBetween(from, to).some(posi => map2d.isPositionEqual(posi, so.posi))) {
                    return { err: 'soureceBox is BETWEEN from and to' };

                }


                // from必须是端点的box
                let soTofrom = map2d.getDirection(from, so.posi);
                let nextPosi = map2d.lineRange(from, 1, soTofrom)[0];
                let nextBox = this.boxList[nextPosi.y] ? this.boxList[nextPosi.y][nextPosi.x] : undefined;
                console.log(from, soTofrom, nextBox);
                if (nextBox && nextBox.type == boxType.painted) {
                    let pa = nextBox as PaintedBox;
                    if (pa.dragSourceId == so.id) {
                        return { err: 'FROM is NOT end point' };
                    }
                }




                let dragDire = map2d.getDirection(to, from);
                let sourceDire = map2d.getDirection(from, so.posi);

                // 方向必须在一条线上
                if ((dragDire + sourceDire) % 2) {
                    return { err: 'NOT same direction' };
                }
                action = dragDire == sourceDire ? 'add' : 'sub';
                let between: map2d.IPosition[] = map2d.getBetween(from, to);
                let posiList: map2d.IPosition[];
                if (action == 'add') {
                    let dist = Math.max(Math.min(so.paintedCount - so.paintIdList.length, between.length + 1), 0);
                    posiList = map2d.lineRange(from, dist, map2d.getDirection(to, from));

                    if (this.checkCross(posiList)) {
                        return {
                            err: 'path CROSS'
                        };
                    }
                    posiList.forEach(posi => this.paint('add', posi, so.id));
                } else if (action == 'sub') {
                    posiList = between.concat(from);
                    posiList.forEach(posi => this.paint('sub', posi, so.id));
                }
                return {
                    err: undefined,
                    action,
                    posiList,
                    sourceId: so.id
                };

            }

        }
        // 检查路径中有没有cross现象
        private checkCross(posiList: map2d.IPosition[]): boolean {
            let flag = !!_.find(posiList, posi => {
                let bo = this.boxList[posi.y][posi.x];
                if (bo.type != boxType.painted) {
                    return true;
                }
                let pa = bo as PaintedBox;
                if (pa.isPainted) {
                    return true;
                }

            });
            return flag;
        }

        // paint/unpaint box
        private paint(action: string, posi: map2d.IPosition, sourceId: number) {
            let so = this.findSource(sourceId);
            let pa = this.boxList[posi.y][posi.x] as PaintedBox;
            if (action == 'add') {

                pa.isPainted = true;
                pa.dragSourceId = so.id;

                so.paintIdList = so.paintIdList.concat(pa.id);
            } else if (action == 'sub') {
                pa.isPainted = false;
                pa.dragSourceId = undefined;

                so.paintIdList = so.paintIdList.filter(paId => paId != pa.id);

            }
        }

        isWin(): boolean {
            let flag = true;
            this.visit((bo, x, y, boxList) => {
                if (bo.type == boxType.painted) {
                    let pa = bo as PaintedBox;
                    if (!pa.isPainted) {
                        flag = false;
                        return false;
                    }
                }

            });
            return flag;
        }

        private log(...arg) {
            return;
            // console.log.apply(null, arg);
        }


        private visit(fn: (bo: Box, x: number, y: number, boxList: Box[][]) => boolean) {
            for (var y = 0; y < this.height; y++) {
                this.boxList[y] = this.boxList[y] || [];
                for (var x = 0; x < this.width; x++) {
                    let bo = this.boxList[y][x];
                    if (fn(bo, x, y, this.boxList) === false) {
                        return;
                    }

                }
            }
        }

        private insert(): boolean {
            let un: Box = this.findUndef();
            if (!un) {
                return false;
            }

            let extList = this.findExtendList(un.posi);
            if (!extList.length) {
                return false;
            }

            let rate = 1;
            // 创建sourceBox
            let bo: SourceBox = this.boxList[un.posi.y][un.posi.x]
                = Box.create(boxType.source, { posi: un.posi }) as SourceBox;


            this.log('create sourece:', bo.posi);
            while (this.passRate(rate) && extList.length) {

                bo.paintedCount++;

                // paint
                let index = Math.floor(Math.random() * extList.length);
                let ext = extList[index];
                extList.splice(index, 1);
                let pa = this.boxList[ext.y][ext.x]
                    = Box.create(boxType.painted, { posi: ext, sourceId: bo.id }) as PaintedBox;

                this.log('create painted', this.findSource(pa.sourceId).posi, pa.posi);

                // rate降低概率
                rate *= (3 / 4);

                this.insertMax--;
                if (!this.insertMax) {
                    return false;
                }
            }

            return true;

        }

        // 尝试合并
        private merge(): boolean {
            let un: Box = this.findUndef();
            if (!un) {
                return false;
            }

            // 周围格子
            let near = map2d.nearRange(un.posi, 1)
                .filter(posi => !this.isOut(posi));

            let flag = false;
            // pa => un的相邻的paintedBox
            // so => pa的sourceBox
            // 1.尝试连接
            // 如果un跟so的方向和pa跟so的方向一致,则尝试连接
            flag = near
                .filter(posi => this.boxList[posi.y][posi.x].type == boxType.painted)
                .some(posi => {
                    let pa: PaintedBox = this.boxList[posi.y][posi.x] as PaintedBox;
                    let so: SourceBox = this.findSource(pa.sourceId);


                    if (map2d.getDirection(pa.posi, so.posi) == map2d.getDirection(un.posi, so.posi)) {
                        this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.painted, { posi: un.posi, sourceId: so.id });
                        so.paintedCount++;
                        this.log('link:', so.posi, pa.posi, un.posi);
                        return true;
                    }
                    return false;
                });

            // 2.切割
            // 如果1方案不能成立
            // 如果邻居是sourceBox,则把un指向so
            // 如果邻居是paintedBox,则切下pa,让un成为sourceBox,让pa指向un
            if (!flag) {
                near.some(posi => {
                    let ne: Box = this.boxList[posi.y][posi.x];
                    if (ne.type == boxType.source) {
                        let so = ne as SourceBox;
                        let pa = this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.painted, { posi: un.posi }) as PaintedBox;
                        pa.sourceId = so.id;
                        so.paintedCount++;
                        this.log('union un:', so.posi, pa.posi);
                    } else if (ne.type == boxType.painted) {
                        let pa = ne as PaintedBox;
                        let lastSo = this.findSource(pa.sourceId);
                        let so = this.boxList[pa.posi.y][pa.posi.x] = Box.create(boxType.source, { posi: pa.posi }) as SourceBox;
                        let pa2 = this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.painted, { posi: un.posi }) as PaintedBox;
                        pa2.sourceId = so.id;
                        so.paintedCount++;

                        if (lastSo.paintedCount == 1) {
                            // 判断so的paintedCount,如果==1,让so转成一个paintedBox,指向pa
                            let so2pa = this.boxList[lastSo.posi.y][lastSo.posi.x]
                                = Box.create(boxType.painted, { posi: lastSo.posi }) as PaintedBox;
                            so2pa.sourceId = so.id;
                            so.paintedCount++;
                        } else {
                            lastSo.paintedCount--;
                        }
                        // 
                        this.log('cut pa:', so.posi, pa.posi);


                    }
                    return true;
                });
            }

            this.mergeMax--;
            if (!this.mergeMax) {
                return false;
            }

            return true;

        }

        // 清理地图上的1
        // 太多的1,会让地图变得没有趣味
        private clearOneBox(): void {
            let arr: { [boxId: string]: { nearIdList: number[] } } = {};

            // 找到所有paintCount==1的box
            let oneBoxList: SourceBox[] = [];
            this.visit((bo, x, y, boxList) => {
                if (bo.type == boxType.source) {
                    let soBox = bo as SourceBox;
                    if (soBox.paintedCount == 1) {
                        oneBoxList.push(soBox);
                    }
                }
                return true;
            });

            // 计算box周围的oneBox的个数
            oneBoxList.forEach(bo => {
                oneBoxList.forEach(bo2 => {
                    if (bo == bo2) { return; }
                    if (Math.abs(bo.posi.x - bo2.posi.x) + Math.abs(bo.posi.y - bo2.posi.y) != 1) { return; }

                    let item = arr[bo.id] = arr[bo.id] || { nearIdList: [] };
                    item.nearIdList.push(bo2.id);

                });
            });


            _.each(arr, (item, key) => {
                let soBox = this.findBoxById(parseInt(key)) as SourceBox;
                let paBox = this.findPaintBoxList(parseInt(key))[0];

                if(!paBox){return;}

                let merge = (soBox: SourceBox, paBox: PaintedBox, soBox2: SourceBox, paBox2: PaintedBox): boolean => {
                    // 找到关键节点
                    // 作为sourceBox,可以跟其他box的x或者y相同
                    let allBoxList = [soBox, soBox2, paBox, paBox2];
                    let soBoxList = [soBox, soBox2];

                    let keBox: SourceBox;
                    soBoxList.some((bo: SourceBox) => {
                        let flag = allBoxList.every((bo2: Box) => {
                            if (bo == bo2) { return true; }
                            return bo.posi.x == bo2.posi.x || bo.posi.y == bo2.posi.y;
                        });

                        if (flag) {
                            keBox = bo;
                            return true;
                        }
                        return false;
                    });

                    // 存在关键节点,就可以合并
                    if (keBox) {
                        let otherSoBox: SourceBox = keBox == soBox ? soBox2 : soBox;

                        {
                            let bo = otherSoBox;
                            let paBox = this.boxList[bo.posi.y][bo.posi.x] = Box.create(boxType.painted, { posi: bo.posi }) as PaintedBox;
                            paBox.sourceId = keBox.id;
                        }

                        {
                            paBox.sourceId = keBox.id;
                            paBox2.sourceId = keBox.id;
                        }

                        keBox.paintedCount += 3;
                        return true;
                    }

                    return false;
                };

                item.nearIdList.some(id => {
                    let soBox2 = this.findBoxById(id) as SourceBox;
                    let paBox2: PaintedBox = this.findPaintBoxList(id)[0];
                    
                    if(!paBox2){
                        return false;
                    }

                    return merge(soBox, paBox, soBox2, paBox2);
                });

            });

            return;


            // nearCount最大的开始merge掉周围的oneBox
            let intervalMax = 1;
            let max = intervalMax;
            let maxId: string;
            while (1) {
                _.each(arr, (item, key) => {
                    let len = item.nearIdList.length;
                    if (max < len) {
                        max = len
                        maxId = key;
                    }
                });

                if (max == intervalMax) {
                    break;
                }

                // 合并掉隔壁的oneBox
                let count: number = 0;
                if (maxId !== undefined) {
                    arr[maxId].nearIdList.forEach(neId => {
                        // 消去sourceBox,使之成为blankBox
                        let bo = this.findSource(neId);
                        if (bo) {
                            console.log('be merged one box:');
                            console.log(bo.posi);
                            count++;
                            this.boxList[bo.posi.y][bo.posi.x] = Box.create(boxType.painted, { posi: bo.posi });

                            // 删除在arr中记录
                            delete arr[neId];
                        }
                    });

                    // maxId所指向的sourceBox自然paintCount要加上max
                    // 然后再删除它在arr中的记录
                    let bo = this.findSource(parseInt(maxId));
                    // 不是直接+=max,而是count,是因为可能邻近的oneBox已经被别的吸收了
                    bo.paintedCount += count;
                    delete arr[maxId];

                    console.log('main box:');
                    console.log(bo.posi);
                }
                max = intervalMax;

            }

            return;

            // 没有和oneBox相邻的oneBox,尝试被整合到隔壁的sourceBox上
            oneBoxList = [];
            this.visit((bo, x, y, boxList) => {
                if (bo.type == boxType.source) {
                    let soBox = bo as SourceBox;
                    if (soBox.paintedCount == 1) {
                        oneBoxList.push(soBox);
                    }
                }
                return true;
            });


            _.each(oneBoxList, bo => {



                let nearPosiList = map2d.nearRange(bo.posi, 1)
                    .filter(posi => !this.isOut(posi))
                    .filter(posi => {
                        return this.boxList[posi.y][posi.x].type == boxType.source;
                    });



                console.log(nearPosiList);

                nearPosiList.some(posi => {
                    let bo: SourceBox = this.boxList[posi.y][posi.x] as SourceBox;
                    bo.paintedCount++;
                    this.boxList[bo.posi.y][bo.posi.x] = Box.create(boxType.painted, { posi });
                    return true;
                });

            });


        }

        // 通过id来查找box
        private findBoxById(id: number): Box {
            let ret: Box;
            this.visit(bo => {
                if (bo.id == id) {
                    ret = bo;
                    return false;
                }
                return true;
            });
            return ret;
        }

        private findPaintBoxList(sourceId: number): PaintedBox[] {
            let ret: PaintedBox[] = [];
            this.visit(bo => {
                if (bo.type == boxType.painted && (bo as PaintedBox).sourceId == sourceId) {
                    ret.push(bo as PaintedBox);
                }
                return true;
            });
            return ret;
        }

        // 从paintedBox的sourceId寻找sourceBox
        private findSource(sourceId: number): SourceBox {
            return this.findBoxById(sourceId) as SourceBox;
        }

        private findAllUndef(): UndefBox[] {
            let un = undefined;
            let boList: Box[] = [];
            this.visit((bo, x, y, list) => {
                if (bo.type == boxType.undef) {
                    boList.push(bo);
                }
                return true;
            });
            return boList;

        }

        // 寻找undef的格子
        private findUndef(): UndefBox {
            let un: UndefBox = undefined;

            let boList = this.findAllUndef();
            if (boList.length) {
                un = boList[Math.floor(Math.random() * boList.length)];
            }
            return un;

        }

        // 格子周围是不是有可以延伸的格子(用以paint)
        private findExtendList(posi: map2d.IPosition): map2d.IPosition[] {
            let list: map2d.IPosition[];
            list = map2d.nearRange(posi, 1)
                .filter(posi => !this.isOut(posi))
                .filter(posi => {
                    return this.boxList[posi.y][posi.x].type == boxType.undef;
                });
            return list;
        }


        // 是否坐标超出地图
        private isOut(posi: map2d.IPosition): boolean {
            return posi.x < 0 || posi.y < 0 || posi.x >= this.width || posi.y >= this.height;


        }

        // 能否通过概率
        private passRate(rate: number): boolean {
            return Math.random() <= rate;
        }
    }


}