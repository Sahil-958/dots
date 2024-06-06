import { Variable as Var } from "resource:///com/github/Aylur/ags/variable.js";

const divide = ([total, free]) => free / total;

const cpu = Variable(0, {
    poll: [1000, ['bash', '-c', "top -bn 1 | awk '/Cpu/{print 100-$8}'"], out => Math.round(out) / 100]
})

const ram = Variable(0, {
    poll: [2000, 'free', out => divide(out.split('\n')
        .find(line => line.includes('Mem:'))
        .split(/\s+/)
        .splice(1, 2))],
});

// Cpu temp
const temp = Variable(-1, {
    poll: [6000, ['bash', '-c', "fastfetch --packages-disabled nix --logo none --cpu-temp | grep 'CPU:' | rev | cut -d ' ' -f1 | cut -c 4- | rev"], out => Math.round(out)
    ]
});

// Percent of storage used on '/' drive
// -t ext4 is a workaround the "df: /run/user/1000/doc: Operation not permitted" error which is returning a non zero value which might be causing it not to work
const storage = Variable(0, {
    poll: [5000, "df -h -t btrfs", out => out.split("\n")
        .find(line => line.endsWith("/"))
        .split(/\s+/).slice(-2)[0]
        .replace("%", "")
    ]
});

const cpuLabel = () => Widget.Label({
    class_name: "StatsLabel",
    label: cpu.bind().transform(value => "  " + Math.round(value * 100).toString() + "%"),
});

const ramLabel = () => Widget.Label({
    class_name: "StatsLabel",
    label: ram.bind().transform(value => "  " + Math.round(value * 100).toString() + "%"),
});

const tempLabel = () => Widget.Label({
    class_name: "StatsLabel",
    label: temp.bind().transform(value => " " + value.toString() + "°C"),
});

const storageLabel = () => Widget.Label({
    class_name: "StatsLabel",
    label: storage.bind().transform(value => "󰋊  " + value + "%"),
});



const cpuProgress = Widget.Box({
    class_name: "CpuStatsBox",
    spacing: 10,
    children: [
        cpuLabel(),
        Widget.LevelBar({
            class_name: "CpuStatsLevelBar",
            hexpand: true,
            value: cpu.bind(),
        }),
    ],
});

const ramProgress = Widget.Box({
    class_name: "RamStatsBox",
    spacing: 10,
    children: [
        ramLabel(),
        Widget.LevelBar({
            class_name: "RamStatsLevelBar",
            hexpand: true,
            value: ram.bind()
        }),
    ],
});

const tempProgress = Widget.Box({
    class_name: "TempStatsBox",
    spacing: 10,
    children: [
        tempLabel(),
        Widget.LevelBar({
            class_name: "TempStatsLevelBar",
            hexpand: true,
            value: temp.bind()
        }),
    ],
});

const storageProgress = Widget.Box({
    class_name: "StorageStatsBox",
    spacing: 10,
    children: [
        storageLabel(),
        Widget.LevelBar({
            class_name: "StorageStatsLevelBar",
            hexpand: true,
            value: storage.bind()
        }),
    ],
});


function stats(monitor = 0) {
    return Widget.Window({
        monitor,
        name: `stats${monitor}`,
        class_name: "StatsWindow",
        widthRequest: 450,
        heightRequest: 600,
        layer: "overlay",
        margins: [10, 0, 10, 10],
        anchor: ["bottom", "right"],
        child: Widget.Box({
            css: "min-width: 1px; min-height: 2px;",
            class_name: "StatsBox",
            vertical: true,
            children: [
                cpuProgress,
                ramProgress,
                tempProgress,
                storageProgress,
            ],
        }),
    });
}

export default stats;
