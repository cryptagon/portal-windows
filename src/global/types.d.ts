export declare type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K];
};
export declare type FunctionArgs<T> = T extends (...args: infer U) => any ? U : never;
export declare type FunctionReturnType<T> = T extends (...args: any) => infer U ? U : never;
declare type XY = {
    x: number;
    y: number;
};
declare type WH = {
    width: number;
    height: number;
};
export declare type Rectangle = XY & WH;
/**
 * Like electron-topic, except exclusively listened to in the context of a single window
 * so, duplicate topics from different windows can be ignored */
export declare enum WindowIpcTopic {
    /** For the frontend to request window info */
    REQUEST_WINDOW_INFO = "request_window_info",
    /** For the desktop to send updates that occur to the actual window,
     * likely due to the user moving the window */
    UPDATE_WINDOW_INFO = "update_window_info",
    /** For the frontend to change window info */
    SET_WINDOW_INFO = "set_window_info",
    /** For the desktop to send updates that occur to the actual displays,
     * likely due to the user attaching/removing displays */
    UPDATE_DISPLAY_INFO = "update_display_info",
    /** For the frontend to request display info */
    REQUEST_DISPLAY_INFO = "request_display_info",
    /** For the desktop to send updates that occur to the actual displays,
     * likely due to the user attaching/removing displays */
    UPDATE_MOUSE_INFO = "update_mouse_info",
    /** For the frontend to request mouse info */
    REQUEST_MOUSE_INFO = "request_mouse_info",
    /** For the desktop to send updates that occur to the system */
    UPDATE_SYSTEM_INFO = "update_system_info",
    /** For the frontend to request system info */
    REQUEST_SYSTEM_INFO = "request_system_info",
    /** When we've finished overlaying, the window won't be visible, but the frontend can choose to show it again */
    FINISHED_OVERLAYING = "finished_overlaying"
}
export declare type WindowInfoUpdateMessage = {
    frameName: WindowFrameName;
    bounds: Rectangle;
    display: Display;
    zoomFactor: number;
    focused: boolean;
    mediaSourceId: string;
};
export declare type WindowInfoBaseMessage = {
    frameName: WindowFrameName;
};
export declare type WindowInfoRequestMessage = WindowInfoBaseMessage;
export declare type OverlayingProps = {
    level?: "normal" | "floating" | "torn-off-menu" | "modal-panel" | "main-menu" | "status" | "pop-up-menu" | "screen-saver";
    relativeLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    fullscreenable?: boolean;
};
export declare type WindowInfoSetMessage = {
    /** A unique ID you can pass in to make sure that this message
     * only gets evaulated once during the lifetime of this window.
     *
     * This is useful because the frontend doesn't necessarily know
     * whether the window it's opening has already been created from
     * the electron side. The electron side doesn't see the window as
     * being opened twice, either.
     */
    onceId?: string;
    bounds?: Partial<Rectangle>;
    animate?: boolean;
    minSize?: Size;
    maxSize?: Size;
    visibility?: {
        show: boolean;
        focus?: boolean;
        blur?: boolean;
    };
    overlay?: OverlayingProps;
    shadow?: boolean;
    mouseEvents?: {
        ignore: boolean;
        options?: Electron.IgnoreMouseEventsOptions;
    };
    resizable?: boolean;
    windowLevel?: {
        aboveAll?: boolean;
        aboveWindowMediaSource?: string;
        oldShowHack?: boolean;
    };
    backgroundThrottling?: boolean;
    focusable?: boolean;
    appDetails?: Electron.AppDetailsOptions;
    aspectRatio?: {
        value: number;
        extraSize?: Size;
    };
    autoHideCursor?: boolean;
    autoHideMenuBar?: boolean;
    backgroundColor?: string;
    closable?: boolean;
    contentBounds?: {
        value: Rectangle;
        animate?: boolean;
    };
    contentProtection?: boolean;
    contentSize?: {
        bounds: Size;
        animate?: boolean;
    };
    documentEdited?: boolean;
    enabled?: boolean;
    fullscreen?: boolean;
    fullscreenable?: boolean;
    hasShadow?: boolean;
    kiosk?: boolean;
    maximizable?: boolean;
    minimizable?: boolean;
    menubarVisibility?: boolean;
    movable?: boolean;
    opacity?: number;
    progressBar?: {
        value: number;
        options: Electron.ProgressBarOptions;
    };
    simpleFullScreen?: boolean;
    skipTaskbar?: boolean;
    title?: string;
    vibrancy?: FunctionArgs<InstanceType<typeof Electron.BrowserWindow>['setVibrancy']>[0];
} & WindowInfoBaseMessage;
export declare type DisplayInfoUpdateMessage = {
    displays: Display[];
    primaryDisplayId: number;
};
export declare type MouseInfoUpdateMessage = {
    position: XY;
};
export declare type SystemInfoUpdateMessage = {
    dndEnabled: boolean;
};
export declare type Display = {
    bounds: Rectangle;
    id: number;
};
export declare type Size = {
    width: number;
    height: number;
};
export declare enum WindowFrameName {
    MAIN_WINDOW = "main_window",
    TOOLTIP_WINDOW = "tooltip_window",
    OVERLAY_WINDOW = "overlay_window",
    PANEL_WINDOW = "panel_window",
    CALL_STATS = "call_stats",
    ACTIVE_DEVICES_WINDOW = "active_devices_tooltip",
    YOURE_MUTED_WINDOW = "youre_muted_window",
    END_SCREENSHARE_WINDOW = "end_screenshare_window",
    ADVANCED_SCREENSHARE_WINDOW = "advanced_screenshare_window",
    IN_CALL_USER_TOOLTIP_WINDOW = "in_call_user_tooltip_window",
    CHAT_BUBBLE = "chat_bubble",
    MEETING_AUTOJOIN = "meeting_autojoin",
    CALLBOX_WINDOW = "callbox_window",
    SIMPLE_TOOLTIP_WINDOW = "simple_tooltip_window"
}
export {};
