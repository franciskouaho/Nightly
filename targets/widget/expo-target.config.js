/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "widget",
  displayName: "Nightly Couple",
  icon: "../../assets/christmas/logo.png",
  deploymentTarget: "17.0",
  bundleIdentifier: ".widget",
  
  // Couleurs pour le widget (thème Nightly)
  colors: {
    $widgetBackground: "#2A0505",
    $accent: "#C41E3A",
    gradient1: {
      light: "#C41E3A",
      dark: "#8B1538",
    },
    gradient2: {
      light: "#FFB6C1",
      dark: "#FF7F50",
    },
  },
  
  // Images pour le widget
  images: {
    logo: "../../assets/christmas/logo.png",
  },
  
  // App Groups pour partager les données
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"] || ["group.com.emplica.nightly.data"],
  },
  
  // Frameworks nécessaires
  frameworks: [
    "SwiftUI",
    "WidgetKit",
    "ActivityKit",
  ],
});

