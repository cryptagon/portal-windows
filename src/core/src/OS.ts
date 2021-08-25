import { OS } from "./types"

export function getOSInfo() {
  if (typeof window === 'undefined') return 'nodejs'
  if (typeof navigator != 'undefined' && navigator.product == 'ReactNative') return navigator.product
  const userAgent = window.navigator.userAgent
  const platform = /[^(]+\(([^)]+)\)/.exec(userAgent)
  return platform[1]
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

// detect operating system
var os: OS = null
export function getOS(): OS {
  if (os) return os

  if (typeof window === 'undefined') {
    // use node.js version of the check
    switch (process.platform) {
      case 'darwin': return os = 'mac'
      case 'win32': return os = 'windows'
      case 'android': return os = 'android'
      default:
        return 'linux'
    }
  }

  if (typeof navigator != 'undefined' && navigator.product == 'ReactNative')
    return os = 'react-native'

  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod']

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'mac'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'ios'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'windows'
  } else if (/Android/.test(userAgent)) {
    os = 'android'
  } else if (!os && /Linux/.test(platform)) {
    os = 'linux'
  }

  return os
}