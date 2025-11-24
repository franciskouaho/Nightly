import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Live Activity Attributes
struct NightlyGameActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var gameName: String
        var playerCount: Int
        var currentRound: Int
        var totalRounds: Int
        var timeRemaining: String?
        var status: String // "playing", "waiting", "finished"
    }
    
    var roomId: String
    var roomCode: String
}

// MARK: - Live Activity Widget
@available(iOS 16.1, *)
struct NightlyGameActivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NightlyGameActivityAttributes.self) { context in
            // Lock screen/banner UI
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded region
                DynamicIslandExpandedRegion(.leading) {
                    HStack {
                        Image(systemName: "gamecontroller.fill")
                            .foregroundColor(Color(red: 0.769, green: 0.447, blue: 0.314))
                        Text(context.state.gameName)
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    HStack(spacing: 8) {
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Tour")
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.7))
                            Text("\(context.state.currentRound)/\(context.state.totalRounds)")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Joueurs")
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.7))
                            Text("\(context.state.playerCount)")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        if context.state.status == "playing" {
                            Image(systemName: "play.circle.fill")
                                .foregroundColor(Color(red: 0.769, green: 0.447, blue: 0.314))
                            Text("Partie en cours")
                                .font(.subheadline)
                                .foregroundColor(.white)
                            
                            if let timeRemaining = context.state.timeRemaining {
                                Spacer()
                                Text(timeRemaining)
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))
                            }
                        } else if context.state.status == "waiting" {
                            Image(systemName: "clock.fill")
                                .foregroundColor(.yellow)
                            Text("En attente de joueurs...")
                                .font(.subheadline)
                                .foregroundColor(.white)
                        } else {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Partie terminée")
                                .font(.subheadline)
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.horizontal)
                }
            } compactLeading: {
                Image(systemName: "gamecontroller.fill")
                    .foregroundColor(Color(red: 0.769, green: 0.447, blue: 0.314))
            } compactTrailing: {
                Text("\(context.state.currentRound)/\(context.state.totalRounds)")
                    .font(.caption2)
                    .foregroundColor(.white)
            } minimal: {
                Image(systemName: "gamecontroller.fill")
                    .foregroundColor(Color(red: 0.769, green: 0.447, blue: 0.314))
            }
            .widgetURL(URL(string: "nightly://room/\(context.attributes.roomId)"))
        }
    }
}

// MARK: - Lock Screen View
@available(iOS 16.1, *)
struct LockScreenLiveActivityView: View {
    let context: ActivityViewContext<NightlyGameActivityAttributes>
    
    var body: some View {
        HStack(spacing: 12) {
            // Icône de jeu
            ZStack {
                Circle()
                    .fill(Color(red: 0.196, green: 0.082, blue: 0.224))
                    .frame(width: 50, height: 50)
                
                Image(systemName: "gamecontroller.fill")
                    .foregroundColor(.white)
                    .font(.title3)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.gameName)
                    .font(.headline)
                    .foregroundColor(.white)
                
                HStack(spacing: 12) {
                    Label("\(context.state.currentRound)/\(context.state.totalRounds)", systemImage: "number.circle")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Label("\(context.state.playerCount)", systemImage: "person.2.fill")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    if context.state.status == "playing" {
                        Label(context.state.timeRemaining ?? "", systemImage: "clock.fill")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
            
            Spacer()
            
            // Code de la room
            VStack(alignment: .trailing, spacing: 2) {
                Text("Code")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                Text(context.attributes.roomCode)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 1.0, green: 0.714, blue: 0.757))
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.055, green: 0.02, blue: 0.02),
                    Color(red: 0.196, green: 0.082, blue: 0.224)
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
    }
}

