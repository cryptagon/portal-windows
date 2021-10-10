import { loggerWithPrefix } from '@portal-windows/core'

const log = loggerWithPrefix(`[reactPortalWindow]`)

// From comments in https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
export function copyStyles(sourceDoc: Document, targetDoc: Document) {
  try {
    Array.from(sourceDoc.styleSheets).forEach((originalSS) => {
      const newSS = document.createElement('style')
      targetDoc.head.appendChild(newSS) // creates newSS's .sheet property

      Array.from(originalSS.cssRules)
        .reverse()
        .forEach((rule) => {
          newSS?.sheet?.insertRule(rule.cssText)
        })
    })
  } catch (e) {
    // This should only happen if the CSSOM isn't supported
    // on a user's version of Electron/whatever browser they're using for Tandem web
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
    log.error('Ran into error using CSSOM API', e)
    Array.from(sourceDoc.querySelectorAll('link[rel="stylesheet"], style')).forEach((link) => {
      targetDoc.head.appendChild(link.cloneNode(true))
    })
  }
}

export const setStyles = (win: Window, styleText: string) => {
  win.document.head.innerHTML = `
    <base href="${window.document.location.origin}/">
    <style type="text/css">
      ${styleText}
    </style>
  `
  copyStyles(document, win.document)
}
