import WidgetKit
import SwiftUI
import ActivityKit

struct NightlyWidget: Widget {
    let kind: String = "NightlyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NightlyProvider()) { entry in
            NightlyWidgetEntryView(entry: entry)
                .containerBackground(Color(red: 0.164, green: 0.02, blue: 0.02), for: .widget)
        }
        .configurationDisplayName("Nightly Couple")
        .description("Voir votre streak, distance et défi quotidien avec votre partenaire.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryCircular, .accessoryInline])
    }
}

struct NightlyProvider: TimelineProvider {
    typealias Entry = NightlyEntry
    
    func placeholder(in context: Context) -> NightlyEntry {
        NightlyEntry(
            date: Date(),
            currentStreak: 5,
            longestStreak: 10,
            distance: "2.5km",
            partnerName: "PARTENAIRE",
            daysTogether: 45,
            hasActiveChallenge: true,
            challengeText: "Défi du jour: Complétez le défi quotidien ensemble!"
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (NightlyEntry) -> Void) {
        let entry = loadWidgetData()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<NightlyEntry>) -> Void) {
        var entries: [NightlyEntry] = []
        
        // Charger les données actuelles
        let currentEntry = loadWidgetData()
        entries.append(currentEntry)
        
        // Mettre à jour toutes les 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadWidgetData() -> NightlyEntry {
        // Accéder aux données partagées via App Groups
        let defaults = UserDefaults(suiteName: "group.com.emplica.nightly.data")
        
        let currentStreak = defaults?.integer(forKey: "currentStreak") ?? 0
        let longestStreak = defaults?.integer(forKey: "longestStreak") ?? 0
        let distance = defaults?.string(forKey: "distance") ?? "N/A"
        let partnerName = defaults?.string(forKey: "partnerName") ?? ""
        let daysTogether = defaults?.integer(forKey: "daysTogether") ?? 0
        let hasActiveChallenge = defaults?.bool(forKey: "hasActiveChallenge") ?? false
        let challengeText = defaults?.string(forKey: "challengeText") ?? ""
        
        return NightlyEntry(
            date: Date(),
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

struct NightlyEntry: TimelineEntry {
    let date: Date
    let currentStreak: Int
    let longestStreak: Int
    let distance: String
    let partnerName: String
    let daysTogether: Int
    let hasActiveChallenge: Bool
    let challengeText: String
}

struct NightlyWidgetEntryView: View {
    var entry: NightlyProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryRectangular:
            LockScreenRectangularView(entry: entry)
        case .accessoryCircular:
            LockScreenCircularView(entry: entry)
        case .accessoryInline:
            LockScreenInlineView(entry: entry)
        default:
            HomeScreenView(entry: entry)
        }
    }
}

// MARK: - Home Screen Widget Views
struct HomeScreenView: View {
    var entry: NightlyProvider.Entry
    
    var body: some View {
        ZStack {
            // Fond dégradé
            LinearGradient(
                colors: [
                    Color(red: 0.196, green: 0.082, blue: 0.224), // #C41E3A
                    Color(red: 0.055, green: 0.02, blue: 0.02)    // #2A0505
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(alignment: .leading, spacing: 8) {
                // Header avec streak
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(Color(red: 1.0, green: 0.447, blue: 0.314)) // #FF7240
                        .font(.title2)
                    
                    Text("\(entry.currentStreak)")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("jours")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    
                    Spacer()
                }
                
                // Distance
                if entry.distance != "N/A" && !entry.partnerName.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757)) // #FFB6C1
                            .font(.caption)
                        
                        Text(entry.distance)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Text("•")
                            .foregroundColor(.white.opacity(0.5))
                        
                        Text(entry.partnerName)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                            .lineLimit(1)
                    }
                }
                
                // Défi quotidien
                if entry.hasActiveChallenge && !entry.challengeText.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                                .font(.caption)
                            
                            Text("Défi du jour")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.white.opacity(0.9))
                        }
                        
                        Text(entry.challengeText)
                            .font(.system(size: 11, weight: .regular))
                            .foregroundColor(.white.opacity(0.8))
                            .lineLimit(2)
                    }
                    .padding(.top, 4)
                }
                
                Spacer()
                
                // Footer avec jours ensemble
                HStack {
                    Image(systemName: "heart.fill")
                        .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                        .font(.caption)
                    
                    Text("\(entry.daysTogether) jours ensemble")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    
                    Spacer()
                }
            }
            .padding()
        }
    }
}

// Widget Bundle
@main
struct NightlyWidgetBundle: WidgetBundle {
    var body: some Widget {
        NightlyWidget()
    }
}

// MARK: - Lock Screen Widget Views

// Rectangular widget pour l'écran de verrouillage (jours ensemble + distance)
struct LockScreenRectangularView: View {
    var entry: NightlyProvider.Entry
    
    var body: some View {
        HStack(spacing: 8) {
            // Icône cœur
            Image(systemName: "heart.fill")
                .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                .font(.caption)
            
            // Days together
            VStack(alignment: .leading, spacing: 2) {
                Text("\(entry.daysTogether) jours")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("ensemble")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundColor(.white.opacity(0.7))
            }
            
            // Séparateur
            if entry.distance != "N/A" && !entry.partnerName.isEmpty {
                Text("•")
                    .foregroundColor(.white.opacity(0.4))
                    .font(.caption)
                
                // Distance
                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                        .font(.system(size: 10))
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.distance)
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                        
                        if !entry.partnerName.isEmpty {
                            Text(entry.partnerName)
                                .font(.system(size: 9, weight: .regular))
                                .foregroundColor(.white.opacity(0.6))
                                .lineLimit(1)
                        }
                    }
                }
            }
            
            Spacer()
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }
}

// Circular widget pour l'écran de verrouillage (jours ensemble uniquement)
struct LockScreenCircularView: View {
    var entry: NightlyProvider.Entry
    
    var body: some View {
        ZStack {
            // Fond circulaire
            Circle()
                .fill(Color(red: 0.196, green: 0.082, blue: 0.224))
                .opacity(0.9)
            
            VStack(spacing: 2) {
                Image(systemName: "heart.fill")
                    .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                    .font(.system(size: 14, weight: .semibold))
                
                Text("\(entry.daysTogether)")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("jours")
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
    }
}

// Inline widget pour l'écran de verrouillage (texte compact)
struct LockScreenInlineView: View {
    var entry: NightlyProvider.Entry
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "heart.fill")
                .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
                .font(.caption2)
            
            Text("\(entry.daysTogether) jours ensemble")
                .font(.system(size: 12, weight: .medium))
            
            if entry.distance != "N/A" && !entry.partnerName.isEmpty {
                Text("• \(entry.distance)")
                    .font(.system(size: 12, weight: .regular))
            }
        }
        .foregroundColor(.white)
    }
}

// MARK: - Preview
#Preview(as: .systemSmall) {
    NightlyWidget()
} timeline: {
    NightlyEntry(
        date: Date(),
        currentStreak: 5,
        longestStreak: 10,
        distance: "2.5km",
        partnerName: "PARTENAIRE",
        daysTogether: 45,
        hasActiveChallenge: true,
        challengeText: "Défi du jour: Complétez le défi quotidien ensemble!"
    )
}

#Preview(as: .accessoryRectangular) {
    NightlyWidget()
} timeline: {
    NightlyEntry(
        date: Date(),
        currentStreak: 5,
        longestStreak: 10,
        distance: "2.5km",
        partnerName: "PARTENAIRE",
        daysTogether: 45,
        hasActiveChallenge: true,
        challengeText: "Défi du jour: Complétez le défi quotidien ensemble!"
    )
}

#Preview(as: .accessoryCircular) {
    NightlyWidget()
} timeline: {
    NightlyEntry(
        date: Date(),
        currentStreak: 5,
        longestStreak: 10,
        distance: "2.5km",
        partnerName: "PARTENAIRE",
        daysTogether: 45,
        hasActiveChallenge: true,
        challengeText: "Défi du jour: Complétez le défi quotidien ensemble!"
    )
}

#Preview(as: .accessoryInline) {
    NightlyWidget()
} timeline: {
    NightlyEntry(
        date: Date(),
        currentStreak: 5,
        longestStreak: 10,
        distance: "2.5km",
        partnerName: "PARTENAIRE",
        daysTogether: 45,
        hasActiveChallenge: true,
        challengeText: "Défi du jour: Complétez le défi quotidien ensemble!"
    )
}

