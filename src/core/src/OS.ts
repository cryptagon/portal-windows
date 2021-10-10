import { OS } from './types'

export function getOSInfo() {
  if (typeof window === 'undefined') return 'nodejs'
  if (typeof navigator != 'undefined' && navigator.product == 'ReactNative')
    return navigator.product
  const userAgent = window.navigator.userAgent
  const platform = /[^(]+\(([^)]+)\)/.exec(userAgent)
  return platform?.[1] ?? 'unknown'
}

export const isMac = getOS() == 'mac'
export const isMacBigSur = (() => {
  const osInfo = getOSInfo()
  if (osInfo.includes('Mac OS X 10_16') || osInfo.includes('Mac OS X 11')) {
    return true
  }
  return false
})()

export const isWindows = getOS() == 'windows'
export const isLinux = getOS() == 'linux'

// fix 'cannot access variable "os" before initialization' issue
export let _os: OS | null = null
export function getOS(): OS {
  if (_os) return _os

  if (typeof window === 'undefined') {
    // use node.js version of the check
    // @ts-ignore
    switch (process.platform) {
      case 'darwin':
        return (_os = 'mac')
      case 'win32':
        return (_os = 'windows')
      case 'android':
        return (_os = 'android')
      default:
        return 'linux'
    }
  }

  if (typeof navigator != 'undefined' && navigator.product == 'ReactNative')
    return (_os = 'react-native')

  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod']

  if (macosPlatforms.indexOf(platform) !== -1) {
    _os = 'mac'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    _os = 'ios'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    _os = 'windows'
  } else if (/Android/.test(userAgent)) {
    _os = 'android'
  } else if (!_os && /Linux/.test(platform)) {
    _os = 'linux'
  } else {
    _os = 'unknown'
  }

  return _os
}
