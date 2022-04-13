import { RecorderModule } from '.'
import localforage from 'localforage';
import { RecordDbData, RecordData } from '../types'
type OPTIONS = {
    dbName: string;
}

export class localDBPlugin {
    private dbName: string;
    private records: RecordDbData[] = [];

    constructor(options: OPTIONS) {
        /** init plugin options */
        this.dbName = options.dbName;
    }

    apply(recorder: RecorderModule) {
        const { plugin } = recorder
        const that = this;
        plugin('run', record => {
            localforage.config({name: that.dbName});
        })
        
        plugin('emit', (record:RecordData) => {
            console.log(`received record: ${record}`)
            that.records.push({type: record.type, time: record.time, ...record.extras});
        })

        plugin('end', () => {
            console.log('recording finish')
            localforage.setItem('frames', this.records).then(()=>{
                that.records = [];
            });
        })
    }
}