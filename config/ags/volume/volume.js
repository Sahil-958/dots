import Gtk from "gi://Gtk";
const audio = await Service.import("audio");

function Volume() {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    };

    function getIcon() {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100);

        return `audio-volume-${icons[icon]}-symbolic`;
    }

    const icon = Widget.EventBox({
        child: Widget.Icon({
            class_name: "VolumeIcon",
            icon: Utils.watch(getIcon(), audio.speaker, getIcon),
            size: 20,
        }),
        setup: self => {
            self.hook(audio.speaker, () => {
                self.on_primary_click = () => {
                    //audio.speaker.stream.is_muted = !audio.speaker.stream.is_muted;
                    audio.speaker.is_muted = !audio.speaker.is_muted;
                };
            });
        }
    });

    const slider = Widget.Slider({
        class_name: "VolumeSlider",
        hexpand: true,
        draw_value: false,
        max: 1.5,
        min: 0,
        step: 0.01,
        on_change: ({ value }) => audio.speaker.volume = value,
        setup: self => self.hook(audio.speaker, () => {
            self.value = audio.speaker.volume || 0;
            self.tooltip_text = `${Math.floor(audio.speaker.volume * 100)}`;
        }),
    });

    const revealer = Widget.Revealer({
        class_name: "VolumeRevealer",
        revealChild: false,
        transitionDuration: 500,
        transition: "slide_down",
        child: Widget.Box({
            vertical: true,
            class_name: "VolumeRevealerBox",
        }),
        setup: self => {
            self.hook(audio, (_, id) => {
                let isSpeaker = audio.speakers.find(spk => spk.id === id);
                let isApp = audio.apps.find(app => app.id === id);
                if (!isSpeaker && !isApp) {
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
                        class_name: "VolumeStreamBox",
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
                self.visible = audio.apps.length > 0 || audio.speakers.length > 1;
            });
        }
    }).on("realize", (self) => {
        self.visible = audio.apps.length > 0 || audio.speakers.length > 1;
    });

    return Widget.Box({
        class_name: "VolumeMainBox",
        css: "min-width: 180px",
        vertical: true,
        children: [
            Widget.Box({
                class_name: "VolumeBox",
                children: [icon, slider, expandIcon],
                setup: self => {
                    self.hook(audio.speaker, () => {
                        self.toggleClassName("Muted", !!audio.speaker.is_muted);
                    });
                }
            }),
            revealer,
        ],
    });
}

export default Volume;
