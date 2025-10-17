const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../app/i18n/locales');

// Traductions manquantes pour chaque langue
const missingTranslations = {
  es: {
    features: {
      unlimited: 'Acceso ilimitado a todos los modos',
      weekly: 'Nuevas cartas cada semana',
      visuals: 'Temas visuales exclusivos',
      characters: 'Personalización de personajes',
      updates: 'Actualizaciones prioritarias'
    },
    plans: {
      weekly: {
        title: 'Prueba Gratuita',
        badge: 'GRATIS',
        period: '7 días',
        description: 'Prueba todas las funciones'
      },
      monthly: {
        title: 'Mensual',
        badge: 'POPULAR',
        period: 'por mes',
        description: 'Acceso completo a todo'
      },
      annual: {
        title: 'Anual',
        badge: 'MEJOR PRECIO',
        period: 'por año',
        description: 'Ahorra más del 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: '7 DÍAS',
    cta: 'COMENZAR PRUEBA',
    annual: {
      title: '🔥 OFERTA LIMITADA 🔥',
      subtitle: 'AHORRA MÁS DEL 50%',
      tagline: '¡No te pierdas esta oportunidad única!',
      features: {
        savings: 'Ahorra más de 30€ por año'
      },
      discount: 'de descuento',
      savings: 'Ahorra {amount} {currency}',
      cta: 'APROVECHAR LA OFERTA'
    },
    alerts: {
      productUnavailable: {
        title: 'Producto no disponible',
        message: 'Este producto no está disponible en este momento.'
      },
      success: {
        title: '¡Felicidades!',
        message: '¡Tu suscripción ha sido activada con éxito!'
      },
      pending: {
        title: 'Pendiente',
        message: 'Tu compra está siendo procesada.'
      },
      error: {
        title: 'Error',
        message: 'Ocurrió un error durante la compra.'
      },
      restoreSuccess: {
        title: 'Restauración exitosa',
        message: '¡Tus compras han sido restauradas con éxito!'
      },
      restoreError: {
        title: 'Error de restauración',
        message: 'No se pudieron restaurar tus compras.'
      },
      termsError: {
        title: 'Error',
        message: 'No se pueden abrir los términos de uso.'
      }
    },
    footer: {
      restore: 'Restaurar compras',
      terms: 'Términos de uso'
    }
  }
};

function addMissingTranslations() {
  Object.keys(missingTranslations).forEach(lang => {
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
    tagline: "JUEGA SIN LÍMITES EN LA OSCURIDAD",
    features: {
      unlimited: "${missingTranslations[lang].features.unlimited}",
      weekly: "${missingTranslations[lang].features.weekly}",
      visuals: "${missingTranslations[lang].features.visuals}",
      characters: "${missingTranslations[lang].features.characters}",
      updates: "${missingTranslations[lang].features.updates}"
    },
    // Paywall A (Planes cortos)
    plans: {
      weekly: {
        title: "${missingTranslations[lang].plans.weekly.title}",
        badge: "${missingTranslations[lang].plans.weekly.badge}",
        period: "${missingTranslations[lang].plans.weekly.period}",
        description: "${missingTranslations[lang].plans.weekly.description}"
      },
      monthly: {
        title: "${missingTranslations[lang].plans.monthly.title}",
        badge: "${missingTranslations[lang].plans.monthly.badge}",
        period: "${missingTranslations[lang].plans.monthly.period}",
        description: "${missingTranslations[lang].plans.monthly.description}"
      },
      annual: {
        title: "${missingTranslations[lang].plans.annual.title}",
        badge: "${missingTranslations[lang].plans.annual.badge}",
        period: "${missingTranslations[lang].plans.annual.period}",
        description: "${missingTranslations[lang].plans.annual.description}"
      }
    },
    prices: {
      weekly: "${missingTranslations[lang].prices.weekly}",
      monthly: "${missingTranslations[lang].prices.monthly}",
      annual: "${missingTranslations[lang].prices.annual}",
      currency: "${missingTranslations[lang].prices.currency}"
    },
    freeTrial: "${missingTranslations[lang].freeTrial}",
    cta: "${missingTranslations[lang].cta}",
    // Paywall B (Plan anual con descuento)
    annual: {
      title: "${missingTranslations[lang].annual.title}",
      subtitle: "${missingTranslations[lang].annual.subtitle}",
      tagline: "${missingTranslations[lang].annual.tagline}",
      features: {
        savings: "${missingTranslations[lang].annual.features.savings}"
      },
      discount: "${missingTranslations[lang].annual.discount}",
      savings: "${missingTranslations[lang].annual.savings}",
      cta: "${missingTranslations[lang].annual.cta}"
    },
    alerts: {
      productUnavailable: {
        title: "${missingTranslations[lang].alerts.productUnavailable.title}",
        message: "${missingTranslations[lang].alerts.productUnavailable.message}"
      },
      success: {
        title: "${missingTranslations[lang].alerts.success.title}",
        message: "${missingTranslations[lang].alerts.success.message}"
      },
      pending: {
        title: "${missingTranslations[lang].alerts.pending.title}",
        message: "${missingTranslations[lang].alerts.pending.message}"
      },
      error: {
        title: "${missingTranslations[lang].alerts.error.title}",
        message: "${missingTranslations[lang].alerts.error.message}"
      },
      restoreSuccess: {
        title: "${missingTranslations[lang].alerts.restoreSuccess.title}",
        message: "${missingTranslations[lang].alerts.restoreSuccess.message}"
      },
      restoreError: {
        title: "${missingTranslations[lang].alerts.restoreError.title}",
        message: "${missingTranslations[lang].alerts.restoreError.message}"
      },
      termsError: {
        title: "${missingTranslations[lang].alerts.termsError.title}",
        message: "${missingTranslations[lang].alerts.termsError.message}"
      }
    },
    footer: {
      restore: "${missingTranslations[lang].footer.restore}",
      terms: "${missingTranslations[lang].footer.terms}"
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

addMissingTranslations();
