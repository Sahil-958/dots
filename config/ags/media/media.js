import Gtk from "gi://Gtk";

const mpris = await Service.import("mpris");

const players = mpris.bind("players");
mpris.cacheCoverArt = false;

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player(player) {
    const FALLBACK_ICON = "audio-x-generic-symbolic";
    const PLAY_ICON = "media-playback-start-symbolic";
    const PAUSE_ICON = "media-playback-pause-symbolic";
    const PREV_ICON = "media-skip-backward-symbolic";
    const NEXT_ICON = "media-skip-forward-symbolic";
    const SHUFFLE_ICON = "media-playlist-shuffle-symbolic";
    const LOOP_ICON = "media-playlist-repeat-symbolic";

    /** @param {number} length */
    function lengthStr(length) {
        const min = Math.floor(length / 60);
        const sec = Math.floor(length % 60);
        const sec0 = sec < 10 ? "0" : "";
        return `${min}:${sec0}${sec}`;
    }
    const img = Widget.Box({
        class_name: "MediaPlayerImage",
        css: player.bind("track_cover_url").transform(p => {
            if (!p) {
                return `
                min-width: 0px;
                min-height: 0px;
                border: none;
                margin: 0px;
                padding: 0px;
                `;
            } else {
                return ` 
                background-image: url('${p}');
                min-width: 100px;
                min-height: 100px;
                `;
            }
        }),
    });

    const title = Widget.Label({
        class_name: "MediaPlayerTitle",
        wrap: true,
        hpack: "start",
        maxWidthChars: 30,
        truncate: "end",
        label: player.bind("track_title"),
    });

    const artist = Widget.Label({
        class_name: "MediaPlayerArtist",
        wrap: true,
        hpack: "start",
        maxWidthChars: 30,
        lines: 2,
        truncate: "end",
        label: player.bind("track_artists").transform(a => a.join(", ")),
    });

    const positionSlider = Widget.Slider({
        class_name: "MediaPlayerSlider",
        draw_value: false,
        on_change: ({ value }) => player.position = value * player.length,
        visible: player.bind("length").as(l => l > 0),
        setup: self => {
            function update() {
                const value = player.position / player.length;
                self.value = value > 0 ? value : 0;
            }
            self.hook(player, update);
            self.hook(player, update, "position");
            self.poll(1000, update);
        },
    }).on("realize", self => {
        self.visible = player.length > 0;
    });

    const TimeElapsedLabel = Widget.Label({
        class_name: "MediaPlayerSliderLabelTimeElapsed",
        hpack: "start",
        setup: self => {
            const update = (_, time) => {
                self.label = lengthStr(time || player.position);
                self.visible = player.length > 0;
            };
            self.hook(player, update, "position");
            self.poll(1000, update);
        },
    });

    const TotalTimeLabel = Widget.Label({
        class_name: "MediaPlayerSliderLabelTotalTime",
        hpack: "end",
        visible: player.bind("length").transform(l => l > 0),
        label: player.bind("length").transform(lengthStr),
    }).on("realize", self => {
        self.visible = player.length > 0;
    });

    const icon = Widget.Icon({
        class_name: "MediaPlayerIcon",
        hexpand: true,
        hpack: "end",
        vpack: "start",
        tooltip_text: player.identity || "",
        icon: player.bind("entry").transform(entry => {
            const name = `${entry}-symbolic`;
            return Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
        }),
    });

    const playPause = Widget.Button({
        class_name: "MediaPlayerPlayPauseButton",
        on_clicked: () => player.playPause(),
        visible: player.bind("can_play"),
        child: Widget.Icon({
            icon: player.bind("play_back_status").transform(s => {
                switch (s) {
                    case "Playing": return PAUSE_ICON;
                    case "Paused":
                    case "Stopped": return PLAY_ICON;
                }
            }),
        }),
    });

    const prev = Widget.Button({
        className: "MediaPlayerPrevButton",
        on_clicked: () => player.previous(),
        visible: player.bind("can_go_prev"),
        child: Widget.Icon(PREV_ICON),
    });

    const next = Widget.Button({
        className: "MediaPlayerNextButton",
        on_clicked: () => player.next(),
        visible: player.bind("can_go_next"),
        child: Widget.Icon(NEXT_ICON),
    });

    const shuffle = Widget.Button({
        className: `MediaPlayerShuffleButton ${player.bind("shuffle_status").emitter.shuffle_status}`,
        on_clicked: () => {
            if (player.bind("shuffle_status").emitter.shuffle_status !== null)
                player.shuffle();
        },
        visible: (player.bind("shuffle_status").emitter.shuffle_status === null),
        child: Widget.Icon(SHUFFLE_ICON),
    });

    const loop = Widget.Button({
        className: `MediaPlayerLoopButton ${(player.bind("loop_status").emitter.loop_status)}`,
        on_clicked: () => {
            if (player.bind("loop_status").emitter.loop_status !== null)
                player.loop();
        },
        visible: (player.bind("loop_status").emitter.loop_status) === null,
        child: Widget.Icon(LOOP_ICON),
    });


    return Widget.Box({
        class_name: "MediaPlayerBackgroundBox",
        css: player.bind("track_cover_url").transform(p => {
            if (p) {
                return ` 
                    background-image: url('${p}');
                    background-size: cover;
                    background-position: center;
                    `;
            }
            else return "";
        }),
        child: Widget.Box({
            class_name: "MediaPlayer",
            children: [
                img,
                Widget.Box(
                    {
                        vertical: true,
                        hexpand: true,
                    },
                    Widget.Box([
                        title,
                        icon,
                    ]),
                    artist,
                    Widget.Box({ vexpand: true }),
                    positionSlider,
                    Widget.CenterBox({
                        start_widget: TimeElapsedLabel,
                        center_widget: Widget.Box([
                            shuffle,
                            prev,
                            playPause,
                            next,
                            loop,
                        ]),
                        end_widget: TotalTimeLabel,
                    }),
                ),
            ],
        }),
    });
}

function Media(valign = Gtk.Align.FILL, halign = Gtk.Align.FILL) {
    const stack = Widget.Stack({
        transition: "slide_left_right",
        transitionDuration: 400,
        setup: self => {
            self.children = mpris.players.reduce((obj, player) => {
                obj[`${player.bus_name}`] = Player(player);
                return obj;
            }, {});

            self.hook(mpris, (_, busName) => {
                let player = mpris.getPlayer(busName);
                if (!player) return;
                let prevObj = self.children;
                let newObj = {};
                for (let key in prevObj) {
                    newObj[key] = prevObj[key];
                }
                newObj[`${player.bus_name}`] = Player(player);
                self.children = newObj;
                self.children[`${player.bus_name}`].show();
                //self.show_all();
                self.shown = `${player.bus_name}`;
            }, "player-added");
            self.hook(mpris, (_, busName) => {
                if (!busName) return;
                if (mpris.players[0]) stack.shown = `${mpris.players[0].bus_name}`;
                setTimeout(() => {
                    self.children[`${busName}`].destroy();
                    delete self.children[`${busName}`];
                }, 400);
            }, "player-closed");
        },
    });

    return Widget.EventBox({
        on_primary_click: () => {
            let index = mpris.players.findIndex(player => `${player.bus_name}` === stack.shown);
            let nextIndex = (index + 1) % mpris.players.length;
            stack.shown = `${mpris.players[nextIndex].bus_name}`;
        },
        halign: halign,
        valign: valign,
        child: Widget.Box({
            class_name: "MediaBox",
            vertical: true,
            children: [
                stack,
                Widget.Box({
                    class_name: "MediaBoxFooter",
                    homogeneous: true,
                    children: players.as(p => p.map(player => {
                        return Widget.Button({
                            class_name: "MediaBoxFooterButton",
                            on_clicked: () => stack.shown = `${player.bus_name}`,
                            child: Widget.Icon({
                                class_name: "MediaBoxFooterIcon",
                                icon: player.bind("entry").transform(entry => {
                                    const name = `${entry}-symbolic`;
                                    return Utils.lookUpIcon(name) ? name : "audio-x-generic-symbolic";
                                }),
                            }),
                        });
                    })),
                    setup: self => {
                        self.hook(mpris, () => {
                            self.visible = mpris.players.length > 1;
                        });
                    }
                }).on("realize", self => {
                    self.visible = mpris.players.length > 1;
                }),
            ],
        }),
        setup: self => {
            self.hook(mpris, () => {
                self.visible = mpris.players.length > 0;
            });
        }
    }).on("realize", self => {
        self.visible = mpris.players.length > 0;
    });
}

export default Media;
