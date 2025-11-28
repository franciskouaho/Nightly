import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Nightly Couple Widget" }
    static var description: IntentDescription { "Widget pour afficher les informations de votre couple." }
}
