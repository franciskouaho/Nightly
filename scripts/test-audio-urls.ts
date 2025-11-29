import { blindtestGenerationsQuestions } from './questions/blindtest-generations-questions';

const testUrl = async (url: string, name: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const isOk = response.ok;
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    console.log(
      `${isOk ? '✅' : '❌'} ${name.padEnd(50)} | Status: ${status} | Type: ${contentType || 'N/A'}`
    );
    
    if (!isOk) {
      console.log(`   URL: ${url}`);
    }
    
    return isOk;
  } catch (error: any) {
    console.log(`❌ ${name.padEnd(50)} | Error: ${error.message}`);
    console.log(`   URL: ${url}`);
    return false;
  }
};

async function main() {
  console.log('🔍 Test des URLs audio du Blind Test...\n');
  
  const questions = blindtestGenerationsQuestions.translations.fr;
  let successCount = 0;
  let failCount = 0;
  const failedUrls: Array<{ name: string; url: string }> = [];
  
  // Tester chaque URL
  for (const question of questions) {
    const isSuccess = await testUrl(question.audioUrl, `${question.text} (${question.category})`);
    if (isSuccess) {
      successCount++;
    } else {
      failCount++;
      failedUrls.push({ name: question.text, url: question.audioUrl });
    }
    
    // Petit délai pour ne pas surcharger les serveurs
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ URLs valides: ${successCount}`);
  console.log(`   ❌ URLs invalides: ${failCount}`);
  console.log(`   📦 Total: ${questions.length}`);
  
  if (failedUrls.length > 0) {
    console.log(`\n❌ URLs qui ne fonctionnent pas:\n`);
    failedUrls.forEach(({ name, url }) => {
      console.log(`   - ${name}`);
      console.log(`     ${url}\n`);
    });
  } else {
    console.log(`\n🎉 Toutes les URLs fonctionnent correctement !\n`);
  }
}

main().catch(console.error);

