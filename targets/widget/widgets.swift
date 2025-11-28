import WidgetKit
import SwiftUI

// Structure pour stocker les données du couple depuis l'App Group
struct CoupleWidgetData {
    let currentStreak: Int
    let longestStreak: Int
    let distance: String?
    let partnerName: String?
    let daysTogether: Int
    let hasActiveChallenge: Bool
    let challengeText: String
    
    static func load() -> CoupleWidgetData {
        let appGroupID = "group.com.emplica.nightly.data"
        guard let sharedDefaults = UserDefaults(suiteName: appGroupID) else {
            return CoupleWidgetData(
                currentStreak: 0,
                longestStreak: 0,
                distance: nil,
                partnerName: nil,
                daysTogether: 0,
                hasActiveChallenge: false,
                challengeText: ""
            )
        }
        
        // Lire les valeurs - ExtensionStorage stocke dans UserDefaults
        func getIntValue(forKey key: String) -> Int {
            if let intValue = sharedDefaults.object(forKey: key) as? Int {
                return intValue
            } else if let stringValue = sharedDefaults.string(forKey: key), let intValue = Int(stringValue) {
                return intValue
            }
            return 0
        }
        
        let currentStreak = getIntValue(forKey: "currentStreak")
        let longestStreak = getIntValue(forKey: "longestStreak")
        let daysTogether = getIntValue(forKey: "daysTogether")
        
        let distanceRaw = sharedDefaults.string(forKey: "distance")
        let distance = (distanceRaw == "N/A" || distanceRaw?.isEmpty == true) ? nil : distanceRaw
        
        let partnerNameRaw = sharedDefaults.string(forKey: "partnerName")
        let partnerName = (partnerNameRaw?.isEmpty == true) ? nil : partnerNameRaw
        
        let hasActiveChallengeStr = sharedDefaults.string(forKey: "hasActiveChallenge") ?? "false"
        let hasActiveChallenge = hasActiveChallengeStr == "true"
        let challengeText = sharedDefaults.string(forKey: "challengeText") ?? ""
        
        return CoupleWidgetData(
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            distance: distance,
            partnerName: partnerName,
            daysTogether: daysTogether,
            hasActiveChallenge: hasActiveChallenge,
            challengeText: challengeText
        )
    }
}

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), data: CoupleWidgetData.load())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration, data: CoupleWidgetData.load())
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let widgetData = CoupleWidgetData.load()
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, configuration: configuration, data: widgetData)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let data: CoupleWidgetData
}

// Vue pour l'illustration du couple avec l'image
struct CoupleIllustrationView: View {
    let daysTogether: Int
    let partnerName: String?
    let currentStreak: Int
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Image de fond - couvre tout l'espace disponible y compris les coins arrondis
                Image("couples")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
                
                // Texte "X days" en haut à gauche
                VStack {
                    HStack {
                        Text("\(daysTogether) days")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 3, x: 1, y: 1)
                        Spacer()
                    }
                    .padding(.leading, 12)
                    .padding(.top, 8)
                    Spacer()
                }
            }
        }
    }
}

struct widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(data: entry.data)
        case .systemMedium:
            MediumWidgetView(data: entry.data)
        case .systemLarge:
            LargeWidgetView(data: entry.data)
        default:
            SmallWidgetView(data: entry.data)
        }
    }
}

// Vue pour petit widget
struct SmallWidgetView: View {
    let data: CoupleWidgetData
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Image de fond qui couvre tout le widget y compris les coins arrondis
                Image("couples")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
                
                // Contenu superposé
                VStack {
                    // Texte "X days" en haut à gauche
                    HStack {
                        Text("\(data.daysTogether) days")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 3, x: 1, y: 1)
                        Spacer()
                    }
                    .padding(.leading, 12)
                    .padding(.top, 8)
                    
                    Spacer()
                    
                    // Informations supplémentaires en bas
                    HStack {
                        if let partnerName = data.partnerName, !partnerName.isEmpty {
                            Text(partnerName)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.5), radius: 2)
                        }
                        Spacer()
                        Text("🔥 \(data.currentStreak)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 2)
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 8)
                }
            }
        }
        .containerBackground(.clear, for: .widget)
    }
}

// Vue pour widget moyen
struct MediumWidgetView: View {
    let data: CoupleWidgetData
    
    var body: some View {
        HStack(spacing: 0) {
            // Illustration à gauche
            CoupleIllustrationView(
                daysTogether: data.daysTogether,
                partnerName: data.partnerName,
                currentStreak: data.currentStreak
            )
            .frame(width: 160)
            .frame(maxHeight: .infinity)
            .clipped()
            
            // Informations à droite
            VStack(alignment: .leading, spacing: 8) {
                if let partnerName = data.partnerName, !partnerName.isEmpty {
                    Text(partnerName)
                        .font(.headline)
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("🔥")
                            .font(.title3)
                        Text("\(data.currentStreak)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    if let distance = data.distance, !distance.isEmpty {
                        HStack {
                            Text("📍")
                            Text(distance)
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    
                    if data.daysTogether > 0 {
                        HStack {
                            Text("💕")
                            Text("\(data.daysTogether) jours")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(
                    colors: [Color(red: 0.16, green: 0.02, blue: 0.02), Color(red: 0.35, green: 0.08, blue: 0.22)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

// Vue pour grand widget vertical
struct LargeWidgetView: View {
    let data: CoupleWidgetData
    
    var body: some View {
        VStack(spacing: 0) {
            // Illustration en haut
            CoupleIllustrationView(
                daysTogether: data.daysTogether,
                partnerName: data.partnerName,
                currentStreak: data.currentStreak
            )
            .frame(height: 200)
            
            // Informations en bas
            VStack(alignment: .leading, spacing: 12) {
                if let partnerName = data.partnerName, !partnerName.isEmpty {
                    Text(partnerName)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                HStack(spacing: 20) {
                    VStack(alignment: .leading) {
                        Text("🔥 Streak")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        Text("\(data.currentStreak)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    if let distance = data.distance, !distance.isEmpty {
                        VStack(alignment: .leading) {
                            Text("📍 Distance")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text(distance)
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        }
                    }
                    
                    if data.daysTogether > 0 {
                        VStack(alignment: .leading) {
                            Text("💕 Ensemble")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text("\(data.daysTogether)j")
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        }
                    }
                }
                
                if data.hasActiveChallenge && !data.challengeText.isEmpty {
                    Divider()
                        .background(Color.white.opacity(0.3))
                    VStack(alignment: .leading, spacing: 4) {
                        Text("✨ Défi du jour")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        Text(data.challengeText)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.9))
                            .lineLimit(3)
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                LinearGradient(
                    colors: [Color(red: 0.16, green: 0.02, blue: 0.02), Color(red: 0.35, green: 0.08, blue: 0.22)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
        }
        .configurationDisplayName("Nightly Couple")
        .description("Affiche votre streak, distance et défi quotidien avec votre partenaire.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// Previews pour Xcode (données de test uniquement - n'affectent pas le widget réel)
#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(
        date: .now,
        configuration: ConfigurationAppIntent(),
        data: CoupleWidgetData.load() // Utilise les vraies données depuis UserDefaults
    )
}

#Preview(as: .systemMedium) {
    widget()
} timeline: {
    SimpleEntry(
        date: .now,
        configuration: ConfigurationAppIntent(),
        data: CoupleWidgetData.load() // Utilise les vraies données depuis UserDefaults
    )
}

#Preview(as: .systemLarge) {
    widget()
} timeline: {
    SimpleEntry(
        date: .now,
        configuration: ConfigurationAppIntent(),
        data: CoupleWidgetData.load() // Utilise les vraies données depuis UserDefaults
    )
}
