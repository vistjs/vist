import { RecordDbData } from './record';
import { ReplayerPlugin } from '../replay/pluginable';

export interface ReplayData {
  index?: number;
  records: RecordDbData[];
}

export interface ReplayOptions {
  exportName?: string;
  receiver?: (sender: (data: RecordDbData[]) => void) => void;
  autoplay?: boolean;
  records?: RecordDbData[];
  target?: string | HTMLElement | Window;
  plugins?: ReplayerPlugin[];
}

export interface ReplayInternalOptions extends Required<ReplayOptions> {
  destroyStore: Set<Function>;
  autoplay: boolean;
  target: string | HTMLElement | Window;
}
