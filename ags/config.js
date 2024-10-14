const hyprland = await Service.import("hyprland")
const notifications = await Service.import("notifications")
const mpris = await Service.import("mpris")
const audio = await Service.import("audio")
const battery = await Service.import("battery")
const systemtray = await Service.import("systemtray")

const time = Variable("", {
  poll: [1000, 'date "+%H\n%M"'],
})

const date = Variable("", {
  poll: [1000, 'date "+%m\n%e"'],
})

const dispatch = ws => hyprland.messageAsync(`dispatch workspace ${ws}`);

const activeId = hyprland.active.workspace.bind("id")

const Workspaces = () => Widget.EventBox({
  onScrollUp: () => dispatch('+1'),
  onScrollDown: () => dispatch('-1'),
  child: Widget.Box({
    vertical: true,
    class_name: "workspaces",
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(i => Widget.Button({
      class_name: activeId.as(activeWsId => `${i === activeWsId ? "focused" : ""}`),
      label: `${i}`,
      onClicked: () => dispatch(i),
    })),

    // remove this setup hook if you want fixed number of buttons
    //setup: self => self.hook(hyprland, () => self.children.forEach(btn => {
    //  btn.visible = hyprland.workspaces.some(ws => ws.id === btn.attribute);
    //})),
  }),
})

//function Workspaces() {
//  const activeId = hyprland.active.workspace.bind("id")
//  const workspaces = hyprland.bind("workspaces")
//    .as(ws => ws.map(({ id }) => Widget.Button({
//      on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
//      child: Widget.Label(`${id}`),
//      class_name: activeId.as(i => `${i === id ? "focused" : ""}`),
//    })))
//
//  return Widget.Box({
//    vertical: true,
//    class_name: "workspaces",
//    children: workspaces,
//  })
//}


function ClientTitle() {
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
  })
}


function Clock() {
  return Widget.Label({
    class_name: "time",
    justification: "right",
    //xpad: 4,
    //xalign: 2,
    //hpack: "end",
    maxWidthChars: 2,
    wrap: true,
    label: date.bind(),
  })
}

function DateDisplay() {
  return Widget.Label({
    class_name: "date",
    justification: "right",
    //xpad: 4,
    //xalign: 2,
    //hpack: "end",
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


function Media() {
  const label = Utils.watch("", mpris, "player-changed", () => {
    if (mpris.players[0]) {
      const { track_artists, track_title } = mpris.players[0]
      return `${track_artists.join(", ")} - ${track_title}`
    } else {
      return "Nothing is playing"
    }
  })

  return Widget.Button({
    class_name: "media",
    on_primary_click: () => mpris.getPlayer("")?.playPause(),
    on_scroll_up: () => mpris.getPlayer("")?.next(),
    on_scroll_down: () => mpris.getPlayer("")?.previous(),
    child: Widget.Label({ label }),
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
  const value = battery.bind("percent").as(p => p > 0 ? p / 100 : 0)
  //const icon = battery.bind("percent").as(p =>
  //    `battery-level-${Math.floor(p / 10) * 10}-symbolic`)
  const icon = value.toString()

  const getColor = function() {

    const pr = value.emitter.percent;


    if (pr <= 25) {
      return "#ed8796"; // Red for <= 25%
    } else if (pr <= 50) {
      return "#eed49f"; // Yellow for <= 50%
    } else {
      return "#eceff4"; // Green for > 50% (optional)
    }
  }

  return Widget.Box({
    class_name: "battery",
    vertical: true,
    visible: battery.bind("available"),
    children: [
      Widget.CircularProgress({
        css: 'min-width: 24px;'  // its size is min(min-height, min-width)
          + 'min-height: 24px;'
          + 'font-size: 2px;' // to set its thickness set font-size on it
          + 'margin: 1px;' // you can set margin on it
          + 'background-color: #171717;' // set its bg color
          + `color: ${getColor()};`, // set its g color
        rounded: false,
        inverted: false,
        startAt: 0.75,
        value: battery.bind('percent').as(p => p / 100),
        child: Widget.Label({
          className: "battery-label",
          //label: value.as(p => `󱐋${Math.round(p * 100)}`),
          label: "󱐋"
        })


      }),
    ],
  })
}


function SysTray() {
  const items = systemtray.bind("items")
    .as(items => items.map(item => Widget.Button({
      child: Widget.Icon({ icon: item.bind("icon") }),
      on_primary_click: (_, event) => item.activate(event),
      on_secondary_click: (_, event) => item.openMenu(event),
      tooltip_markup: item.bind("tooltip_markup"),
    })))

  return Widget.Box({
    children: items,
  })
}


function ArchCtl() {
  return Widget.Button({
    label: "",
    class_name: "archctl",
    on_primary_click: () => Utils.exec("/home/gabriel/.config/ags/scripts/change-theme.sh /home/gabriel/pictures/waneella-wallpapers/desktop-favorites/")

    //child: Widget.Label({ label }),
  })
}

// layout of the bar
function Left() {
  return Widget.Box({
    className: "modules-top",
    vertical: true,
    spacing: 4,
    children: [
      ArchCtl(),
      BatteryLabel(),
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

function Right() {
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
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  })
}


App.config({
  style: "./style.css",
  windows: [
    Bar(),

    // you can call it, for each monitor
    // Bar(0),
    // Bar(1)
  ],
})

export { }
