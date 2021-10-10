// Electron API typedefs here so we can use the structs in the frontend, without requiring the Electron package
declare namespace Electron {
  export interface Display {
    // Docs: https://electronjs.org/docs/api/structures/display

    /**
     * Can be `available`, `unavailable`, `unknown`.
     */
    accelerometerSupport: 'available' | 'unavailable' | 'unknown'
    bounds: Rectangle
    /**
     * The number of bits per pixel.
     */
    colorDepth: number
    /**
     * represent a color space (three-dimensional object which contains all realizable
     * color combinations) for the purpose of color conversions
     */
    colorSpace: string
    /**
     * The number of bits per color component.
     */
    depthPerComponent: number
    /**
     * Unique identifier associated with the display.
     */
    id: number
    /**
     * `true` for an internal display and `false` for an external display
     */
    internal: boolean
    /**
     * Whether or not the display is a monochrome display.
     */
    monochrome: boolean
    /**
     * Can be 0, 90, 180, 270, represents screen rotation in clock-wise degrees.
     */
    rotation: number
    /**
     * Output device's pixel scale factor.
     */
    scaleFactor: number
    size: Size
    /**
     * Can be `available`, `unavailable`, `unknown`.
     */
    touchSupport: 'available' | 'unavailable' | 'unknown'
    workArea: Rectangle
    workAreaSize: Size
  }

  interface DesktopCapturerSource {
    // Docs: https://electronjs.org/docs/api/structures/desktop-capturer-source

    /**
     * An icon image of the application that owns the window or null if the source has
     * a type screen. The size of the icon is not known in advance and depends on what
     * the application provides.
     */
    appIcon: NativeImage
    /**
     * A unique identifier that will correspond to the `id` of the matching Display
     * returned by the Screen API. On some platforms, this is equivalent to the `XX`
     * portion of the `id` field above and on others it will differ. It will be an
     * empty string if not available.
     */
    display_id: string
    /**
     * The identifier of a window or screen that can be used as a `chromeMediaSourceId`
     * constraint when calling [`navigator.webkitGetUserMedia`]. The format of the
     * identifier will be `window:XX` or `screen:XX`, where `XX` is a random generated
     * number.
     */
    id: string
    /**
     * A screen source will be named either `Entire Screen` or `Screen <index>`, while
     * the name of a window source will match the window title.
     */
    name: string
    /**
     * A thumbnail image. **Note:** There is no guarantee that the size of the
     * thumbnail is the same as the `thumbnailSize` specified in the `options` passed
     * to `desktopCapturer.getSources`. The actual size depends on the scale of the
     * screen or window.
     */
    thumbnail: NativeImage
  }

  interface SourcesOptions {
    /**
     * An array of Strings that lists the types of desktop sources to be captured,
     * available types are `screen` and `window`.
     */
    types: string[]
    /**
     * The size that the media source thumbnail should be scaled to. Default is `150` x
     * `150`. Set width or height to 0 when you do not need the thumbnails. This will
     * save the processing time required for capturing the content of each window and
     * screen.
     */
    thumbnailSize?: Size
    /**
     * Set to true to enable fetching window icons. The default value is false. When
     * false the appIcon property of the sources return null. Same if a source has the
     * type screen.
     */
    fetchWindowIcons?: boolean
  }

  interface AppDetailsOptions {
    /**
     * Window's App User Model ID. It has to be set, otherwise the other options will
     * have no effect.
     */
    appId?: string
    /**
     * Window's Relaunch Icon.
     */
    appIconPath?: string
    /**
     * Index of the icon in `appIconPath`. Ignored when `appIconPath` is not set.
     * Default is `0`.
     */
    appIconIndex?: number
    /**
     * Window's Relaunch Command.
     */
    relaunchCommand?: string
    /**
     * Window's Relaunch Display Name.
     */
    relaunchDisplayName?: string
  }

  interface IgnoreMouseEventsOptions {
    /**
     * If true, forwards mouse move messages to Chromium, enabling mouse related events
     * such as `mouseleave`. Only used when `ignore` is true. If `ignore` is false,
     * forwarding is always disabled regardless of this value.
     *
     * @platform darwin,win32
     */
    forward?: boolean
  }

  interface ProgressBarOptions {
    /**
     * Mode for the progress bar. Can be `none`, `normal`, `indeterminate`, `error` or
     * `paused`.
     *
     * @platform win32
     */
    mode: 'none' | 'normal' | 'indeterminate' | 'error' | 'paused'
  }

  class BrowserWindow extends NodeEventEmitter {
    // Docs: https://electronjs.org/docs/api/browser-window

    /**
     * Emitted when the window is set or unset to show always on top of other windows.
     */
    on(
      event: 'always-on-top-changed',
      listener: (event: Event, isAlwaysOnTop: boolean) => void
    ): this
    once(
      event: 'always-on-top-changed',
      listener: (event: Event, isAlwaysOnTop: boolean) => void
    ): this
    addListener(
      event: 'always-on-top-changed',
      listener: (event: Event, isAlwaysOnTop: boolean) => void
    ): this
    removeListener(
      event: 'always-on-top-changed',
      listener: (event: Event, isAlwaysOnTop: boolean) => void
    ): this
    /**
     * Emitted when an App Command is invoked. These are typically related to keyboard
     * media keys or browser commands, as well as the "Back" button built into some
     * mice on Windows.
     *
     * Commands are lowercased, underscores are replaced with hyphens, and the
     * `APPCOMMAND_` prefix is stripped off. e.g. `APPCOMMAND_BROWSER_BACKWARD` is
     * emitted as `browser-backward`.
     *
     * The following app commands are explicitly supported on Linux:
     *
     * `browser-backward`
     * `browser-forward`
     *
     * @platform win32,linux
     */
    on(event: 'app-command', listener: (event: Event, command: string) => void): this
    once(event: 'app-command', listener: (event: Event, command: string) => void): this
    addListener(event: 'app-command', listener: (event: Event, command: string) => void): this
    removeListener(event: 'app-command', listener: (event: Event, command: string) => void): this
    /**
     * Emitted when the window loses focus.
     */
    on(event: 'blur', listener: Function): this
    once(event: 'blur', listener: Function): this
    addListener(event: 'blur', listener: Function): this
    removeListener(event: 'blur', listener: Function): this
    /**
     * Emitted when the window is going to be closed. It's emitted before the
     * `beforeunload` and `unload` event of the DOM. Calling `event.preventDefault()`
     * will cancel the close.
     *
     * Usually you would want to use the `beforeunload` handler to decide whether the
     * window should be closed, which will also be called when the window is reloaded.
     * In Electron, returning any value other than `undefined` would cancel the close.
     * For example:
     *
     * _**Note**: There is a subtle difference between the behaviors of
     * `window.onbeforeunload = handler` and `window.addEventListener('beforeunload',
     * handler)`. It is recommended to always set the `event.returnValue` explicitly,
     * instead of only returning a value, as the former works more consistently within
     * Electron._
     */
    on(event: 'close', listener: (event: Event) => void): this
    once(event: 'close', listener: (event: Event) => void): this
    addListener(event: 'close', listener: (event: Event) => void): this
    removeListener(event: 'close', listener: (event: Event) => void): this
    /**
     * Emitted when the window is closed. After you have received this event you should
     * remove the reference to the window and avoid using it any more.
     */
    on(event: 'closed', listener: Function): this
    once(event: 'closed', listener: Function): this
    addListener(event: 'closed', listener: Function): this
    removeListener(event: 'closed', listener: Function): this
    /**
     * Emitted when the window enters a full-screen state.
     */
    on(event: 'enter-full-screen', listener: Function): this
    once(event: 'enter-full-screen', listener: Function): this
    addListener(event: 'enter-full-screen', listener: Function): this
    removeListener(event: 'enter-full-screen', listener: Function): this
    /**
     * Emitted when the window enters a full-screen state triggered by HTML API.
     */
    on(event: 'enter-html-full-screen', listener: Function): this
    once(event: 'enter-html-full-screen', listener: Function): this
    addListener(event: 'enter-html-full-screen', listener: Function): this
    removeListener(event: 'enter-html-full-screen', listener: Function): this
    /**
     * Emitted when the window gains focus.
     */
    on(event: 'focus', listener: Function): this
    once(event: 'focus', listener: Function): this
    addListener(event: 'focus', listener: Function): this
    removeListener(event: 'focus', listener: Function): this
    /**
     * Emitted when the window is hidden.
     */
    on(event: 'hide', listener: Function): this
    once(event: 'hide', listener: Function): this
    addListener(event: 'hide', listener: Function): this
    removeListener(event: 'hide', listener: Function): this
    /**
     * Emitted when the window leaves a full-screen state.
     */
    on(event: 'leave-full-screen', listener: Function): this
    once(event: 'leave-full-screen', listener: Function): this
    addListener(event: 'leave-full-screen', listener: Function): this
    removeListener(event: 'leave-full-screen', listener: Function): this
    /**
     * Emitted when the window leaves a full-screen state triggered by HTML API.
     */
    on(event: 'leave-html-full-screen', listener: Function): this
    once(event: 'leave-html-full-screen', listener: Function): this
    addListener(event: 'leave-html-full-screen', listener: Function): this
    removeListener(event: 'leave-html-full-screen', listener: Function): this
    /**
     * Emitted when window is maximized.
     */
    on(event: 'maximize', listener: Function): this
    once(event: 'maximize', listener: Function): this
    addListener(event: 'maximize', listener: Function): this
    removeListener(event: 'maximize', listener: Function): this
    /**
     * Emitted when the window is minimized.
     */
    on(event: 'minimize', listener: Function): this
    once(event: 'minimize', listener: Function): this
    addListener(event: 'minimize', listener: Function): this
    removeListener(event: 'minimize', listener: Function): this
    /**
     * Emitted when the window is being moved to a new position.
     */
    on(event: 'move', listener: Function): this
    once(event: 'move', listener: Function): this
    addListener(event: 'move', listener: Function): this
    removeListener(event: 'move', listener: Function): this
    /**
     * Emitted once when the window is moved to a new position.
     *
__Note__: On macOS this event is an alias of `move`.
     *
     * @platform darwin,win32
     */
    on(event: 'moved', listener: Function): this
    once(event: 'moved', listener: Function): this
    addListener(event: 'moved', listener: Function): this
    removeListener(event: 'moved', listener: Function): this
    /**
     * Emitted when the native new tab button is clicked.
     *
     * @platform darwin
     */
    on(event: 'new-window-for-tab', listener: Function): this
    once(event: 'new-window-for-tab', listener: Function): this
    addListener(event: 'new-window-for-tab', listener: Function): this
    removeListener(event: 'new-window-for-tab', listener: Function): this
    /**
     * Emitted when the document changed its title, calling `event.preventDefault()`
     * will prevent the native window's title from changing. `explicitSet` is false
     * when title is synthesized from file URL.
     */
    on(
      event: 'page-title-updated',
      listener: (event: Event, title: string, explicitSet: boolean) => void
    ): this
    once(
      event: 'page-title-updated',
      listener: (event: Event, title: string, explicitSet: boolean) => void
    ): this
    addListener(
      event: 'page-title-updated',
      listener: (event: Event, title: string, explicitSet: boolean) => void
    ): this
    removeListener(
      event: 'page-title-updated',
      listener: (event: Event, title: string, explicitSet: boolean) => void
    ): this
    /**
     * Emitted when the web page has been rendered (while not being shown) and window
     * can be displayed without a visual flash.
     *
     * Please note that using this event implies that the renderer will be considered
     * "visible" and paint even though `show` is false.  This event will never fire if
     * you use `paintWhenInitiallyHidden: false`
     */
    on(event: 'ready-to-show', listener: Function): this
    once(event: 'ready-to-show', listener: Function): this
    addListener(event: 'ready-to-show', listener: Function): this
    removeListener(event: 'ready-to-show', listener: Function): this
    /**
     * Emitted after the window has been resized.
     */
    on(event: 'resize', listener: Function): this
    once(event: 'resize', listener: Function): this
    addListener(event: 'resize', listener: Function): this
    removeListener(event: 'resize', listener: Function): this
    /**
     * Emitted once when the window has finished being resized.
     *
     * This is usually emitted when the window has been resized manually. On macOS,
     * resizing the window with `setBounds`/`setSize` and setting the `animate`
     * parameter to `true` will also emit this event once resizing has finished.
     *
     * @platform darwin,win32
     */
    on(event: 'resized', listener: Function): this
    once(event: 'resized', listener: Function): this
    addListener(event: 'resized', listener: Function): this
    removeListener(event: 'resized', listener: Function): this
    /**
     * Emitted when the unresponsive web page becomes responsive again.
     */
    on(event: 'responsive', listener: Function): this
    once(event: 'responsive', listener: Function): this
    addListener(event: 'responsive', listener: Function): this
    removeListener(event: 'responsive', listener: Function): this
    /**
     * Emitted when the window is restored from a minimized state.
     */
    on(event: 'restore', listener: Function): this
    once(event: 'restore', listener: Function): this
    addListener(event: 'restore', listener: Function): this
    removeListener(event: 'restore', listener: Function): this
    /**
     * Emitted on trackpad rotation gesture. Continually emitted until rotation gesture
     * is ended. The `rotation` value on each emission is the angle in degrees rotated
     * since the last emission. The last emitted event upon a rotation gesture will
     * always be of value `0`. Counter-clockwise rotation values are positive, while
     * clockwise ones are negative.
     *
     * @platform darwin
     */
    on(event: 'rotate-gesture', listener: (event: Event, rotation: number) => void): this
    once(event: 'rotate-gesture', listener: (event: Event, rotation: number) => void): this
    addListener(event: 'rotate-gesture', listener: (event: Event, rotation: number) => void): this
    removeListener(
      event: 'rotate-gesture',
      listener: (event: Event, rotation: number) => void
    ): this
    /**
     * Emitted when scroll wheel event phase has begun.
     *
     * @platform darwin
     */
    on(event: 'scroll-touch-begin', listener: Function): this
    once(event: 'scroll-touch-begin', listener: Function): this
    addListener(event: 'scroll-touch-begin', listener: Function): this
    removeListener(event: 'scroll-touch-begin', listener: Function): this
    /**
     * Emitted when scroll wheel event phase filed upon reaching the edge of element.
     *
     * @platform darwin
     */
    on(event: 'scroll-touch-edge', listener: Function): this
    once(event: 'scroll-touch-edge', listener: Function): this
    addListener(event: 'scroll-touch-edge', listener: Function): this
    removeListener(event: 'scroll-touch-edge', listener: Function): this
    /**
     * Emitted when scroll wheel event phase has ended.
     *
     * @platform darwin
     */
    on(event: 'scroll-touch-end', listener: Function): this
    once(event: 'scroll-touch-end', listener: Function): this
    addListener(event: 'scroll-touch-end', listener: Function): this
    removeListener(event: 'scroll-touch-end', listener: Function): this
    /**
     * Emitted when window session is going to end due to force shutdown or machine
     * restart or session log off.
     *
     * @platform win32
     */
    on(event: 'session-end', listener: Function): this
    once(event: 'session-end', listener: Function): this
    addListener(event: 'session-end', listener: Function): this
    removeListener(event: 'session-end', listener: Function): this
    /**
     * Emitted when the window opens a sheet.
     *
     * @platform darwin
     */
    on(event: 'sheet-begin', listener: Function): this
    once(event: 'sheet-begin', listener: Function): this
    addListener(event: 'sheet-begin', listener: Function): this
    removeListener(event: 'sheet-begin', listener: Function): this
    /**
     * Emitted when the window has closed a sheet.
     *
     * @platform darwin
     */
    on(event: 'sheet-end', listener: Function): this
    once(event: 'sheet-end', listener: Function): this
    addListener(event: 'sheet-end', listener: Function): this
    removeListener(event: 'sheet-end', listener: Function): this
    /**
     * Emitted when the window is shown.
     */
    on(event: 'show', listener: Function): this
    once(event: 'show', listener: Function): this
    addListener(event: 'show', listener: Function): this
    removeListener(event: 'show', listener: Function): this
    /**
     * Emitted on 3-finger swipe. Possible directions are `up`, `right`, `down`,
     * `left`.
     *
     * The method underlying this event is built to handle older macOS-style trackpad
     * swiping, where the content on the screen doesn't move with the swipe. Most macOS
     * trackpads are not configured to allow this kind of swiping anymore, so in order
     * for it to emit properly the 'Swipe between pages' preference in `System
     * Preferences > Trackpad > More Gestures` must be set to 'Swipe with two or three
     * fingers'.
     *
     * @platform darwin
     */
    on(event: 'swipe', listener: (event: Event, direction: string) => void): this
    once(event: 'swipe', listener: (event: Event, direction: string) => void): this
    addListener(event: 'swipe', listener: (event: Event, direction: string) => void): this
    removeListener(event: 'swipe', listener: (event: Event, direction: string) => void): this
    /**
     * Emitted when the system context menu is triggered on the window, this is
     * normally only triggered when the user right clicks on the non-client area of
     * your window.  This is the window titlebar or any area you have declared as
     * `-webkit-app-region: drag` in a frameless window.
     *
Calling `event.preventDefault()` will prevent the menu from being displayed.
     *
     * @platform win32
     */
    on(
      event: 'system-context-menu',
      listener: (
        event: Event,
        /**
         * The screen coordinates the context menu was triggered at
         */
        point: Point
      ) => void
    ): this
    once(
      event: 'system-context-menu',
      listener: (
        event: Event,
        /**
         * The screen coordinates the context menu was triggered at
         */
        point: Point
      ) => void
    ): this
    addListener(
      event: 'system-context-menu',
      listener: (
        event: Event,
        /**
         * The screen coordinates the context menu was triggered at
         */
        point: Point
      ) => void
    ): this
    removeListener(
      event: 'system-context-menu',
      listener: (
        event: Event,
        /**
         * The screen coordinates the context menu was triggered at
         */
        point: Point
      ) => void
    ): this
    /**
     * Emitted when the window exits from a maximized state.
     */
    on(event: 'unmaximize', listener: Function): this
    once(event: 'unmaximize', listener: Function): this
    addListener(event: 'unmaximize', listener: Function): this
    removeListener(event: 'unmaximize', listener: Function): this
    /**
     * Emitted when the web page becomes unresponsive.
     */
    on(event: 'unresponsive', listener: Function): this
    once(event: 'unresponsive', listener: Function): this
    addListener(event: 'unresponsive', listener: Function): this
    removeListener(event: 'unresponsive', listener: Function): this
    /**
     * Emitted before the window is moved. On Windows, calling `event.preventDefault()`
     * will prevent the window from being moved.
     *
     * Note that this is only emitted when the window is being resized manually.
     * Resizing the window with `setBounds`/`setSize` will not emit this event.
     *
     * @platform darwin,win32
     */
    on(
      event: 'will-move',
      listener: (
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    once(
      event: 'will-move',
      listener: (
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    addListener(
      event: 'will-move',
      listener: (
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    removeListener(
      event: 'will-move',
      listener: (
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    /**
     * Emitted before the window is resized. Calling `event.preventDefault()` will
     * prevent the window from being resized.
     *
     * Note that this is only emitted when the window is being resized manually.
     * Resizing the window with `setBounds`/`setSize` will not emit this event.
     *
     * @platform darwin,win32
     */
    on(
      event: 'will-resize',
      listener: (
        event: Event,
        /**
         * Size the window is being resized to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    once(
      event: 'will-resize',
      listener: (
        event: Event,
        /**
         * Size the window is being resized to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    addListener(
      event: 'will-resize',
      listener: (
        event: Event,
        /**
         * Size the window is being resized to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    removeListener(
      event: 'will-resize',
      listener: (
        event: Event,
        /**
         * Size the window is being resized to.
         */
        newBounds: Rectangle
      ) => void
    ): this
    /**
     * BrowserWindow
     */
    constructor(options?: BrowserWindowConstructorOptions)
    /**
     * Adds DevTools extension located at `path`, and returns extension's name.
     *
     * The extension will be remembered so you only need to call this API once, this
     * API is not for programming use. If you try to add an extension that has already
     * been loaded, this method will not return and instead log a warning to the
     * console.
     *
     * The method will also not return if the extension's manifest is missing or
     * incomplete.
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     **Note:** This method is deprecated. Instead, use `ses.loadExtension(path)`.
     *
     * @deprecated
     */
    static addDevToolsExtension(path: string): void
    /**
     * Adds Chrome extension located at `path`, and returns extension's name.
     *
     * The method will also not return if the extension's manifest is missing or
     * incomplete.
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     **Note:** This method is deprecated. Instead, use `ses.loadExtension(path)`.
     *
     * @deprecated
     */
    static addExtension(path: string): void
    /**
     * The window that owns the given `browserView`. If the given view is not attached
     * to any window, returns `null`.
     */
    static fromBrowserView(browserView: BrowserView): BrowserWindow | null
    /**
     * The window with the given `id`.
     */
    static fromId(id: number): BrowserWindow | null
    /**
     * The window that owns the given `webContents` or `null` if the contents are not
     * owned by a window.
     */
    static fromWebContents(webContents: WebContents): BrowserWindow | null
    /**
     * An array of all opened browser windows.
     */
    static getAllWindows(): BrowserWindow[]
    /**
     * The keys are the extension names and each value is an Object containing `name`
     * and `version` properties.
     *
     * To check if a DevTools extension is installed you can run the following:
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     **Note:** This method is deprecated. Instead, use `ses.getAllExtensions()`.
     *
     * @deprecated
     */
    static getDevToolsExtensions(): Record<string, ExtensionInfo>
    /**
     * The keys are the extension names and each value is an Object containing `name`
     * and `version` properties.
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     **Note:** This method is deprecated. Instead, use `ses.getAllExtensions()`.
     *
     * @deprecated
     */
    static getExtensions(): Record<string, ExtensionInfo>
    /**
     * The window that is focused in this application, otherwise returns `null`.
     */
    static getFocusedWindow(): BrowserWindow | null
    /**
     * Remove a DevTools extension by name.
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     * **Note:** This method is deprecated. Instead, use
     * `ses.removeExtension(extension_id)`.
     *
     * @deprecated
     */
    static removeDevToolsExtension(name: string): void
    /**
     * Remove a Chrome extension by name.
     *
     * **Note:** This API cannot be called before the `ready` event of the `app` module
     * is emitted.
     *
     * **Note:** This method is deprecated. Instead, use
     * `ses.removeExtension(extension_id)`.
     *
     * @deprecated
     */
    static removeExtension(name: string): void
    /**
     * Replacement API for setBrowserView supporting work with multi browser views.
     *
     * @experimental
     */
    addBrowserView(browserView: BrowserView): void
    /**
     * Adds a window as a tab on this window, after the tab for the window instance.
     *
     * @platform darwin
     */
    addTabbedWindow(browserWindow: BrowserWindow): void
    /**
     * Removes focus from the window.
     */
    blur(): void
    blurWebView(): void
    /**
     * Resolves with a NativeImage
     *
     * Captures a snapshot of the page within `rect`. Omitting `rect` will capture the
     * whole visible page. If the page is not visible, `rect` may be empty.
     */
    capturePage(rect?: Rectangle): Promise<Electron.NativeImage>
    /**
     * Moves window to the center of the screen.
     */
    center(): void
    /**
     * Try to close the window. This has the same effect as a user manually clicking
     * the close button of the window. The web page may cancel the close though. See
     * the close event.
     */
    close(): void
    /**
     * Closes the currently open Quick Look panel.
     *
     * @platform darwin
     */
    closeFilePreview(): void
    /**
     * Force closing the window, the `unload` and `beforeunload` event won't be emitted
     * for the web page, and `close` event will also not be emitted for this window,
     * but it guarantees the `closed` event will be emitted.
     */
    destroy(): void
    /**
     * Starts or stops flashing the window to attract user's attention.
     */
    flashFrame(flag: boolean): void
    /**
     * Focuses on the window.
     */
    focus(): void
    focusOnWebView(): void
    /**
     * Gets the background color of the window. See Setting `backgroundColor`.
     */
    getBackgroundColor(): string
    /**
     * The `bounds` of the window as `Object`.
     */
    getBounds(): Rectangle
    /**
     * The `BrowserView` attached to `win`. Returns `null` if one is not attached.
     * Throws an error if multiple `BrowserView`s are attached.
     *
     * @experimental
     */
    getBrowserView(): BrowserView | null
    /**
     * an array of all BrowserViews that have been attached with `addBrowserView` or
     * `setBrowserView`.
     *
     * **Note:** The BrowserView API is currently experimental and may change or be
     * removed in future Electron releases.
     *
     * @experimental
     */
    getBrowserViews(): BrowserView[]
    /**
     * All child windows.
     */
    getChildWindows(): BrowserWindow[]
    /**
     * The `bounds` of the window's client area as `Object`.
     */
    getContentBounds(): Rectangle
    /**
     * Contains the window's client area's width and height.
     */
    getContentSize(): number[]
    /**
     * Contains the window's maximum width and height.
     */
    getMaximumSize(): number[]
    /**
     * Window id in the format of DesktopCapturerSource's id. For example
     * "window:1234:0".
     *
     * More precisely the format is `window:id:other_id` where `id` is `HWND` on
     * Windows, `CGWindowID` (`uint64_t`) on macOS and `Window` (`unsigned long`) on
     * Linux. `other_id` is used to identify web contents (tabs) so within the same top
     * level window.
     */
    getMediaSourceId(): string
    /**
     * Contains the window's minimum width and height.
     */
    getMinimumSize(): number[]
    /**
     * The platform-specific handle of the window.
     *
     * The native type of the handle is `HWND` on Windows, `NSView*` on macOS, and
     * `Window` (`unsigned long`) on Linux.
     */
    getNativeWindowHandle(): Buffer
    /**
     * Contains the window bounds of the normal state
     *
     * **Note:** whatever the current state of the window : maximized, minimized or in
     * fullscreen, this function always returns the position and size of the window in
     * normal state. In normal state, getBounds and getNormalBounds returns the same
     * `Rectangle`.
     */
    getNormalBounds(): Rectangle
    /**
     * between 0.0 (fully transparent) and 1.0 (fully opaque). On Linux, always returns
     * 1.
     */
    getOpacity(): number
    /**
     * The parent window.
     */
    getParentWindow(): BrowserWindow
    /**
     * Contains the window's current position.
     */
    getPosition(): number[]
    /**
     * The pathname of the file the window represents.
     *
     * @platform darwin
     */
    getRepresentedFilename(): string
    /**
     * Contains the window's width and height.
     */
    getSize(): number[]
    /**
     * The title of the native window.
     *
     * **Note:** The title of the web page can be different from the title of the
     * native window.
     */
    getTitle(): string
    /**
     * The current position for the traffic light buttons. Can only be used with
     * `titleBarStyle` set to `hidden`.
     *
     * @platform darwin
     */
    getTrafficLightPosition(): Point
    /**
     * Whether the window has a shadow.
     */
    hasShadow(): boolean
    /**
     * Hides the window.
     */
    hide(): void
    /**
     * Hooks a windows message. The `callback` is called when the message is received
     * in the WndProc.
     *
     * @platform win32
     */
    hookWindowMessage(message: number, callback: (wParam: any, lParam: any) => void): void
    /**
     * Whether the window is always on top of other windows.
     */
    isAlwaysOnTop(): boolean
    /**
     * Whether the window can be manually closed by user.
     *
On Linux always returns `true`.
     *
     * @platform darwin,win32
     */
    isClosable(): boolean
    /**
     * Whether the window is destroyed.
     */
    isDestroyed(): boolean
    /**
     * Whether the window's document has been edited.
     *
     * @platform darwin
     */
    isDocumentEdited(): boolean
    /**
     * whether the window is enabled.
     */
    isEnabled(): boolean
    /**
     * Whether the window is focused.
     */
    isFocused(): boolean
    /**
     * Whether the window is in fullscreen mode.
     */
    isFullScreen(): boolean
    /**
     * Whether the maximize/zoom window button toggles fullscreen mode or maximizes the
     * window.
     */
    isFullScreenable(): boolean
    /**
     * Whether the window is in kiosk mode.
     */
    isKiosk(): boolean
    /**
     * Whether the window can be manually maximized by user.
     *
On Linux always returns `true`.
     *
     * @platform darwin,win32
     */
    isMaximizable(): boolean
    /**
     * Whether the window is maximized.
     */
    isMaximized(): boolean
    /**
     * Whether menu bar automatically hides itself.
     */
    isMenuBarAutoHide(): boolean
    /**
     * Whether the menu bar is visible.
     */
    isMenuBarVisible(): boolean
    /**
     * Whether the window can be manually minimized by the user.
     *
On Linux always returns `true`.
     *
     * @platform darwin,win32
     */
    isMinimizable(): boolean
    /**
     * Whether the window is minimized.
     */
    isMinimized(): boolean
    /**
     * Whether current window is a modal window.
     */
    isModal(): boolean
    /**
     * Whether the window can be moved by user.

On Linux always returns `true`.
     *
     * @platform darwin,win32
     */
    isMovable(): boolean
    /**
     * Whether the window is in normal state (not maximized, not minimized, not in
     * fullscreen mode).
     */
    isNormal(): boolean
    /**
     * Whether the window can be manually resized by the user.
     */
    isResizable(): boolean
    /**
     * Whether the window is in simple (pre-Lion) fullscreen mode.
     *
     * @platform darwin
     */
    isSimpleFullScreen(): boolean
    /**
     * Whether the window is visible to the user.
     */
    isVisible(): boolean
    /**
     * Whether the window is visible on all workspaces.
     *
     **Note:** This API always returns false on Windows.
     */
    isVisibleOnAllWorkspaces(): boolean
    /**
     * `true` or `false` depending on whether the message is hooked.
     *
     * @platform win32
     */
    isWindowMessageHooked(message: number): boolean
    /**
     * the promise will resolve when the page has finished loading (see
     * `did-finish-load`), and rejects if the page fails to load (see `did-fail-load`).
     *
     * Same as `webContents.loadFile`, `filePath` should be a path to an HTML file
     * relative to the root of your application.  See the `webContents` docs for more
     * information.
     */
    loadFile(filePath: string, options?: LoadFileOptions): Promise<void>
    /**
     * the promise will resolve when the page has finished loading (see
     * `did-finish-load`), and rejects if the page fails to load (see `did-fail-load`).
     *
     * Same as `webContents.loadURL(url[, options])`.
     *
     * The `url` can be a remote address (e.g. `http://`) or a path to a local HTML
     * file using the `file://` protocol.
     *
     * To ensure that file URLs are properly formatted, it is recommended to use Node's
     * `url.format` method:
     *
     * You can load a URL using a `POST` request with URL-encoded data by doing the
     * following:
     */
    loadURL(url: string, options?: LoadURLOptions): Promise<void>
    /**
     * Maximizes the window. This will also show (but not focus) the window if it isn't
     * being displayed already.
     */
    maximize(): void
    /**
     * Merges all windows into one window with multiple tabs when native tabs are
     * enabled and there is more than one open window.
     *
     * @platform darwin
     */
    mergeAllWindows(): void
    /**
     * Minimizes the window. On some platforms the minimized window will be shown in
     * the Dock.
     */
    minimize(): void
    /**
     * Moves window above the source window in the sense of z-order. If the
     * `mediaSourceId` is not of type window or if the window does not exist then this
     * method throws an error.
     */
    moveAbove(mediaSourceId: string): void
    /**
     * Moves the current tab into a new window if native tabs are enabled and there is
     * more than one tab in the current window.
     *
     * @platform darwin
     */
    moveTabToNewWindow(): void
    /**
     * Moves window to top(z-order) regardless of focus
     */
    moveTop(): void
    /**
     * Uses Quick Look to preview a file at a given path.
     *
     * @platform darwin
     */
    previewFile(path: string, displayName?: string): void
    /**
     * Same as `webContents.reload`.
     */
    reload(): void
    removeBrowserView(browserView: BrowserView): void
    /**
     * Remove the window's menu bar.
     *
     * @platform linux,win32
     */
    removeMenu(): void
    /**
     * Restores the window from minimized state to its previous state.
     */
    restore(): void
    /**
     * Selects the next tab when native tabs are enabled and there are other tabs in
     * the window.
     *
     * @platform darwin
     */
    selectNextTab(): void
    /**
     * Selects the previous tab when native tabs are enabled and there are other tabs
     * in the window.
     *
     * @platform darwin
     */
    selectPreviousTab(): void
    /**
     * Sets whether the window should show always on top of other windows. After
     * setting this, the window is still a normal window, not a toolbox window which
     * can not be focused on.
     */
    setAlwaysOnTop(
      flag: boolean,
      level?:
        | 'normal'
        | 'floating'
        | 'torn-off-menu'
        | 'modal-panel'
        | 'main-menu'
        | 'status'
        | 'pop-up-menu'
        | 'screen-saver',
      relativeLevel?: number
    ): void
    /**
     * Sets the properties for the window's taskbar button.
     *
     * **Note:** `relaunchCommand` and `relaunchDisplayName` must always be set
     * together. If one of those properties is not set, then neither will be used.
     *
     * @platform win32
     */
    setAppDetails(options: AppDetailsOptions): void
    /**
     * This will make a window maintain an aspect ratio. The extra size allows a
     * developer to have space, specified in pixels, not included within the aspect
     * ratio calculations. This API already takes into account the difference between a
     * window's size and its content size.
     *
     * Consider a normal window with an HD video player and associated controls.
     * Perhaps there are 15 pixels of controls on the left edge, 25 pixels of controls
     * on the right edge and 50 pixels of controls below the player. In order to
     * maintain a 16:9 aspect ratio (standard aspect ratio for HD @1920x1080) within
     * the player itself we would call this function with arguments of 16/9 and {
     * width: 40, height: 50 }. The second argument doesn't care where the extra width
     * and height are within the content view--only that they exist. Sum any extra
     * width and height areas you have within the overall content view.
     *
     * The aspect ratio is not respected when window is resized programmingly with APIs
     * like `win.setSize`.
     */
    setAspectRatio(aspectRatio: number, extraSize?: Size): void
    /**
     * Controls whether to hide cursor when typing.
     *
     * @platform darwin
     */
    setAutoHideCursor(autoHide: boolean): void
    /**
     * Sets whether the window menu bar should hide itself automatically. Once set the
     * menu bar will only show when users press the single `Alt` key.
     *
     * If the menu bar is already visible, calling `setAutoHideMenuBar(true)` won't
     * hide it immediately.
     */
    setAutoHideMenuBar(hide: boolean): void
    /**
     * Sets the background color of the window. See Setting `backgroundColor`.
     */
    setBackgroundColor(backgroundColor: string): void
    /**
     * Resizes and moves the window to the supplied bounds. Any properties that are not
     * supplied will default to their current values.
     */
    setBounds(bounds: Partial<Rectangle>, animate?: boolean): void
    setBrowserView(browserView: BrowserView | null): void
    /**
     * Sets whether the window can be manually closed by user. On Linux does nothing.
     *
     * @platform darwin,win32
     */
    setClosable(closable: boolean): void
    /**
     * Resizes and moves the window's client area (e.g. the web page) to the supplied
     * bounds.
     */
    setContentBounds(bounds: Rectangle, animate?: boolean): void
    /**
     * Prevents the window contents from being captured by other apps.
     *
     * On macOS it sets the NSWindow's sharingType to NSWindowSharingNone. On Windows
     * it calls SetWindowDisplayAffinity with `WDA_MONITOR`.
     *
     * @platform darwin,win32
     */
    setContentProtection(enable: boolean): void
    /**
     * Resizes the window's client area (e.g. the web page) to `width` and `height`.
     */
    setContentSize(width: number, height: number, animate?: boolean): void
    /**
     * Specifies whether the window’s document has been edited, and the icon in title
     * bar will become gray when set to `true`.
     *
     * @platform darwin
     */
    setDocumentEdited(edited: boolean): void
    /**
     * Disable or enable the window.
     */
    setEnabled(enable: boolean): void
    /**
     * Changes whether the window can be focused.
     *
On macOS it does not remove the focus from the window.
     *
     * @platform darwin,win32
     */
    setFocusable(focusable: boolean): void
    /**
     * Sets whether the window should be in fullscreen mode.
     */
    setFullScreen(flag: boolean): void
    /**
     * Sets whether the maximize/zoom window button toggles fullscreen mode or
     * maximizes the window.
     */
    setFullScreenable(fullscreenable: boolean): void
    /**
     * Sets whether the window should have a shadow.
     */
    setHasShadow(hasShadow: boolean): void
    /**
     * Changes window icon.
     *
     * @platform win32,linux
     */
    setIcon(icon: NativeImage | string): void
    /**
     * Makes the window ignore all mouse events.
     *
     * All mouse events happened in this window will be passed to the window below this
     * window, but if this window has focus, it will still receive keyboard events.
     */
    setIgnoreMouseEvents(ignore: boolean, options?: IgnoreMouseEventsOptions): void
    /**
     * Enters or leaves kiosk mode.
     */
    setKiosk(flag: boolean): void
    /**
     * Sets whether the window can be manually maximized by user. On Linux does
     * nothing.
     *
     * @platform darwin,win32
     */
    setMaximizable(maximizable: boolean): void
    /**
     * Sets the maximum size of window to `width` and `height`.
     */
    setMaximumSize(width: number, height: number): void
    /**
     * Sets the `menu` as the window's menu bar.
     *
     * @platform linux,win32
     */
    setMenu(menu: Menu | null): void
    /**
     * Sets whether the menu bar should be visible. If the menu bar is auto-hide, users
     * can still bring up the menu bar by pressing the single `Alt` key.
     *
     * @platform win32,linux
     */
    setMenuBarVisibility(visible: boolean): void
    /**
     * Sets whether the window can be manually minimized by user. On Linux does
     * nothing.
     *
     * @platform darwin,win32
     */
    setMinimizable(minimizable: boolean): void
    /**
     * Sets the minimum size of window to `width` and `height`.
     */
    setMinimumSize(width: number, height: number): void
    /**
     * Sets whether the window can be moved by user. On Linux does nothing.
     *
     * @platform darwin,win32
     */
    setMovable(movable: boolean): void
    /**
     * Sets the opacity of the window. On Linux, does nothing. Out of bound number
     * values are clamped to the [0, 1] range.
     *
     * @platform win32,darwin
     */
    setOpacity(opacity: number): void
    /**
     * Sets a 16 x 16 pixel overlay onto the current taskbar icon, usually used to
     * convey some sort of application status or to passively notify the user.
     *
     * @platform win32
     */
    setOverlayIcon(overlay: NativeImage | null, description: string): void
    /**
     * Sets `parent` as current window's parent window, passing `null` will turn
     * current window into a top-level window.
     */
    setParentWindow(parent: BrowserWindow | null): void
    /**
     * Moves window to `x` and `y`.
     */
    setPosition(x: number, y: number, animate?: boolean): void
    /**
     * Sets progress value in progress bar. Valid range is [0, 1.0].
     *
     * Remove progress bar when progress < 0; Change to indeterminate mode when
     * progress > 1.
     *
     * On Linux platform, only supports Unity desktop environment, you need to specify
     * the `*.desktop` file name to `desktopName` field in `package.json`. By default,
     * it will assume `{app.name}.desktop`.
     *
     * On Windows, a mode can be passed. Accepted values are `none`, `normal`,
     * `indeterminate`, `error`, and `paused`. If you call `setProgressBar` without a
     * mode set (but with a value within the valid range), `normal` will be assumed.
     */
    setProgressBar(progress: number, options?: ProgressBarOptions): void
    /**
     * Sets the pathname of the file the window represents, and the icon of the file
     * will show in window's title bar.
     *
     * @platform darwin
     */
    setRepresentedFilename(filename: string): void
    /**
     * Sets whether the window can be manually resized by the user.
     */
    setResizable(resizable: boolean): void
    /**
     * Setting a window shape determines the area within the window where the system
     * permits drawing and user interaction. Outside of the given region, no pixels
     * will be drawn and no mouse events will be registered. Mouse events outside of
     * the region will not be received by that window, but will fall through to
     * whatever is behind the window.
     *
     * @experimental
     * @platform win32,linux
     */
    setShape(rects: Rectangle[]): void
    /**
     * Changes the attachment point for sheets on macOS. By default, sheets are
     * attached just below the window frame, but you may want to display them beneath a
     * HTML-rendered toolbar. For example:
     *
     * @platform darwin
     */
    setSheetOffset(offsetY: number, offsetX?: number): void
    /**
     * Enters or leaves simple fullscreen mode.
     *
     * Simple fullscreen mode emulates the native fullscreen behavior found in versions
     * of macOS prior to Lion (10.7).
     *
     * @platform darwin
     */
    setSimpleFullScreen(flag: boolean): void
    /**
     * Resizes the window to `width` and `height`. If `width` or `height` are below any
     * set minimum size constraints the window will snap to its minimum size.
     */
    setSize(width: number, height: number, animate?: boolean): void
    /**
     * Makes the window not show in the taskbar.
     */
    setSkipTaskbar(skip: boolean): void
    /**
     * Whether the buttons were added successfully
     *
     * Add a thumbnail toolbar with a specified set of buttons to the thumbnail image
     * of a window in a taskbar button layout. Returns a `Boolean` object indicates
     * whether the thumbnail has been added successfully.
     *
     * The number of buttons in thumbnail toolbar should be no greater than 7 due to
     * the limited room. Once you setup the thumbnail toolbar, the toolbar cannot be
     * removed due to the platform's limitation. But you can call the API with an empty
     * array to clean the buttons.
     *
     * The `buttons` is an array of `Button` objects:
     *
     * * `Button` Object
     *   * `icon` NativeImage - The icon showing in thumbnail toolbar.
     *   * `click` Function
     *   * `tooltip` String (optional) - The text of the button's tooltip.
     *   * `flags` String[] (optional) - Control specific states and behaviors of the
     * button. By default, it is `['enabled']`.
     *
     * The `flags` is an array that can include following `String`s:
     *
     * * `enabled` - The button is active and available to the user.
     * * `disabled` - The button is disabled. It is present, but has a visual state
     * indicating it will not respond to user action.
     * * `dismissonclick` - When the button is clicked, the thumbnail window closes
     * immediately.
     * * `nobackground` - Do not draw a button border, use only the image.
     * * `hidden` - The button is not shown to the user.
     * * `noninteractive` - The button is enabled but not interactive; no pressed
     * button state is drawn. This value is intended for instances where the button is
     * used in a notification.
     *
     * @platform win32
     */
    setThumbarButtons(buttons: ThumbarButton[]): boolean
    /**
     * Sets the region of the window to show as the thumbnail image displayed when
     * hovering over the window in the taskbar. You can reset the thumbnail to be the
     * entire window by specifying an empty region: `{ x: 0, y: 0, width: 0, height: 0
     * }`.
     *
     * @platform win32
     */
    setThumbnailClip(region: Rectangle): void
    /**
     * Sets the toolTip that is displayed when hovering over the window thumbnail in
     * the taskbar.
     *
     * @platform win32
     */
    setThumbnailToolTip(toolTip: string): void
    /**
     * Changes the title of native window to `title`.
     */
    setTitle(title: string): void
    /**
     * Raises `browserView` above other `BrowserView`s attached to `win`. Throws an
     * error if `browserView` is not attached to `win`.
     *
     * @experimental
     */
    setTopBrowserView(browserView: BrowserView): void
    /**
     * Sets the touchBar layout for the current window. Specifying `null` or
     * `undefined` clears the touch bar. This method only has an effect if the machine
     * has a touch bar and is running on macOS 10.12.1+.
     *
     * **Note:** The TouchBar API is currently experimental and may change or be
     * removed in future Electron releases.
     *
     * @platform darwin
     */
    setTouchBar(touchBar: TouchBar | null): void
    /**
     * Set a custom position for the traffic light buttons. Can only be used with
     * `titleBarStyle` set to `hidden`.
     *
     * @platform darwin
     */
    setTrafficLightPosition(position: Point): void
    /**
     * Adds a vibrancy effect to the browser window. Passing `null` or an empty string
     * will remove the vibrancy effect on the window.
     *
     * Note that `appearance-based`, `light`, `dark`, `medium-light`, and `ultra-dark`
     * have been deprecated and will be removed in an upcoming version of macOS.
     *
     * @platform darwin
     */
    setVibrancy(
      type:
        | (
            | 'appearance-based'
            | 'light'
            | 'dark'
            | 'titlebar'
            | 'selection'
            | 'menu'
            | 'popover'
            | 'sidebar'
            | 'medium-light'
            | 'ultra-dark'
            | 'header'
            | 'sheet'
            | 'window'
            | 'hud'
            | 'fullscreen-ui'
            | 'tooltip'
            | 'content'
            | 'under-window'
            | 'under-page'
          )
        | null
    ): void
    /**
     * Sets whether the window should be visible on all workspaces.
     *
     **Note:** This API does nothing on Windows.
     */
    setVisibleOnAllWorkspaces(visible: boolean, options?: VisibleOnAllWorkspacesOptions): void
    /**
     * Sets whether the window traffic light buttons should be visible.
     *
This cannot be called when `titleBarStyle` is set to `customButtonsOnHover`.
     *
     * @platform darwin
     */
    setWindowButtonVisibility(visible: boolean): void
    /**
     * Shows and gives focus to the window.
     */
    show(): void
    /**
     * Same as `webContents.showDefinitionForSelection()`.
     *
     * @platform darwin
     */
    showDefinitionForSelection(): void
    /**
     * Shows the window but doesn't focus on it.
     */
    showInactive(): void
    /**
     * Toggles the visibility of the tab bar if native tabs are enabled and there is
     * only one tab in the current window.
     *
     * @platform darwin
     */
    toggleTabBar(): void
    /**
     * Unhooks all of the window messages.
     *
     * @platform win32
     */
    unhookAllWindowMessages(): void
    /**
     * Unhook the window message.
     *
     * @platform win32
     */
    unhookWindowMessage(message: number): void
    /**
     * Unmaximizes the window.
     */
    unmaximize(): void
    accessibleTitle: string
    autoHideMenuBar: boolean
    closable: boolean
    documentEdited: boolean
    excludedFromShownWindowsMenu: boolean
    fullScreen: boolean
    fullScreenable: boolean
    readonly id: number
    kiosk: boolean
    maximizable: boolean
    menuBarVisible: boolean
    minimizable: boolean
    movable: boolean
    representedFilename: string
    resizable: boolean
    shadow: boolean
    simpleFullScreen: boolean
    title: string
    visibleOnAllWorkspaces: boolean
    readonly webContents: WebContents
  }
}
