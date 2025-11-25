/**
 * Validation script to verify all game rules are properly exported
 * Run with: npx ts-node scripts/rules/validate.ts
 */

import { gameRules } from './all-rules.js';

console.log('🔍 Validating game rules extraction...\n');

const gameIds = Object.keys(gameRules);
console.log(`✅ Total games found: ${gameIds.length}`);
console.log(`   Games: ${gameIds.join(', ')}\n`);

let totalLanguages = 0;
let totalRules = 0;

gameIds.forEach((gameId) => {
  const game = gameRules[gameId];
  const languages = Object.keys(game.translations);
  const rulesCount = Object.values(game.translations).reduce(
    (sum, lang) => sum + lang.rules.length,
    0
  );

  totalLanguages += languages.length;
  totalRules += rulesCount;

  console.log(`📋 ${gameId}:`);
  console.log(`   Languages: ${languages.length} (${languages.join(', ')})`);
  console.log(`   Total rules: ${rulesCount}`);
  console.log(
    `   Rules per language: ${Object.values(game.translations).map((l) => l.rules.length).join(', ')}`
  );
  console.log('');
});

console.log('📊 Summary:');
console.log(`   Total games: ${gameIds.length}`);
console.log(`   Total language versions: ${totalLanguages}`);
console.log(`   Total individual rules: ${totalRules}`);
console.log(`   Average languages per game: ${(totalLanguages / gameIds.length).toFixed(1)}`);
console.log(`   Average rules per game: ${(totalRules / gameIds.length).toFixed(1)}`);

console.log('\n✅ Validation complete!');
