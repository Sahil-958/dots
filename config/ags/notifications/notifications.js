import Gtk from "gi://Gtk";

const notifications = await Service.import("notifications");

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function Notification(n) {
    let progressBar;
    let type = n.hints.value?.get_type_string();
    let value = n.hints?.value;
    if (type && type === "i" && value) {
        progressBar = Widget.Box({
            homogeneous: true,
            child: Widget.LevelBar({
                widthRequest: 100,
                class_name: "NotificationLevelBar",
                maxValue: 100,
                minValue: 0,
                value: value.get_int32(),
            }),
        });
    }

    /** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
    function NotificationIcon({ app_entry, app_icon, image }) {
        if (image) {
            return Widget.Box({
                className: "NotificationImageIconBox",
                css: `background-image: url("${image}");`,
            });
        }

        let icon = "dialog-information-symbolic";
        if (Utils.lookUpIcon(app_icon))
            icon = app_icon;

        if (app_entry && Utils.lookUpIcon(app_entry))
            icon = app_entry;

        return Widget.Box({
            class_name: "NotificationIconBox",
            child: Widget.Icon(
                {
                    icon: icon,
                    size: 30,
                }
            ),
            homogeneous: true,
        });
    }

    const icon = Widget.Box({
        vpack: "start",
        class_name: "NotificationIconAndImageContainerBox",
        child: NotificationIcon(n),
    });

    const closeButton = Widget.Button({
        class_name: "NotificationCloseButton",
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        child: Widget.Icon({
            class_name: "NotificationCloseIcon",
            icon: "window-close-symbolic",
            size: 16,
        }),
        onClicked: () => {
            n.popup ? n.dismiss() : n.close();
        },
    });

    const title = Widget.Label({
        class_name: "NotificationTitleLabel",
        xalign: 0,
        justification: "left",
        hexpand: true,
        max_width_chars: 24,
        truncate: "end",
        wrap: true,
        label: n.summary,
        use_markup: true,
    });

    const body = Widget.Box({
        class_name: "NotificationBodyBox",
        vertical: true,
        children: [
            Widget.Label({
                class_name: "NotificationBodyLabel",
                use_markup: true,
                label: n.body,
                wrap: true,
                hexpand: true,
                justification: "left",
                xalign: 0,
            }),
        ],
        setup: self => {
            self.visible = n.body !== "";
            let body = n.body;
            let img = body.match(/<img[^>]+>/g);
            if (img) {
                self.children[0].label = body.replace(/<img[^>]+>/g, "");
                let src = img[0].match(/src="([^"]+)"/)[1];
                if (src) {
                    //src = src.replace("~", Utils.HOME); keeping this here
                    //if you want to use Icon widget then you can use this
                    let image = Widget.Box({
                        class_name: "NotificationBodyImage",
                        css: `background-image: url("${src}");`,
                    });

                    let imageBox = Widget.Box({
                        attribute: { id: "imageBox" },
                        class_name: "NotificationImageBox",
                        valign: Gtk.Align.CENTER,
                        halign: Gtk.Align.CENTER,
                        child: image,
                    });
                    self.children = [...self.children, imageBox];
                }
            }
        }
    });

    const actions = Widget.Box({
        class_name: "NotificationActionsBox",
        children: n.actions.map(({ id, label }) => Widget.Button({
            class_name: "NotificationActionButton",
            on_clicked: () => {
                n.invoke(id);
                n.dismiss();
            },
            hexpand: true,
            child: Widget.Label(label),
        })),
        setup: self => {
            self.hook(notifications, () => {
                self.visible = n.actions.length > 0;
            });
        }
    });

    return Widget.Box({
        class_name: `NotificationBox ${n.urgency}`,
        vertical: true,
        attribute: {
            id: n.id,
            app_name: n.app_name,
        },
        setup: self => {
            if (progressBar) self.children = [...self.children, progressBar];
        },
        children: [
            Widget.Box({
                class_name: "NotificationIconAndTitleBox",
                spacing: 10,
                children: [
                    icon,
                    Widget.Box(
                        {
                            vertical: true,
                            valign: Gtk.Align.CENTER,
                            class_name: "NotificationTitleBox",
                        },
                        title,
                    ),
                    closeButton,
                ]
            }),
            body,
            actions,
        ],
    });

}

function NotificationList() {
    const NotificationGroupHeaderBox = (group, revealer) => {
        return Widget.EventBox({
            on_primary_click: () => {
                revealer.revealChild = !revealer.revealChild;
            },
            child: Widget.Box({
                class_name: "NotificationGroupHeaderBox",
                attribute: { app_name: group },
                vertical: false,
                spacing: 10,
                hpack: "fill",
                children: [
                    Widget.Label({
                        class_name: "NotificationGroupLabel",
                        label: group,
                    }),
                    Widget.Box({
                        hexpand: true,
                    }),
                    Widget.Button({
                        class_name: "NotificationGroupClearButton",
                        attribute: { app_name: group },
                        child: Widget.Icon({
                            //icon: `${App.configDir}/assets/clear-list-alt.svg`,
                            icon: "list-remove-all-symbolic",
                            size: 20,
                        }),
                        on_clicked: (self) => {
                            let group = self.attribute.app_name;
                            let list = notifications.notifications;
                            list.forEach((n) => {
                                if (n.app_name === group) {
                                    n.close();
                                }
                            });
                        },
                    }),
                ],
            }),
        });
    };

    function onNotified(self, id) {
        const notification = notifications.getNotification(id);
        //get unique app names that are in the list and then filter out the
        //unique that are only in the list and not in the self.children.attrub1ute.app_name
        const app_names = notifications.notifications.map(n => n.app_name)
            .filter((value, index, appNames) => {
                const inList = appNames.indexOf(value) === index;
                const inChildren = self.children.some((child) => {
                    return child.attribute.app_name === value;
                });
                return inList && !inChildren;
            });

        let isGroupExist = self.children.some((child) => {
            return child.attribute.app_name === notification.app_name;
        });

        if (!isGroupExist) {
            const groups = app_names.map((app_name) => {
                let revealer = Widget.Revealer({
                    class_name: "NotificationGroupRevealer",
                    revealChild: false,
                    child: Widget.Box({
                        class_name: "NotificationGroupListContainerBox",
                        vertical: true,
                        setup: self => {
                            self.hook(notifications, (_, id) => {
                                let list = notifications.notifications;
                                self.children = list
                                    .filter(n => n.app_name === app_name)
                                    .map(n => Notification(n));
                            });
                        }
                    }),
                });
                return Widget.Box({
                    class_name: "NotificationGroupBox",
                    attribute: { app_name: app_name },
                    vertical: true,
                    children: [
                        NotificationGroupHeaderBox(app_name, revealer),
                        revealer,
                    ],
                });
            });
            self.children = [...self.children, ...groups];
        }
    }

    function onClosed(self, id) {
        let list = notifications.notifications;
        let app_names = list.map(n => n.app_name)
            .filter((value, index, self) => self.indexOf(value) === index);
        self.children.map((child) => {
            let group_name = child.attribute.app_name;
            let group_list = list.filter(n => n.app_name === group_name);
            if (group_list.length === 0) {
                self.children.find((child) => {
                    if (child.attribute.app_name === group_name) {
                        child.destroy();
                        return true;
                    }
                });
            }
        });
    }

    function listGen() {
        return Widget.Box({
            class_name: "NotificationListContainerBox",
            vertical: true,
            setup: self => {
                self.hook(notifications, onNotified, "notified")
                    .hook(notifications, onClosed, "closed");
            },
        });
    }


    return Widget.Scrollable({
        class_name: "NotificationListContainerScrollable",
        vscroll: "automatic",
        min_content_height: 300,
        hscroll: "never",
        vexpand: true,
        setup: self => {
            self.hook(notifications, () => {
                if (notifications.notifications.length <= 0) {
                    self.child = Widget.Box({
                        class_name: "NotificationListContainerBox",
                        vertical: true,
                        vexpand: true,
                        child: Widget.Label({
                            class_name: "NoNotificationLabel",
                            label: "No notifications",
                            vexpand: true,
                        }),
                    });
                } else {
                    self.child = listGen();
                }
            });
        }
    });
}


// _________________________________________________________________________________________

const NotificaitonHeader = function() {

    const NotificationHeaderClearButton = () =>
        Widget.Button({
            class_name: "NotificationHeaderClearButton",
            child: Widget.Icon({
                //icon: `${App.configDir}/assets/clear-list-alt.svg`,
                icon: "list-remove-all-symbolic",
                size: 20,
            }),
            on_clicked: () => {
                notifications.clear();
            }
        });
    return Widget.Box({
        class_name: "NotificationHeaderBox",
        vertical: false,
        hpack: "fill",
        children: [
            Widget.Label({
                class_name: "NotificationHeaderLabel",
                label: "Notifications",
            }),
            Widget.Box({
                hexpand: true,
            }),
            NotificationHeaderClearButton(),
        ]
    });
};


const NotificationMainBox = function() {
    return Widget.Box({
        class_name: "NotificationMainBox",
        vertical: true,
        vexpand: true,
        spacing: 10,
        children: [
            NotificaitonHeader(),
            NotificationList(),
        ],
    });
};

function NotificationPopups(monitor = 0) {
    const list = Widget.Box({
        vertical: true,
        children: notifications.popups.map(Notification),
    });

    function onNotified(_, /** @type {number} */ id) {
        const n = notifications.getNotification(id);
        if (n) {
            if (!(n?.urgency === "low") && n.popup) {
                Utils.execAsync(["bash", "-c", "~/dots/scripts/playNotificationSound.sh"]);
            }
            let newN = Notification(n);
            let prevNoti = list.children.findIndex(n => n.attribute.id === id);
            if (prevNoti !== -1) {
                list.children = list.children.map((child, index) => (index === prevNoti) ? newN : child);
                //list.children[prevNoti] = newN;
                return;
            }
            list.children = [newN, ...list.children];
        }
    }

    function onDismissed(_, /** @type {number} */ id) {
        list.children.find(n => n.attribute.id === id)?.destroy();
    }

    list.hook(notifications, onNotified, "notified")
        .hook(notifications, onDismissed, "dismissed");

    return Widget.Window({
        monitor,
        name: `notifications${monitor}`,
        class_name: "NotificationPopupsWindow",
        widthRequest: 350,
        layer: "overlay",
        margins: [15, 15, 0, 0],
        anchor: ["top", "right"],
        child: Widget.Box({
            css: "min-width: 1px; min-height: 2px;",
            class_name: "NotificationPopupsBox",
            vertical: true,
            child: list,
        }),
        setup: self => {
            self.hook(notifications, () => {
                self.visible = notifications.popups.length > 0;
            });
        },
    });
}


const Dnd = function() {
    return Widget.Box({
        class_name: "DndBox",
        vertical: false,
        hpack: "fill",
        children: [
            Widget.Label({
                class_name: "DndLabel",
                label: "Do not disturb",
            }),
            Widget.Box({
                hexpand: true,
            }),
            Widget.Switch({
                class_name: "DndSwitch",
                onActivate: ({ active }) => notifications.dnd = active,
                setup: self => {
                    self.hook(notifications, () => {
                        self.active = notifications.dnd;
                    });
                },
            }),
        ]
    });
};

export { NotificationMainBox, NotificationPopups, Dnd };
