import { RecordData } from './record';
import { ReplayerPlugin } from '../replay/pluginable';

export interface ReplayOptions {
  context?: Window;
  target?: string | HTMLElement | Window;
  receiver?: (sender: (data: RecordData[]) => void) => void;
  autoplay?: boolean;
  records?: RecordData[];
  plugins?: ReplayerPlugin[];
}

export interface ReplayInternalOptions extends ReplayOptions {
  context: Window;
  target: string | HTMLElement | Window;
  destroyStore: Set<Function>;
  autoplay: boolean;
}
