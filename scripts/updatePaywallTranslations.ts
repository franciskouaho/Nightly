import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.join(__dirname, '../app/i18n/locales');

const translations = {
  en: {
    // Paywall A (Short-term plans)
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
    // Paywall B (Annual plan with discount)
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
    // Paywall A (Plans courts)
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
    // Paywall B (Plan annuel avec réduction)
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
  },
  es: {
    // Paywall A (Planes cortos)
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
    // Paywall B (Plan anual con descuento)
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
  },
  de: {
    // Paywall A (Kurzzeitpläne)
    plans: {
      weekly: {
        title: 'Kostenlose Testversion',
        badge: 'KOSTENLOS',
        period: '7 Tage',
        description: 'Alle Funktionen testen'
      },
      monthly: {
        title: 'Monatlich',
        badge: 'BELIEBT',
        period: 'pro Monat',
        description: 'Vollzugang zu allem'
      },
      annual: {
        title: 'Jährlich',
        badge: 'BESTER PREIS',
        period: 'pro Jahr',
        description: 'Sparen Sie mehr als 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: '7 TAGE',
    cta: 'TEST STARTEN',
    // Paywall B (Jahresplan mit Rabatt)
    annual: {
      title: '🔥 LIMITIERTES ANGEBOT 🔥',
      subtitle: 'SPAREN SIE MEHR ALS 50%',
      tagline: 'Verpassen Sie nicht diese einzigartige Gelegenheit!',
      features: {
        savings: 'Sparen Sie mehr als 30€ pro Jahr'
      },
      discount: 'Rabatt',
      savings: 'Sparen Sie {amount} {currency}',
      cta: 'ANGEBOT NUTZEN'
    },
    alerts: {
      productUnavailable: {
        title: 'Produkt nicht verfügbar',
        message: 'Dieses Produkt ist derzeit nicht verfügbar.'
      },
      success: {
        title: 'Herzlichen Glückwunsch!',
        message: 'Ihr Abonnement wurde erfolgreich aktiviert!'
      },
      pending: {
        title: 'Ausstehend',
        message: 'Ihr Kauf wird bearbeitet.'
      },
      error: {
        title: 'Fehler',
        message: 'Ein Fehler ist beim Kauf aufgetreten.'
      },
      restoreSuccess: {
        title: 'Wiederherstellung erfolgreich',
        message: 'Ihre Käufe wurden erfolgreich wiederhergestellt!'
      },
      restoreError: {
        title: 'Wiederherstellungsfehler',
        message: 'Käufe konnten nicht wiederhergestellt werden.'
      },
      termsError: {
        title: 'Fehler',
        message: 'Nutzungsbedingungen können nicht geöffnet werden.'
      }
    },
    footer: {
      restore: 'Käufe wiederherstellen',
      terms: 'Nutzungsbedingungen'
    }
  },
  it: {
    // Paywall A (Piani a breve termine)
    plans: {
      weekly: {
        title: 'Prova Gratuita',
        badge: 'GRATIS',
        period: '7 giorni',
        description: 'Prova tutte le funzionalità'
      },
      monthly: {
        title: 'Mensile',
        badge: 'POPOLARE',
        period: 'al mese',
        description: 'Accesso completo a tutto'
      },
      annual: {
        title: 'Annuale',
        badge: 'MIGLIOR PREZZO',
        period: 'all\'anno',
        description: 'Risparmia più del 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: '7 GIORNI',
    cta: 'INIZIA PROVA',
    // Paywall B (Piano annuale con sconto)
    annual: {
      title: '🔥 OFFERTA LIMITATA 🔥',
      subtitle: 'RISPARMIA PIÙ DEL 50%',
      tagline: 'Non perdere questa opportunità unica!',
      features: {
        savings: 'Risparmia più di 30€ all\'anno'
      },
      discount: 'di sconto',
      savings: 'Risparmia {amount} {currency}',
      cta: 'APPROFITTA DELL\'OFFERTA'
    },
    alerts: {
      productUnavailable: {
        title: 'Prodotto non disponibile',
        message: 'Questo prodotto non è disponibile al momento.'
      },
      success: {
        title: 'Congratulazioni!',
        message: 'Il tuo abbonamento è stato attivato con successo!'
      },
      pending: {
        title: 'In sospeso',
        message: 'Il tuo acquisto è in fase di elaborazione.'
      },
      error: {
        title: 'Errore',
        message: 'Si è verificato un errore durante l\'acquisto.'
      },
      restoreSuccess: {
        title: 'Ripristino riuscito',
        message: 'I tuoi acquisti sono stati ripristinati con successo!'
      },
      restoreError: {
        title: 'Errore di ripristino',
        message: 'Impossibile ripristinare i tuoi acquisti.'
      },
      termsError: {
        title: 'Errore',
        message: 'Impossibile aprire i termini di utilizzo.'
      }
    },
    footer: {
      restore: 'Ripristina acquisti',
      terms: 'Termini di utilizzo'
    }
  },
  pt: {
    // Paywall A (Planos de curto prazo)
    plans: {
      weekly: {
        title: 'Teste Grátis',
        badge: 'GRÁTIS',
        period: '7 dias',
        description: 'Teste todos os recursos'
      },
      monthly: {
        title: 'Mensal',
        badge: 'POPULAR',
        period: 'por mês',
        description: 'Acesso completo a tudo'
      },
      annual: {
        title: 'Anual',
        badge: 'MELHOR PREÇO',
        period: 'por ano',
        description: 'Economize mais de 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: 'R$'
    },
    freeTrial: '7 DIAS',
    cta: 'INICIAR TESTE',
    // Paywall B (Plano anual com desconto)
    annual: {
      title: '🔥 OFERTA LIMITADA 🔥',
      subtitle: 'ECONOMIZE MAIS DE 50%',
      tagline: 'Não perca esta oportunidade única!',
      features: {
        savings: 'Economize mais de R$ 30 por ano'
      },
      discount: 'de desconto',
      savings: 'Economize {amount} {currency}',
      cta: 'APROVEITAR A OFERTA'
    },
    alerts: {
      productUnavailable: {
        title: 'Produto indisponível',
        message: 'Este produto não está disponível no momento.'
      },
      success: {
        title: 'Parabéns!',
        message: 'Sua assinatura foi ativada com sucesso!'
      },
      pending: {
        title: 'Pendente',
        message: 'Sua compra está sendo processada.'
      },
      error: {
        title: 'Erro',
        message: 'Ocorreu um erro durante a compra.'
      },
      restoreSuccess: {
        title: 'Restauração bem-sucedida',
        message: 'Suas compras foram restauradas com sucesso!'
      },
      restoreError: {
        title: 'Erro de restauração',
        message: 'Não foi possível restaurar suas compras.'
      },
      termsError: {
        title: 'Erro',
        message: 'Não foi possível abrir os termos de uso.'
      }
    },
    footer: {
      restore: 'Restaurar compras',
      terms: 'Termos de uso'
    }
  },
  ar: {
    // Paywall A (خطط قصيرة المدى)
    plans: {
      weekly: {
        title: 'تجربة مجانية',
        badge: 'مجاني',
        period: '7 أيام',
        description: 'اختبر جميع الميزات'
      },
      monthly: {
        title: 'شهري',
        badge: 'شائع',
        period: 'شهرياً',
        description: 'وصول كامل لكل شيء'
      },
      annual: {
        title: 'سنوي',
        badge: 'أفضل سعر',
        period: 'سنوياً',
        description: 'وفر أكثر من 50%'
      }
    },
    prices: {
      weekly: '0',
      monthly: '4.99',
      annual: '29.99',
      currency: 'د.إ'
    },
    freeTrial: '7 أيام',
    cta: 'بدء التجربة',
    // Paywall B (خطة سنوية مع خصم)
    annual: {
      title: '🔥 عرض محدود 🔥',
      subtitle: 'وفر أكثر من 50%',
      tagline: 'لا تفوت هذه الفرصة الفريدة!',
      features: {
        savings: 'وفر أكثر من 30 د.إ سنوياً'
      },
      discount: 'خصم',
      savings: 'وفر {amount} {currency}',
      cta: 'استفد من العرض'
    },
    alerts: {
      productUnavailable: {
        title: 'المنتج غير متوفر',
        message: 'هذا المنتج غير متوفر في الوقت الحالي.'
      },
      success: {
        title: 'تهانينا!',
        message: 'تم تفعيل اشتراكك بنجاح!'
      },
      pending: {
        title: 'قيد الانتظار',
        message: 'يتم معالجة عملية الشراء الخاصة بك.'
      },
      error: {
        title: 'خطأ',
        message: 'حدث خطأ أثناء عملية الشراء.'
      },
      restoreSuccess: {
        title: 'استعادة ناجحة',
        message: 'تم استعادة مشترياتك بنجاح!'
      },
      restoreError: {
        title: 'خطأ في الاستعادة',
        message: 'لا يمكن استعادة مشترياتك.'
      },
      termsError: {
        title: 'خطأ',
        message: 'لا يمكن فتح شروط الاستخدام.'
      }
    },
    footer: {
      restore: 'استعادة المشتريات',
      terms: 'شروط الاستخدام'
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
    title: "${lang === 'en' ? '🎃 Nightly Premium 🎃' : '🎃 Nightly Premium 🎃'}",
    subtitle: "${lang === 'en' ? 'HALLOWEEN SPECIAL' : 'HALLOWEEN SPECIAL'}",
    tagline: "${lang === 'en' ? 'PLAY WITHOUT LIMITS IN THE DARKNESS' : 'PLAY WITHOUT LIMITS IN THE DARKNESS'}",
    features: {
      unlimited: "${translations[lang].features?.unlimited || 'Unlimited access to all modes'}",
      weekly: "${translations[lang].features?.weekly || 'New cards every week'}",
      visuals: "${translations[lang].features?.visuals || 'Exclusive visual themes'}",
      characters: "${translations[lang].features?.characters || 'Character customization'}",
      updates: "${translations[lang].features?.updates || 'Priority updates'}"
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
