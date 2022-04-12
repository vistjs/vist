import { Watcher } from '@timecat/recorder'

// define error watcher example
class LogErrorWatcher extends Watcher {
    init() {
        window.addEventListener('error', ErrorEvent => {
            const { message, filename, lineno, colno, error } = ErrorEvent
            this.emitData('type your define', { message, filename, lineno, colno, error })
        })
    }
}

class ExamplePlugin {
    constructor(options) {
        /** init plugin options */
    }

    apply(recorder) {
        const { plugin, db, addWatcher } = recorder

        recorder.onData(async (data: RecordData, next: () => Promise<void>) => {
            // get or set record
            await next()
            // get or set record
        })

        addWatcher(LogErrorWatcher)

        type HooksType = 'beforeRun' | 'run' | 'emit' | 'end'
        
        plugin(HooksType, () => void)
        
        // emitData before save
        plugin('emit', record => {
            // get or set record
            record['some property'] = doSomething
        })

        plugin('end', () => {
            console.log('recording finish')
        })

        // read or write to indexedDB
        const records = await db.readRecords()
        db.deleteRecords(range: { lowerBound: <recordID>, upperBound: <recordID> })
        db.clear()
        db.doSomething()...
    }
}