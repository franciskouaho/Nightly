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

interface WordVerificationResult {
  isValid: boolean;
  example?: string;
}

/**
 * Vérifie si un mot correspond aux critères du jeu
 * @param params Les paramètres de vérification
 * @returns Promise<WordVerificationResult> Résultat de la vérification
 */
export async function verifyWord({
  word,
  firstLetter,
  secondLetter,
  theme
}: WordVerificationParams): Promise<WordVerificationResult> {
  try {
    // Nouveau prompt très strict pour s'assurer que l'exemple respecte les règles.
    const prompt = `Vérifie si le mot '${word}' contient les lettres '${firstLetter}' et '${secondLetter}' et correspond strictement au thème '${theme}'. Si le mot est valide, réponds UNIQUEMENT par 'oui'. Si le mot n'est PAS valide, réponds UNIQUEMENT par 'non|exemple', où 'exemple' est UN SEUL mot valide qui CONTIENT OBLIGATOIREMENT les lettres '${firstLetter}' et '${secondLetter}' (dans n'importe quel ordre, insensible à la casse) et correspond EXACTEMENT au thème '${theme}'. Ne donne AUCUNE autre information, explication ou ponctuation supplémentaire.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant qui répond uniquement par "oui" ou "non" à la question posée. Si la réponse est non, donne un exemple sous la forme non|exemple.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 30
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

    const answer = result.choices[0]?.message?.content?.toLowerCase().trim();

    console.log('API Answer:', answer);

    if (!answer) {
      throw new Error('Réponse invalide de l\'API');
    }

    if (answer.startsWith('oui')) {
      return { isValid: true };
    }
    if (answer.startsWith('non')) {
      const example = answer.includes('|') ? answer.split('|')[1]?.trim() : undefined;
      return { isValid: false, example };
    }
    // fallback for any other unexpected response
    return { isValid: false };
  } catch (error) {
    console.error('Erreur lors de la vérification du mot:', error);
    throw error;
  }
} 