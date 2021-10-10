import { WindowIpcTopic } from 'src'

declare global {
  interface Window {
    electronSubscribe?: (
      message: WindowIpcTopic,
      callback: (message: string, ...args: any[]) => void
    ) => void
    electronUnsubscribe?: (
      message: WindowIpcTopic,
      callback?: (message: string, ...args: any[]) => void
    ) => void
    electronPublish?: (message: WindowIpcTopic, ...args: any[]) => void
  }
}
