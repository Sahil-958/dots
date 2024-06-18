import Gtk from "gi://Gtk";
const audio = await Service.import("audio");

function MicroPhone() {
    const icons = {
        77: "high",
        44: "medium",
        1: "low",
        0: "muted",
    };

    function getIcon() {
        const icon = audio.microphone.is_muted ? 0 : [77, 44, 1, 0].find(
            threshold => threshold <= audio.microphone.volume * 100);

        return `microphone-sensitivity-${icons[icon]}-symbolic`;
    }

    const icon = Widget.EventBox({
        child: Widget.Icon({
            class_name: "MicroPhoneIcon",
            icon: Utils.watch(getIcon(), audio.microphone, getIcon),
            size: 20,
        }),
        setup: self => {
            self.hook(audio.microphone, () => {
                self.on_primary_click = () => {
                    //audio.microphone.stream.is_muted = !audio.microphone.stream.is_muted;
                    audio.microphone.is_muted = !audio.microphone.is_muted;
                };
            });
        }
    });

    const slider = Widget.Slider({
        class_name: "MicroPhoneSlider",
        hexpand: true,
        draw_value: false,
        max: 1.5,
        min: 0,
        step: 0.01,
        on_change: ({ value }) => audio.microphone.volume = value,
        setup: self => self.hook(audio.microphone, () => {
            self.value = audio.microphone.volume || 0;
            self.tooltip_text = `${Math.floor(audio.microphone.volume * 100)}`;
        }),
    });

    const revealer = Widget.Revealer({
        class_name: "MicroPhoneRevealer",
        revealChild: false,
        transitionDuration: 500,
        transition: "slide_down",
        child: Widget.Box({
            vertical: true,
            class_name: "MicroPhoneRevealerBox",
        }),
        setup: self => {
            self.hook(audio, (_, id) => {
                if (!audio.microphones.find(mic => mic.id === id)) {
                    return;
                }
                let stream = audio.getStream(id);
                if (stream) {
                    let labelWid = Widget.Label({
                        label: stream.description || stream.name || "Unknown",
                        expand: false,
                        maxWidthChars: 8,
                        xalign: 0,
                        //ellipsize: 2,
                        //lines: 1,
                        //wrap: true,
                        //wrapMode: Gtk.WrapMode.CHAR,
                        truncate: "end",
                        hexpand: true,
                    });

                    let sliderWid = Widget.Slider({
                        hexpand: true,
                        draw_value: false,
                        max: 1.5,
                        min: 0,
                        step: 0.01,
                        on_change: ({ value }) => stream.volume = value,
                        setup: self => {
                            self.hook(stream, () => {
                                self.value = stream.volume || 0;
                                self.tooltip_text = `${Math.floor(stream.volume * 100)}`;
                            });
                        },
                    });

                    let streamBox = Widget.Box({
                        attribute: { "stream-id": id },
                        tooltip_text: "Name: " +
                            stream.name + "\nDescription: "
                            + stream.description + "\nApplication ID: "
                            + stream.application_id
                        ,
                        class_name: "MicroPhoneStreamBox",
                        setup: self => {
                            self.hook(stream, () => {
                                self.toggleClassName("Muted", !!stream.is_muted);
                            });
                        },
                        children: [
                            Widget.EventBox({
                                hexpand: false,
                                widthRequest: 100,
                                child: labelWid,
                                onPrimaryClick: () => stream.is_muted = !stream.is_muted,
                            }),
                            sliderWid,
                        ],
                    });

                    self.child.children = [...self.child.children, streamBox];
                }
            }, "stream-added");
            self.hook(audio, (_, id) => {
                if (id) {
                    self.child.children = self.child.children
                        .filter(n => n.attribute["stream-id"] !== id);
                }
            }, "stream-removed");
        },
    });

    const expandIcon = Widget.EventBox({
        on_primary_click: (self) => {
            revealer.revealChild = !revealer.revealChild;
            //self.child.icon = revealer.revealChild ? "go-up-symbolic" : "go-down-symbolic";
            self.child.css = `
                            -gtk-icon-transform: ${revealer.reveal_child ? "rotate(-0.5turn)" : "none"};
                            transition: -gtk-icon-transform 0.5s;
                            `;
        },
        child: Widget.Icon({
            icon: "go-down-symbolic",
            size: 20,
        }),
        setup: self => {
            self.hook(audio, () => {
                self.visible = audio.apps.length > 0 || audio.microphones.length > 1;
            });
        }
    }).on("realize", (self) => {
        self.visible = audio.apps.length > 0 || audio.microphones.length > 1;
    });

    return Widget.Box({
        class_name: "MicroPhoneMainBox",
        css: "min-width: 180px",
        vertical: true,
        children: [
            Widget.Box({
                class_name: "MicroPhoneBox",
                children: [icon, slider, expandIcon],
                setup: self => {
                    self.hook(audio.microphone, () => {
                        self.toggleClassName("Muted", !!audio.microphone.is_muted);
                    });
                }
            }),
            revealer,
        ],
    });
}

export default MicroPhone;
