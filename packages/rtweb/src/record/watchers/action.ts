import { Watcher } from '../watcher'

export class ActionWatcher extends Watcher<any> {
    protected init() {
        this.context.addEventListener('beforeunload', this.handleFn)

        this.uninstall(() => {
            this.context.removeEventListener('beforeunload', this.handleFn)
        })
    }

    private handleFn() {
        // do some sync job
        // navigator.sendBeacon(url, data)
        // this.emitData(this.wrapData())
    }

    private wrapData() {
        return [null, null]
    }
}