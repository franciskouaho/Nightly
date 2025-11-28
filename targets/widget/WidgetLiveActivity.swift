import ActivityKit
import WidgetKit
import SwiftUI

struct CoupleLiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Données dynamiques du couple
        var currentStreak: Int
        var longestStreak: Int
        var distance: String?
        var partnerName: String?
        var daysTogether: Int
        var hasActiveChallenge: Bool
        var challengeText: String
        var lastUpdate: Date
    }

    // Propriétés fixes
    var coupleId: String
}

struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CoupleLiveActivityAttributes.self) { context in
            // Écran de verrouillage / Bannière avec l'image
            ZStack {
                // Image de fond - couvre tout l'espace
                Image("couples")
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .clipped()
                
                // Contenu superposé
                VStack(spacing: 8) {
                    // En-tête avec "X days" et streak
                    HStack {
                        Text("\(context.state.daysTogether) days")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 3, x: 1, y: 1)
                        Spacer()
                        Text("🔥 \(context.state.currentStreak)")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 2)
                    }
                    
                    Divider()
                        .background(Color.white.opacity(0.3))
                    
                    // Informations principales
                    HStack(spacing: 16) {
                        // Distance
                        if let distance = context.state.distance, !distance.isEmpty {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("📍")
                                    .font(.caption)
                                Text(distance)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.5), radius: 2)
                            }
                        }
                        
                        // Nom du partenaire
                        if let partnerName = context.state.partnerName, !partnerName.isEmpty {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("💕")
                                    .font(.caption)
                                Text(partnerName)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.5), radius: 2)
                            }
                        }
                        
                        Spacer()
                        
                        // Streak le plus long
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Record")
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.8))
                                .shadow(color: .black.opacity(0.5), radius: 2)
                            Text("\(context.state.longestStreak)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.5), radius: 2)
                        }
                    }
                    
                    // Défi actif
                    if context.state.hasActiveChallenge && !context.state.challengeText.isEmpty {
                        Divider()
                            .background(Color.white.opacity(0.3))
                        VStack(alignment: .leading, spacing: 4) {
                            Text("✨ Défi du jour")
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.9))
                                .shadow(color: .black.opacity(0.5), radius: 2)
                            Text(context.state.challengeText)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.9))
                                .shadow(color: .black.opacity(0.5), radius: 2)
                                .lineLimit(2)
                        }
                    }
                }
                .padding()
            }
            .activityBackgroundTint(Color(red: 0.16, green: 0.02, blue: 0.02))
            .activitySystemActionForegroundColor(Color.white)

        } dynamicIsland: { context in
            DynamicIsland {
                // Vue étendue du Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 4) {
                        if let partnerName = context.state.partnerName, !partnerName.isEmpty {
                            Text(partnerName)
                                .font(.headline)
                                .foregroundColor(.white)
                        } else {
                            Text("Nightly")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        Text("🔥 Streak: \(context.state.currentStreak)")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 4) {
                        if let distance = context.state.distance, !distance.isEmpty {
                            Text("📍 \(distance)")
                                .font(.subheadline)
                                .foregroundColor(.white)
                        }
                        if context.state.daysTogether > 0 {
                            Text("💕 \(context.state.daysTogether)j")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    if context.state.hasActiveChallenge && !context.state.challengeText.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("✨ Défi du jour")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text(context.state.challengeText)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(2)
                        }
                        .padding(.top, 8)
                    } else {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Record: \(context.state.longestStreak) jours")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        .padding(.top, 8)
                    }
                }
            } compactLeading: {
                // Vue compacte - côté gauche
                Text("🔥")
                    .font(.title3)
            } compactTrailing: {
                // Vue compacte - côté droit
                Text("\(context.state.currentStreak)")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            } minimal: {
                // Vue minimale
                Text("🔥")
                    .font(.title2)
            }
            .widgetURL(URL(string: "nightly://couples"))
            .keylineTint(Color(red: 0.78, green: 0.12, blue: 0.23))
        }
    }
}

extension CoupleLiveActivityAttributes {
    fileprivate static var preview: CoupleLiveActivityAttributes {
        CoupleLiveActivityAttributes(coupleId: "preview")
    }
}

extension CoupleLiveActivityAttributes.ContentState {
    fileprivate static var example: CoupleLiveActivityAttributes.ContentState {
        CoupleLiveActivityAttributes.ContentState(
            currentStreak: 7,
            longestStreak: 15,
            distance: "2.5km",
            partnerName: "MARIE",
            daysTogether: 120,
            hasActiveChallenge: true,
            challengeText: "Qu'est-ce qui vous a fait tomber amoureux de moi ?",
            lastUpdate: Date()
        )
    }
    
    fileprivate static var example2: CoupleLiveActivityAttributes.ContentState {
        CoupleLiveActivityAttributes.ContentState(
            currentStreak: 3,
            longestStreak: 10,
            distance: nil,
            partnerName: "JOHN",
            daysTogether: 45,
            hasActiveChallenge: false,
            challengeText: "",
            lastUpdate: Date()
        )
    }
}

#Preview("Notification", as: .content, using: CoupleLiveActivityAttributes.preview) {
   WidgetLiveActivity()
} contentStates: {
    CoupleLiveActivityAttributes.ContentState.example
    CoupleLiveActivityAttributes.ContentState.example2
}
