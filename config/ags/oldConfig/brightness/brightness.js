import brightness from "../services/brightness.js";

function Brightness() {
    const icon = Widget.Icon({
        class_name: "BrightnessIcon",
        size: 20,
    }).hook(brightness, self => {
        let percentage = Math.floor(brightness.screen_value * 100);
        const icons = {
            80: "high",
            34: "medium",
            0: "low",
        };
        const icon = icons[[80, 34, 0].find(threshold => threshold <= percentage)];
        self.icon = "display-brightness-" + icon + "-symbolic";
    });

    const slider = Widget.Slider({
        class_name: "BrightnessSlider",
        hexpand: true,
        draw_value: false,
        max: 1,
        min: 0.01,
        step: 0.015,
        on_change: self => brightness.screen_value = self.value,
        setup: self => self.hook(brightness, () => {
            self.value = brightness.screen_value || 0;
            self.tooltip_text = `${Math.floor(brightness.screen_value * 100)}`;
        }),
    });

    return Widget.Box({
        class_name: "BrightnessBox",
        css: "min-width: 180px",
        children: [icon, slider],
    });

}

export default Brightness;
