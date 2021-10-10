export enum WindowFrameName {
  MAIN_WINDOW = 'main_window',
  TOOLTIP_WINDOW = 'tooltip_window',
  OVERLAY_WINDOW = 'overlay_window',

  PANEL_WINDOW = 'panel_window',
  CALL_STATS = 'call_stats',
  ACTIVE_DEVICES_WINDOW = 'active_devices_tooltip',
  YOURE_MUTED_WINDOW = 'youre_muted_window',
  END_SCREENSHARE_WINDOW = 'end_screenshare_window',
  ADVANCED_SCREENSHARE_WINDOW = 'advanced_screenshare_window',
  IN_CALL_USER_TOOLTIP_WINDOW = 'in_call_user_tooltip_window',
  CHAT_BUBBLE = 'chat_bubble',
  MEETING_AUTOJOIN = 'meeting_autojoin',

  CALLBOX_WINDOW = 'callbox_window',
  SIMPLE_TOOLTIP_WINDOW = 'simple_tooltip_window',
}

/**
 * Like electron-topic, except exclusively listened to in the context of a single window
 * so, duplicate topics from different windows can be ignored */
export enum WindowIpcTopic {
  /** For the frontend to request window info */
  REQUEST_WINDOW_INFO = 'request_window_info',
  /** For the desktop to send updates that occur to the actual window,
   * likely due to the user moving the window */
  UPDATE_WINDOW_INFO = 'update_window_info',
  /** For the frontend to change window info */
  SET_WINDOW_INFO = 'set_window_info',

  /** For the desktop to send updates that occur to the actual displays,
   * likely due to the user attaching/removing displays */
  UPDATE_DISPLAY_INFO = 'update_display_info',
  /** For the frontend to request display info */
  REQUEST_DISPLAY_INFO = 'request_display_info',

  /** For the desktop to send updates that occur to the actual displays,
   * likely due to the user attaching/removing displays */
  UPDATE_MOUSE_INFO = 'update_mouse_info',
  /** For the frontend to request mouse info */
  REQUEST_MOUSE_INFO = 'request_mouse_info',

  /** For the desktop to send updates that occur to the system */
  UPDATE_SYSTEM_INFO = 'update_system_info',
  /** For the frontend to request system info */
  REQUEST_SYSTEM_INFO = 'request_system_info',

  /** When we've finished overlaying, the window won't be visible, but the frontend can choose to show it again */
  FINISHED_OVERLAYING = 'finished_overlaying',
}
