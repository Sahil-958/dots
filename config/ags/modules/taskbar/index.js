import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Apps from "resource:///com/github/Aylur/ags/service/applications.js";

export const Taskbar = () => {
  function lowMatch(a, b) {
    return a.toLowerCase().includes(b.toLowerCase());
  }

  return Widget.Box({
    class_name: "taskbarContainer",
    child: Widget.Box({
      class_name: "taskbar",
      children: Hyprland.bind("clients").as((clients) => {
        return clients
          .map((client) => {
            let matchingObject = Apps.list.find((app) => {
              if (app["wm-class"] === client.class) return true;
              if (lowMatch(client.initialTitle, app.name)) return true;
              if (lowMatch(client.title, app.name)) return true;
              if (lowMatch(app.desktop, client.initialTitle)) return true;
              if (lowMatch(app.desktop, client.initialClass)) return true;
            });
            return Widget.Button({
              attribute: {
                workSpace: client.workspace,
              },
              class_name: "taskbarButton",
              visible: Hyprland.bind("clients").as(
                (clients) => clients.length > 0,
              ),
              child: Widget.Icon({
                class_name: "taskbarIcon",
                icon: matchingObject?.icon_name || "package-x-generic",
              }),
              tooltip_markup: client.title,
              on_clicked: (self) => {
                Hyprland.messageAsync(
                  `dispatch focuswindow address:${client.address}`,
                );
              },
              setup: (self) => {
                self.hook(Hyprland.active.client, (self) => {
                  self.toggleClassName(
                    "Active",
                    Hyprland.active.client.address == client.address,
                  );
                });
              },
            });
          })
          .sort((a, b) => {
            return a.attribute.workSpace.id - b.attribute.workSpace.id;
          });
      }),
    }),
  });
};
