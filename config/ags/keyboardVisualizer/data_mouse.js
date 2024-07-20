// See /usr/include/linux/input-event-codes.h for key_codes

export const DEFAULT_OSK_MOUSE_LAYOUT = "Default";
export const mouseLayouts = {
  Default: {
    name: "Default",
    name_short: "Default",
    comment: "Just whatever layout my cheap chinese mouse got me",
    keys: [
      [
        { keytype: "normal", label: "L", shape: "left", key_code: 272 },
        { keytype: "normal", label: "M", shape: "middle", key_code: 274 },
        { keytype: "normal", label: "R", shape: "right", key_code: 273 },
      ],
      [
        { keytype: "modkey", label: "E1", shape: "extra1", key_code: 276 },
        { keytype: "modkey", label: "E2", shape: "extra2", key_code: 275 },
      ],
    ],
  },
};
