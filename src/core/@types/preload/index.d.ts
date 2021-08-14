interface Window {
  electronSubscribe?: (message: ElectronTopic, callback: (message: string, ...args?: any[]) => void) => void
  electronUnsubscribe?: (message: ElectronTopic, callback?: (message: string, ...args?: any[]) => void) => void
  electronPublish?: (message: ElectronTopic, ...args?: any[]) => void
}