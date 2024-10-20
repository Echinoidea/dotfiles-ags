

const WINDOW_NAME = "themeSelector"

const ThemeSelector = () => {
  return Widget.Box({
    className: "theme-selector",
    vertical: true,

    children: [
      Widget.Scrollable({
        child: Widget.Box({

          vertical: true,
          children: [
            Widget.Label({ label: "Test1" })
          ]
        })
      })
    ]
  })
}

export const themeSelector = Widget.Window({
  name: WINDOW_NAME,
  className: "archctl-window",
  anchor: ["left", "top"],
  //window_position: Gtk.WindowPosition. 
  setup: self => self.keybind("Escape", () => {
    App.closeWindow(WINDOW_NAME)
  }),
  visible: false,
  exclusive: true,
  keymode: "on-demand",
  child: ThemeSelector(),
})
