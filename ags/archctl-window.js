
const WINDOW_NAME = "archctl"

const SettingsButton = (label, onClick) => Widget.Button({
  className: "settings-button",
  label: label,
  onClicked: onClick,
})

let saturation = 0.0;

const SaturationSlider = () => Widget.Slider({
  className: "saturation-slider",
  // @ts-ignore
  vertical: false,
  value: 0,
  min: 0,
  max: 100,
  on_change: ({ value }) => { saturation = value / 100 },
  marks: [
    [1, 'saturation', 'bottom']
  ]
})

// todo)) Icons instead of text 
// todo)) GTK Stack for icons? dropdown? button?

const ArchCtl = ({ width = 500, height = 500, spacing = 12 }) => {

  // search entry
  return Widget.Box({

    className: "archctl-window",
    vertical: true,
    spacing: 8,
    children: [

      Widget.Label({
        label: "Theme"
      }),

      Widget.Box({
        className: "archctl-window-column",
        vertical: false,
        spacing: 8,
        //
        children: [
          SettingsButton("", () => Utils.exec(Utils.exec(`/home/gabriel/.config/ags/scripts/change-theme.sh /home/gabriel/pictures/waneella-wallpapers/desktop-favorites/ ${saturation}`))),

          SettingsButton("", () => Utils.exec(Utils.exec(`/home/gabriel/.config/ags/scripts/change-theme.sh /home/gabriel/pictures/waneella-wallpapers/desktop-favorites/ ${saturation}`))),
        ]
      }),


      SaturationSlider(),
      Widget.Label({
        label: "System"
      }),
      //SettingsButton("⏻", () => Utils.exec("wlogout"))
      SettingsButton("⏻", () => { App.ToggleWindow("themeSelector") })
    ],
    setup: self => self.hook(App, (_, windowName, visible) => {
      if (windowName !== WINDOW_NAME)
        return
    }),
  })
}

// there needs to be only one instance
export const archctl = Widget.Window({
  name: WINDOW_NAME,
  className: "archctl-window",
  anchor: ["top", "left"],
  setup: self => self.keybind("Escape", () => {
    App.closeWindow(WINDOW_NAME)
  }),
  visible: false,
  keymode: "on-demand",
  child: ArchCtl({
    width: 500,
    height: 500,
    spacing: 12,
  }),
})
