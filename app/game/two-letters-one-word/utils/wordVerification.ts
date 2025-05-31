/**
 * Fonction de vérification des mots pour le jeu "2 Lettres 1 Mot"
 * Utilise l'API OpenAI pour vérifier si un mot correspond aux critères
 */

interface WordVerificationParams {
  word: string;
  firstLetter: string;
  secondLetter: string;
  theme: string;
}

/**
 * Vérifie si un mot correspond aux critères du jeu
 * @param params Les paramètres de vérification
 * @returns Promise<boolean> True si le mot est valide, false sinon
 */
export async function verifyWord({
  word,
  firstLetter,
  secondLetter,
  theme
}: WordVerificationParams): Promise<boolean> {
  try {
    // Construction de la question pour l'API
    const prompt = `Le mot '${word}' commence-t-il par les lettres ${firstLetter} et ${secondLetter} et est-ce ${theme} ? Réponds uniquement par 'oui' ou 'non'.`;

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant qui répond uniquement par "oui" ou "non" à la question posée.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 5
      })
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de la requête API')), 5000);
    });

    const result = await Promise.race([
      response.json(),
      timeoutPromise
    ]);

    if (!response.ok) {
      throw new Error(`Erreur API: ${result.error?.message || 'Erreur inconnue'}`);
    }

    // Extraction de la réponse
    const answer = result.choices[0]?.message?.content?.toLowerCase().trim();
    
    // Vérification de la réponse
    if (!answer || (answer !== 'oui' && answer !== 'non')) {
      throw new Error('Réponse invalide de l\'API');
    }

    return answer === 'oui';

  } catch (error) {
    console.error('Erreur lors de la vérification du mot:', error);
    throw error;
  }
} 