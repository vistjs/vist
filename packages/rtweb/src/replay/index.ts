// player裸壳子，要提供命令出来

 import {
  logError,
  debounce,
  logInfo,
  isDev,
  removeGlobalVariables,
  delay,
  tempEmptyFn
} from '../utils'
import {
  SnapshotRecord,
  ReplayOptions,
  RecordData,
  RecordType,
  ReplayInternalOptions,
  HeadRecord
} from '@timecat/share'
import { waitStart, removeStartPage, showStartMask, ConnectProps, ReplayDataState } from './utils'
import { PlayerEventTypes } from './types'
import {
  FMP,
  observer,
  Store,
  PlayerReducerTypes,
  getRecordsFromDB,
  ProgressReducerTypes,
  ReplayDataReducerTypes,
  transToReplayData,
  getGZipData
} from './utils'
import { getPacks } from './utils/transform'

const defaultReplayOptions = {
  autoplay: true,
  mode: 'default',
  target: window,
  heatPoints: true,
  timeMode: 'durationTime',
  fastForward: [2, 8],
  disableScrolling: true
}

export class Player {
  on: (key: PlayerEventTypes, fn: Function) => void = tempEmptyFn
  destroy: () => void = tempEmptyFn
  append: (records: RecordData[]) => void = tempEmptyFn
  constructor(options?: ReplayOptions) {
      const player = new PlayerModule(options)
      Object.keys(this).forEach((key: keyof Player) => {
          this[key] = player[key].bind(player)
      })
  }
}

export class PlayerModule {
  fmp: FMP
  destroyStore = new Set<Function>()
  options: ReplayInternalOptions
  ctrl: any
  initialized = false
  constructor(options?: ReplayOptions) {
      this.init(options)
      this.watchData()
  }

  @ConnectProps(state => ({
      currentData: state.replayData.currentData,
      records: state.replayData.records,
      packs: state.replayData.packs
  }))
  private watchData(state?: ReplayDataState) {
      if (state && !this.initialized) {
          this.initialized = true
          const opts = this.options
          const { records, packs, currentData } = state

          (this.fmp = new FMP()).ready(async () => {
              if (records.length) {
                  if (opts.autoplay || hasAudio) {
                      if (opts.autoplay) {
                          Store.dispatch({
                              type: PlayerReducerTypes.SPEED,
                              data: { speed: 1 }
                          })
                      }
                  }
              }
          })

          if (packs.length) {
              this.calcProgress()
          }

      }
  }

  private init(options?: ReplayOptions) {
      if (!isDev) {
          logInfo()
      }

      this.initOptions(options)
      this.initData()
  }

  private async initOptions(options?: ReplayOptions) {
      const opts = {
          destroyStore: this.destroyStore,
          ...defaultReplayOptions,
          ...options
      } as ReplayInternalOptions

      this.options = opts
      Store.dispatch({ type: PlayerReducerTypes.OPTIONS, data: { options: opts } })
      this.destroyStore.add(() => Store.unsubscribe())
  }

  private async initData() {
      const opts = this.options
      const records = await this.getRecords(opts)
      window.G_REPLAY_RECORDS = records
      const packs = getPacks(records)
      const firstData = transToReplayData(packs[0])

      Store.dispatch({
          type: ReplayDataReducerTypes.UPDATE_DATA,
          data: { records, packs, currentData: firstData }
      })
  }

  private async getRecords(options: ReplayInternalOptions) {
      const { receiver, records: recordsData } = options

      const records =
          recordsData ||
          (receiver && (await this.dataReceiver(receiver))) ||
          getGZipData() ||
          (await getRecordsFromDB())

      if (!records) {
          throw logError('Replay data not found')
      }

      return records
  }

  private calcProgress() {
      const { packs } = Store.getState().replayData
      const startTime = packs[0][0].time

      let duration = 0
      const packsInfo: {
          startTime: number
          endTime: number
          duration: number
          diffTime: number
      }[] = []
      let diffTime = 0
      packs.forEach((pack, index) => {
          const startTime = pack[0].time
          const endTime = pack.slice(-1)[0].time
          if (index) {
              diffTime += startTime - packs[index - 1].slice(-1)[0].time
          }
          const info = {
              startTime,
              endTime,
              duration: endTime - startTime,
              diffTime
          }
          packsInfo.push(info)
          duration += info.duration
      })
      const endTime = startTime + duration

      Store.dispatch({
          type: ProgressReducerTypes.PROGRESS,
          data: {
              duration,
              packsInfo,
              startTime,
              endTime
          }
      })
  }

  private dispatchEvent(type: string, data: RecordData) {
      const event = new CustomEvent(type, { detail: data })
      window.dispatchEvent(event)
  }

  private async dataReceiver(receiver: (sender: (data: RecordData) => void) => void): Promise<RecordData[]> {
      let isResolved: boolean
      let head: HeadRecord
      let snapshot: SnapshotRecord
      return await new Promise(resolve => {
          receiver(data => {
              if (isResolved) {
                  this.dispatchEvent('record-data', data as RecordData)
              } else {
                  if (data.type === RecordType.HEAD) {
                      head = data
                  } else if (data.type === RecordType.SNAPSHOT) {
                      snapshot = data
                  }

                  if (head && snapshot) {
                      isResolved = true
                      resolve([head, snapshot])
                      this.dispatchEvent('record-data', data as RecordData)
                  }
              }
          })
      })
  }

  private triggerCalcProgress = debounce(() => this.calcProgress(), 500)

  async destroy(opts: { removeDOM: boolean } = { removeDOM: true }) {
      this.destroyStore.forEach(un => un())
      observer.destroy()
      Store.unsubscribe()
      await delay(0)
      removeGlobalVariables()
  }

  public on(key: PlayerEventTypes, fn: Function) {
      observer.on(key, fn)
  }

  public async append(records: RecordData[]) {
      await delay(0)
      Store.dispatch({
          type: ReplayDataReducerTypes.APPEND_RECORDS,
          data: { records }
      })

      this.triggerCalcProgress()
  }

}
