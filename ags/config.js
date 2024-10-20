import { themeSelector } from "./archctl-theme-selector.js"
import { archctl } from "./archctl-window.js"

const hyprland = await Service.import("hyprland")
const notifications = await Service.import("notifications")
const audio = await Service.import("audio")
const battery = await Service.import("battery")


const time = Variable("", {
  poll: [1000, 'date "+%I\n%M"'],
})

const date = Variable("", {
  poll: [1000, 'date "+%m\n%e"'],
})

const divide = ([total, free]) => free / total

const cpu = Variable(0, {
  poll: [2000, 'top -b -n 1', out => divide([100, out.split('\n')
    .find(line => line.includes('Cpu(s)'))
    .split(/\s+/)[1]
    .replace(',', '.')])],
})

const temp = Variable(0, {
  poll: [1000, 'sensors', out => {
    const line = out.split('\n').find(line => line.includes("Package id 0:"));
    if (line) {
      const tempValue = line.split(/\s+/)[3].replace(/[°C+]/g, '').trim();
      return parseFloat(tempValue) / 100;
    }
    return 0; // Default value if not found
  }]
})


const dispatch = ws => hyprland.messageAsync(`dispatch workspace ${ws}`);

const activeId = hyprland.active.workspace.bind("id")

const Workspaces = () => Widget.EventBox({
  onScrollDown: () => dispatch('+1'),
  onScrollUp: () => dispatch('-1'),
  child: Widget.Box({
    vertical: true,
    class_name: "workspaces",
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(i => Widget.Button({
      class_name: activeId.as(activeWsId => `${i === activeWsId ? "focused" : ""}`),
      label: activeId.as(activeWsId => `${i === activeWsId ? "" : i}`),
      onClicked: () => dispatch(i),
    })),

    // remove this setup hook if you want fixed number of buttons
    //setup: self => self.hook(hyprland, () => self.children.forEach(btn => {
    //  btn.visible = hyprland.workspaces.some(ws => ws.id === btn.attribute);
    //})),
  }),
})

function Clock() {
  return Widget.Label({
    class_name: "time",
    justification: "right",
    maxWidthChars: 2,
    wrap: true,
    label: date.bind(),
  })
}

function DateDisplay() {
  return Widget.Label({
    class_name: "date",
    justification: "right",
    maxWidthChars: 2,
    wrap: true,
    label: time.bind(),
  })
}


// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification() {
  const popups = notifications.bind("popups")
  return Widget.Box({
    class_name: "notification",
    visible: popups.as(p => p.length > 0),
    children: [
      Widget.Icon({
        icon: "preferences-system-notifications-symbolic",
      }),
      Widget.Label({
        label: popups.as(p => p[0]?.summary || ""),
      }),
    ],
  })
}

function Volume() {
  const icons = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted",
  }

  function getIcon() {
    const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
      threshold => threshold <= audio.speaker.volume * 100)

    return `audio-volume-${icons[icon]}-symbolic`
  }

  const icon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
  })

  const slider = Widget.Slider({
    vexpand: true,
    draw_value: false,
    on_change: ({ value }) => audio.speaker.volume = value,
    setup: self => self.hook(audio.speaker, () => {
      self.value = audio.speaker.volume || 0
    }),
  })

  return Widget.Box({
    class_name: "volume",
    css: "min-width: 180px",
    children: [icon, slider],
  })
}

function BatteryLabel() {
  const value = battery.bind("percent").emitter.percent;


  const getColor = function(percent, charging) {
    let value = battery.bind("percent").emitter.percent

    if (charging) {
      return "#a3be8c";
    }

    if (value <= 25) {
      return "#ed8796";
    } else if (value <= 50) {
      return "#eed49f";
    } else {
      return "#eceff4";
    }
  };



  return Widget.Box({
    class_name: "battery",
    vertical: true,
    visible: battery.bind("available"),
    children: [
      Widget.CircularProgress({
        css: battery.bind("charging").as((charging) =>
          'min-width: 24px;'
          + 'min-height: 24px;'
          + 'font-size: 2px;'
          + 'margin: 1px;'
          + 'background-color: #171717;'
          + `color: ${getColor(value, charging)};`
        ),
        rounded: false,
        inverted: false,
        startAt: 0.75,
        value: battery.bind('percent').as(p => p / 100),
        child: Widget.Label({
          className: "battery-label",
          label: "󱐋"
        })
      }),
    ],
  })
}

function ArchCtl() {
  return Widget.Button({
    label: "",
    class_name: "archctl",
    //on_primary_click: () => Utils.exec("/home/gabriel/.config/ags/scripts/change-theme.sh /home/gabriel/pictures/waneella-wallpapers/desktop-favorites/")
    on_primary_click: () => {
      App.ToggleWindow("archctl")
    }
  })
}

function CpuTemp() {
  const getColor = function(value) {

    const tempVal = value;
    if (tempVal > .9) {
      return "#ed8796";
    } else if (tempVal > .75) {
      return "#eed49f";
    } else {
      return "#eceff4";
    }
  }

  console.log(temp.getValue())

  return Widget.Box({
    class_name: "cpu-temp",
    vertical: true,
    children: [
      Widget.CircularProgress({
        css: temp.bind("value").as((value) =>
          'min-width: 24px;'
          + 'min-height: 24px;'
          + 'font-size: 2px;'
          + 'margin: 1px;'
          + 'background-color: #171717;'
          + `color: ${getColor(value)};`
        ),
        rounded: false,
        inverted: false,
        startAt: 0.75,
        value: temp.bind(),
        child: Widget.Label({
          className: "cpu-temp-label",
          label: "󰔄"
        })
      }),
    ],
  })
}

// layout of the bar
function Top() {
  return Widget.Box({
    className: "modules-top",
    vertical: true,
    spacing: 8,
    children: [
      ArchCtl(),
      BatteryLabel(),
      CpuTemp()
    ],
  })
}

function Center() {
  return Widget.Box({
    spacing: 8,
    children: [
      Workspaces()
    ],
  })
}

function Bottom() {
  return Widget.Box({
    className: "modules-bottom",
    spacing: 8,
    vpack: 'end',
    vertical: true,
    children: [
      DateDisplay(),
      Clock(),
    ],
  })
}

function Bar(monitor = 0) {
  return Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["left", "top", "bottom"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      vertical: true,
      start_widget: Top(),
      center_widget: Center(),
      end_widget: Bottom(),
    }),
  })
}


App.config({
  style: "./style.css",
  windows: [
    Bar(),
    archctl,
    themeSelector
    // you can call it, for each monitor
    // Bar(0),
    // Bar(1)
  ],
})

export { }
