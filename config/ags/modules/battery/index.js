import battery from "resource:///com/github/Aylur/ags/service/battery.js";
const iconsCharging = {
  0: "battery-empty-charging",
  20: "battery-caution-charging",
  40: "battery-low-charging",
  60: "battery-good-charging",
  100: "battery-full-charging",
};
const iconsDischarging = {
  0: "battery-empty-symbolic",
  20: "battery-caution-symbolic",
  40: "battery-low-symbolic",
  60: "battery-good-symbolic",
  100: "battery-full-symbolic",
};

function BatteryLabel() {
  return Widget.Box({
    class_name: "Battery",
    hasTooltip: true,
    spacing: 5,
    children: [
      Widget.Icon({
        class_name: "BatteryIcon",
        size: 20,
      }),
      Widget.Label({
        class_name: "BatteryLabel",
      }),
    ],
  }).hook(
    battery,
    (self) => {
      let icon =
        iconsCharging[
          [100, 60, 40, 20, 0].find((threshold) => threshold <= battery.percent)
        ];
      let dischargingIcon =
        iconsDischarging[
          [100, 60, 40, 20, 0].find((threshold) => threshold <= battery.percent)
        ];
      self.children[0].icon = battery.charging
        ? `${icon}`
        : `${dischargingIcon}`;
      self.children[1].label = `${battery.percent}%`;
      self.visible = battery.available;
      self.toggleClassName("Critical", battery.percent < 20);
      self.toggleClassName("Full", battery.percent >= 90);
      self.tooltip_text = `Percentage: ${battery.percent}
Energy: ${battery.energy}w
${battery.charging ? "Charging" : "Discharging"} Rate: ${battery.energy_rate}w
Time Remaining: ${Math.floor(battery.time_remaining / 3600)}hrs ${Math.floor((battery.time_remaining % 3600) / 60)}min `;
    },
    "changed",
  );
}

export default BatteryLabel;
