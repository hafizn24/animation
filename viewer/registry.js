export const ENTRIES = [
  { id: 'default', label: '👨 Default Hoodie', name: 'Default Hoodie', group: 'Characters', module: '../characters/character-default.js', exportName: 'App' },
  { id: 'suit', label: '👔 Three-Piece Suit', name: 'Three-Piece Suit', group: 'Characters', module: '../characters/character-suit.js', exportName: 'SuitOutfitApp' },
  { id: 'coach', label: '👕 Coach Tracksuit', name: 'Coach Tracksuit', group: 'Characters', module: '../characters/character-coach.js', exportName: 'SoccerCoachOutfitApp' },
  { id: 'soccer', label: '⚽ Soccer Jersey', name: 'Soccer Jersey', group: 'Characters', module: '../characters/character-soccer.js', exportName: 'SoccerOutfitApp' },
  { id: 'casual', label: '🧥 Casual Sweater', name: 'Casual Sweater', group: 'Characters', module: '../characters/character-casual.js', exportName: 'AnotherCasualOutfitApp' },
  { id: 'chairman', label: '👤 The Chairman', name: 'The Chairman', group: 'Characters', module: '../characters/character-chairman.js', exportName: 'ChairmanApp' },
  { id: 'newowner', label: '👔 The New Owner', name: 'The New Owner', group: 'Characters', module: '../characters/character-new-owner.js', exportName: 'NewOwnerApp' },
  { id: 'sponsor', label: '💼 Sponsor Executive', name: 'Sponsor Executive', group: 'Characters', module: '../characters/character-sponsor.js', exportName: 'SponsorApp' },
  { id: 'karim', label: '⭐ Karim (Captain #8 — Match Jersey)', name: 'Karim – Captain #8 (Match Jersey)', group: 'Characters', module: '../characters/character-karim.js', exportName: 'KarimApp' },
  { id: 'azam', label: '🙅 Azam (#7 Defender)', name: 'Azam – Defender #7 (RM5)', group: 'Characters', module: '../characters/character-azam.js', exportName: 'AzamApp' },
  { id: 'stadium', label: '⚽ Stadium (Buluh FC)', name: 'Stadium – Buluh FC', group: 'Environments', module: '../environments/stadium.js', exportName: 'StadiumApp' },
  { id: 'locker', label: '🚿 Locker Room', name: 'Locker Room', group: 'Environments', module: '../environments/locker-room.js', exportName: 'LockerRoomApp' },
  { id: 'managerOffice', label: '🏢 Manager Office', name: 'Manager Office', group: 'Environments', module: '../environments/manager-office.js', exportName: 'ManagerOfficeApp' },
  { id: 'boardroom', label: '🏛️ Lender Boardroom', name: 'Lender Boardroom', group: 'Environments', module: '../environments/lender-boardroom.js', exportName: 'LenderBoardroomApp' },
  { id: 'playersTunnel', label: '🚇 Players Tunnel', name: 'Players Tunnel', group: 'Environments', module: '../environments/players-tunnel.js', exportName: 'PlayersTunnelApp' },
  { id: 'sponsorOffice', label: '🏢 Sponsor Office (Nexus Sports)', name: 'Sponsor Office – Nexus Sports', group: 'Environments', module: '../environments/sponsor-office.js', exportName: 'SponsorOfficeApp' },
  { id: 'bakery', label: '🥐 Bakery (Kek Maju)', name: 'Bakery – Kek Maju', group: 'Environments', module: '../environments/bakery.js', exportName: 'BakeryApp' },
  { id: 'clubOffice', label: '🚪 Club Office (Episode 4)', name: 'Club Office – Episode 4', group: 'Environments', module: '../environments/club-office.js', exportName: 'ClubOfficeApp' },
];

export const BY_ID = new Map(ENTRIES.map((entry) => [entry.id, entry]));
