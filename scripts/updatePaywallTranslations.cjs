const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../app/i18n/locales');

const translations = {
  en: {
    features: {
      unlimited: 'Unlimited access to all modes',
      weekly: 'New cards every week',
      visuals: 'Exclusive visual themes',
      characters: 'Character customization',
      updates: 'Priority updates'
    },
    plans: {
      weekly: {
        title: 'Free Trial',
        badge: 'FREE',
        period: '7 days',
        description: 'Test all features'
      },
      monthly: {
        title: 'Monthly',
        badge: 'POPULAR',
        period: 'per month',
        description: 'Full access to everything'
      },
      annual: {
        title: 'Annual',
        badge: 'BEST VALUE',
        period: 'per year',
        description: 'Save more than 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: '$'
    },
    freeTrial: '7 DAYS',
    cta: 'START TRIAL',
    annual: {
      title: '🔥 LIMITED OFFER 🔥',
      subtitle: 'SAVE MORE THAN 50%',
      tagline: 'Don\'t miss this unique opportunity!',
      features: {
        savings: 'Save more than $30 per year'
      },
      discount: 'off',
      savings: 'Save {amount} {currency}',
      cta: 'GRAB THE DEAL'
    },
    alerts: {
      productUnavailable: {
        title: 'Product not available',
        message: 'This product is not available at the moment.'
      },
      success: {
        title: 'Congratulations!',
        message: 'Your subscription has been activated successfully!'
      },
      pending: {
        title: 'Pending',
        message: 'Your purchase is being processed.'
      },
      error: {
        title: 'Error',
        message: 'An error occurred during the purchase.'
      },
      restoreSuccess: {
        title: 'Restoration successful',
        message: 'Your purchases have been restored successfully!'
      },
      restoreError: {
        title: 'Restoration error',
        message: 'Unable to restore your purchases.'
      },
      termsError: {
        title: 'Error',
        message: 'Unable to open terms of use.'
      }
    },
    footer: {
      restore: 'Restore purchases',
      terms: 'Terms of use'
    }
  },
  fr: {
    features: {
      unlimited: 'Accès illimité à tous les modes',
      weekly: 'Nouvelles cartes chaque semaine',
      visuals: 'Ambiances visuelles exclusives',
      characters: 'Personnalisation des personnages',
      updates: 'Mises à jour prioritaires'
    },
    plans: {
      weekly: {
        title: 'Essai Gratuit',
        badge: 'GRATUIT',
        period: '7 jours',
        description: 'Testez toutes les fonctionnalités'
      },
      monthly: {
        title: 'Mensuel',
        badge: 'POPULAIRE',
        period: 'par mois',
        description: 'Accès complet à tout'
      },
      annual: {
        title: 'Annuel',
        badge: 'MEILLEUR PRIX',
        period: 'par an',
        description: 'Économisez plus de 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: '7 JOURS',
    cta: 'COMMENCER L\'ESSAI',
    annual: {
      title: '🔥 OFFRE LIMITÉE 🔥',
      subtitle: 'ÉCONOMISEZ PLUS DE 50%',
      tagline: 'Ne ratez pas cette opportunité unique !',
      features: {
        savings: 'Économisez plus de 30€ par an'
      },
      discount: 'de réduction',
      savings: 'Économisez {amount} {currency}',
      cta: 'PROFITER DE L\'OFFRE'
    },
    alerts: {
      productUnavailable: {
        title: 'Produit indisponible',
        message: 'Ce produit n\'est pas disponible pour le moment.'
      },
      success: {
        title: 'Félicitations !',
        message: 'Votre abonnement a été activé avec succès !'
      },
      pending: {
        title: 'En attente',
        message: 'Votre achat est en cours de traitement.'
      },
      error: {
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'achat.'
      },
      restoreSuccess: {
        title: 'Restauration réussie',
        message: 'Vos achats ont été restaurés avec succès !'
      },
      restoreError: {
        title: 'Erreur de restauration',
        message: 'Impossible de restaurer vos achats.'
      },
      termsError: {
        title: 'Erreur',
        message: 'Impossible d\'ouvrir les conditions d\'utilisation.'
      }
    },
    footer: {
      restore: 'Restaurer les achats',
      terms: 'Conditions d\'utilisation'
    }
  }
};

function updatePaywallTranslations() {
  Object.keys(translations).forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.ts`);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Trouver la section paywall existante
      const paywallStart = content.indexOf('  paywall: {');
      const paywallEnd = content.indexOf('  },', paywallStart) + 4;
      
      if (paywallStart !== -1 && paywallEnd !== -1) {
        // Remplacer la section paywall
        const beforePaywall = content.substring(0, paywallStart);
        const afterPaywall = content.substring(paywallEnd);
        
        // Construire la nouvelle section paywall
        const newPaywallSection = `  paywall: {
    title: "🎃 Nightly Premium 🎃",
    subtitle: "HALLOWEEN SPECIAL",
    tagline: "PLAY WITHOUT LIMITS IN THE DARKNESS",
    features: {
      unlimited: "${translations[lang].features.unlimited}",
      weekly: "${translations[lang].features.weekly}",
      visuals: "${translations[lang].features.visuals}",
      characters: "${translations[lang].features.characters}",
      updates: "${translations[lang].features.updates}"
    },
    // Paywall A (Plans courts)
    plans: {
      weekly: {
        title: "${translations[lang].plans.weekly.title}",
        badge: "${translations[lang].plans.weekly.badge}",
        period: "${translations[lang].plans.weekly.period}",
        description: "${translations[lang].plans.weekly.description}"
      },
      monthly: {
        title: "${translations[lang].plans.monthly.title}",
        badge: "${translations[lang].plans.monthly.badge}",
        period: "${translations[lang].plans.monthly.period}",
        description: "${translations[lang].plans.monthly.description}"
      },
      annual: {
        title: "${translations[lang].plans.annual.title}",
        badge: "${translations[lang].plans.annual.badge}",
        period: "${translations[lang].plans.annual.period}",
        description: "${translations[lang].plans.annual.description}"
      }
    },
    prices: {
      weekly: "${translations[lang].prices.weekly}",
      monthly: "${translations[lang].prices.monthly}",
      annual: "${translations[lang].prices.annual}",
      currency: "${translations[lang].prices.currency}"
    },
    freeTrial: "${translations[lang].freeTrial}",
    cta: "${translations[lang].cta}",
    // Paywall B (Plan annuel avec réduction)
    annual: {
      title: "${translations[lang].annual.title}",
      subtitle: "${translations[lang].annual.subtitle}",
      tagline: "${translations[lang].annual.tagline}",
      features: {
        savings: "${translations[lang].annual.features.savings}"
      },
      discount: "${translations[lang].annual.discount}",
      savings: "${translations[lang].annual.savings}",
      cta: "${translations[lang].annual.cta}"
    },
    alerts: {
      productUnavailable: {
        title: "${translations[lang].alerts.productUnavailable.title}",
        message: "${translations[lang].alerts.productUnavailable.message}"
      },
      success: {
        title: "${translations[lang].alerts.success.title}",
        message: "${translations[lang].alerts.success.message}"
      },
      pending: {
        title: "${translations[lang].alerts.pending.title}",
        message: "${translations[lang].alerts.pending.message}"
      },
      error: {
        title: "${translations[lang].alerts.error.title}",
        message: "${translations[lang].alerts.error.message}"
      },
      restoreSuccess: {
        title: "${translations[lang].alerts.restoreSuccess.title}",
        message: "${translations[lang].alerts.restoreSuccess.message}"
      },
      restoreError: {
        title: "${translations[lang].alerts.restoreError.title}",
        message: "${translations[lang].alerts.restoreError.message}"
      },
      termsError: {
        title: "${translations[lang].alerts.termsError.title}",
        message: "${translations[lang].alerts.termsError.message}"
      }
    },
    footer: {
      restore: "${translations[lang].footer.restore}",
      terms: "${translations[lang].footer.terms}"
    }
  },`;
        
        content = beforePaywall + newPaywallSection + afterPaywall;
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${lang}.ts`);
      } else {
        console.log(`❌ Could not find paywall section in ${lang}.ts`);
      }
    } else {
      console.log(`❌ File ${lang}.ts not found`);
    }
  });
}

updatePaywallTranslations();
