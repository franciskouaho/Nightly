import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

//node scripts/uploadQuestionsToFirebase.js

const questions = {
  'word-guessing': {
  translations: {
    fr: [
      // LIEUX
      {
        type: "lieux",
        question: "plage",
        answer: "plage",
        traps: ["sable", "soleil", "mer"]
      },
      {
        type: "lieux",
        question: "école",
        answer: "école",
        traps: ["classe", "élève", "professeur"]
      },
      {
        type: "lieux",
        question: "hôpital",
        answer: "hôpital",
        traps: ["médecin", "malade", "soigner"]
      },
      {
        type: "lieux",
        question: "restaurant",
        answer: "restaurant",
        traps: ["manger", "serveur", "menu"]
      },
      {
        type: "lieux",
        question: "bibliothèque",
        answer: "bibliothèque",
        traps: ["livre", "silence", "lire"]
      },
      {
        type: "lieux",
        question: "parc",
        answer: "parc",
        traps: ["arbre", "banc", "jouer"]
      },
      // ALIMENTS
      {
        type: "aliments",
        question: "pizza",
        answer: "pizza",
        traps: ["fromage", "tomate", "mozzarella"]
      },
      {
        type: "aliments",
        question: "chocolat",
        answer: "chocolat",
        traps: ["cacao", "sucré", "tablette"]
      },
      {
        type: "aliments",
        question: "pomme",
        answer: "pomme",
        traps: ["rouge", "fruit", "croquer"]
      },
      {
        type: "aliments",
        question: "pain",
        answer: "pain",
        traps: ["boulangerie", "mie", "croûte"]
      },
      {
        type: "aliments",
        question: "gâteau",
        answer: "gâteau",
        traps: ["anniversaire", "bougie", "dessert"]
      },
      {
        type: "aliments",
        question: "fromage",
        answer: "fromage",
        traps: ["lait", "jaune", "souris"]
      },
      // OBJETS
      {
        type: "objets",
        question: "téléphone",
        answer: "téléphone",
        traps: ["appel", "portable", "smartphone"]
      },
      {
        type: "objets",
        question: "voiture",
        answer: "voiture",
        traps: ["rouler", "essence", "volant"]
      },
      {
        type: "objets",
        question: "ordinateur",
        answer: "ordinateur",
        traps: ["écran", "clavier", "souris"]
      },
      {
        type: "objets",
        question: "livre",
        answer: "livre",
        traps: ["page", "histoire", "lire"]
      },
      {
        type: "objets",
        question: "chaussure",
        answer: "chaussure",
        traps: ["pied", "marcher", "lacet"]
      },
      {
        type: "objets",
        question: "montre",
        answer: "montre",
        traps: ["temps", "heure", "poignet"]
      },
      // ANIMAUX
      {
        type: "animaux",
        question: "chat",
        answer: "chat",
        traps: ["miaou", "ronron", "griffes"]
      },
      {
        type: "animaux",
        question: "chien",
        answer: "chien",
        traps: ["aboyer", "fidèle", "queue"]
      },
      {
        type: "animaux",
        question: "éléphant",
        answer: "éléphant",
        traps: ["trompe", "gris", "grand"]
      },
      {
        type: "animaux",
        question: "oiseau",
        answer: "oiseau",
        traps: ["voler", "aile", "chanter"]
      },
      {
        type: "animaux",
        question: "poisson",
        answer: "poisson",
        traps: ["nager", "eau", "écaille"]
      },
      // AUTRES
      {
        type: "nature",
        question: "soleil",
        answer: "soleil",
        traps: ["jaune", "chaud", "jour"]
      },
      {
        type: "nature",
        question: "fleur",
        answer: "fleur",
        traps: ["jardin", "parfum", "couleur"]
      }
    ],
    
    en: [
      // PLACES
      {
        type: "places",
        question: "beach",
        answer: "beach",
        traps: ["sand", "sun", "sea"]
      },
      {
        type: "places",
        question: "school",
        answer: "school",
        traps: ["student", "teacher", "classroom"]
      },
      {
        type: "places",
        question: "hospital",
        answer: "hospital",
        traps: ["doctor", "sick", "nurse"]
      },
      {
        type: "places",
        question: "restaurant",
        answer: "restaurant",
        traps: ["food", "waiter", "menu"]
      },
      {
        type: "places",
        question: "library",
        answer: "library",
        traps: ["book", "quiet", "read"]
      },
      {
        type: "places",
        question: "park",
        answer: "park",
        traps: ["tree", "bench", "play"]
      },
      // FOOD
      {
        type: "food",
        question: "pizza",
        answer: "pizza",
        traps: ["cheese", "tomato", "slice"]
      },
      {
        type: "food",
        question: "chocolate",
        answer: "chocolate",
        traps: ["sweet", "brown", "cocoa"]
      },
      {
        type: "food",
        question: "apple",
        answer: "apple",
        traps: ["red", "fruit", "bite"]
      },
      {
        type: "food",
        question: "bread",
        answer: "bread",
        traps: ["bakery", "slice", "wheat"]
      },
      {
        type: "food",
        question: "cake",
        answer: "cake",
        traps: ["birthday", "candle", "sweet"]
      },
      {
        type: "food",
        question: "cheese",
        answer: "cheese",
        traps: ["milk", "yellow", "mouse"]
      },
      // OBJECTS
      {
        type: "objects",
        question: "phone",
        answer: "phone",
        traps: ["call", "mobile", "ring"]
      },
      {
        type: "objects",
        question: "car",
        answer: "car",
        traps: ["drive", "wheel", "engine"]
      },
      {
        type: "objects",
        question: "computer",
        answer: "computer",
        traps: ["screen", "keyboard", "mouse"]
      },
      {
        type: "objects",
        question: "book",
        answer: "book",
        traps: ["page", "story", "read"]
      },
      {
        type: "objects",
        question: "shoe",
        answer: "shoe",
        traps: ["foot", "walk", "lace"]
      },
      {
        type: "objects",
        question: "watch",
        answer: "watch",
        traps: ["time", "wrist", "hour"]
      },
      // ANIMALS
      {
        type: "animals",
        question: "cat",
        answer: "cat",
        traps: ["meow", "purr", "claw"]
      },
      {
        type: "animals",
        question: "dog",
        answer: "dog",
        traps: ["bark", "loyal", "tail"]
      },
      {
        type: "animals",
        question: "elephant",
        answer: "elephant",
        traps: ["trunk", "gray", "big"]
      },
      {
        type: "animals",
        question: "bird",
        answer: "bird",
        traps: ["fly", "wing", "sing"]
      },
      {
        type: "animals",
        question: "fish",
        answer: "fish",
        traps: ["swim", "water", "scale"]
      },
      // NATURE
      {
        type: "nature",
        question: "sun",
        answer: "sun",
        traps: ["yellow", "hot", "day"]
      },
      {
        type: "nature",
        question: "flower",
        answer: "flower",
        traps: ["garden", "smell", "color"]
      }
    ],
    
    es: [
      // LUGARES
      {
        type: "lugares",
        question: "playa",
        answer: "playa",
        traps: ["arena", "sol", "mar"]
      },
      {
        type: "lugares",
        question: "escuela",
        answer: "escuela",
        traps: ["estudiante", "maestro", "clase"]
      },
      {
        type: "lugares",
        question: "hospital",
        answer: "hospital",
        traps: ["médico", "enfermo", "curar"]
      },
      {
        type: "lugares",
        question: "restaurante",
        answer: "restaurante",
        traps: ["comer", "camarero", "menú"]
      },
      {
        type: "lugares",
        question: "biblioteca",
        answer: "biblioteca",
        traps: ["libro", "silencio", "leer"]
      },
      {
        type: "lugares",
        question: "parque",
        answer: "parque",
        traps: ["árbol", "banco", "jugar"]
      },
      // COMIDA
      {
        type: "comida",
        question: "pizza",
        answer: "pizza",
        traps: ["queso", "tomate", "masa"]
      },
      {
        type: "comida",
        question: "chocolate",
        answer: "chocolate",
        traps: ["dulce", "cacao", "marrón"]
      },
      {
        type: "comida",
        question: "manzana",
        answer: "manzana",
        traps: ["roja", "fruta", "morder"]
      },
      {
        type: "comida",
        question: "pan",
        answer: "pan",
        traps: ["panadería", "rebanada", "trigo"]
      },
      {
        type: "comida",
        question: "pastel",
        answer: "pastel",
        traps: ["cumpleaños", "vela", "dulce"]
      },
      {
        type: "comida",
        question: "queso",
        answer: "queso",
        traps: ["leche", "amarillo", "ratón"]
      },
      // OBJETOS
      {
        type: "objetos",
        question: "teléfono",
        answer: "teléfono",
        traps: ["llamar", "móvil", "sonar"]
      },
      {
        type: "objetos",
        question: "coche",
        answer: "coche",
        traps: ["conducir", "rueda", "motor"]
      },
      {
        type: "objetos",
        question: "computadora",
        answer: "computadora",
        traps: ["pantalla", "teclado", "ratón"]
      },
      {
        type: "objetos",
        question: "libro",
        answer: "libro",
        traps: ["página", "historia", "leer"]
      },
      {
        type: "objetos",
        question: "zapato",
        answer: "zapato",
        traps: ["pie", "caminar", "cordón"]
      },
      {
        type: "objetos",
        question: "reloj",
        answer: "reloj",
        traps: ["tiempo", "muñeca", "hora"]
      },
      // ANIMALES
      {
        type: "animales",
        question: "gato",
        answer: "gato",
        traps: ["miau", "ronroneo", "garra"]
      },
      {
        type: "animales",
        question: "perro",
        answer: "perro",
        traps: ["ladrar", "fiel", "cola"]
      },
      {
        type: "animales",
        question: "elefante",
        answer: "elefante",
        traps: ["trompa", "gris", "grande"]
      },
      {
        type: "animales",
        question: "pájaro",
        answer: "pájaro",
        traps: ["volar", "ala", "cantar"]
      },
      {
        type: "animales",
        question: "pez",
        answer: "pez",
        traps: ["nadar", "agua", "escama"]
      },
      // NATURALEZA
      {
        type: "naturaleza",
        question: "sol",
        answer: "sol",
        traps: ["amarillo", "calor", "día"]
      },
      {
        type: "naturaleza",
        question: "flor",
        answer: "flor",
        traps: ["jardín", "olor", "color"]
      }
    ],
    
    de: [
      // ORTE
      {
        type: "orte",
        question: "strand",
        answer: "strand",
        traps: ["sand", "sonne", "meer"]
      },
      {
        type: "orte",
        question: "schule",
        answer: "schule",
        traps: ["schüler", "lehrer", "klasse"]
      },
      {
        type: "orte",
        question: "krankenhaus",
        answer: "krankenhaus",
        traps: ["arzt", "krank", "heilen"]
      },
      {
        type: "orte",
        question: "restaurant",
        answer: "restaurant",
        traps: ["essen", "kellner", "karte"]
      },
      {
        type: "orte",
        question: "bibliothek",
        answer: "bibliothek",
        traps: ["buch", "ruhe", "lesen"]
      },
      {
        type: "orte",
        question: "park",
        answer: "park",
        traps: ["baum", "bank", "spielen"]
      },
      // ESSEN
      {
        type: "essen",
        question: "pizza",
        answer: "pizza",
        traps: ["käse", "tomate", "teig"]
      },
      {
        type: "essen",
        question: "schokolade",
        answer: "schokolade",
        traps: ["süß", "kakao", "braun"]
      },
      {
        type: "essen",
        question: "apfel",
        answer: "apfel",
        traps: ["rot", "obst", "beißen"]
      },
      {
        type: "essen",
        question: "brot",
        answer: "brot",
        traps: ["bäckerei", "scheibe", "weizen"]
      },
      {
        type: "essen",
        question: "kuchen",
        answer: "kuchen",
        traps: ["geburtstag", "kerze", "süß"]
      },
      {
        type: "essen",
        question: "käse",
        answer: "käse",
        traps: ["milch", "gelb", "maus"]
      },
      // OBJEKTE
      {
        type: "objekte",
        question: "telefon",
        answer: "telefon",
        traps: ["anrufen", "handy", "klingeln"]
      },
      {
        type: "objekte",
        question: "auto",
        answer: "auto",
        traps: ["fahren", "rad", "motor"]
      },
      {
        type: "objekte",
        question: "computer",
        answer: "computer",
        traps: ["bildschirm", "tastatur", "maus"]
      },
      {
        type: "objekte",
        question: "buch",
        answer: "buch",
        traps: ["seite", "geschichte", "lesen"]
      },
      {
        type: "objekte",
        question: "schuh",
        answer: "schuh",
        traps: ["fuß", "gehen", "schnürsenkel"]
      },
      {
        type: "objekte",
        question: "uhr",
        answer: "uhr",
        traps: ["zeit", "handgelenk", "stunde"]
      },
      // TIERE
      {
        type: "tiere",
        question: "katze",
        answer: "katze",
        traps: ["miau", "schnurren", "kralle"]
      },
      {
        type: "tiere",
        question: "hund",
        answer: "hund",
        traps: ["bellen", "treu", "schwanz"]
      },
      {
        type: "tiere",
        question: "elefant",
        answer: "elefant",
        traps: ["rüssel", "grau", "groß"]
      },
      {
        type: "tiere",
        question: "vogel",
        answer: "vogel",
        traps: ["fliegen", "flügel", "singen"]
      },
      {
        type: "tiere",
        question: "fisch",
        answer: "fisch",
        traps: ["schwimmen", "wasser", "schuppe"]
      },
      // NATUR
      {
        type: "natur",
        question: "sonne",
        answer: "sonne",
        traps: ["gelb", "heiß", "tag"]
      },
      {
        type: "natur",
        question: "blume",
        answer: "blume",
        traps: ["garten", "duft", "farbe"]
      }
    ],
    
    it: [
      // LUOGHI
      {
        type: "luoghi",
        question: "spiaggia",
        answer: "spiaggia",
        traps: ["sabbia", "sole", "mare"]
      },
      {
        type: "luoghi",
        question: "scuola",
        answer: "scuola",
        traps: ["studente", "insegnante", "classe"]
      },
      {
        type: "luoghi",
        question: "ospedale",
        answer: "ospedale",
        traps: ["dottore", "malato", "curare"]
      },
      {
        type: "luoghi",
        question: "ristorante",
        answer: "ristorante",
        traps: ["mangiare", "cameriere", "menù"]
      },
      {
        type: "luoghi",
        question: "biblioteca",
        answer: "biblioteca",
        traps: ["libro", "silenzio", "leggere"]
      },
      {
        type: "luoghi",
        question: "parco",
        answer: "parco",
        traps: ["albero", "panchina", "giocare"]
      },
      // CIBO
      {
        type: "cibo",
        question: "pizza",
        answer: "pizza",
        traps: ["formaggio", "pomodoro", "pasta"]
      },
      {
        type: "cibo",
        question: "cioccolato",
        answer: "cioccolato",
        traps: ["dolce", "cacao", "marrone"]
      },
      {
        type: "cibo",
        question: "mela",
        answer: "mela",
        traps: ["rossa", "frutta", "mordere"]
      },
      {
        type: "cibo",
        question: "pane",
        answer: "pane",
        traps: ["panetteria", "fetta", "grano"]
      },
      {
        type: "cibo",
        question: "torta",
        answer: "torta",
        traps: ["compleanno", "candela", "dolce"]
      },
      {
        type: "cibo",
        question: "formaggio",
        answer: "formaggio",
        traps: ["latte", "giallo", "topo"]
      },
      // OGGETTI
      {
        type: "oggetti",
        question: "telefono",
        answer: "telefono",
        traps: ["chiamare", "cellulare", "suonare"]
      },
      {
        type: "oggetti",
        question: "macchina",
        answer: "macchina",
        traps: ["guidare", "ruota", "motore"]
      },
      {
        type: "oggetti",
        question: "computer",
        answer: "computer",
        traps: ["schermo", "tastiera", "mouse"]
      },
      {
        type: "oggetti",
        question: "libro",
        answer: "libro",
        traps: ["pagina", "storia", "leggere"]
      },
      {
        type: "oggetti",
        question: "scarpa",
        answer: "scarpa",
        traps: ["piede", "camminare", "laccio"]
      },
      {
        type: "oggetti",
        question: "orologio",
        answer: "orologio",
        traps: ["tempo", "polso", "ora"]
      },
      // ANIMALI
      {
        type: "animali",
        question: "gatto",
        answer: "gatto",
        traps: ["miao", "fusa", "artiglio"]
      },
      {
        type: "animali",
        question: "cane",
        answer: "cane",
        traps: ["abbaiare", "fedele", "coda"]
      },
      {
        type: "animali",
        question: "elefante",
        answer: "elefante",
        traps: ["proboscide", "grigio", "grande"]
      },
      {
        type: "animali",
        question: "uccello",
        answer: "uccello",
        traps: ["volare", "ala", "cantare"]
      },
      {
        type: "animali",
        question: "pesce",
        answer: "pesce",
        traps: ["nuotare", "acqua", "squama"]
      },
      // NATURA
      {
        type: "natura",
        question: "sole",
        answer: "sole",
        traps: ["giallo", "caldo", "giorno"]
      },
      {
        type: "natura",
        question: "fiore",
        answer: "fiore",
        traps: ["giardino", "profumo", "colore"]
      }
    ],
    
    pt: [
      // LUGARES
      {
        type: "lugares",
        question: "praia",
        answer: "praia",
        traps: ["areia", "sol", "mar"]
      },
      {
        type: "lugares",
        question: "escola",
        answer: "escola",
        traps: ["estudante", "professor", "sala"]
      },
      {
        type: "lugares",
        question: "hospital",
        answer: "hospital",
        traps: ["médico", "doente", "curar"]
      },
      {
        type: "lugares",
        question: "restaurante",
        answer: "restaurante",
        traps: ["comer", "garçom", "cardápio"]
      },
      {
        type: "lugares",
        question: "biblioteca",
        answer: "biblioteca",
        traps: ["livro", "silêncio", "ler"]
      },
      {
        type: "lugares",
        question: "parque",
        answer: "parque",
        traps: ["árvore", "banco", "brincar"]
      },
      // COMIDA
      {
        type: "comida",
        question: "pizza",
        answer: "pizza",
        traps: ["queijo", "tomate", "massa"]
      },
      {
        type: "comida",
        question: "chocolate",
        answer: "chocolate",
        traps: ["doce", "cacau", "marrom"]
      },
      {
        type: "comida",
        question: "maçã",
        answer: "maçã",
        traps: ["vermelha", "fruta", "morder"]
      },
      {
        type: "comida",
        question: "pão",
        answer: "pão",
        traps: ["padaria", "fatia", "trigo"]
      },
      {
        type: "comida",
        question: "bolo",
        answer: "bolo",
        traps: ["aniversário", "vela", "doce"]
      },
      {
        type: "comida",
        question: "queijo",
        answer: "queijo",
        traps: ["leite", "amarelo", "rato"]
      },
      // OBJETOS
      {
        type: "objetos",
        question: "telefone",
        answer: "telefone",
        traps: ["ligar", "celular", "tocar"]
      },
      {
        type: "objetos",
        question: "carro",
        answer: "carro",
        traps: ["dirigir", "roda", "motor"]
      },
      {
        type: "objetos",
        question: "computador",
        answer: "computador",
        traps: ["tela", "teclado", "mouse"]
      },
      {
        type: "objetos",
        question: "livro",
        answer: "livro",
        traps: ["página", "história", "ler"]
      },
      {
        type: "objetos",
        question: "sapato",
        answer: "sapato",
        traps: ["pé", "andar", "cadarço"]
      },
      {
        type: "objetos",
        question: "relógio",
        answer: "relógio",
        traps: ["tempo", "pulso", "hora"]
      },
      // ANIMAIS
      {
        type: "animais",
        question: "gato",
        answer: "gato",
        traps: ["miau", "ronronar", "garra"]
      },
      {
        type: "animais",
        question: "cão",
        answer: "cão",
        traps: ["latir", "fiel", "rabo"]
      },
      {
        type: "animais",
        question: "elefante",
        answer: "elefante",
        traps: ["tromba", "cinza", "grande"]
      },
      {
        type: "animais",
        question: "pássaro",
        answer: "pássaro",
        traps: ["voar", "asa", "cantar"]
      },
      {
        type: "animais",
        question: "peixe",
        answer: "peixe",
        traps: ["nadar", "água", "escama"]
      },
      // NATUREZA
      {
        type: "natureza",
        question: "sol",
        answer: "sol",
        traps: ["amarelo", "quente", "dia"]
      },
      {
        type: "natureza",
        question: "flor",
        answer: "flor",
        traps: ["jardim", "cheiro", "cor"]
      }
    ],
    
    ar: [
      // أماكن
      {
        type: "أماكن",
        question: "شاطئ",
        answer: "شاطئ",
        traps: ["رمل", "شمس", "بحر"]
      },
      {
        type: "أماكن",
        question: "مدرسة",
        answer: "مدرسة",
        traps: ["طالب", "معلم", "فصل"]
      },
      {
        type: "أماكن",
        question: "مستشفى",
        answer: "مستشفى",
        traps: ["طبيب", "مريض", "علاج"]
      },
      {
        type: "أماكن",
        question: "مطعم",
        answer: "مطعم",
        traps: ["طعام", "نادل", "قائمة"]
      },
      {
        type: "أماكن",
        question: "مكتبة",
        answer: "مكتبة",
        traps: ["كتاب", "هدوء", "قراءة"]
      },
      {
        type: "أماكن",
        question: "حديقة",
        answer: "حديقة",
        traps: ["شجرة", "مقعد", "لعب"]
      },
      // طعام
      {
        type: "طعام",
        question: "بيتزا",
        answer: "بيتزا",
        traps: ["جبن", "طماطم", "عجين"]
      },
      {
        type: "طعام",
        question: "شوكولاتة",
        answer: "شوكولاتة",
        traps: ["حلو", "كاكاو", "بني"]
      },
      {
        type: "طعام",
        question: "تفاحة",
        answer: "تفاحة",
        traps: ["أحمر", "فاكهة", "عض"]
      },
      {
        type: "طعام",
        question: "خبز",
        answer: "خبز",
        traps: ["مخبز", "شريحة", "قمح"]
      },
      {
        type: "طعام",
        question: "كيك",
        answer: "كيك",
        traps: ["عيد", "شمعة", "حلو"]
      },
      {
        type: "طعام",
        question: "جبن",
        answer: "جبن",
        traps: ["حليب", "أصفر", "فأر"]
      },
      // أشياء
      {
        type: "أشياء",
        question: "هاتف",
        answer: "هاتف",
        traps: ["اتصال", "جوال", "رنين"]
      },
      {
        type: "أشياء",
        question: "سيارة",
        answer: "سيارة",
        traps: ["قيادة", "عجلة", "محرك"]
      },
      {
        type: "أشياء",
        question: "حاسوب",
        answer: "حاسوب",
        traps: ["شاشة", "لوحة", "فأرة"]
      },
      {
        type: "أشياء",
        question: "كتاب",
        answer: "كتاب",
        traps: ["صفحة", "قصة", "قراءة"]
      },
      {
        type: "أشياء",
        question: "حذاء",
        answer: "حذاء",
        traps: ["قدم", "مشي", "رباط"]
      },
      {
        type: "أشياء",
        question: "ساعة",
        answer: "ساعة",
        traps: ["وقت", "معصم", "ساعة"]
      },
      // حيوانات
      {
        type: "حيوانات",
        question: "قطة",
        answer: "قطة",
        traps: ["مواء", "خرخرة", "مخلب"]
      },
      {
        type: "حيوانات",
        question: "كلب",
        answer: "كلب",
        traps: ["نباح", "وفي", "ذيل"]
      },
      {
        type: "حيوانات",
        question: "فيل",
        answer: "فيل",
        traps: ["خرطوم", "رمادي", "كبير"]
      },
      {
        type: "حيوانات",
        question: "طائر",
        answer: "طائر",
        traps: ["طيران", "جناح", "غناء"]
      },
      {
        type: "حيوانات",
        question: "سمك",
        answer: "سمك",
        traps: ["سباحة", "ماء", "قشور"]
      },
      // طبيعة
      {
        type: "طبيعة",
        question: "شمس",
        answer: "شمس",
        traps: ["أصفر", "حار", "نهار"]
      },
      {
        type: "طبيعة",
        question: "زهرة",
        answer: "زهرة",
        traps: ["حديقة", "رائحة", "لون"]
      }
    ]
  }
},
  'listen-but-don-t-judge': {
    translations: {
      fr: [
        'Si {playerName} devait confesser un péché mignon, lequel serait-ce ?',
        'Quelle est la pire habitude de {playerName} qu\'il/elle n\'admettra jamais publiquement ?',
        'Comment {playerName} réagirait face à un compliment sincère mais inattendu ?',
        'Quel secret {playerName} serait-il/elle prêt(e) à partager avec nous aujourd\'hui ?',
        'Qu\'est-ce qui rend {playerName} vraiment unique selon vous ?',
        'Quelle qualité admirez-vous le plus chez {playerName} ?',
        'Si {playerName} était un personnage de film ou de série, lequel serait-il/elle et pourquoi ?',
        'Quelle est la plus grande peur de {playerName} d\'après vous ?',
        'Comment imaginez-vous la vie de {playerName} dans 10 ans ?',
        'Quelle est la chose la plus gentille que {playerName} ait jamais faite pour quelqu\'un ?',
        'Si {playerName} pouvait changer une chose dans sa vie, quelle serait-elle selon vous ?',
        'Quelle situation fait le plus douter {playerName} de ses capacités ?',
        'Quel est le rêve secret de {playerName} selon vous ?',
        'Quelle est la plus belle qualité cachée de {playerName} ?',
        'Si {playerName} écrivait un livre, quel en serait le titre ?',
        'Comment {playerName} exprime-t-il/elle son affection ?',
        'Quel compliment {playerName} aimerait-il/elle entendre plus souvent ?',
        'Quelle est la plus grande force de {playerName} en amitié ?',
        'Si {playerName} avait une baguette magique, que changerait-il/elle en premier ?',
        'Quel est le talent caché de {playerName} que peu de gens connaissent ?',
        'Comment {playerName} gère-t-il/elle le stress selon vous ?',
        'Quelle est la chose qui fait le plus sourire {playerName} ?',
        'Si {playerName} était un super-héros, quel serait son pouvoir ?',
        'Quelle est la plus grande leçon que {playerName} a apprise dans sa vie ?',
        'Comment {playerName} montre-t-il/elle qu\'il/elle tient à quelqu\'un ?',
        'Si {playerName} pouvait revivre un moment de sa vie, lequel choisirait-il/elle ?',
        'Quelle est la chose que {playerName} fait mieux que tout le monde ?',
        'Si {playerName} était un animal, lequel serait-il et pourquoi ?',
        'Comment {playerName} inspire-t-il/elle les autres sans s\'en rendre compte ?',
        'Si {playerName} pouvait donner un conseil au monde entier, que dirait-il/elle ?',
        'Comment {playerName} voit-il/elle l\'amour idéal ?',
        'Si {playerName} était une chanson, laquelle serait-ce ?',
        'Comment {playerName} réconforte-t-il/elle ses proches ?',
        'Si {playerName} pouvait rencontrer une personne célèbre, qui choisirait-il/elle ?',
        'Comment {playerName} définit-il/elle le bonheur selon vous ?',
        'Comment {playerName} exprime-t-il/elle sa créativité ?',
        'Si {playerName} pouvait apprendre instantanément une compétence, laquelle choisirait-il/elle ?',
        'Comment {playerName} imagine-t-il/elle sa retraite idéale ?',
        'Si {playerName} était un parfum, quelle serait son essence ?',
        'Comment {playerName} réagit-il/elle quand personne ne le/la regarde ?',
        'Si {playerName} pouvait changer le monde, par quoi commencerait-il/elle ?',
        'Comment {playerName} célèbre-t-il/elle ses petites victoires ?',
        'Si {playerName} était un dessert, lequel serait-il et pourquoi ?',
        'Comment {playerName} gère-t-il/elle les moments difficiles ?',
        'Si {playerName} pouvait posséder un objet magique, lequel choisirait-il/elle ?',
        'Comment {playerName} exprime-t-il/elle sa reconnaissance ?',
        'Si {playerName} était une couleur, laquelle serait-ce et pourquoi ?',
        'Comment {playerName} montre-t-il/elle qu\'il/elle est heureux/se ?',
        'Si {playerName} pouvait voyager dans le temps, quelle époque visiterait-il/elle ?',
        'Quelle est la plus belle leçon que la vie a enseignée à {playerName} ?'
      ],
      en: [
        'If {playerName} had to confess a cute sin, what would it be?',
        'What is {playerName}\'s worst habit that they would never publicly admit?',
        'How would {playerName} react to a sincere but unexpected compliment?',
        'What secret would {playerName} be willing to share with us today?',
        'What makes {playerName} truly unique in your opinion?',
        'What quality do you admire most about {playerName}?',
        'If {playerName} were a movie or TV series character, which one would they be and why?',
        'What do you think is {playerName}\'s biggest fear?',
        'How do you imagine {playerName}\'s life in 10 years?',
        'What is the kindest thing {playerName} has ever done for someone?',
        'If {playerName} could change one thing in their life, what do you think it would be?',
        'What situation makes {playerName} doubt their abilities the most?',
        'What do you think is {playerName}\'s secret dream?',
        'What is {playerName}\'s most beautiful hidden quality?',
        'If {playerName} wrote a book, what would the title be?',
        'How does {playerName} express affection?',
        'What compliment would {playerName} like to hear more often?',
        'What is {playerName}\'s greatest strength in friendship?',
        'If {playerName} had a magic wand, what would they change first?',
        'What is {playerName}\'s hidden talent that few people know about?',
        'How do you think {playerName} handles stress?',
        'What is the thing that makes {playerName} smile the most?',
        'If {playerName} were a superhero, what would their power be?',
        'What is the greatest lesson {playerName} has learned in life?',
        'How does {playerName} show that they care about someone?',
        'If {playerName} could relive one moment of their life, which would they choose?',
        'What is the thing {playerName} does better than anyone else?',
        'If {playerName} were an animal, which one would they be and why?',
        'How does {playerName} inspire others without realizing it?',
        'If {playerName} could give advice to the whole world, what would they say?',
        'How does {playerName} view ideal love?',
        'If {playerName} were a song, which one would it be?',
        'How does {playerName} comfort their loved ones?',
        'If {playerName} could meet a famous person, who would they choose?',
        'How do you think {playerName} defines happiness?',
        'How does {playerName} express their creativity?',
        'If {playerName} could instantly learn a skill, which would they choose?',
        'How does {playerName} imagine their ideal retirement?',
        'If {playerName} were a perfume, what would be their essence?',
        'How does {playerName} act when no one is watching?',
        'If {playerName} could change the world, where would they start?',
        'How does {playerName} celebrate their small victories?',
        'If {playerName} were a dessert, which would they be and why?',
        'How does {playerName} handle difficult moments?',
        'If {playerName} could own a magical object, which would they choose?',
        'How does {playerName} express gratitude?',
        'If {playerName} were a color, which would it be and why?',
        'How does {playerName} show that they are happy?',
        'If {playerName} could time travel, what era would they visit?',
        'What is the most beautiful lesson life has taught {playerName}?'
      ],
      es: [
        'Si {playerName} tuviera que confesar un pecado adorable, ¿cuál sería?',
        '¿Cuál es el peor hábito de {playerName} que nunca admitiría públicamente?',
        '¿Cómo reaccionaría {playerName} ante un cumplido sincero pero inesperado?',
        '¿Qué secreto estaría {playerName} dispuesto/a a compartir con nosotros hoy?',
        '¿Qué hace que {playerName} sea verdaderamente único/a en tu opinión?',
        '¿Qué cualidad admiras más de {playerName}?',
        'Si {playerName} fuera un personaje de película o serie, ¿cuál sería y por qué?',
        '¿Cuál crees que es el mayor miedo de {playerName}?',
        '¿Cómo imaginas la vida de {playerName} en 10 años?',
        '¿Cuál es la cosa más amable que {playerName} ha hecho por alguien?',
        'Si {playerName} pudiera cambiar una cosa en su vida, ¿qué crees que sería?',
        '¿Qué situación hace que {playerName} dude más de sus capacidades?',
        '¿Cuál crees que es el sueño secreto de {playerName}?',
        '¿Cuál es la cualidad oculta más hermosa de {playerName}?',
        'Si {playerName} escribiera un libro, ¿cuál sería el título?',
        '¿Cómo expresa {playerName} el cariño?',
        '¿Qué cumplido le gustaría a {playerName} escuchar más a menudo?',
        '¿Cuál es la mayor fortaleza de {playerName} en la amistad?',
        'Si {playerName} tuviera una varita mágica, ¿qué cambiaría primero?',
        '¿Cuál es el talento oculto de {playerName} que poca gente conoce?',
        '¿Cómo crees que {playerName} maneja el estrés?',
        '¿Qué es lo que más hace sonreír a {playerName}?',
        'Si {playerName} fuera un superhéroe, ¿cuál sería su poder?',
        '¿Cuál es la lección más grande que {playerName} ha aprendido en la vida?',
        '¿Cómo demuestra {playerName} que le importa alguien?',
        'Si {playerName} pudiera revivir un momento de su vida, ¿cuál elegiría?',
        '¿Qué es lo que {playerName} hace mejor que nadie?',
        'Si {playerName} fuera un animal, ¿cuál sería y por qué?',
        '¿Cómo inspira {playerName} a otros sin darse cuenta?',
        'Si {playerName} pudiera dar un consejo al mundo entero, ¿qué diría?',
        '¿Cómo ve {playerName} el amor ideal?',
        'Si {playerName} fuera una canción, ¿cuál sería?',
        '¿Cómo consuela {playerName} a sus seres queridos?',
        'Si {playerName} pudiera conocer a una persona famosa, ¿a quién elegiría?',
        '¿Cómo crees que {playerName} define la felicidad?',
        '¿Cómo expresa {playerName} su creatividad?',
        'Si {playerName} pudiera aprender instantáneamente una habilidad, ¿cuál elegiría?',
        '¿Cómo imagina {playerName} su jubilación ideal?',
        'Si {playerName} fuera un perfume, ¿cuál sería su esencia?',
        '¿Cómo actúa {playerName} cuando nadie lo/la mira?',
        'Si {playerName} pudiera cambiar el mundo, ¿por dónde empezaría?',
        '¿Cómo celebra {playerName} sus pequeñas victorias?',
        'Si {playerName} fuera un postre, ¿cuál sería y por qué?',
        '¿Cómo maneja {playerName} los momentos difíciles?',
        'Si {playerName} pudiera poseer un objeto mágico, ¿cuál elegiría?',
        '¿Cómo expresa {playerName} la gratitud?',
        'Si {playerName} fuera un color, ¿cuál sería y por qué?',
        '¿Cómo demuestra {playerName} que está feliz?',
        'Si {playerName} pudiera viajar en el tiempo, ¿qué época visitaría?',
        '¿Cuál es la lección más hermosa que la vida ha enseñado a {playerName}?'
      ],
      de: [
        'Wenn {playerName} eine niedliche Sünde gestehen müsste, welche wäre das?',
        'Was ist die schlimmste Angewohnheit von {playerName}, die er/sie nie öffentlich zugeben würde?',
        'Wie würde {playerName} auf ein aufrichtiges, aber unerwartetes Kompliment reagieren?',
        'Welches Geheimnis wäre {playerName} bereit, heute mit uns zu teilen?',
        'Was macht {playerName} deiner Meinung nach wirklich einzigartig?',
        'Welche Eigenschaft bewunderst du am meisten an {playerName}?',
        'Wenn {playerName} eine Film- oder Fernsehfigur wäre, welche wäre es und warum?',
        'Was ist deiner Meinung nach die größte Angst von {playerName}?',
        'Wie stellst du dir das Leben von {playerName} in 10 Jahren vor?',
        'Was ist das Netteste, was {playerName} jemals für jemanden getan hat?',
        'Wenn {playerName} eine Sache in seinem/ihrem Leben ändern könnte, was wäre es deiner Meinung nach?',
        'Welche Situation lässt {playerName} am meisten an seinen/ihren Fähigkeiten zweifeln?',
        'Was ist deiner Meinung nach der geheime Traum von {playerName}?',
        'Was ist die schönste versteckte Eigenschaft von {playerName}?',
        'Wenn {playerName} ein Buch schreiben würde, wie würde der Titel lauten?',
        'Wie drückt {playerName} Zuneigung aus?',
        'Welches Kompliment würde {playerName} gerne öfter hören?',
        'Was ist {playerName}s größte Stärke in der Freundschaft?',
        'Wenn {playerName} einen Zauberstab hätte, was würde er/sie zuerst ändern?',
        'Was ist das versteckte Talent von {playerName}, das nur wenige kennen?',
        'Wie denkst du, geht {playerName} mit Stress um?',
        'Was bringt {playerName} am meisten zum Lächeln?',
        'Wenn {playerName} ein Superheld wäre, was wäre seine/ihre Kraft?',
        'Was ist die größte Lektion, die {playerName} im Leben gelernt hat?',
        'Wie zeigt {playerName}, dass ihm/ihr jemand wichtig ist?',
        'Wenn {playerName} einen Moment seines/ihres Lebens wiederleben könnte, welchen würde er/sie wählen?',
        'Was macht {playerName} besser als alle anderen?',
        'Wenn {playerName} ein Tier wäre, welches wäre es und warum?',
        'Wie inspiriert {playerName} andere, ohne es zu merken?',
        'Wenn {playerName} der ganzen Welt einen Rat geben könnte, was würde er/sie sagen?',
        'Wie sieht {playerName} die ideale Liebe?',
        'Wenn {playerName} ein Lied wäre, welches wäre es?',
        'Wie tröstet {playerName} seine/ihre Lieben?',
        'Wenn {playerName} eine berühmte Person treffen könnte, wen würde er/sie wählen?',
        'Wie definiert {playerName} deiner Meinung nach Glück?',
        'Wie drückt {playerName} seine/ihre Kreativität aus?',
        'Wenn {playerName} sofort eine Fähigkeit erlernen könnte, welche würde er/sie wählen?',
        'Wie stellt sich {playerName} seinen/ihren idealen Ruhestand vor?',
        'Wenn {playerName} ein Parfüm wäre, was wäre seine/ihre Essenz?',
        'Wie verhält sich {playerName}, wenn niemand hinschaut?',
        'Wenn {playerName} die Welt verändern könnte, womit würde er/sie anfangen?',
        'Wie feiert {playerName} seine/ihre kleinen Siege?',
        'Wenn {playerName} ein Dessert wäre, welches wäre es und warum?',
        'Wie geht {playerName} mit schwierigen Momenten um?',
        'Wenn {playerName} einen magischen Gegenstand besitzen könnte, welchen würde er/sie wählen?',
        'Wie drückt {playerName} Dankbarkeit aus?',
        'Wenn {playerName} eine Farbe wäre, welche wäre es und warum?',
        'Wie zeigt {playerName}, dass er/sie glücklich ist?',
        'Wenn {playerName} durch die Zeit reisen könnte, welche Epoche würde er/sie besuchen?',
        'Was ist die schönste Lektion, die das Leben {playerName} gelehrt hat?'
      ],
      it: [
        'Se {playerName} dovesse confessare un piccolo peccato, quale sarebbe?',
        'Qual è la peggiore abitudine di {playerName} che non ammetterebbe mai pubblicamente?',
        'Come reagirebbe {playerName} a un complimento sincero ma inaspettato?',
        'Quale segreto {playerName} sarebbe disposto/a a condividere con noi oggi?',
        'Cosa rende {playerName} veramente unico/a secondo te?',
        'Quale qualità ammiri di più in {playerName}?',
        'Se {playerName} fosse un personaggio di un film o di una serie TV, quale sarebbe e perché?',
        'Qual è secondo te la più grande paura di {playerName}?',
        'Come immagini la vita di {playerName} tra 10 anni?',
        'Qual è la cosa più gentile che {playerName} ha mai fatto per qualcuno?',
        'Se {playerName} potesse cambiare una cosa nella sua vita, quale pensi che sarebbe?',
        'Quale situazione fa dubitare maggiormente {playerName} delle proprie capacità?',
        'Qual è secondo te il sogno segreto di {playerName}?',
        'Qual è la più bella qualità nascosta di {playerName}?',
        'Se {playerName} scrivesse un libro, quale sarebbe il titolo?',
        'Come esprime {playerName} l\'affetto?',
        'Quale complimento a {playerName} piacerebbe sentire più spesso?',
        'Qual è il più grande punto di forza di {playerName} nell\'amicizia?',
        'Se {playerName} avesse una bacchetta magica, cosa cambierebbe per primo?',
        'Qual è il talento nascosto di {playerName} che poche persone conoscono?',
        'Come pensi che {playerName} gestisca lo stress?',
        'Qual è la cosa che fa sorridere di più {playerName}?',
        'Se {playerName} fosse un supereroe, quale sarebbe il suo potere?',
        'Qual è la lezione più grande che {playerName} ha imparato nella vita?',
        'Come dimostra {playerName} che tiene a qualcuno?',
        'Se {playerName} potesse rivivere un momento della sua vita, quale sceglierebbe?',
        'Qual è la cosa che {playerName} fa meglio di chiunque altro?',
        'Se {playerName} fosse un animale, quale sarebbe e perché?',
        'Come ispira {playerName} gli altri senza rendersene conto?',
        'Se {playerName} potesse dare un consiglio al mondo intero, cosa direbbe?',
        'Come vede {playerName} l\'amore ideale?',
        'Se {playerName} fosse una canzone, quale sarebbe?',
        'Come consola {playerName} i suoi cari?',
        'Se {playerName} potesse incontrare una persona famosa, chi sceglierebbe?',
        'Come pensi che {playerName} definisca la felicità?',
        'Come esprime {playerName} la sua creatività?',
        'Se {playerName} potesse imparare istantaneamente una habilidad, quale sceglierebbe?',
        'Come immagina {playerName} la sua pensione ideale?',
        'Se {playerName} fosse un profumo, quale sarebbe la sua essenza?',
        'Come si comporta {playerName} quando nessuno lo/la guarda?',
        'Se {playerName} potesse cambiare il mondo, da dove inizierebbe?',
        'Come celebra {playerName} le sue piccole vittorie?',
        'Se {playerName} fosse una sobremesa, quale sarebbe e perché?',
        'Come affronta {playerName} i momenti difficili?',
        'Se {playerName} potesse possedere un oggetto magico, quale sceglierebbe?',
        'Come esprime {playerName} la gratitudine?',
        'Se {playerName} fosse un colore, quale sarebbe e perché?',
        'Come dimostra {playerName} che è felice?',
        'Se {playerName} potesse viaggiare nel tempo, quale epoca visiterebbe?',
        'Qual è la lezione più bella che la vita ha insegnato a {playerName}?'
      ],
      pt: [
        'Se {playerName} tivesse que confessar um pecado fofo, qual seria?',
        'Qual é o pior hábito de {playerName} que ele/ela nunca admitiria publicamente?',
        'Como {playerName} reagiria a um elogio sincero, mas inesperado?',
        'Que segredo {playerName} estaria disposto/a a compartilhar conosco hoje?',
        'O que torna {playerName} verdadeiramente único/a na sua opinião?',
        'Que qualidade você mais admira em {playerName}?',
        'Se {playerName} fosse um personagem de filme ou série, qual seria e por quê?',
        'Qual você acha que é o maior medo de {playerName}?',
        'Como você imagina a vida de {playerName} daqui a 10 anos?',
        'Qual é a coisa mais gentil que {playerName} já fez por alguém?',
        'Se {playerName} pudesse mudar uma coisa em sua vida, o que você acha que seria?',
        'Que situação faz {playerName} duvidar mais de suas habilidades?',
        'Qual você acha que é o sonho secreto de {playerName}?',
        'Qual é a mais bela qualidade oculta de {playerName}?',
        'Se {playerName} escrevesse um livro, qual seria o título?',
        'Como {playerName} expressa carinho?',
        'Que elogio {playerName} gostaria de ouvir mais frequentemente?',
        'Qual é a maior força de {playerName} na amizade?',
        'Se {playerName} tivesse uma varinha mágica, o que mudaria primeiro?',
        'Qual é o talento oculto de {playerName} que poucas pessoas conhecem?',
        'Como você acha que {playerName} lida com o estresse?',
        'O que mais faz {playerName} sorrir?',
        'Se {playerName} fosse um super-herói, qual seria seu poder?',
        'Qual é a maior lição que {playerName} aprendeu na vida?',
        'Como {playerName} demonstra que se importa com alguém?',
        'Se {playerName} pudesse reviver um momento de sua vida, qual escolheria?',
        'O que {playerName} faz melhor que qualquer outra pessoa?',
        'Se {playerName} fosse um animal, qual seria e por quê?',
        'Como {playerName} inspira outros sem perceber?',
        'Se {playerName} pudesse dar um conselho ao mundo inteiro, o que diria?',
        'Como {playerName} vê o amor ideal?',
        'Se {playerName} fosse uma música, qual seria?',
        'Como {playerName} consola seus entes queridos?',
        'Se {playerName} pudesse conhecer uma pessoa famosa, quem escolheria?',
        'Como você acha que {playerName} define felicidade?',
        'Como {playerName} expressa sua criatividade?',
        'Se {playerName} pudesse aprender instantaneamente uma habilidade, qual escolheria?',
        'Como {playerName} imagina sua aposentadoria ideal?',
        'Se {playerName} fosse um perfume, qual seria sua essência?',
        'Como {playerName} age quando ninguém está olhando?',
        'Se {playerName} pudesse mudar o mundo, por onde começaria?',
        'Como {playerName} celebra suas pequenas vitórias?',
        'Se {playerName} fosse uma sobremesa, qual seria e por quê?',
        'Como {playerName} lida com momentos difíceis?',
        'Se {playerName} pudesse possuir um objeto mágico, qual escolheria?',
        'Como {playerName} expressa gratidão?',
        'Se {playerName} fosse uma cor, qual seria e por quê?',
        'Como {playerName} demonstra que está feliz?',
        'Se {playerName} pudesse viajar no tempo, que época visitaria?',
        'Qual é a mais bela lição que a vida ensinou a {playerName}?'
      ],
      ar: [
        'إذا كان على {playerName} الاعتراف بخطيئة لطيفة، فماذا ستكون؟',
        'ما هي أسوأ عادة لدى {playerName} لن يعترف بها أبدًا علنًا؟',
        'كيف سيتفاعل {playerName} مع مجاملة صادقة ولكنها غير متوقعة؟',
        'ما هو السر الذي سيكون {playerName} على استعداد لمشاركته معنا اليوم؟',
        'ما الذي يجعل {playerName} فريدًا حقًا في رأيك؟',
        'ما هي الصفة التي تعجبك أكثر في {playerName}؟',
        'إذا كان {playerName} شخصية في فيلم أو مسلسل تلفزيوني، فأي شخصية سيكون ولماذا؟',
        'ما هو برأيك أكبر خوف لدى {playerName}؟',
        'كيف تتخيل حياة {playerName} بعد 10 سنوات؟',
        'ما هو ألطف شيء قام به {playerName} لشخص ما؟',
        'إذا كان بإمكان {playerName} تغيير شيء واحد في حياته، ما الذي تعتقد أنه سيكون؟',
        'ما هو الموقف الذي يجعل {playerName} يشك في قدراته أكثر؟',
        'ما الذي تعتقد أنه الحلم السري لـ {playerName}؟',
        'ما هي أجمل صفة مخفية لدى {playerName}؟',
        'إذا كتب {playerName} كتابًا، فما سيكون عنوانه؟',
        'كيف يعبر {playerName} عن المودة؟',
        'أي مجاملة يحب {playerName} أن يسمعها أكثر؟',
        'ما هي أكبر نقطة قوة لدى {playerName} في الصداقة؟',
        'إذا كان لدى {playerName} عصا سحرية، فما الذي سيغيره أولاً؟',
        'ما هي الموهبة المخفية لدى {playerName} التي يعرفها القليل من الناس؟',
        'كيف تعتقد أن {playerName} يتعامل مع التوتر؟',
        'ما الذي يجعل {playerName} يبتسم أكثر؟',
        'إذا كان {playerName} بطلاً خارقًا، فما ستكون قوته؟',
        'ما هي أعظم درس تعلمه {playerName} في الحياة؟',
        'كيف يُظهر {playerName} اهتمامه بشخص ما؟',
        'إذا كان بإمكان {playerName} إعادة عيش لحظة من حياته، فأيها سيختار؟',
        'ما الذي يفعله {playerName} أفضل من أي شخص آخر؟',
        'إذا كان {playerName} حيوانًا، فأي حيوان سيكون ولماذا؟',
        'كيف يلهم {playerName} الآخرين دون أن يدرك ذلك؟',
        'إذا كان بإمكان {playerName} إعطاء نصيحة للعالم كله، فماذا سيقول؟',
        'كيف يرى {playerName} الحب المثالي؟',
        'إذا كان {playerName} أغنية، فأي أغنية ستكون؟',
        'كيف يواسي {playerName} أحباءه؟',
        'إذا كان بإمكان {playerName} مقابلة شخصية مشهورة، فمن سيختار؟',
        'كيف تعتقد أن {playerName} يعرّف السعادة؟',
        'كيف يعبر {playerName} عن إبداعه؟',
        'إذا كان بإمكان {playerName} تعلم مهارة فورًا، فأيها سيختار؟',
        'كيف يتخيل {playerName} تقاعده المثالي؟',
        'إذا كان {playerName} عطرًا، فما ستكون جوهره؟',
        'كيف يتصرف {playerName} عندما لا يراقبه أحد؟',
        'إذا كان بإمكان {playerName} تغيير العالم، فمن أين سيبدأ؟',
        'كيف يحتفل {playerName} بانتصاراته الصغيرة؟',
        'إذا كان {playerName} حلوى، فأي حلوى سيكون ولماذا؟',
        'كيف يتعامل {playerName} مع اللحظات الصعبة؟',
        'إذا كان بإمكان {playerName} امتلاك شيء سحري، فماذا سيختار؟',
        'كيف يعبر {playerName} عن الامتنان؟',
        'إذا كان {playerName} لونًا، فأي لون سيكون ولماذا؟',
        'كيف يُظهر {playerName} أنه سعيد؟',
        'إذا كان بإمكان {playerName} السفر عبر الزمن، فأي عصر سيزور؟',
        'ما هي أجمل درس علمته الحياة لـ {playerName}؟'
      ]
    }
  },
  'truth-or-dare': {
    translations: {
      fr: [
        {
          type: "action",
          text: "Danse collé-serré pendant 30 secondes… avec un coussin. Regarde quelqu'un du groupe droit dans les yeux pendant toute la danse."
        },
        {
          type: "verite",
          text: "Quelle est la dernière chose que tu as faite en secret et que personne ici ne soupçonnerait ?"
        },
        {
          type: "action",
          text: "Fais un spectacle de mode avec les objets qui traînent dans la pièce pendant 2 minutes."
        },
        {
          type: "verite",
          text: "Quel est le mensonge le plus innocent que tu as dit récemment ?"
        },
        {
          type: "action",
          text: "Imite ta célébrité préférée pendant 1 minute sans dire qui c'est."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus embarrassante dans ton historique de recherche ?"
        },
        {
          type: "action",
          text: "Chante l'alphabet à l'envers en dansant la macarena."
        },
        {
          type: "verite",
          text: "Si tu pouvais lire dans les pensées de quelqu'un ici, qui choisirais-tu ?"
        },
        {
          type: "action",
          text: "Fais un discours passionné de 30 secondes sur l'importance des chaussettes dépareillées."
        },
        {
          type: "verite",
          text: "Quel est le compliment le plus bizarre qu'on t'ait jamais fait ?"
        },
        {
          type: "action",
          text: "Dessine un portrait de quelqu'un du groupe avec tes pieds."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus étrange que tu fais quand tu es seul(e) ?"
        },
        {
          type: "action",
          text: "Raconte une histoire de 2 minutes en ne parlant qu'en questions."
        },
        {
          type: "verite",
          text: "Quel est ton plus grand regret de ces 5 dernières années ?"
        },
        {
          type: "action",
          text: "Fais une séance de yoga en commentant comme un prof très zen."
        },
        {
          type: "verite",
          text: "Si tu devais être enfermé(e) dans une pièce avec quelqu'un d'ici, qui choisirais-tu ?"
        },
        {
          type: "action",
          text: "Invente et interprète une pub de 30 secondes pour un produit imaginaire."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus puérile que tu fais encore ?"
        },
        {
          type: "action",
          text: "Mime ton film préféré pendant que les autres devinent."
        },
        {
          type: "verite",
          text: "Quel est le surnom le plus ridicule qu'on t'ait donné ?"
        },
        {
          type: "action",
          text: "Fais un défilé de mode en utilisant uniquement du papier toilette."
        },
        {
          type: "verite",
          text: "Si tu pouvais échanger de place avec quelqu'un ici pour une journée, qui ce serait ?"
        },
        {
          type: "action",
          text: "Parle avec l'accent le plus ridicule possible pendant 3 minutes."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus impulsive que tu aies jamais faite ?"
        },
        {
          type: "action",
          text: "Fais une chorégraphie sur ta chanson préférée avec uniquement tes mains."
        },
        {
          type: "verite",
          text: "Quel est le message le plus gênant que tu aies envoyé par erreur ?"
        },
        {
          type: "action",
          text: "Raconte une blague en faisant différentes voix pour chaque personnage."
        },
        {
          type: "verite",
          text: "Si tu pouvais supprimer une de tes habitudes, laquelle ce serait ?"
        },
        {
          type: "action",
          text: "Fais un selfie groupe en dirigeant la séance photo comme un photographe professionnel."
        },
        {
          type: "verite",
          text: "Quelle est la célébrité avec qui tu aimerais le plus prendre un café ?"
        },
        {
          type: "action",
          text: "Invente un nouveau style de danse et apprends-le au groupe."
        },
        {
          type: "verite",
          text: "Quel est ton plus gros complexe que tu n'avoues jamais ?"
        },
        {
          type: "action",
          text: "Fais un one-man-show de stand-up pendant 2 minutes."
        },
        {
          type: "verite",
          text: "Si tu devais déménager dans un autre pays demain, lequel choisirais-tu ?"
        },
        {
          type: "action",
          text: "Imite chaque personne du groupe pendant 10 secondes chacune."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus embarrassante que tes parents aient faite devant tes amis ?"
        },
        {
          type: "action",
          text: "Crée un rap improvisé sur ce qui se passe en ce moment dans la pièce."
        },
        {
          type: "verite",
          text: "Quel est le mensonge que tu dis le plus souvent ?"
        },
        {
          type: "action",
          text: "Fais un cours de cuisine imaginaire en préparant un plat invisible."
        },
        {
          type: "verite",
          text: "Si tu pouvais avoir accès aux DM de quelqu'un, qui choisirais-tu ?"
        },
        {
          type: "action",
          text: "Joue le rôle d'un commentateur sportif décrivant quelqu'un qui mange."
        },
        {
          type: "verite",
          text: "Quelle est la règle sociale que tu brises le plus souvent ?"
        },
        {
          type: "action",
          text: "Fais une présentation TED talk de 2 minutes sur un sujet totalement absurde."
        },
        {
          type: "verite",
          text: "Quel est le secret que tu gardes depuis le plus longtemps ?"
        },
        {
          type: "action",
          text: "Crée une nouvelle langue et enseigne-nous 5 mots."
        },
        {
          type: "verite",
          text: "Si tu pouvais retourner en arrière et changer une conversation, laquelle ce serait ?"
        },
        {
          type: "action",
          text: "Fais un karaoké muet : chante une chanson connue sans le son."
        },
        {
          type: "verite",
          text: "Quelle est la chose la plus bizarre que tu aies trouvée attirante chez quelqu'un ?"
        },
        {
          type: "action",
          text: "Organise un jeu télévisé improvisé avec le groupe comme candidats."
        },
        {
          type: "verite",
          text: "Si tu devais choisir une seule app sur ton téléphone, laquelle garderais-tu ?"
        }
      ],
      en: [
        {
          type: "dare",
          text: "Slow dance for 30 seconds... with a pillow. Look someone in the group directly in the eyes during the entire dance."
        },
        {
          type: "truth",
          text: "What's the last thing you did in secret that no one here would suspect?"
        },
        {
          type: "dare",
          text: "Do a fashion show with random objects in the room for 2 minutes."
        },
        {
          type: "truth",
          text: "What's the most innocent lie you've told recently?"
        },
        {
          type: "dare",
          text: "Impersonate your favorite celebrity for 1 minute without saying who it is."
        },
        {
          type: "truth",
          text: "What's the most embarrassing thing in your search history?"
        },
        {
          type: "dare",
          text: "Sing the alphabet backwards while doing the macarena."
        },
        {
          type: "truth",
          text: "If you could read someone's mind here, who would you choose?"
        },
        {
          type: "dare",
          text: "Give a passionate 30-second speech about the importance of mismatched socks."
        },
        {
          type: "truth",
          text: "What's the weirdest compliment you've ever received?"
        },
        {
          type: "dare",
          text: "Draw a portrait of someone in the group using your feet."
        },
        {
          type: "truth",
          text: "What's the strangest thing you do when you're alone?"
        },
        {
          type: "dare",
          text: "Tell a 2-minute story speaking only in questions."
        },
        {
          type: "truth",
          text: "What's your biggest regret from the past 5 years?"
        },
        {
          type: "dare",
          text: "Lead a yoga session while commentating like a very zen instructor."
        },
        {
          type: "truth",
          text: "If you had to be locked in a room with someone here, who would you choose?"
        },
        {
          type: "dare",
          text: "Create and perform a 30-second commercial for an imaginary product."
        },
        {
          type: "truth",
          text: "What's the most childish thing you still do?"
        },
        {
          type: "dare",
          text: "Act out your favorite movie while others guess."
        },
        {
          type: "truth",
          text: "What's the most ridiculous nickname you've been given?"
        },
        {
          type: "dare",
          text: "Do a fashion show using only toilet paper."
        },
        {
          type: "truth",
          text: "If you could switch places with someone here for a day, who would it be?"
        },
        {
          type: "dare",
          text: "Speak in the most ridiculous accent possible for 3 minutes."
        },
        {
          type: "truth",
          text: "What's the most impulsive thing you've ever done?"
        },
        {
          type: "dare",
          text: "Choreograph a dance to your favorite song using only your hands."
        },
        {
          type: "truth",
          text: "What's the most awkward text you've sent by mistake?"
        },
        {
          type: "dare",
          text: "Tell a joke using different voices for each character."
        },
        {
          type: "truth",
          text: "If you could eliminate one of your habits, which would it be?"
        },
        {
          type: "dare",
          text: "Take a group selfie while directing the photo shoot like a professional photographer."
        },
        {
          type: "truth",
          text: "Which celebrity would you most like to have coffee with?"
        },
        {
          type: "dare",
          text: "Invent a new dance style and teach it to the group."
        },
        {
          type: "truth",
          text: "What's your biggest insecurity that you never admit?"
        },
        {
          type: "dare",
          text: "Do a 2-minute stand-up comedy routine."
        },
        {
          type: "truth",
          text: "If you had to move to another country tomorrow, which would you choose?"
        },
        {
          type: "dare",
          text: "Impersonate each person in the group for 10 seconds each."
        },
        {
          type: "truth",
          text: "What's the most embarrassing thing your parents did in front of your friends?"
        },
        {
          type: "dare",
          text: "Create an improvised rap about what's happening in the room right now."
        },
        {
          type: "truth",
          text: "What's the lie you tell most often?"
        },
        {
          type: "dare",
          text: "Give an imaginary cooking lesson preparing an invisible dish."
        },
        {
          type: "truth",
          text: "If you could access someone's DMs, who would you choose?"
        },
        {
          type: "dare",
          text: "Be a sports commentator describing someone eating."
        },
        {
          type: "truth",
          text: "What social rule do you break most often?"
        },
        {
          type: "dare",
          text: "Give a 2-minute TED talk on a completely absurd topic."
        },
        {
          type: "truth",
          text: "What's the secret you've kept the longest?"
        },
        {
          type: "dare",
          text: "Create a new language and teach us 5 words."
        },
        {
          type: "truth",
          text: "If you could go back and change one conversation, which would it be?"
        },
        {
          type: "dare",
          text: "Do silent karaoke: sing a famous song without sound."
        },
        {
          type: "truth",
          text: "What's the weirdest thing you've found attractive about someone?"
        },
        {
          type: "dare",
          text: "Host an improvised game show with the group as contestants."
        },
        {
          type: "truth",
          text: "If you had to choose just one app on your phone, which would you keep?"
        }
      ],
      es: [
        {
          type: "reto",
          text: "Baila pegado durante 30 segundos... con un cojín. Mira a alguien del grupo directamente a los ojos durante todo el baile."
        },
        {
          type: "verdad",
          text: "¿Cuál es la última cosa que hiciste en secreto y que nadie aquí sospecharía?"
        },
        {
          type: "reto",
          text: "Haz un desfile de moda con objetos aleatorios de la habitación durante 2 minutos."
        },
        {
          type: "verdad",
          text: "¿Cuál es la mentira más inocente que has dicho recientemente?"
        },
        {
          type: "reto",
          text: "Imita a tu celebridad favorita durante 1 minuto sin decir quién es."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más embarazoso en tu historial de búsqueda?"
        },
        {
          type: "reto",
          text: "Canta el alfabeto al revés mientras haces la macarena."
        },
        {
          type: "verdad",
          text: "Si pudieras leer la mente de alguien aquí, ¿a quién elegirías?"
        },
        {
          type: "reto",
          text: "Da un discurso apasionado de 30 segundos sobre la importancia de los calcetines desparejados."
        },
        {
          type: "verdad",
          text: "¿Cuál es el cumplido más raro que has recibido?"
        },
        {
          type: "reto",
          text: "Dibuja un retrato de alguien del grupo usando tus pies."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más extraño que haces cuando estás solo/a?"
        },
        {
          type: "reto",
          text: "Cuenta una historia de 2 minutos hablando solo con preguntas."
        },
        {
          type: "verdad",
          text: "¿Cuál es tu mayor arrepentimiento de los últimos 5 años?"
        },
        {
          type: "reto",
          text: "Dirige una sesión de yoga comentando como un instructor muy zen."
        },
        {
          type: "verdad",
          text: "Si tuvieras que estar encerrado/a en una habitación con alguien de aquí, ¿a quién elegirías?"
        },
        {
          type: "reto",
          text: "Crea e interpreta un comercial de 30 segundos para un producto imaginario."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más infantil que aún haces?"
        },
        {
          type: "reto",
          text: "Actúa tu película favorita mientras otros adivinan."
        },
        {
          type: "verdad",
          text: "¿Cuál es el apodo más ridículo que te han puesto?"
        },
        {
          type: "reto",
          text: "Haz un desfile de moda usando solo papel higiénico."
        },
        {
          type: "verdad",
          text: "Si pudieras intercambiar lugares con alguien de aquí por un día, ¿quién sería?"
        },
        {
          type: "reto",
          text: "Habla con el acento más ridículo posible durante 3 minutos."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más impulsivo que has hecho?"
        },
        {
          type: "reto",
          text: "Coreografía un baile de tu canción favorita usando solo las manos."
        },
        {
          type: "verdad",
          text: "¿Cuál es el mensaje más incómodo que has enviado por error?"
        },
        {
          type: "reto",
          text: "Cuenta un chiste usando diferentes voces para cada personaje."
        },
        {
          type: "verdad",
          text: "Si pudieras eliminar uno de tus hábitos, ¿cuál sería?"
        },
        {
          type: "reto",
          text: "Toma una selfie grupal dirigiendo la sesión de fotos como un fotógrafo profesional."
        },
        {
          type: "verdad",
          text: "¿Con qué celebridad te gustaría más tomar un café?"
        },
        {
          type: "reto",
          text: "Inventa un nuevo estilo de baile y enséñaselo al grupo."
        },
        {
          type: "verdad",
          text: "¿Cuál es tu mayor inseguridad que nunca admites?"
        },
        {
          type: "reto",
          text: "Haz una rutina de comedia stand-up de 2 minutos."
        },
        {
          type: "verdad",
          text: "Si tuvieras que mudarte a otro país mañana, ¿cuál elegirías?"
        },
        {
          type: "reto",
          text: "Imita a cada persona del grupo durante 10 segundos cada una."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más embarazoso que hicieron tus padres frente a tus amigos?"
        },
        {
          type: "reto",
          text: "Crea un rap improvisado sobre lo que está pasando en la habitación ahora mismo."
        },
        {
          type: "verdad",
          text: "¿Cuál es la mentira que dices más a menudo?"
        },
        {
          type: "reto",
          text: "Da una clase de cocina imaginaria preparando un plato invisible."
        },
        {
          type: "verdad",
          text: "Si pudieras acceder a los mensajes privados de alguien, ¿a quién elegirías?"
        },
        {
          type: "reto",
          text: "Sé un comentarista deportivo describiendo a alguien comiendo."
        },
        {
          type: "verdad",
          text: "¿Qué regla social rompes más a menudo?"
        },
        {
          type: "reto",
          text: "Da una charla TED de 2 minutos sobre un tema completamente absurdo."
        },
        {
          type: "verdad",
          text: "¿Cuál es el secreto que has guardado por más tiempo?"
        },
        {
          type: "reto",
          text: "Crea un nuevo idioma y enséñanos 5 palabras."
        },
        {
          type: "verdad",
          text: "Si pudieras volver atrás y cambiar una conversación, ¿cuál sería?"
        },
        {
          type: "reto",
          text: "Haz karaoke silencioso: canta una canción famosa sin sonido."
        },
        {
          type: "verdad",
          text: "¿Qué es lo más raro que has encontrado atractivo de alguien?"
        },
        {
          type: "reto",
          text: "Organiza un programa de juegos improvisado con el grupo como concursantes."
        },
        {
          type: "verdad",
          text: "Si tuvieras que elegir solo una app en tu teléfono, ¿cuál conservarías?"
        }
      ],
      de: [
        {
          type: "pflicht",
          text: "Tanze 30 Sekunden lang eng... mit einem Kissen. Schaue jemandem aus der Gruppe während des gesamten Tanzes direkt in die Augen."
        },
        {
          type: "wahrheit",
          text: "Was ist das Letzte, was du heimlich getan hast und von dem niemand hier vermuten würde?"
        },
        {
          type: "pflicht",
          text: "Mache eine Modenschau mit zufälligen Gegenständen im Raum für 2 Minuten."
        },
        {
          type: "wahrheit",
          text: "Was ist die harmloseste Lüge, die du kürzlich erzählt hast?"
        },
        {
          type: "pflicht",
          text: "Imitiere deinen Lieblings-Promi für 1 Minute, ohne zu sagen, wer es ist."
        },
        {
          type: "wahrheit",
          text: "Was ist das Peinlichste in deiner Suchhistorie?"
        },
        {
          type: "pflicht",
          text: "Singe das Alphabet rückwärts, während du die Macarena tanzt."
        },
        {
          type: "wahrheit",
          text: "Wenn du die Gedanken von jemandem hier lesen könntest, wen würdest du wählen?"
        },
        {
          type: "pflicht",
          text: "Halte eine leidenschaftliche 30-Sekunden-Rede über die Wichtigkeit ungleicher Socken."
        },
        {
          type: "wahrheit",
          text: "Was ist das seltsamste Kompliment, das du je erhalten hast?"
        },
        {
          type: "pflicht",
          text: "Zeichne ein Porträt von jemandem aus der Gruppe mit deinen Füßen."
        },
        {
          type: "wahrheit",
          text: "Was ist das Seltsamste, was du tust, wenn du allein bist?"
        },
        {
          type: "pflicht",
          text: "Erzähle eine 2-minütige Geschichte und sprich nur in Fragen."
        },
        {
          type: "wahrheit",
          text: "Was ist dein größtes Bedauern der letzten 5 Jahre?"
        },
        {
          type: "pflicht",
          text: "Leite eine Yoga-Stunde und kommentiere wie ein sehr zen Instruktor."
        },
        {
          type: "wahrheit",
          text: "Wenn du mit jemandem hier in einem Raum eingesperrt werden müsstest, wen würdest du wählen?"
        },
        {
          type: "pflicht",
          text: "Erstelle und führe einen 30-Sekunden-Werbespot für ein imaginäres Produkt auf."
        },
        {
          type: "wahrheit",
          text: "Was ist das Kindischste, was du immer noch tust?"
        },
        {
          type: "pflicht",
          text: "Spiele deinen Lieblingsfilm nach, während die anderen raten."
        },
        {
          type: "wahrheit",
          text: "Was ist der lächerlichste Spitzname, den du bekommen hast?"
        },
        {
          type: "pflicht",
          text: "Mache eine Modenschau nur mit Toilettenpapier."
        },
        {
          type: "wahrheit",
          text: "Wenn du für einen Tag mit jemandem hier die Plätze tauschen könntest, wer wäre es?"
        },
        {
          type: "pflicht",
          text: "Sprich 3 Minuten lang mit dem lächerlichsten Akzent möglich."
        },
        {
          type: "wahrheit",
          text: "Was ist das Impulsivste, was du je getan hast?"
        },
        {
          type: "pflicht",
          text: "Choreographiere einen Tanz zu deinem Lieblingslied nur mit deinen Händen."
        },
        {
          type: "wahrheit",
          text: "Was ist die peinlichste Nachricht, die du aus Versehen gesendet hast?"
        },
        {
          type: "pflicht",
          text: "Erzähle einen Witz mit verschiedenen Stimmen für jeden Charakter."
        },
        {
          type: "wahrheit",
          text: "Wenn du eine deiner Gewohnheiten eliminieren könntest, welche wäre es?"
        },
        {
          type: "pflicht",
          text: "Macht ein Gruppen-Selfie und leite das Fotoshooting wie ein professioneller Fotograf."
        },
        {
          type: "wahrheit",
          text: "Mit welchem Promi würdest du am liebsten einen Kaffee trinken?"
        },
        {
          type: "pflicht",
          text: "Erfinde einen neuen Tanzstil und bringe ihn der Gruppe bei."
        },
        {
          type: "wahrheit",
          text: "Was ist deine größte Unsicherheit, die du nie zugibst?"
        },
        {
          type: "pflicht",
          text: "Mache eine 2-minütige Stand-up-Comedy-Routine."
        },
        {
          type: "wahrheit",
          text: "Wenn du morgen in ein anderes Land ziehen müsstest, welches würdest du wählen?"
        },
        {
          type: "pflicht",
          text: "Imitiere jede Person in der Gruppe für jeweils 10 Sekunden."
        },
        {
          type: "wahrheit",
          text: "Was ist das Peinlichste, was deine Eltern vor deinen Freunden getan haben?"
        },
        {
          type: "pflicht",
          text: "Erstelle einen improvisierten Rap über das, was gerade im Raum passiert."
        },
        {
          type: "wahrheit",
          text: "Was ist die Lüge, die du am häufigsten erzählst?"
        },
        {
          type: "pflicht",
          text: "Gib eine imaginäre Kochstunde und bereite ein unsichtbares Gericht zu."
        },
        {
          type: "wahrheit",
          text: "Wenn du auf jemandes private Nachrichten zugreifen könntest, wen würdest du wählen?"
        },
        {
          type: "pflicht",
          text: "Sei ein Sportkommentator, der jemanden beim Essen beschreibt."
        },
        {
          type: "wahrheit",
          text: "Welche gesellschaftliche Regel brichst du am häufigsten?"
        },
        {
          type: "pflicht",
          text: "Halte einen 2-minütigen TED-Talk über ein völlig absurdes Thema."
        },
        {
          type: "wahrheit",
          text: "Was ist das Geheimnis, das du am längsten bewahrt hast?"
        },
        {
          type: "pflicht",
          text: "Erstelle eine neue Sprache und lehre uns 5 Wörter."
        },
        {
          type: "wahrheit",
          text: "Wenn du zurückgehen und ein Gespräch ändern könntest, welches wäre es?"
        },
        {
          type: "pflicht",
          text: "Mache stummes Karaoke: singe ein bekanntes Lied ohne Ton."
        },
        {
          type: "wahrheit",
          text: "Was ist das Seltsamste, was du an jemandem attraktiv gefunden hast?"
        },
        {
          type: "pflicht",
          text: "Veranstalte eine improvisierte Gameshow mit der Gruppe als Kandidaten."
        },
        {
          type: "wahrheit",
          text: "Wenn du nur eine App auf deinem Handy behalten könntest, welche wäre es?"
        }
      ],
      it: [
        {
          type: "sfida",
          text: "Balla lentamente per 30 secondi... con un cuscino. Guarda qualcuno nel gruppo direttamente negli occhi durante tutta la danza."
        },
        {
          type: "verità",
          text: "Qual è l'ultima cosa che hai fatto in segreto e che nessuno qui sospetterebbe?"
        },
        {
          type: "sfida",
          text: "Fai una sfilata di moda con oggetti casuali nella stanza per 2 minuti."
        },
        {
          type: "verità",
          text: "Qual è la bugia più innocente che hai detto di recente?"
        },
        {
          type: "sfida",
          text: "Imita la tua celebrità preferita per 1 minuto senza dire chi è."
        },
        {
          type: "verità",
          text: "Qual è la cosa più imbarazzante nella tua cronologia di ricerca?"
        },
        {
          type: "sfida",
          text: "Canta l'alfabeto al contrario mentre fai la macarena."
        },
        {
          type: "verità",
          text: "Se potessi leggere la mente di qualcuno qui, chi sceglieresti?"
        },
        {
          type: "sfida",
          text: "Fai un discorso appassionato di 30 secondi sull'importanza dei calzini spaiati."
        },
        {
          type: "verità",
          text: "Qual è il complimento più strano che hai mai ricevuto?"
        },
        {
          type: "sfida",
          text: "Disegna un ritratto di qualcuno del gruppo usando i piedi."
        },
        {
          type: "verità",
          text: "Qual è la cosa più strana che fai quando sei da solo/a?"
        },
        {
          type: "sfida",
          text: "Racconta una storia di 2 minuti parlando solo con domande."
        },
        {
          type: "verità",
          text: "Qual è il tuo più grande rimpianto degli ultimi 5 anni?"
        },
        {
          type: "sfida",
          text: "Conduci una sessione di yoga commentando come un istruttore molto zen."
        },
        {
          type: "verità",
          text: "Se dovessi essere rinchiuso/a in una stanza con qualcuno qui, chi sceglieresti?"
        },
        {
          type: "sfida",
          text: "Crea e interpreta uno spot pubblicitario di 30 secondi per un prodotto immaginario."
        },
        {
          type: "verità",
          text: "Qual è la cosa più infantile che fai ancora?"
        },
        {
          type: "sfida",
          text: "Recita il tuo film preferito mentre gli altri indovinano."
        },
        {
          type: "verità",
          text: "Qual è il soprannome più ridicolo che ti hanno dato?"
        },
        {
          type: "sfida",
          text: "Fai una sfilata di moda usando solo carta igienica."
        },
        {
          type: "verità",
          text: "Se potessi scambiare posto con qualcuno qui per un giorno, chi sarebbe?"
        },
        {
          type: "sfida",
          text: "Parla con l'accento più ridicolo possibile per 3 minuti."
        },
        {
          type: "verità",
          text: "Qual è la cosa più impulsiva che hai mai fatto?"
        },
        {
          type: "sfida",
          text: "Coreografa una danza sulla tua canzone preferita usando solo le mani."
        },
        {
          type: "verità",
          text: "Qual è il messaggio più imbarazzante che hai inviato per sbaglio?"
        },
        {
          type: "sfida",
          text: "Racconta una barzelletta usando voci diverse per ogni personaggio."
        },
        {
          type: "verità",
          text: "Se potessi eliminare una delle tue abitudini, quale sarebbe?"
        },
        {
          type: "sfida",
          text: "Fai un selfie di gruppo dirigendo il servizio fotografico come un fotografo professionale."
        },
        {
          type: "verità",
          text: "Con quale celebrità vorresti di più prendere un caffè?"
        },
        {
          type: "sfida",
          text: "Inventa un nuovo stile di danza e insegnalo al gruppo."
        },
        {
          type: "verità",
          text: "Qual è la tua più grande insicurezza che non ammetti mai?"
        },
        {
          type: "sfida",
          text: "Fai una routine di stand-up comedy di 2 minuti."
        },
        {
          type: "verità",
          text: "Se dovessi trasferirti in un altro paese domani, quale sceglieresti?"
        },
        {
          type: "sfida",
          text: "Imita ogni persona del gruppo per 10 secondi ciascuna."
        },
        {
          type: "verità",
          text: "Qual è la cosa più imbarazzante che i tuoi genitori hanno fatto davanti ai tuoi amici?"
        },
        {
          type: "sfida",
          text: "Crea un rap improvvisato su quello che sta succedendo nella stanza ora."
        },
        {
          type: "verità",
          text: "Qual è la bugia che dici più spesso?"
        },
        {
          type: "sfida",
          text: "Fai una lezione di cucina immaginaria preparando un piatto invisibile."
        },
        {
          type: "verità",
          text: "Se potessi accedere ai messaggi privati di qualcuno, chi sceglieresti?"
        },
        {
          type: "sfida",
          text: "Fai il commentatore sportivo descrivendo qualcuno che mangia."
        },
        {
          type: "verità",
          text: "Quale regola sociale infragi più spesso?"
        },
        {
          type: "sfida",
          text: "Fai un TED talk di 2 minuti su un argomento completamente assurdo."
        },
        {
          type: "verità",
          text: "Qual è il segreto che hai tenuto più a lungo?"
        },
        {
          type: "sfida",
          text: "Crea una nuova lingua e insegnaci 5 parole."
        },
        {
          type: "verità",
          text: "Se potessi tornare indietro e cambiare una conversazione, quale sarebbe?"
        },
        {
          type: "sfida",
          text: "Fai karaoke silenzioso: canta una canzone famosa senza suono."
        },
        {
          type: "verità",
          text: "Qual è la cosa più strana che hai trovato attraente in qualcuno?"
        },
        {
          type: "sfida",
          text: "Organizza un game show improvvisato con il gruppo come concorrenti."
        },
        {
          type: "verità",
          text: "Se dovessi scegliere solo un'app sul tuo telefono, quale terresti?"
        }
      ],
      pt: [
        {
          type: "desafio",
          text: "Dance coladinho por 30 segundos... com um travesseiro. Olhe alguém do grupo diretamente nos olhos durante toda a dança."
        },
        {
          type: "verdade",
          text: "Qual foi a última coisa que você fez em segredo e que ninguém aqui suspeitaria?"
        },
        {
          type: "desafio",
          text: "Faça um desfile de moda com objetos aleatórios da sala por 2 minutos."
        },
        {
          type: "verdade",
          text: "Qual é a mentira mais inocente que você contou recentemente?"
        },
        {
          type: "desafio",
          text: "Imite sua celebridade favorita por 1 minuto sem dizer quem é."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais embaraçosa no seu histórico de pesquisa?"
        },
        {
          type: "desafio",
          text: "Cante o alfabeto de trás para frente enquanto faz a macarena."
        },
        {
          type: "verdade",
          text: "Se você pudesse ler a mente de alguém aqui, quem escolheria?"
        },
        {
          type: "desafio",
          text: "Faça um discurso apaixonado de 30 segundos sobre a importância de meias descombinadas."
        },
        {
          type: "verdade",
          text: "Qual é o elogio mais estranho que você já recebeu?"
        },
        {
          type: "desafio",
          text: "Desenhe um retrato de alguém do grupo usando os pés."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais estranha que você faz quando está sozinho/a?"
        },
        {
          type: "desafio",
          text: "Conte uma história de 2 minutos falando apenas em perguntas."
        },
        {
          type: "verdade",
          text: "Qual é o seu maior arrependimento dos últimos 5 anos?"
        },
        {
          type: "desafio",
          text: "Conduza uma sessão de yoga comentando como um instrutor muito zen."
        },
        {
          type: "verdade",
          text: "Se você tivesse que ficar trancado/a numa sala com alguém daqui, quem escolheria?"
        },
        {
          type: "desafio",
          text: "Crie e apresente um comercial de 30 segundos para um produto imaginário."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais infantil que você ainda faz?"
        },
        {
          type: "desafio",
          text: "Atue seu filme favorito enquanto outros adivinham."
        },
        {
          type: "verdade",
          text: "Qual é o apelido mais ridículo que te deram?"
        },
        {
          type: "desafio",
          text: "Faça um desfile de moda usando apenas papel higiênico."
        },
        {
          type: "verdade",
          text: "Se você pudesse trocar de lugar com alguém aqui por um dia, quem seria?"
        },
        {
          type: "desafio",
          text: "Fale com o sotaque mais ridículo possível por 3 minutos."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais impulsiva que você já fez?"
        },
        {
          type: "desafio",
          text: "Coreografe uma dança da sua música favorita usando apenas as mãos."
        },
        {
          type: "verdade",
          text: "Qual é a mensagem mais constrangedora que você enviou por engano?"
        },
        {
          type: "desafio",
          text: "Conte uma piada usando vozes diferentes para cada personagem."
        },
        {
          type: "verdade",
          text: "Se você pudesse eliminar um dos seus hábitos, qual seria?"
        },
        {
          type: "desafio",
          text: "Tirem uma selfie em grupo dirigindo a sessão de fotos como um fotógrafo profissional."
        },
        {
          type: "verdade",
          text: "Com qual celebridade você mais gostaria de tomar um café?"
        },
        {
          type: "desafio",
          text: "Invente um novo estilo de dança e ensine ao grupo."
        },
        {
          type: "verdade",
          text: "Qual é a sua maior insegurança que você nunca admite?"
        },
        {
          type: "desafio",
          text: "Faça uma rotina de stand-up comedy de 2 minutos."
        },
        {
          type: "verdade",
          text: "Se você tivesse que se mudar para outro país amanhã, qual escolheria?"
        },
        {
          type: "desafio",
          text: "Imite cada pessoa do grupo por 10 segundos cada uma."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais embaraçosa que seus pais fizeram na frente dos seus amigos?"
        },
        {
          type: "desafio",
          text: "Crie um rap improvisado sobre o que está acontecendo na sala agora."
        },
        {
          type: "verdade",
          text: "Qual é a mentira que você conta mais frequentemente?"
        },
        {
          type: "desafio",
          text: "Dê uma aula de culinária imaginária preparando um prato invisível."
        },
        {
          type: "verdade",
          text: "Se você pudesse acessar as mensagens privadas de alguém, quem escolheria?"
        },
        {
          type: "desafio",
          text: "Seja um comentarista esportivo descrevendo alguém comendo."
        },
        {
          type: "verdade",
          text: "Qual regra social você quebra mais frequentemente?"
        },
        {
          type: "desafio",
          text: "Faça uma palestra TED de 2 minutos sobre um tópico completamente absurdo."
        },
        {
          type: "verdade",
          text: "Qual é o segredo que você guardou por mais tempo?"
        },
        {
          type: "desafio",
          text: "Crie uma nova língua e nos ensine 5 palavras."
        },
        {
          type: "verdade",
          text: "Se você pudesse voltar atrás e mudar uma conversa, qual seria?"
        },
        {
          type: "desafio",
          text: "Faça karaokê silencioso: cante uma música famosa sem som."
        },
        {
          type: "verdade",
          text: "Qual é a coisa mais estranha que você achou atraente em alguém?"
        },
        {
          type: "desafio",
          text: "Organize um programa de jogos improvisado com o grupo como concorrentes."
        },
        {
          type: "verdade",
          text: "Se você tivesse que escolher apenas um aplicativo no seu telefone, qual manteria?"
        }
      ],
      ar: [
        {
          type: "تحدي",
          text: "ارقص ببطء لمدة 30 ثانية... مع وسادة. انظر إلى شخص في المجموعة مباشرة في العينين خلال الرقصة بأكملها."
        },
        {
          type: "حقيقة",
          text: "ما هو آخر شيء فعلته سراً ولا أحد هنا يشك فيه؟"
        },
        {
          type: "تحدي",
          text: "اعمل عرض أزياء بأشياء عشوائية في الغرفة لمدة دقيقتين."
        },
        {
          type: "حقيقة",
          text: "ما هي أبرأ كذبة قلتها مؤخراً؟"
        },
        {
          type: "تحدي",
          text: "قلد المشهور المفضل لديك لمدة دقيقة دون أن تقول من هو."
        },
        {
          type: "حقيقة",
          text: "ما هو أكثر شيء محرج في تاريخ بحثك؟"
        },
        {
          type: "تحدي",
          text: "اغنِ الأبجدية بالعكس بينما ترقص الماكارينا."
        },
        {
          type: "حقيقة",
          text: "إذا كان بإمكانك قراءة عقل شخص هنا، من ستختار؟"
        },
        {
          type: "تحدي",
          text: "ألقِ خطاباً شغوفاً لمدة 30 ثانية عن أهمية الجوارب غير المتطابقة."
        },
        {
          type: "حقيقة",
          text: "ما هو أغرب مجاملة تلقيتها؟"
        },
        {
          type: "تحدي",
          text: "ارسم صورة شخصية لأحد أفراد المجموعة باستخدام قدميك."
        },
        {
          type: "حقيقة",
          text: "ما هو أغرب شيء تفعله عندما تكون وحيداً؟"
        },
        {
          type: "تحدي",
          text: "احكِ قصة لمدة دقيقتين بالتحدث بالأسئلة فقط."
        },
        {
          type: "حقيقة",
          text: "ما هو أكبر ندم لديك من السنوات الخمس الماضية؟"
        },
        {
          type: "تحدي",
          text: "قُد جلسة يوغا مع التعليق كمدرب زين جداً."
        },
        {
          type: "حقيقة",
          text: "إذا كان عليك أن تُحبس في غرفة مع شخص من هنا، من ستختار؟"
        },
        {
          type: "تحدي",
          text: "اصنع وقدم إعلاناً تجارياً لمدة 30 ثانية لمنتج خيالي."
        },
        {
          type: "حقيقة",
          text: "ما هو أكثر شيء طفولي ما زلت تفعله؟"
        },
        {
          type: "تحدي",
          text: "مثّل فيلمك المفضل بينما يخمن الآخرون."
        },
        {
          type: "حقيقة",
          text: "ما هو أسخف لقب أطلقوه عليك؟"
        },
        {
          type: "تحدي",
          text: "اعمل عرض أزياء باستخدام ورق التواليت فقط."
        },
        {
          type: "حقيقة",
          text: "إذا كان بإمكانك تبديل الأماكن مع شخص هنا ليوم واحد، من سيكون؟"
        },
        {
          type: "تحدي",
          text: "تحدث بأسخف لهجة ممكنة لمدة 3 دقائق."
        },
        {
          type: "حقيقة",
          text: "ما هو أكثر شيء اندفاعي فعلته؟"
        },
        {
          type: "تحدي",
          text: "صمم رقصة لأغنيتك المفضلة باستخدام يديك فقط."
        },
        {
          type: "حقيقة",
          text: "ما هي أكثر رسالة محرجة أرسلتها بالخطأ؟"
        },
        {
          type: "تحدي",
          text: "احكِ نكتة باستخدام أصوات مختلفة لكل شخصية."
        },
        {
          type: "حقيقة",
          text: "إذا كان بإمكانك إلغاء إحدى عاداتك، فأيها ستكون؟"
        },
        {
          type: "تحدي",
          text: "التقطوا صورة جماعية مع إدارة جلسة التصوير كمصور محترف."
        },
        {
          type: "حقيقة",
          text: "مع أي مشهور تود أن تشرب القهوة أكثر؟"
        },
        {
          type: "تحدي",
          text: "اخترع نمط رقص جديد وعلمه للمجموعة."
        },
        {
          type: "حقيقة",
          text: "ما هو أكبر انعدام أمان لديك والذي لا تعترف به أبداً؟"
        },
        {
          type: "تحدي",
          text: "قم بعرض كوميدي وقوف لمدة دقيقتين."
        },
        {
          type: "حقيقة",
          text: "إذا كان عليك الانتقال إلى بلد آخر غداً، أيهما ستختار؟"
        },
        {
          type: "تحدي",
          text: "قلد كل شخص في المجموعة لمدة 10 ثوان لكل واحد."
        },
        {
          type: "حقيقة",
          text: "ما هو أكثر شيء محرج فعله والداك أمام أصدقائك؟"
        },
        {
          type: "تحدي",
          text: "اصنع راب مرتجل عما يحدث في الغرفة الآن."
        },
        {
          type: "حقيقة",
          text: "ما هي الكذبة التي تقولها أكثر؟"
        },
        {
          type: "تحدي",
          text: "أعطِ درس طبخ خيالي بتحضير طبق غير مرئي."
        },
        {
          type: "حقيقة",
          text: "إذا كان بإمكانك الوصول إلى الرسائل الخاصة لشخص ما، من ستختار؟"
        },
        {
          type: "تحدي",
          text: "كن معلق رياضي يصف شخصاً يأكل."
        },
        {
          type: "حقيقة",
          text: "ما هي القاعدة الاجتماعية التي تكسرها أكثر؟"
        },
        {
          type: "تحدي",
          text: "ألقِ محاضرة TED لمدة دقيقتين عن موضوع سخيف تماماً."
        },
        {
          type: "حقيقة",
          text: "ما هو السر الذي احتفظت به لأطول فترة؟"
        },
        {
          type: "تحدي",
          text: "اصنع لغة جديدة وعلمنا 5 كلمات."
        },
        {
          type: "حقيقة",
          text: "إذا كان بإمكانك العودة وتغيير محادثة واحدة، فأيها ستكون؟"
        },
        {
          type: "تحدي",
          text: "اعمل كاريوكي صامت: اغنِ أغنية مشهورة بدون صوت."
        },
        {
          type: "حقيقة",
          text: "ما هو أغرب شيء وجدته جذاباً في شخص ما؟"
        },
        {
          type: "تحدي",
          text: "نظم برنامج ألعاب مرتجل مع المجموعة كمتسابقين."
        },
        {
          type: "حقيقة",
          text: "إذا كان عليك اختيار تطبيق واحد فقط على هاتفك، أيهما ستحتفظ به؟"
        }
      ]
    }
  },
  'genius-or-liar': {
    translations: {
      fr: [
        {type: "cultureG", question: "Quel est le plus long fleuve du monde ?", answer: "Le Nil"},
        {type: "cultureG", question: "Quelle est la monnaie utilisée au Royaume-Uni ?", answer: "La livre sterling"},
        {
          type: "cultureGHard",
          question: "Quel est le seul pays au monde situé sur deux continents ?",
          answer: "La Turquie"
        },
        {type: "culturePop", question: "Quel film a popularisé la réplique 'Je suis ton père' ?", answer: "Star Wars"},
        {type: "science", question: "Combien d'os a un adulte humain ?", answer: "206"},
        {type: "geographie", question: "Quelle est la capitale de l'Australie ?", answer: "Canberra"},
        {type: "histoire", question: "En quelle année a eu lieu la chute du mur de Berlin ?", answer: "1989"},
        {
          type: "sport",
          question: "Combien de joueurs y a-t-il dans une équipe de basket sur le terrain ?",
          answer: "5"
        },
        {type: "cultureG", question: "Quel animal est le symbole de l'Australie ?", answer: "Le kangourou"},
        {type: "science", question: "Quelle planète est la plus proche du Soleil ?", answer: "Mercure"},
        {type: "cultureGHard", question: "Dans quel pays a été inventé le sudoku ?", answer: "Le Japon"},
        {type: "culturePop", question: "Qui a écrit 'Harry Potter' ?", answer: "J.K. Rowling"},
        {type: "geographie", question: "Quel est le plus petit pays du monde ?", answer: "Vatican"},
        {type: "histoire", question: "Qui était le premier président des États-Unis ?", answer: "George Washington"},
        {type: "science", question: "Quel gaz représente environ 78% de l'atmosphère terrestre ?", answer: "L'azote"},
        {type: "sport", question: "Tous les combien d'années ont lieu les Jeux Olympiques d'été ?", answer: "4 ans"},
        {type: "cultureG", question: "Combien de continents y a-t-il ?", answer: "7"},
        {type: "culturePop", question: "Quel réseau social a été créé par Mark Zuckerberg ?", answer: "Facebook"},
        {
          type: "cultureGHard",
          question: "Quel est l'élément chimique le plus abondant dans l'univers ?",
          answer: "L'hydrogène"
        },
        {type: "geographie", question: "Dans quel pays se trouve le Machu Picchu ?", answer: "Le Pérou"},
        {
          type: "histoire",
          question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
          answer: "1969"
        },
        {type: "science", question: "Quel organe du corps humain produit l'insuline ?", answer: "Le pancréas"},
        {type: "sport", question: "Dans quel sport utilise-t-on un volant ?", answer: "Le badminton"},
        {type: "cultureG", question: "Combien de cordes a une guitare classique ?", answer: "6"},
        {
          type: "culturePop",
          question: "Quel personnage Disney a de très longues oreilles et mange des carottes ?",
          answer: "Bugs Bunny"
        },
        {
          type: "cultureGHard",
          question: "Quel est le nom de la galaxie dans laquelle se trouve notre système solaire ?",
          answer: "La Voie lactée"
        },
        {type: "geographie", question: "Quel océan borde la côte ouest de l'Afrique ?", answer: "L'océan Atlantique"},
        {type: "histoire", question: "Combien d'années a duré la Seconde Guerre mondiale ?", answer: "6 ans"},
        {type: "science", question: "À quelle température l'eau bout-elle au niveau de la mer ?", answer: "100°C"},
        {type: "sport", question: "Quel pays a gagné la Coupe du Monde de football en 2018 ?", answer: "La France"},
        {type: "cultureG", question: "Combien de minutes y a-t-il dans une heure ?", answer: "60"},
        {type: "culturePop", question: "Quel est le prénom de la sirène dans le film Disney ?", answer: "Ariel"},
        {
          type: "cultureGHard",
          question: "Quel scientifique a développé la théorie de la relativité ?",
          answer: "Einstein"
        },
        {type: "geographie", question: "Quel désert est le plus grand du monde ?", answer: "Le Sahara"},
        {type: "histoire", question: "Quel empereur français a été exilé à Sainte-Hélène ?", answer: "Napoléon"},
        {type: "science", question: "Combien de chambres a le cœur humain ?", answer: "4"},
        {
          type: "sport",
          question: "Dans quel sport les joueurs utilisent-ils des raquettes et une balle jaune ?",
          answer: "Le tennis"
        },
        {type: "cultureG", question: "Combien de jours compte une année bissextile ?", answer: "366"},
        {
          type: "culturePop",
          question: "Quel super-héros porte un costume rouge et bleu et peut voler ?",
          answer: "Superman"
        },
        {type: "cultureGHard", question: "Quel est le plus petit os du corps humain ?", answer: "L'étrier"},
        {type: "geographie", question: "Sur quel continent se trouve l'Égypte ?", answer: "L'Afrique"},
        {type: "histoire", question: "En quelle année a été construite la Tour Eiffel ?", answer: "1889"},
        {type: "science", question: "Quel est le symbole chimique de l'or ?", answer: "Au"},
        {
          type: "sport",
          question: "Combien de sets faut-il gagner pour remporter un match de tennis masculin en Grand Chelem ?",
          answer: "3"
        },
        {type: "cultureG", question: "Combien de pattes a une araignée ?", answer: "8"},
        {type: "culturePop", question: "Quel est le nom du lion dans 'Le Roi Lion' ?", answer: "Simba"},
        {type: "cultureGHard", question: "Quel pays a inventé les pâtes ?", answer: "La Chine"},
        {type: "geographie", question: "Quelle mer sépare l'Europe de l'Afrique ?", answer: "La mer Méditerranée"},
        {type: "histoire", question: "Qui a peint la Chapelle Sixtine ?", answer: "Michel-Ange"},
        {type: "science", question: "Quelle est la vitesse de la lumière dans le vide ?", answer: "300 000 km/s"}
      ],
      en: [
        {type: "generalKnowledge", question: "What is the longest river in the world?", answer: "The Nile"},
        {
          type: "generalKnowledge",
          question: "What currency is used in the United Kingdom?",
          answer: "The pound sterling"
        },
        {
          type: "hardGeneralKnowledge",
          question: "What is the only country in the world located on two continents?",
          answer: "Turkey"
        },
        {type: "popCulture", question: "Which movie popularized the line 'I am your father'?", answer: "Star Wars"},
        {type: "science", question: "How many bones does an adult human have?", answer: "206"},
        {type: "geography", question: "What is the capital of Australia?", answer: "Canberra"},
        {type: "history", question: "In what year did the Berlin Wall fall?", answer: "1989"},
        {type: "sports", question: "How many players are on a basketball team on the court?", answer: "5"},
        {type: "generalKnowledge", question: "What animal is the symbol of Australia?", answer: "The kangaroo"},
        {type: "science", question: "Which planet is closest to the Sun?", answer: "Mercury"},
        {type: "hardGeneralKnowledge", question: "In which country was Sudoku invented?", answer: "Japan"},
        {type: "popCulture", question: "Who wrote 'Harry Potter'?", answer: "J.K. Rowling"},
        {type: "geography", question: "What is the smallest country in the world?", answer: "Vatican"},
        {type: "history", question: "Who was the first President of the United States?", answer: "George Washington"},
        {type: "science", question: "What gas makes up about 78% of Earth's atmosphere?", answer: "Nitrogen"},
        {type: "sports", question: "How often do the Summer Olympics take place?", answer: "Every 4 years"},
        {type: "generalKnowledge", question: "How many continents are there?", answer: "7"},
        {type: "popCulture", question: "What social network was created by Mark Zuckerberg?", answer: "Facebook"},
        {
          type: "hardGeneralKnowledge",
          question: "What is the most abundant chemical element in the universe?",
          answer: "Hydrogen"
        },
        {type: "geography", question: "In which country is Machu Picchu located?", answer: "Peru"},
        {type: "history", question: "In what year did man first walk on the Moon?", answer: "1969"},
        {type: "science", question: "Which organ in the human body produces insulin?", answer: "The pancreas"},
        {type: "sports", question: "In which sport do you use a shuttlecock?", answer: "Badminton"},
        {type: "generalKnowledge", question: "How many strings does a classical guitar have?", answer: "6"},
        {
          type: "popCulture",
          question: "Which Disney character has very long ears and eats carrots?",
          answer: "Bugs Bunny"
        },
        {
          type: "hardGeneralKnowledge",
          question: "What is the name of the galaxy containing our solar system?",
          answer: "The Milky Way"
        },
        {type: "geography", question: "Which ocean borders the west coast of Africa?", answer: "The Atlantic Ocean"},
        {type: "history", question: "How many years did World War II last?", answer: "6 years"},
        {type: "science", question: "At what temperature does water boil at sea level?", answer: "100°C"},
        {type: "sports", question: "Which country won the 2018 FIFA World Cup?", answer: "France"},
        {type: "generalKnowledge", question: "How many minutes are in an hour?", answer: "60"},
        {type: "popCulture", question: "What is the name of the mermaid in the Disney movie?", answer: "Ariel"},
        {
          type: "hardGeneralKnowledge",
          question: "Which scientist developed the theory of relativity?",
          answer: "Einstein"
        },
        {type: "geography", question: "Which is the largest desert in the world?", answer: "The Sahara"},
        {type: "history", question: "Which French emperor was exiled to Saint Helena?", answer: "Napoleon"},
        {type: "science", question: "How many chambers does the human heart have?", answer: "4"},
        {type: "sports", question: "In which sport do players use rackets and a yellow ball?", answer: "Tennis"},
        {type: "generalKnowledge", question: "How many days are in a leap year?", answer: "366"},
        {type: "popCulture", question: "Which superhero wears a red and blue costume and can fly?", answer: "Superman"},
        {
          type: "hardGeneralKnowledge",
          question: "What is the smallest bone in the human body?",
          answer: "The stapes"
        },
        {type: "geography", question: "On which continent is Egypt located?", answer: "Africa"},
        {type: "history", question: "In what year was the Eiffel Tower built?", answer: "1889"},
        {type: "science", question: "What is the chemical symbol for gold?", answer: "Au"},
        {
          type: "sports",
          question: "How many sets must you win to win a men's Grand Slam tennis match?",
          answer: "3"
        },
        {type: "generalKnowledge", question: "How many legs does a spider have?", answer: "8"},
        {type: "popCulture", question: "What is the name of the lion in 'The Lion King'?", answer: "Simba"},
        {type: "hardGeneralKnowledge", question: "Which country invented pasta?", answer: "China"},
        {type: "geography", question: "Which sea separates Europe from Africa?", answer: "The Mediterranean Sea"},
        {type: "history", question: "Who painted the Sistine Chapel?", answer: "Michelangelo"},
        {type: "science", question: "What is the speed of light in a vacuum?", answer: "300,000 km/s"}
      ],
      es: [
        {type: "culturaGeneral", question: "¿Cuál es el río más largo del mundo?", answer: "El Nilo"},
        {type: "culturaGeneral", question: "¿Qué moneda se utiliza en el Reino Unido?", answer: "La libra esterlina"},
        {
          type: "culturaGeneralDificil",
          question: "¿Cuál es el único país del mundo situado en dos continentes?",
          answer: "Turquía"
        },
        {type: "culturaPop", question: "¿Qué película popularizó la frase 'Yo soy tu padre'?", answer: "Star Wars"},
        {type: "ciencia", question: "¿Cuántos huesos tiene un adulto humano?", answer: "206"},
        {type: "geografía", question: "¿Cuál es la capital de Australia?", answer: "Canberra"},
        {type: "historia", question: "¿En qué año cayó el Muro de Berlín?", answer: "1989"},
        {type: "deporte", question: "¿Cuántos jugadores hay en un equipo de baloncesto en la cancha?", answer: "5"},
        {type: "culturaGeneral", question: "¿Qué animal es el símbolo de Australia?", answer: "El canguro"},
        {type: "ciencia", question: "¿Qué planeta está más cerca del Sol?", answer: "Mercurio"},
        {type: "culturaGeneralDificil", question: "¿En qué país se inventó el sudoku?", answer: "Japón"},
        {type: "culturaPop", question: "¿Quién escribió 'Harry Potter'?", answer: "J.K. Rowling"},
        {type: "geografía", question: "¿Cuál es el país más pequeño del mundo?", answer: "Vaticano"},
        {type: "historia", question: "¿Quién fue el primer presidente de Estados Unidos?", answer: "George Washington"},
        {
          type: "ciencia",
          question: "¿Qué gas representa aproximadamente el 78% de la atmósfera terrestre?",
          answer: "El nitrógeno"
        },
        {type: "deporte", question: "¿Cada cuántos años se celebran los Juegos Olímpicos de verano?", answer: "4 años"},
        {type: "culturaGeneral", question: "¿Cuántos continentes hay?", answer: "7"},
        {type: "culturaPop", question: "¿Qué red social creó Mark Zuckerberg?", answer: "Facebook"},
        {
          type: "culturaGeneralDificil",
          question: "¿Cuál es el elemento químico más abundante en el universo?",
          answer: "El hidrógeno"
        },
        {type: "geografía", question: "¿En qué país se encuentra Machu Picchu?", answer: "Perú"},
        {type: "historia", question: "¿En qué año pisó el hombre la Luna por primera vez?", answer: "1969"},
        {type: "ciencia", question: "¿Qué órgano del cuerpo humano produce la insulina?", answer: "El páncreas"},
        {type: "deporte", question: "¿En qué deporte se usa un volante?", answer: "El bádminton"},
        {type: "culturaGeneral", question: "¿Cuántas cuerdas tiene una guitarra clásica?", answer: "6"},
        {
          type: "culturaPop",
          question: "¿Qué personaje Disney tiene orejas muy largas y come zanahorias?",
          answer: "Bugs Bunny"
        },
        {
          type: "culturaGeneralDificil",
          question: "¿Cómo se llama la galaxia que contiene nuestro sistema solar?",
          answer: "La Vía Láctea"
        },
        {type: "geografía", question: "¿Qué océano bordea la costa oeste de África?", answer: "El océano Atlántico"},
        {type: "historia", question: "¿Cuántos años duró la Segunda Guerra Mundial?", answer: "6 años"},
        {type: "ciencia", question: "¿A qué temperatura hierve el agua al nivel del mar?", answer: "100°C"},
        {type: "deporte", question: "¿Qué país ganó la Copa Mundial de fútbol de 2018?", answer: "Francia"},
        {type: "culturaGeneral", question: "¿Cuántos minutos hay en una hora?", answer: "60"},
        {type: "culturaPop", question: "¿Cómo se llama la sirena en la película de Disney?", answer: "Ariel"},
        {
          type: "culturaGeneralDificil",
          question: "¿Qué científico desarrolló la teoría de la relatividad?",
          answer: "Einstein"
        },
        {type: "geografía", question: "¿Cuál es el desierto más grande del mundo?", answer: "El Sahara"},
        {type: "historia", question: "¿Qué emperador francés fue exiliado a Santa Elena?", answer: "Napoleón"},
        {type: "ciencia", question: "¿Cuántas cámaras tiene el corazón humano?", answer: "4"},
        {
          type: "deporte",
          question: "¿En qué deporte los jugadores usan raquetas y una pelota amarilla?",
          answer: "El tenis"
        },
        {type: "culturaGeneral", question: "¿Cuántos días tiene un año bisiesto?", answer: "366"},
        {type: "culturaPop", question: "¿Qué superhéroe lleva un traje rojo y azul y puede volar?", answer: "Superman"},
        {
          type: "culturaGeneralDificil",
          question: "¿Cuál es el hueso más pequeño del cuerpo humano?",
          answer: "El estribo"
        },
        {type: "geografía", question: "¿En qué continente se encuentra Egipto?", answer: "África"},
        {type: "historia", question: "¿En qué año se construyó la Torre Eiffel?", answer: "1889"},
        {type: "ciencia", question: "¿Cuál es el símbolo químico del oro?", answer: "Au"},
        {
          type: "deporte",
          question: "¿Cuántos sets hay que ganar para ganar un partido de tenis masculino de Grand Slam?",
          answer: "3"
        },
        {type: "culturaGeneral", question: "¿Cuántas patas tiene una araña?", answer: "8"},
        {type: "culturaPop", question: "¿Cómo se llama el león en 'El Rey León'?", answer: "Simba"},
        {type: "culturaGeneralDificil", question: "¿Qué país inventó la pasta?", answer: "China"},
        {type: "geografía", question: "¿Qué mar separa Europa de África?", answer: "El mar Mediterráneo"},
        {type: "historia", question: "¿Quién pintó la Capilla Sixtina?", answer: "Miguel Ángel"},
        {type: "ciencia", question: "¿Cuál es la velocidad de la luz en el vacío?", answer: "300.000 km/s"}
      ],
      de: [
        {type: "allgemeinwissen", question: "Welcher ist der längste Fluss der Welt?", answer: "Der Nil"},
        {
          type: "allgemeinwissen",
          question: "Welche Währung wird im Vereinigten Königreich verwendet?",
          answer: "Das Pfund Sterling"
        },
        {
          type: "schwerAllgemeinwissen",
          question: "Welches ist das einzige Land der Welt, das auf zwei Kontinenten liegt?",
          answer: "Die Türkei"
        },
        {
          type: "popkultur",
          question: "Welcher Film hat die Zeile 'Ich bin dein Vater' populär gemacht?",
          answer: "Star Wars"
        },
        {type: "wissenschaft", question: "Wie viele Knochen hat ein erwachsener Mensch?", answer: "206"},
        {type: "geographie", question: "Was ist die Hauptstadt von Australien?", answer: "Canberra"},
        {type: "geschichte", question: "In welchem Jahr fiel die Berliner Mauer?", answer: "1989"},
        {type: "sport", question: "Wie viele Spieler sind in einem Basketballteam auf dem Feld?", answer: "5"},
        {type: "allgemeinwissen", question: "Welches Tier ist das Symbol Australiens?", answer: "Das Känguru"},
        {type: "wissenschaft", question: "Welcher Planet ist der Sonne am nächsten?", answer: "Merkur"},
        {
          type: "schwerAllgemeinwissen",
          question: "In welchem Land wurde Sudoku erfunden?",
          answer: "Japan"
        },
        {type: "popkultur", question: "Wer schrieb 'Harry Potter'?", answer: "J.K. Rowling"},
        {type: "geographie", question: "Was ist das kleinste Land der Welt?", answer: "Vatikan"},
        {
          type: "geschichte",
          question: "Wer war der erste Präsident der Vereinigten Staaten?",
          answer: "George Washington"
        },
        {type: "wissenschaft", question: "Welches Gas macht etwa 78% der Erdatmosphäre aus?", answer: "Stickstoff"},
        {type: "sport", question: "Wie oft finden die Olympischen Sommerspiele statt?", answer: "Alle 4 Jahre"},
        {type: "allgemeinwissen", question: "Wie viele Kontinente gibt es?", answer: "7"},
        {
          type: "popkultur",
          question: "Welches soziale Netzwerk wurde von Mark Zuckerberg erstellt?",
          answer: "Facebook"
        },
        {
          type: "schwerAllgemeinwissen",
          question: "Was ist das häufigste chemische Element im Universum?",
          answer: "Wasserstoff"
        },
        {type: "geographie", question: "In welchem Land befindet sich Machu Picchu?", answer: "Peru"},
        {type: "geschichte", question: "In welchem Jahr betrat der Mensch zum ersten Mal den Mond?", answer: "1969"},
        {
          type: "wissenschaft",
          question: "Welches Organ im menschlichen Körper produziert Insulin?",
          answer: "Die Bauchspeicheldrüse"
        },
        {type: "sport", question: "In welchem Sport verwendet man einen Federball?", answer: "Badminton"},
        {type: "allgemeinwissen", question: "Wie viele Saiten hat eine klassische Gitarre?", answer: "6"},
        {
          type: "popkultur",
          question: "Welche Disney-Figur hat sehr lange Ohren und isst Karotten?",
          answer: "Bugs Bunny"
        },
        {
          type: "schwerAllgemeinwissen",
          question: "Wie heißt die Galaxie, die unser Sonnensystem enthält?",
          answer: "Die Milchstraße"
        },
        {
          type: "geographie",
          question: "Welcher Ozean grenzt an die Westküste Afrikas?",
          answer: "Der Atlantische Ozean"
        },
        {type: "geschichte", question: "Wie lange dauerte der Zweite Weltkrieg?", answer: "6 Jahre"},
        {type: "wissenschaft", question: "Bei welcher Temperatur kocht Wasser auf Meereshöhe?", answer: "100°C"},
        {type: "sport", question: "Welches Land gewann die Fußball-Weltmeisterschaft 2018?", answer: "Frankreich"},
        {type: "allgemeinwissen", question: "Wie viele Minuten hat eine Stunde?", answer: "60"},
        {type: "popkultur", question: "Wie heißt die Meerjungfrau im Disney-Film?", answer: "Ariel"},
        {
          type: "schwerAllgemeinwissen",
          question: "Welcher Wissenschaftler entwickelte die Relativitätstheorie?",
          answer: "Einstein"
        },
        {type: "geographie", question: "Welche ist die größte Wüste der Welt?", answer: "Die Sahara"},
        {
          type: "geschichte",
          question: "Welcher französische Kaiser wurde nach Sankt Helena verbannt?",
          answer: "Napoleon"
        },
        {type: "wissenschaft", question: "Wie viele Kammern hat das menschliche Herz?", answer: "4"},
        {
          type: "sport",
          question: "In welchem Sport verwenden Spieler Schläger und einen gelben Ball?",
          answer: "Tennis"
        },
        {type: "allgemeinwissen", question: "Wie viele Tage hat ein Schaltjahr?", answer: "366"},
        {
          type: "popkultur",
          question: "Welcher Superheld trägt ein rot-blaues Kostüm und kann fliegen?",
          answer: "Superman"
        },
        {
          type: "schwerAllgemeinwissen",
          question: "Was ist der kleinste Knochen im menschlichen Körper?",
          answer: "Der Steigbügel"
        },
        {type: "geographie", question: "Auf welchem Kontinent liegt Ägypten?", answer: "Afrika"},
        {type: "geschichte", question: "In welchem Jahr wurde der Eiffelturm gebaut?", answer: "1889"},
        {type: "wissenschaft", question: "Was ist das chemische Symbol für Gold?", answer: "Au"},
        {
          type: "sport",
          question: "Wie viele Sätze muss man gewinnen, um ein Herren-Grand-Slam-Tennismatch zu gewinnen?",
          answer: "3"
        },
        {type: "allgemeinwissen", question: "Wie viele Beine hat eine Spinne?", answer: "8"},
        {type: "popkultur", question: "Wie heißt der Löwe in 'Der König der Löwen'?", answer: "Simba"},
        {type: "schwerAllgemeinwissen", question: "Welches Land hat die Nudeln erfunden?", answer: "China"},
        {type: "geographie", question: "Welches Meer trennt Europa von Afrika?", answer: "Das Mittelmeer"},
        {type: "geschichte", question: "Wer malte die Sixtinische Kapelle?", answer: "Michelangelo"},
        {type: "wissenschaft", question: "Wie schnell ist das Licht im Vakuum?", answer: "300.000 km/s"}
      ],
      it: [
        {type: "culturaGenerale", question: "Qual è il fiume più lungo del mondo?", answer: "Il Nilo"},
        {type: "culturaGenerale", question: "Quale valuta è utilizzata nel Regno Unito?", answer: "La sterlina"},
        {
          type: "culturaGeneraleDifficile",
          question: "Qual è l'unico paese al mondo situato su due continenti?",
          answer: "La Turchia"
        },
        {
          type: "culturaPop",
          question: "Quale film ha reso popolare la frase 'Io sono tuo padre'?",
          answer: "Star Wars"
        },
        {type: "scienza", question: "Quante ossa ha un adulto umano?", answer: "206"},
        {type: "geografia", question: "Qual è la capitale dell'Australia?", answer: "Canberra"},
        {type: "storia", question: "In che anno è caduto il Muro di Berlino?", answer: "1989"},
        {type: "sport", question: "Quanti giocatori ci sono in una squadra di basket in campo?", answer: "5"},
        {type: "culturaGenerale", question: "Quale animale è il simbolo dell'Australia?", answer: "Il canguro"},
        {type: "scienza", question: "Quale pianeta è più vicino al Sole?", answer: "Mercurio"},
        {
          type: "culturaGeneraleDifficile",
          question: "In quale paese è stato inventato il sudoku?",
          answer: "Il Giappone"
        },
        {type: "culturaPop", question: "Chi ha scritto 'Harry Potter'?", answer: "J.K. Rowling"},
        {type: "geografia", question: "Qual è il paese più piccolo del mondo?", answer: "Vaticano"},
        {type: "storia", question: "Chi è stato il primo presidente degli Stati Uniti?", answer: "George Washington"},
        {type: "scienza", question: "Quale gas costituisce circa il 78% dell'atmosfera terrestre?", answer: "L'azoto"},
        {type: "sport", question: "Ogni quanti anni si svolgono le Olimpiadi estive?", answer: "4 anni"},
        {type: "culturaGenerale", question: "Quanti continenti ci sono?", answer: "7"},
        {type: "culturaPop", question: "Quale social network è stato creato da Mark Zuckerberg?", answer: "Facebook"},
        {
          type: "culturaGeneraleDifficile",
          question: "Qual è l'elemento chimico più abbondante nell'universo?",
          answer: "L'idrogeno"
        },
        {type: "geografia", question: "In quale paese si trova Machu Picchu?", answer: "Il Perù"},
        {type: "storia", question: "In che anno l'uomo ha camminato sulla Luna per la prima volta?", answer: "1969"},
        {type: "scienza", question: "Quale organo del corpo umano produce l'insulina?", answer: "Il pancreas"},
        {type: "sport", question: "In quale sport si usa un volano?", answer: "Il badminton"},
        {type: "culturaGenerale", question: "Quante corde ha una chitarra classica?", answer: "6"},
        {
          type: "culturaPop",
          question: "Quale personaggio Disney ha orecchie molto lunghe e mangia carote?",
          answer: "Bugs Bunny"
        },
        {
          type: "culturaGeneraleDifficile",
          question: "Come si chiama la galassia che contiene il nostro sistema solare?",
          answer: "La Via Lattea"
        },
        {
          type: "geografia",
          question: "Quale oceano confina con la costa occidentale dell'Africa?",
          answer: "L'oceano Atlantico"
        },
        {type: "storia", question: "Quanti anni è durata la Seconda Guerra Mondiale?", answer: "6 anni"},
        {type: "scienza", question: "A quale temperatura bolle l'acqua a livello del mare?", answer: "100°C"},
        {type: "sport", question: "Quale paese ha vinto la Coppa del Mondo di calcio del 2018?", answer: "La Francia"},
        {type: "culturaGenerale", question: "Quanti minuti ci sono in un'ora?", answer: "60"},
        {type: "culturaPop", question: "Come si chiama la sirena nel film Disney?", answer: "Ariel"},
        {
          type: "culturaGeneraleDifficile",
          question: "Quale scienziato ha sviluppato la teoria della relatività?",
          answer: "Einstein"
        },
        {type: "geografia", question: "Qual è il deserto più grande del mondo?", answer: "Il Sahara"},
        {type: "storia", question: "Quale imperatore francese fu esiliato a Sant'Elena?", answer: "Napoleone"},
        {type: "scienza", question: "Quante camere ha il cuore umano?", answer: "4"},
        {
          type: "sport",
          question: "In quale sport i giocatori usano racchette e una palla gialla?",
          answer: "Il tennis"
        },
        {type: "culturaGenerale", question: "Quanti giorni ha un anno bisestile?", answer: "366"},
        {
          type: "culturaPop",
          question: "Quale supereroe indossa un costume rosso e blu e può volare?",
          answer: "Superman"
        },
        {type: "culturaGeneraleDifficile", question: "Qual è l'osso più piccolo del corpo umano?", answer: "La staffa"},
        {type: "geografia", question: "In quale continente si trova l'Egitto?", answer: "L'Africa"},
        {type: "storia", question: "In che anno è stata costruita la Torre Eiffel?", answer: "1889"},
        {type: "scienza", question: "Qual è il simbolo chimico dell'oro?", answer: "Au"},
        {
          type: "sport",
          question: "Quanti set bisogna vincere per vincere una partita di tennis maschile del Grande Slam?",
          answer: "3"
        },
        {type: "culturaGenerale", question: "Quante zampe ha un ragno?", answer: "8"},
        {type: "culturaPop", question: "Come si chiama il leone ne 'Il Re Leone'?", answer: "Simba"},
        {type: "culturaGeneraleDifficile", question: "Quale paese ha inventato la pasta?", answer: "La Cina"},
        {type: "geografia", question: "Quale mare separa l'Europa dall'Africa?", answer: "Il Mar Mediterraneo"},
        {type: "storia", question: "Chi ha dipinto la Cappella Sistina?", answer: "Michelangelo"},
        {type: "scienza", question: "Qual è la velocità della luce nel vuoto?", answer: "300.000 km/s"}
      ],
      pt: [
        {type: "culturGeral", question: "Qual é o rio mais longo do mundo?", answer: "O Nilo"},
        {type: "culturGeral", question: "Qual é a moeda utilizada no Reino Unido?", answer: "A libra esterlina"},
        {
          type: "culturGeralDificil",
          question: "Qual é o único país do mundo situado em dois continentes?",
          answer: "A Turquia"
        },
        {type: "culturaPop", question: "Que filme popularizou a frase 'Eu sou seu pai'?", answer: "Star Wars"},
        {type: "ciencia", question: "Quantos ossos tem um adulto humano?", answer: "206"},
        {type: "geografia", question: "Qual é a capital da Austrália?", answer: "Canberra"},
        {type: "historia", question: "Em que ano caiu o Muro de Berlim?", answer: "1989"},
        {type: "esporte", question: "Quantos jogadores há numa equipe de basquete em quadra?", answer: "5"},
        {type: "culturGeral", question: "Que animal é o símbolo da Austrália?", answer: "O canguru"},
        {type: "ciencia", question: "Qual planeta está mais próximo do Sol?", answer: "Mercúrio"},
        {type: "culturGeralDificil", question: "Em que país foi inventado o sudoku?", answer: "O Japão"},
        {type: "culturaPop", question: "Quem escreveu 'Harry Potter'?", answer: "J.K. Rowling"},
        {type: "geografia", question: "Qual é o menor país do mundo?", answer: "Vaticano"},
        {type: "historia", question: "Quem foi o primeiro presidente dos Estados Unidos?", answer: "George Washington"},
        {type: "ciencia", question: "Que gás representa cerca de 78% da atmosfera terrestre?", answer: "O nitrogênio"},
        {
          type: "esporte",
          question: "De quantos em quantos anos acontecem os Jogos Olímpicos de verão?",
          answer: "4 anos"
        },
        {type: "culturGeral", question: "Quantos continentes existem?", answer: "7"},
        {type: "culturaPop", question: "Que rede social foi criada por Mark Zuckerberg?", answer: "Facebook"},
        {
          type: "culturGeralDificil",
          question: "Qual é o elemento químico mais abundante no universo?",
          answer: "O hidrogênio"
        },
        {type: "geografia", question: "Em que país se encontra Machu Picchu?", answer: "O Peru"},
        {type: "historia", question: "Em que ano o homem pisou na Lua pela primeira vez?", answer: "1969"},
        {type: "ciencia", question: "Que órgão do corpo humano produz a insulina?", answer: "O pâncreas"},
        {type: "esporte", question: "Em que esporte se usa uma peteca?", answer: "O badminton"},
        {type: "culturGeral", question: "Quantas cordas tem um violão clássico?", answer: "6"},
        {
          type: "culturaPop",
          question: "Que personagem Disney tem orelhas muito compridas e come cenouras?",
          answer: "Bugs Bunny"
        },
        {
          type: "culturGeralDificil",
          question: "Como se chama a galáxia que contém o nosso sistema solar?",
          answer: "A Via Láctea"
        },
        {
          type: "geografia",
          question: "Que oceano faz fronteira com a costa oeste da África?",
          answer: "O Oceano Atlântico"
        },
        {type: "historia", question: "Quantos anos durou a Segunda Guerra Mundial?", answer: "6 anos"},
        {type: "ciencia", question: "A que temperatura ferve a água ao nível do mar?", answer: "100°C"},
        {type: "esporte", question: "Que país ganhou a Copa do Mundo de futebol de 2018?", answer: "A França"},
        {type: "culturGeral", question: "Quantos minutos há numa hora?", answer: "60"},
        {type: "culturaPop", question: "Como se chama a sereia no filme da Disney?", answer: "Ariel"},
        {
          type: "culturGeralDificil",
          question: "Que cientista desenvolveu a teoria da relatividade?",
          answer: "Einstein"
        },
        {type: "geografia", question: "Qual é o maior deserto do mundo?", answer: "O Saara"},
        {type: "historia", question: "Que imperador francês foi exilado para Santa Helena?", answer: "Napoleão"},
        {type: "ciencia", question: "Quantas câmaras tem o coração humano?", answer: "4"},
        {type: "esporte", question: "Em que esporte os jogadores usam raquetes e uma bola amarela?", answer: "O tênis"},
        {type: "culturGeral", question: "Quantos dias tem um ano bissexto?", answer: "366"},
        {type: "culturaPop", question: "Que super-herói usa um traje vermelho e azul e pode voar?", answer: "Superman"},
        {type: "culturGeralDificil", question: "Qual é o menor osso do corpo humano?", answer: "O estribo"},
        {type: "geografia", question: "Em que continente se encontra o Egito?", answer: "A África"},
        {type: "historia", question: "Em que ano foi construída a Torre Eiffel?", answer: "1889"},
        {type: "ciencia", question: "Qual é o símbolo químico do ouro?", answer: "Au"},
        {
          type: "esporte",
          question: "Quantos sets é preciso ganhar para vencer uma partida de tênis masculino de Grand Slam?",
          answer: "3"
        },
        {type: "culturGeral", question: "Quantas patas tem uma aranha?", answer: "8"},
        {type: "culturaPop", question: "Como se chama o leão em 'O Rei Leão'?", answer: "Simba"},
        {type: "culturGeralDificil", question: "Que país inventou a massa?", answer: "A China"},
        {type: "geografia", question: "Que mar separa a Europa da África?", answer: "O Mar Mediterrâneo"},
        {type: "historia", question: "Quem pintou a Capela Sistina?", answer: "Michelangelo"},
        {type: "ciencia", question: "Qual é a velocidade da luz no vácuo?", answer: "300.000 km/s"}
      ],
      ar: [
        {type: "ثقافةعامة", question: "ما هو أطول نهر في العالم؟", answer: "النيل"},
        {type: "ثقافةعامة", question: "ما هي العملة المستخدمة في المملكة المتحدة؟", answer: "الجنيه الإسترليني"},
        {type: "ثقافةعامةصعبة", question: "ما هي الدولة الوحيدة في العالم التي تقع على قارتين؟", answer: "تركيا"},
        {type: "ثقافةشعبية", question: "أي فيلم جعل عبارة 'أنا أبوك' شهيرة؟", answer: "حرب النجوم"},
        {type: "علم", question: "كم عدد العظام في الإنسان البالغ؟", answer: "206"},
        {type: "جغرافيا", question: "ما هي عاصمة أستراليا؟", answer: "كانبرا"},
        {type: "تاريخ", question: "في أي عام سقط جدار برلين؟", answer: "1989"},
        {type: "رياضة", question: "كم عدد اللاعبين في فريق كرة السلة على الملعب؟", answer: "5"},
        {type: "ثقافةعامة", question: "ما هو الحيوان الذي يرمز لأستراليا؟", answer: "الكنغر"},
        {type: "علم", question: "أي كوكب هو الأقرب إلى الشمس؟", answer: "عطارد"},
        {type: "ثقافةعامةصعبة", question: "في أي بلد اخترع السودوكو؟", answer: "اليابان"},
        {type: "ثقافةشعبية", question: "من كتب 'هاري بوتر'؟", answer: "ج.ك. رولينغ"},
        {type: "جغرافيا", question: "ما هي أصغر دولة في العالم؟", answer: "الفاتيكان"},
        {type: "تاريخ", question: "من كان أول رئيس للولايات المتحدة؟", answer: "جورج واشنطن"},
        {type: "علم", question: "ما هو الغاز الذي يشكل حوالي 78% من الغلاف الجوي للأرض؟", answer: "النيتروجين"},
        {type: "رياضة", question: "كل كم سنة تقام الألعاب الأولمبية الصيفية؟", answer: "4 سنوات"},
        {type: "ثقافةعامة", question: "كم عدد القارات؟", answer: "7"},
        {type: "ثقافةشعبية", question: "ما هي الشبكة الاجتماعية التي أنشأها مارك زوكربيرغ؟", answer: "فيسبوك"},
        {type: "ثقافةعامةصعبة", question: "ما هو العنصر الكيميائي الأكثر وفرة في الكون؟", answer: "الهيدروجين"},
        {type: "جغرافيا", question: "في أي بلد يقع ماتشو بيتشو؟", answer: "بيرو"},
        {type: "تاريخ", question: "في أي عام مشى الإنسان على القمر لأول مرة؟", answer: "1969"},
        {type: "علم", question: "أي عضو في جسم الإنسان ينتج الأنسولين؟", answer: "البنكرياس"},
        {type: "رياضة", question: "في أي رياضة يستخدم الريشة؟", answer: "الريشة الطائرة"},
        {type: "ثقافةعامة", question: "كم عدد الأوتار في الجيتار الكلاسيكي؟", answer: "6"},
        {type: "ثقافةشعبية", question: "أي شخصية ديزني لها آذان طويلة جداً وتأكل الجزر؟", answer: "باغز باني"},
        {type: "ثقافةعامةصعبة", question: "ما اسم المجرة التي تحتوي على نظامنا الشمسي؟", answer: "درب التبانة"},
        {type: "جغرافيا", question: "أي محيط يحد الساحل الغربي لأفريقيا؟", answer: "المحيط الأطلسي"},
        {type: "تاريخ", question: "كم سنة استمرت الحرب العالمية الثانية؟", answer: "6 سنوات"},
        {type: "علم", question: "في أي درجة حرارة يغلي الماء على مستوى سطح البحر؟", answer: "100 درجة مئوية"},
        {type: "رياضة", question: "أي بلد فاز بكأس العالم لكرة القدم 2018؟", answer: "فرنسا"},
        {type: "ثقافةعامة", question: "كم دقيقة في الساعة؟", answer: "60"},
        {type: "ثقافةشعبية", question: "ما اسم حورية البحر في فيلم ديزني؟", answer: "أرييل"},
        {type: "ثقافةعامةصعبة", question: "أي عالم طور نظرية النسبية؟", answer: "أينشتاين"},
        {type: "جغرافيا", question: "ما هي أكبر صحراء في العالم؟", answer: "الصحراء الكبرى"},
        {type: "تاريخ", question: "أي إمبراطور فرنسي نُفي إلى سانت هيلينا؟", answer: "نابليون"},
        {type: "علم", question: "كم عدد الحجرات في القلب البشري؟", answer: "4"},
        {type: "رياضة", question: "في أي رياضة يستخدم اللاعبون المضارب والكرة الصفراء؟", answer: "التنس"},
        {type: "ثقافةعامة", question: "كم يوماً في السنة الكبيسة؟", answer: "366"},
        {type: "ثقافةشعبية", question: "أي بطل خارق يرتدي زياً أحمر وأزرق ويستطيع الطيران؟", answer: "سوبرمان"},
        {type: "ثقافةعامةصعبة", question: "ما هو أصغر عظم في جسم الإنسان؟", answer: "الركاب"},
        {type: "جغرافيا", question: "في أي قارة تقع مصر؟", answer: "أفريقيا"},
        {type: "تاريخ", question: "في أي عام بُني برج إيفل؟", answer: "1889"},
        {type: "علم", question: "ما هو الرمز الكيميائي للذهب؟", answer: "Au"},
        {type: "رياضة", question: "كم مجموعة يجب الفوز بها للفوز في مباراة تنس رجال في البطولات الكبرى؟", answer: "3"},
        {type: "ثقافةعامة", question: "كم عدد أرجل العنكبوت؟", answer: "8"},
        {type: "ثقافةشعبية", question: "ما اسم الأسد في 'ملك الأسود'؟", answer: "سيمبا"},
        {type: "ثقافةعامةصعبة", question: "أي بلد اخترع المعكرونة؟", answer: "الصين"},
        {type: "جغرافيا", question: "أي بحر يفصل أوروبا عن أفريقيا؟", answer: "البحر الأبيض المتوسط"},
        {type: "تاريخ", question: "من رسم كنيسة سيستين؟", answer: "مايكل أنجلو"},
        {type: "علم", question: "ما هي سرعة الضوء في الفراغ؟", answer: "300,000 كم/ث"}
      ]
    }
  },
  'never-have-i-ever-hot': {
    translations: {
      fr: [
        {
          "text": "Je n'ai jamais envoyé de photos osées à quelqu'un",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu une aventure d'un soir",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais trompé mon partenaire",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais fait l'amour dans un lieu public",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu un plan à trois",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais simulé un orgasme",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un de marié",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais regardé du contenu pornographique",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des fantasmes sur un collègue",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu une expérience avec le même sexe",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais utilisé de sextoys",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu du sexe sous l'influence d'alcool ou de drogues",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu une relation avec quelqu'un de beaucoup plus âgé",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations le premier rendez-vous",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais envoyé de messages coquins pendant le travail",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations dans la voiture",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais participé à un jeu sexuel en groupe",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations avec un ex après la rupture",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais fait du sexting",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu une relation secrète",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un rencontré en soirée",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais menti sur le nombre de mes partenaires",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des pensées coquines sur un ami proche",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations dans la maison de mes parents",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais utilisé une application de rencontres pour du sexe",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un dont j'ignore le nom",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des fantasmes sur plusieurs personnes à la fois",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations dans les toilettes publiques",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais participé à un jeu de strip-poker",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations avec le partenaire d'un ami",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais envoyé de photos nues par erreur",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations dans un ascenseur",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais fantasmé sur un professeur ou un patron",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations pendant que d'autres dormaient à côté",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais utilisé de la nourriture pendant l'acte",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un de ma famille par alliance",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais participé à une orgie",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations dans une piscine ou jacuzzi",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais fait du sexe par téléphone",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un en couple",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais utilisé des liens ou des menottes",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations dans un lieu de travail",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais participé à un échange de partenaires",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations avec quelqu'un de célèbre",
          "type": "épicé"
        },
        {
          "text": "Je n'ai jamais filmé ou photographié mes ébats",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations dans un avion",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais payé pour des services sexuels",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations avec plus de 3 personnes en une semaine",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais participé à un jeu sexuel impliquant de la douleur",
          "type": "brûlant"
        },
        {
          "text": "Je n'ai jamais eu des relations dans un endroit religieux",
          "type": "brûlant"
        }
      ],
      en: [
        {
          "text": "I've never sent nude photos to someone",
          "type": "hot"
        },
        {
          "text": "I've never had a one-night stand",
          "type": "hot"
        },
        {
          "text": "I've never cheated on my partner",
          "type": "hot"
        },
        {
          "text": "I've never had sex in a public place",
          "type": "hot"
        },
        {
          "text": "I've never had a threesome",
          "type": "hot"
        },
        {
          "text": "I've never faked an orgasm",
          "type": "spicy"
        },
        {
          "text": "I've never slept with someone who was married",
          "type": "hot"
        },
        {
          "text": "I've never watched pornography",
          "type": "spicy"
        },
        {
          "text": "I've never fantasized about a coworker",
          "type": "spicy"
        },
        {
          "text": "I've never had a same-sex experience",
          "type": "hot"
        },
        {
          "text": "I've never used sex toys",
          "type": "hot"
        },
        {
          "text": "I've never had sex under the influence of alcohol or drugs",
          "type": "hot"
        },
        {
          "text": "I've never been with someone much older than me",
          "type": "spicy"
        },
        {
          "text": "I've never had sex on the first date",
          "type": "spicy"
        },
        {
          "text": "I've never sent dirty messages during work",
          "type": "spicy"
        },
        {
          "text": "I've never had sex in a car",
          "type": "hot"
        },
        {
          "text": "I've never participated in group sexual activity",
          "type": "hot"
        },
        {
          "text": "I've never slept with an ex after breaking up",
          "type": "spicy"
        },
        {
          "text": "I've never engaged in sexting",
          "type": "spicy"
        },
        {
          "text": "I've never had a secret relationship",
          "type": "spicy"
        },
        {
          "text": "I've never hooked up with someone I met at a party",
          "type": "spicy"
        },
        {
          "text": "I've never lied about my number of sexual partners",
          "type": "spicy"
        },
        {
          "text": "I've never had sexual thoughts about a close friend",
          "type": "spicy"
        },
        {
          "text": "I've never had sex in my parents' house",
          "type": "spicy"
        },
        {
          "text": "I've never used a dating app for hookups",
          "type": "hot"
        },
        {
          "text": "I've never slept with someone whose name I didn't know",
          "type": "hot"
        },
        {
          "text": "I've never fantasized about multiple people at once",
          "type": "hot"
        },
        {
          "text": "I've never had sex in a public bathroom",
          "type": "hot"
        },
        {
          "text": "I've never played strip poker",
          "type": "spicy"
        },
        {
          "text": "I've never slept with a friend's partner",
          "type": "hot"
        },
        {
          "text": "I've never sent nude photos by mistake",
          "type": "spicy"
        },
        {
          "text": "I've never had sex in an elevator",
          "type": "hot"
        },
        {
          "text": "I've never fantasized about a teacher or boss",
          "type": "spicy"
        },
        {
          "text": "I've never had sex while others were sleeping nearby",
          "type": "hot"
        },
        {
          "text": "I've never used food during intimacy",
          "type": "hot"
        },
        {
          "text": "I've never slept with someone from my extended family",
          "type": "hot"
        },
        {
          "text": "I've never participated in an orgy",
          "type": "hot"
        },
        {
          "text": "I've never had sex in a pool or hot tub",
          "type": "spicy"
        },
        {
          "text": "I've never had phone sex",
          "type": "spicy"
        },
        {
          "text": "I've never slept with someone who was in a relationship",
          "type": "hot"
        },
        {
          "text": "I've never used restraints or handcuffs",
          "type": "hot"
        },
        {
          "text": "I've never had sex at work",
          "type": "hot"
        },
        {
          "text": "I've never participated in partner swapping",
          "type": "hot"
        },
        {
          "text": "I've never slept with a celebrity",
          "type": "spicy"
        },
        {
          "text": "I've never recorded or photographed intimate moments",
          "type": "hot"
        },
        {
          "text": "I've never had sex on an airplane",
          "type": "hot"
        },
        {
          "text": "I've never paid for sexual services",
          "type": "hot"
        },
        {
          "text": "I've never slept with more than 3 people in one week",
          "type": "hot"
        },
        {
          "text": "I've never engaged in sexual activities involving pain",
          "type": "hot"
        },
        {
          "text": "I've never had sex in a religious place",
          "type": "hot"
        }
      ],
      es: [
        {
          "text": "Nunca he enviado fotos íntimas a alguien",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido una aventura de una noche",
          "type": "ardiente"
        },
        {
          "text": "Nunca he engañado a mi pareja",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en un lugar público",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido un trío",
          "type": "ardiente"
        },
        {
          "text": "Nunca he fingido un orgasmo",
          "type": "picante"
        },
        {
          "text": "Nunca he estado con alguien casado",
          "type": "ardiente"
        },
        {
          "text": "Nunca he visto pornografía",
          "type": "picante"
        },
        {
          "text": "Nunca he fantaseado con un compañero de trabajo",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido una experiencia con el mismo sexo",
          "type": "ardiente"
        },
        {
          "text": "Nunca he usado juguetes sexuales",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo bajo la influencia del alcohol o drogas",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con alguien mucho mayor que yo",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo en la primera cita",
          "type": "picante"
        },
        {
          "text": "Nunca he enviado mensajes sucios durante el trabajo",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo en un coche",
          "type": "ardiente"
        },
        {
          "text": "Nunca he participado en actividades sexuales grupales",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con un ex después de romper",
          "type": "picante"
        },
        {
          "text": "Nunca he hecho sexting",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido una relación secreta",
          "type": "picante"
        },
        {
          "text": "Nunca he ligado con alguien que conocí en una fiesta",
          "type": "picante"
        },
        {
          "text": "Nunca he mentido sobre mi número de parejas sexuales",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido pensamientos sexuales sobre un amigo cercano",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo en casa de mis padres",
          "type": "picante"
        },
        {
          "text": "Nunca he usado una app de citas para encuentros casuales",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con alguien cuyo nombre no sabía",
          "type": "ardiente"
        },
        {
          "text": "Nunca he fantaseado con múltiples personas a la vez",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en un baño público",
          "type": "ardiente"
        },
        {
          "text": "Nunca he jugado al strip poker",
          "type": "picante"
        },
        {
          "text": "Nunca he estado con la pareja de un amigo",
          "type": "ardiente"
        },
        {
          "text": "Nunca he enviado fotos desnudo por error",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo en un ascensor",
          "type": "ardiente"
        },
        {
          "text": "Nunca he fantaseado con un profesor o jefe",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo mientras otros dormían cerca",
          "type": "ardiente"
        },
        {
          "text": "Nunca he usado comida durante la intimidad",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con alguien de mi familia política",
          "type": "ardiente"
        },
        {
          "text": "Nunca he participado en una orgía",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en una piscina o jacuzzi",
          "type": "picante"
        },
        {
          "text": "Nunca he tenido sexo telefónico",
          "type": "picante"
        },
        {
          "text": "Nunca he estado con alguien que tenía pareja",
          "type": "ardiente"
        },
        {
          "text": "Nunca he usado ataduras o esposas",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en el trabajo",
          "type": "ardiente"
        },
        {
          "text": "Nunca he participado en intercambio de parejas",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con una celebridad",
          "type": "picante"
        },
        {
          "text": "Nunca he grabado o fotografiado momentos íntimos",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en un avión",
          "type": "ardiente"
        },
        {
          "text": "Nunca he pagado por servicios sexuales",
          "type": "ardiente"
        },
        {
          "text": "Nunca he estado con más de 3 personas en una semana",
          "type": "ardiente"
        },
        {
          "text": "Nunca he participado en actividades sexuales que involucran dolor",
          "type": "ardiente"
        },
        {
          "text": "Nunca he tenido sexo en un lugar religioso",
          "type": "ardiente"
        }
      ],
      de: [
        {
          "text": "Ich habe noch nie intime Fotos an jemanden geschickt",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie einen One-Night-Stand",
          "type": "heiß"
        },
        {
          "text": "Ich habe meinen Partner noch nie betrogen",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex an einem öffentlichen Ort",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie einen Dreier",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie einen Orgasmus vorgetäuscht",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie etwas mit jemandem Verheiratetem",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie Pornografie angeschaut",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie über einen Kollegen fantasiert",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie eine gleichgeschlechtliche Erfahrung",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie Sexspielzeug benutzt",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex unter Alkohol- oder Drogeneinfluss",
          "type": "heiß"
        },
        {
          "text": "Ich war noch nie mit jemandem viel Älterem zusammen",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex beim ersten Date",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie schmutzige Nachrichten während der Arbeit verschickt",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex in einem Auto",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie an Gruppensex teilgenommen",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex mit einem Ex nach der Trennung",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie gesextet",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie eine geheime Beziehung",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex mit jemandem, den ich auf einer Party kennengelernt habe",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie über meine Anzahl an Sexualpartnern gelogen",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie sexuelle Gedanken über einen engen Freund",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex im Elternhaus",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie eine Dating-App für Gelegenheitssex benutzt",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex mit jemandem, dessen Namen ich nicht kannte",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie gleichzeitig über mehrere Personen fantasiert",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex in einer öffentlichen Toilette",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie Strip-Poker gespielt",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex mit dem Partner eines Freundes",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie versehentlich Nacktfotos verschickt",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex in einem Aufzug",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie über einen Lehrer oder Chef fantasiert",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex, während andere in der Nähe geschlafen haben",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie Essen beim Sex verwendet",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex mit jemandem aus der angeheirateten Familie",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie an einer Orgie teilgenommen",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex in einem Pool oder Whirlpool",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Telefonsex",
          "type": "scharf"
        },
        {
          "text": "Ich hatte noch nie Sex mit jemandem, der in einer Beziehung war",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie Fesseln oder Handschellen benutzt",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex am Arbeitsplatz",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie an Partnertausch teilgenommen",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex mit einer Berühmtheit",
          "type": "scharf"
        },
        {
          "text": "Ich habe noch nie intime Momente aufgenommen oder fotografiert",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex in einem Flugzeug",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie für sexuelle Dienstleistungen bezahlt",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex mit mehr als 3 Personen in einer Woche",
          "type": "heiß"
        },
        {
          "text": "Ich habe noch nie an sexuellen Aktivitäten mit Schmerzen teilgenommen",
          "type": "heiß"
        },
        {
          "text": "Ich hatte noch nie Sex an einem religiösen Ort",
          "type": "heiß"
        }
      ],
      it: [
        {
          "text": "Non ho mai inviato foto intime a qualcuno",
          "type": "bollente"
        },
        {
          "text": "Non ho mai avuto un'avventura di una notte",
          "type": "bollente"
        },
        {
          "text": "Non ho mai tradito il mio partner",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso in un luogo pubblico",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto un menage à trois",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fingito un orgasmo",
          "type": "piccante"
        },
        {
          "text": "Non sono mai stato/a con qualcuno sposato",
          "type": "bollente"
        },
        {
          "text": "Non ho mai guardato pornografia",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fantasticato su un collega",
          "type": "piccante"
        },
        {
          "text": "Non ho mai avuto un'esperienza con lo stesso sesso",
          "type": "bollente"
        },
        {
          "text": "Non ho mai usato giocattoli sessuali",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso sotto l'influenza di alcol o droghe",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con qualcuno molto più grande di me",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso al primo appuntamento",
          "type": "piccante"
        },
        {
          "text": "Non ho mai inviato messaggi sporchi durante il lavoro",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso in macchina",
          "type": "bollente"
        },
        {
          "text": "Non ho mai partecipato ad attività sessuali di gruppo",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con un ex dopo la rottura",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sexting",
          "type": "piccante"
        },
        {
          "text": "Non ho mai avuto una relazione segreta",
          "type": "piccante"
        },
        {
          "text": "Non ho mai rimorchiato qualcuno che ho conosciuto a una festa",
          "type": "piccante"
        },
        {
          "text": "Non ho mai mentito sul numero dei miei partner sessuali",
          "type": "piccante"
        },
        {
          "text": "Non ho mai avuto pensamenti sessuali su un amico stretto",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso a casa dei miei genitori",
          "type": "piccante"
        },
        {
          "text": "Non ho mai usato un'app di incontri per avventure casuali",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con qualcuno di cui non sapevo il nome",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fantasticato su più persone contemporaneamente",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso in un bagno pubblico",
          "type": "bollente"
        },
        {
          "text": "Non ho mai giocato a strip poker",
          "type": "piccante"
        },
        {
          "text": "Non sono mai stato/a con il partner di un amico",
          "type": "bollente"
        },
        {
          "text": "Non ho mai inviato foto nude per sbaglio",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso in ascensore",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fantasticato su un insegnante o capo",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso mentre altri dormivano vicino",
          "type": "bollente"
        },
        {
          "text": "Non ho mai usato cibo durante l'intimità",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con qualcuno della famiglia acquisita",
          "type": "bollente"
        },
        {
          "text": "Non ho mai partecipato a un'orgia",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso in piscina o jacuzzi",
          "type": "piccante"
        },
        {
          "text": "Non ho mai fatto sesso telefonico",
          "type": "piccante"
        },
        {
          "text": "Non sono mai stato/a con qualcuno fidanzato",
          "type": "bollente"
        },
        {
          "text": "Non ho mai usato legacci o manette",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso sul posto di lavoro",
          "type": "bollente"
        },
        {
          "text": "Non ho mai partecipato a scambio di coppie",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con una celebrità",
          "type": "piccante"
        },
        {
          "text": "Non ho mai registrato o fotografato momenti intimi",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso in aereo",
          "type": "bollente"
        },
        {
          "text": "Non ho mai pagato per servizi sessuali",
          "type": "bollente"
        },
        {
          "text": "Non sono mai stato/a con più di 3 persone in una settimana",
          "type": "bollente"
        },
        {
          "text": "Non ho mai partecipato ad attività sessuali che coinvolgono dolore",
          "type": "bollente"
        },
        {
          "text": "Non ho mai fatto sesso in un luogo religioso",
          "type": "bollente"
        }
      ],
      pt: [
        {
          "text": "Eu nunca enviei fotos íntimas para alguém",
          "type": "quente"
        },
        {
          "text": "Eu nunca tive uma aventura de uma noite",
          "type": "quente"
        },
        {
          "text": "Eu nunca traí meu parceiro",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo em um lugar público",
          "type": "quente"
        },
        {
          "text": "Eu nunca participei de um ménage à trois",
          "type": "quente"
        },
        {
          "text": "Eu nunca fingi um orgasmo",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiquei com alguém casado",
          "type": "quente"
        },
        {
          "text": "Eu nunca assisti pornografia",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fantasiei com um colega de trabalho",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca tive uma experiência com o mesmo sexo",
          "type": "quente"
        },
        {
          "text": "Eu nunca usei brinquedos sexuais",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo sob influência de álcool ou drogas",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com alguém muito mais velhor que eu",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo no primeiro encontro",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca enviei mensagens sujas durante o trabalho",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo no carro",
          "type": "quente"
        },
        {
          "text": "Eu nunca participei de atividades sexuais em grupo",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com um ex depois do término",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca pratiquei sexting",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca tive um relacionamento secreto",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca peguei alguém que conheci numa festa",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca menti sobre meu número de parceiros sexuais",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca tive pensamentos sexuais sobre um amigo próximo",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo na casa dos meus pais",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca usei app de relacionamento para encontros casuais",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com alguém cujo nome eu não sabia",
          "type": "quente"
        },
        {
          "text": "Eu nunca fantasiei com múltiplas pessoas ao mesmo tempo",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo em banheiro público",
          "type": "quente"
        },
        {
          "text": "Eu nunca joguei strip poker",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiquei com o parceiro de um amigo",
          "type": "quente"
        },
        {
          "text": "Eu nunca enviei fotos nuas por engano",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo no elevador",
          "type": "quente"
        },
        {
          "text": "Eu nunca fantasiei com um professor ou chefe",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo enquanto outros dormiam por perto",
          "type": "quente"
        },
        {
          "text": "Eu nunca usei comida durante a intimidade",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com alguém da minha família por afinidade",
          "type": "quente"
        },
        {
          "text": "Eu nunca participei de uma orgia",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo na piscina ou jacuzzi",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiz sexo por telefone",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca fiquei com alguém que estava comprometido",
          "type": "quente"
        },
        {
          "text": "Eu nunca usei amarras ou algemas",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo no trabalho",
          "type": "quente"
        },
        {
          "text": "Eu nunca participei de troca de casais",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com uma celebridade",
          "type": "apimentado"
        },
        {
          "text": "Eu nunca gravei ou fotografei momentos íntimos",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo no avião",
          "type": "quente"
        },
        {
          "text": "Eu nunca paguei por serviços sexuais",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiquei com mais de 3 pessoas numa semana",
          "type": "quente"
        },
        {
          "text": "Eu nunca participei de atividades sexuais envolvendo dor",
          "type": "quente"
        },
        {
          "text": "Eu nunca fiz sexo em um lugar religioso",
          "type": "quente"
        }
      ],
      ar: [
        {
          "text": "لم أرسل أبدًا صورًا حميمة لأحد",
          "type": "ساخن"
        },
        {
          "text": "لم أقم أبدًا بمغامرة ليلة واحدة",
          "type": "ساخن"
        },
        {
          "text": "لم أخن شريكي أبدًا",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في مكان عام",
          "type": "ساخن"
        },
        {
          "text": "لم أشارك أبدًا في علاقة ثلاثية",
          "type": "ساخن"
        },
        {
          "text": "لم أتظاهر أبدًا بالوصول للذروة",
          "type": "حار"
        },
        {
          "text": "لم أكن أبدًا مع شخص متزوج",
          "type": "ساخن"
        },
        {
          "text": "لم أشاهد أبدًا مواد إباحية",
          "type": "حار"
        },
        {
          "text": "لم أحلم أبدًا بزميل في العمل",
          "type": "حار"
        },
        {
          "text": "لم أخض أبدًا تجربة مع نفس الجنس",
          "type": "ساخن"
        },
        {
          "text": "لم أستخدم أبدًا ألعابًا جنسية",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا تحت تأثير الكحول أو المخدرات",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع شخص أكبر مني بكثير",
          "type": "حار"
        },
        {
          "text": "لم أمارس الجنس أبدًا في أول موعد",
          "type": "حار"
        },
        {
          "text": "لم أرسل أبدًا رسائل مثيرة أثناء العمل",
          "type": "حار"
        },
        {
          "text": "لم أمارس الجنس أبدًا في السيارة",
          "type": "ساخن"
        },
        {
          "text": "لم أشارك أبدًا في أنشطة جنسية جماعية",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع حبيب سابق بعد الانفصال",
          "type": "حار"
        },
        {
          "text": "لم أمارس أبدًا الجنس عبر الرسائل",
          "type": "حار"
        },
        {
          "text": "لم تكن لي أبدًا علاقة سرية",
          "type": "حار"
        },
        {
          "text": "لم ألتقِ أبدًا بأحد في حفلة للمغازلة",
          "type": "حار"
        },
        {
          "text": "لم أكذب أبدًا حول عدد شركائي الجنسيين",
          "type": "حار"
        },
        {
          "text": "لم تراودني أبدًا أفكار جنسية حول صديق مقرب",
          "type": "حار"
        },
        {
          "text": "لم أمارس الجنس أبدًا في منزل والدي",
          "type": "حار"
        },
        {
          "text": "لم أستخدم أبدًا تطبيق مواعدة للقاءات عابرة",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع شخص لا أعرف اسمه",
          "type": "ساخن"
        },
        {
          "text": "لم أحلم أبدًا بعدة أشخاص في نفس الوقت",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في حمام عام",
          "type": "ساخن"
        },
        {
          "text": "لم ألعب أبدًا البوكر المتعري",
          "type": "حار"
        },
        {
          "text": "لم أكن أبدًا مع شريك صديق",
          "type": "ساخن"
        },
        {
          "text": "لم أرسل أبدًا صورًا عارية بالخطأ",
          "type": "حار"
        },
        {
          "text": "لم أمارس الجنس أبدًا في المصعد",
          "type": "ساخن"
        },
        {
          "text": "لم أحلم أبدًا بمعلم أو رئيس",
          "type": "حار"
        },
        {
          "text": "لم أمارس الجنس أبدًا بينما آخرون ينامون بالقرب",
          "type": "ساخن"
        },
        {
          "text": "لم أستخدم أبدًا الطعام أثناء الحميمية",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع أحد من العائلة بالمصاهرة",
          "type": "ساخن"
        },
        {
          "text": "لم أشارك أبدًا في مجون جماعي",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في المسبح أو الجاكوزي",
          "type": "حار"
        },
        {
          "text": "لم أمارس أبدًا الجنس الهاتفي",
          "type": "حار"
        },
        {
          "text": "لم أكن أبدًا مع شخص مرتبط",
          "type": "ساخن"
        },
        {
          "text": "لم أستخدم أبدًا قيودًا أو أصفادًا",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في مكان العمل",
          "type": "ساخن"
        },
        {
          "text": "لم أشارك أبدًا في تبادل الأزواج",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع مشهور",
          "type": "حار"
        },
        {
          "text": "لم أسجل أو أصور أبدًا لحظات حميمة",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في الطائرة",
          "type": "ساخن"
        },
        {
          "text": "لم أدفع أبدًا مقابل خدمات جنسية",
          "type": "ساخن"
        },
        {
          "text": "لم أكن أبدًا مع أكثر من 3 أشخاص في أسبوع واحد",
          "type": "ساخن"
        },
        {
          "text": "لم أشارك أبدًا في أنشطة جنسية تتضمن الألم",
          "type": "ساخن"
        },
        {
          "text": "لم أمارس الجنس أبدًا في مكان ديني",
          "type": "ساخن"
        }
      ]
    }
  },
  'the-hidden-village': {
    translations: {
      fr: [
        "Si tu étais le traître, qui éliminerais-tu en premier et pourquoi ?",
        "À qui fais-tu le moins confiance dans ce village ?",
        "Qui serait, selon toi, le meilleur protecteur ?",
        "Si tu devais convaincre tout le monde que tu es innocent, que dirais-tu ?",
        "Qui a l'air de cacher un secret ce soir ?",
        "Si tu étais le médium, qui sonderais-tu en premier ?",
        "Qui serait le plus crédible en menteur ?",
        "Quel argument utiliserais-tu pour accuser quelqu'un d'être le traître ?",
        "Si tu devais sauver un joueur cette nuit, qui choisirais-tu ?",
        "Qui serait le plus dangereux s'il était traître ?",
        "Quelle stratégie adopterais-tu pour survivre jusqu'à la fin ?",
        "Si tu devais inventer un rôle spécial, ce serait quoi ?"
      ],
      en: [
        "If you were the traitor, who would you eliminate first and why?",
        "Who do you trust the least in this village?",
        "Who would be the best protector, in your opinion?",
        "If you had to convince everyone you're innocent, what would you say?",
        "Who seems to be hiding a secret tonight?",
        "If you were the medium, who would you investigate first?",
        "Who would be the most believable liar?",
        "What argument would you use to accuse someone of being the traitor?",
        "If you had to save a player tonight, who would you choose?",
        "Who would be the most dangerous if they were the traitor?",
        "What strategy would you use to survive until the end?",
        "If you could invent a special role, what would it be?"
      ],
      es: [
        "Si fueras el traidor, ¿a quién eliminarías primero y por qué?",
        "¿En quién confías menos en este pueblo?",
        "¿Quién sería el mejor protector según tú?",
        "Si tuvieras que convencer a todos de que eres inocente, ¿qué dirías?",
        "¿Quién parece estar ocultando un secreto esta noche?",
        "Si fueras el médium, ¿a quién investigarías primero?",
        "¿Quién sería el mentiroso más creíble?",
        "¿Qué argumento usarías para acusar a alguien de ser el traidor?",
        "Si tuvieras que salvar un jugador esta noche, ¿a quién elegirías?",
        "¿Quién sería el más peligroso si fuera el traidor?",
        "¿Qué estrategia usarías para sobrevivir hasta el final?",
        "Si pudieras inventar un rol especial, ¿cuál sería?"
      ],
      de: [
        "Wenn du der Verräter wärst, wen würdest du zuerst eliminieren und warum?",
        "Wem vertraust du in diesem Dorf am wenigsten?",
        "Wer wäre deiner Meinung nach der beste Beschützer?",
        "Wie würdest du alle davon überzeugen, dass du unschuldig bist?",
        "Wer scheint heute Abend ein Geheimnis zu verbergen?",
        "Wenn du das Medium wärst, wen würdest du zuerst untersuchen?",
        "Wer wäre der glaubwürdigste Lügner?",
        "Welches Argument würdest du benutzen, um jemanden als Verräter zu beschuldigen?",
        "Wenn du heute Nacht einen Spieler retten müsstest, wen würdest du wählen?",
        "Wer wäre am gefährlichsten, wenn er der Verräter wäre?",
        "Welche Strategie würdest du wählen, um bis zum Ende zu überleben?",
        "Wenn du eine Spezialrolle erfinden könntest, welche wäre das?"
      ],
      it: [
        "Se fossi il traditore, chi elimineresti per primo e perché?",
        "Di chi ti fidi di meno in questo villaggio?",
        "Chi sarebbe il miglior protettore secondo te?",
        "Se dovessi convincere tutti della tua innocenza, cosa diresti?",
        "Chi sembra nascondere un segreto stasera?",
        "Se fossi il medium, chi indagheresti per primo?",
        "Chi sarebbe il bugiardo più credibile?",
        "Quale argomento useresti per accusare qualcuno di essere il traditore?",
        "Se dovessi salvare un giocatore stanotte, chi sceglieresti?",
        "Chi sarebbe il più pericoloso se fosse il traditore?",
        "Quale strategia useresti per sopravvivere fino alla fine?",
        "Se potessi inventare un ruolo speciale, quale sarebbe?"
      ],
      pt: [
        "Se você fosse o traidor, quem eliminaria primeiro e por quê?",
        "Em quem você menos confia nesta vila?",
        "Quem seria o melhor protetor na sua opinião?",
        "Se tivesse que convencer todos de que é inocente, o que diria?",
        "Quem parece estar escondendo um segredo esta noite?",
        "Se fosse o médium, quem investigaria primeiro?",
        "Quem seria o mentiroso mais convincente?",
        "Que argumento usaria para acusar alguém de ser o traidor?",
        "Se tivesse que salvar um jogador esta noite, quem escolheria?",
        "Quem seria o mais perigoso se fosse o traidor?",
        "Que estratégia usaria para sobreviver até o fim?",
        "Se pudesse inventar um papel especial, qual seria?"
      ],
      ar: [
        "إذا كنت الخائن، من ستقضي عليه أولاً ولماذا؟",
        "من هو أقل شخص تثق به في هذه القرية؟",
        "من سيكون أفضل حامٍ برأيك؟",
        "إذا كان عليك إقناع الجميع ببراءتك، ماذا ستقول؟",
        "من يبدو أنه يخفي سراً الليلة؟",
        "إذا كنت الوسيط، من ستحقق معه أولاً؟",
        "من سيكون الكاذب الأكثر إقناعاً؟",
        "ما الحجة التي ستستخدمها لاتهام شخص بأنه الخائن؟",
        "إذا كان عليك إنقاذ لاعب الليلة، من ستختار؟",
        "من سيكون الأخطر إذا كان هو الخائن؟",
        "ما الاستراتيجية التي ستتبعها للبقاء حتى النهاية؟",
        "إذا كان بإمكانك اختراع دور خاص، ما هو؟"
      ]
    }
  },
  'trap-answer': {
    translations: {
      fr: [
        {
          type: "culture",
          question: "Où a été inventé le croissant ?",
          answer: "Autriche",
          traps: ["France", "Italie", "Belgique"]
        },
        {
          type: "nature",
          question: "Quel est l'animal le plus rapide sur terre ?",
          answer: "Guépard",
          traps: ["Aigle royal", "Lièvre", "Zèbre"]
        },
        {
          type: "art",
          question: "Qui a peint la Joconde ?",
          answer: "Léonard de Vinci",
          traps: ["Michel-Ange", "Raphaël", "Botticelli"]
        },
        {
          type: "géographie",
          question: "Quelle est la capitale de l'Australie ?",
          answer: "Canberra",
          traps: ["Sydney", "Melbourne", "Brisbane"]
        },
        {
          type: "géographie",
          question: "Quel est le plus grand océan du monde ?",
          answer: "Océan Pacifique",
          traps: ["Océan Atlantique", "Océan Indien", "Océan Arctique"]
        },
        {
          type: "histoire",
          question: "Qui a inventé l'ampoule électrique ?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "science",
          question: "Combien de cœurs a une pieuvre ?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "culture",
          question: "Dans quel pays a été inventé le sushi ?",
          answer: "Chine",
          traps: ["Japon", "Corée", "Thaïlande"]
        },
        {
          type: "nature",
          question: "Quel animal ne peut pas marcher à reculons ?",
          answer: "Kangourou",
          traps: ["Éléphant", "Girafe", "Pingouin"]
        },
        {
          type: "science",
          question: "Quelle planète est la plus chaude du système solaire ?",
          answer: "Vénus",
          traps: ["Mercure", "Mars", "Jupiter"]
        },
        {
          type: "géographie",
          question: "Quel pays a le plus de fuseaux horaires ?",
          answer: "France",
          traps: ["Russie", "États-Unis", "Chine"]
        },
        {
          type: "histoire",
          question: "Quel peuple a inventé le papier ?",
          answer: "Chinois",
          traps: ["Égyptiens", "Grecs", "Romains"]
        },
        {
          type: "nature",
          question: "Quel est le plus grand mammifère terrestre ?",
          answer: "Éléphant d'Afrique",
          traps: ["Baleine bleue", "Rhinocéros", "Hippopotame"]
        },
        {
          type: "culture",
          question: "Quelle boisson contient le plus de caféine ?",
          answer: "Thé matcha",
          traps: ["Café espresso", "Red Bull", "Coca-Cola"]
        },
        {
          type: "science",
          question: "Quel organe humain consomme le plus d'énergie ?",
          answer: "Cerveau",
          traps: ["Cœur", "Foie", "Muscles"]
        },
        {
          type: "géographie",
          question: "Quel désert est le plus grand au monde ?",
          answer: "Antarctique",
          traps: ["Sahara", "Gobi", "Kalahari"]
        },
        {
          type: "histoire",
          question: "Quelle civilisation a inventé l'écriture ?",
          answer: "Sumériens",
          traps: ["Égyptiens", "Chinois", "Grecs"]
        },
        {
          type: "nature",
          question: "Quel fruit contient le plus de vitamine C ?",
          answer: "Acérola",
          traps: ["Orange", "Citron", "Kiwi"]
        },
        {
          type: "science",
          question: "Quel métal est liquide à température ambiante ?",
          answer: "Mercure",
          traps: ["Plomb", "Étain", "Zinc"]
        },
        {
          type: "culture",
          question: "Quel pays a inventé la pizza ?",
          answer: "Grèce antique",
          traps: ["Italie", "États-Unis", "France"]
        },
        {
          type: "nature",
          question: "Quel animal a la morsure la plus puissante ?",
          answer: "Crocodile du Nil",
          traps: ["Grand requin blanc", "Lion", "Hyène"]
        },
        {
          type: "géographie",
          question: "Quel pays a la plus longue côte au monde ?",
          answer: "Canada",
          traps: ["Norvège", "Australie", "Russie"]
        },
        {
          type: "science",
          question: "Combien d'os a un requin ?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "histoire",
          question: "Qui a découvert l'Amérique en premier ?",
          answer: "Leif Erikson",
          traps: ["Christophe Colomb", "Amerigo Vespucci", "Magellan"]
        },
        {
          type: "culture",
          question: "Dans quel pays boit-on le plus de thé par habitant ?",
          answer: "Turquie",
          traps: ["Chine", "Inde", "Angleterre"]
        },
        {
          type: "nature",
          question: "Quel insecte peut soulever 50 fois son poids ?",
          answer: "Fourmi",
          traps: ["Scarabée", "Abeille", "Sauterelle"]
        },
        {
          type: "science",
          question: "Quelle couleur absorbe le plus la chaleur ?",
          answer: "Noir",
          traps: ["Rouge", "Bleu foncé", "Violet"]
        },
        {
          type: "géographie",
          question: "Quelle ville est surnommée la 'Venise du Nord' ?",
          answer: "Amsterdam",
          traps: ["Stockholm", "Bruges", "Saint-Pétersbourg"]
        },
        {
          type: "histoire",
          question: "Quel empire a duré le plus longtemps ?",
          answer: "Empire byzantin",
          traps: ["Empire romain", "Empire ottoman", "Empire britannique"]
        },
        {
          type: "culture",
          question: "Quel fromage est le plus consommé au monde ?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "nature",
          question: "Quel animal dort le plus par jour ?",
          answer: "Koala",
          traps: ["Paresseux", "Chat", "Chauve-souris"]
        },
        {
          type: "science",
          question: "Quel gaz compose principalement l'atmosphère ?",
          answer: "Azote",
          traps: ["Oxygène", "Dioxyde de carbone", "Argon"]
        },
        {
          type: "géographie",
          question: "Quel pays a le plus de lacs au monde ?",
          answer: "Finlande",
          traps: ["Canada", "Suède", "Russie"]
        },
        {
          type: "histoire",
          question: "Quelle guerre a duré le plus longtemps ?",
          answer: "Guerre de Cent Ans",
          traps: ["Guerre de Trente Ans", "Guerre froide", "Reconquista"]
        },
        {
          type: "culture",
          question: "Quel instrument a le plus de cordes ?",
          answer: "Piano",
          traps: ["Harpe", "Guitare", "Violon"]
        },
        {
          type: "nature",
          question: "Quel oiseau peut voler à reculons ?",
          answer: "Colibri",
          traps: ["Aigle", "Faucon", "Moineau"]
        },
        {
          type: "science",
          question: "Quel est l'élément le plus abondant dans l'univers ?",
          answer: "Hydrogène",
          traps: ["Oxygène", "Carbone", "Hélium"]
        },
        {
          type: "géographie",
          question: "Quelle montagne grandit chaque année ?",
          answer: "Mont Everest",
          traps: ["Mont Blanc", "Kilimandjaro", "Mont Fuji"]
        },
        {
          type: "histoire",
          question: "Qui a inventé l'imprimerie ?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "culture",
          question: "Quel pays produit le plus de café ?",
          answer: "Brésil",
          traps: ["Colombie", "Vietnam", "Éthiopie"]
        },
        {
          type: "nature",
          question: "Quel animal a le plus d'estomacs ?",
          answer: "Vache",
          traps: ["Mouton", "Cheval", "Porc"]
        },
        {
          type: "science",
          question: "À quelle température l'eau est-elle la plus dense ?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "géographie",
          question: "Quel pays a la plus haute espérance de vie ?",
          answer: "Monaco",
          traps: ["Japon", "Suisse", "Singapour"]
        },
        {
          type: "histoire",
          question: "Quelle révolution a eu lieu en premier ?",
          answer: "Révolution anglaise",
          traps: ["Révolution française", "Révolution américaine", "Révolution russe"]
        },
        {
          type: "culture",
          question: "Quel sport a été inventé en premier ?",
          answer: "Lutte",
          traps: ["Course à pied", "Natation", "Boxe"]
        },
        {
          type: "nature",
          question: "Quel animal vit le plus longtemps ?",
          answer: "Méduse immortelle",
          traps: ["Tortue", "Baleine", "Requin"]
        },
        {
          type: "science",
          question: "Combien de dimensions a l'espace-temps selon Einstein ?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "géographie",
          question: "Quel fleuve traverse le plus de pays ?",
          answer: "Danube",
          traps: ["Nil", "Amazone", "Rhin"]
        },
        {
          type: "histoire",
          question: "Quelle langue était parlée par Jésus ?",
          answer: "Araméen",
          traps: ["Hébreu", "Latin", "Grec"]
        },
        {
          type: "culture",
          question: "Quel pays a inventé les pâtes ?",
          answer: "Chine",
          traps: ["Italie", "Grèce", "Perse"]
        }
      ],
      en: [
        {
          type: "culture",
          question: "Where was the croissant invented?",
          answer: "Austria",
          traps: ["France", "Italy", "Belgium"]
        },
        {
          type: "nature",
          question: "What is the fastest animal on land?",
          answer: "Cheetah",
          traps: ["Golden Eagle", "Hare", "Zebra"]
        },
        {
          type: "art",
          question: "Who painted the Mona Lisa?",
          answer: "Leonardo da Vinci",
          traps: ["Michelangelo", "Raphael", "Botticelli"]
        },
        {
          type: "geography",
          question: "What is the capital of Australia?",
          answer: "Canberra",
          traps: ["Sydney", "Melbourne", "Brisbane"]
        },
        {
          type: "geography",
          question: "What is the largest ocean in the world?",
          answer: "Pacific Ocean",
          traps: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]
        },
        {
          type: "history",
          question: "Who invented the light bulb?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "science",
          question: "How many hearts does an octopus have?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "culture",
          question: "In which country was sushi invented?",
          answer: "China",
          traps: ["Japan", "Korea", "Thailand"]
        },
        {
          type: "nature",
          question: "Which animal cannot walk backwards?",
          answer: "Kangaroo",
          traps: ["Elephant", "Giraffe", "Penguin"]
        },
        {
          type: "science",
          question: "Which planet is the hottest in our solar system?",
          answer: "Venus",
          traps: ["Mercury", "Mars", "Jupiter"]
        },
        {
          type: "geography",
          question: "Which country has the most time zones?",
          answer: "France",
          traps: ["Russia", "United States", "China"]
        },
        {
          type: "history",
          question: "Which people invented paper?",
          answer: "Chinese",
          traps: ["Egyptians", "Greeks", "Romans"]
        },
        {
          type: "nature",
          question: "What is the largest land mammal?",
          answer: "African Elephant",
          traps: ["Blue Whale", "Rhinoceros", "Hippopotamus"]
        },
        {
          type: "culture",
          question: "Which drink contains the most caffeine?",
          answer: "Matcha tea",
          traps: ["Espresso coffee", "Red Bull", "Coca-Cola"]
        },
        {
          type: "science",
          question: "Which human organ consumes the most energy?",
          answer: "Brain",
          traps: ["Heart", "Liver", "Muscles"]
        },
        {
          type: "geography",
          question: "Which is the largest desert in the world?",
          answer: "Antarctica",
          traps: ["Sahara", "Gobi", "Kalahari"]
        },
        {
          type: "history",
          question: "Which civilization invented writing?",
          answer: "Sumerians",
          traps: ["Egyptians", "Chinese", "Greeks"]
        },
        {
          type: "nature",
          question: "Which fruit contains the most vitamin C?",
          answer: "Acerola",
          traps: ["Orange", "Lemon", "Kiwi"]
        },
        {
          type: "science",
          question: "Which metal is liquid at room temperature?",
          answer: "Mercury",
          traps: ["Lead", "Tin", "Zinc"]
        },
        {
          type: "culture",
          question: "Which country invented pizza?",
          answer: "Ancient Greece",
          traps: ["Italy", "United States", "France"]
        },
        {
          type: "nature",
          question: "Which animal has the strongest bite?",
          answer: "Nile Crocodile",
          traps: ["Great White Shark", "Lion", "Hyena"]
        },
        {
          type: "geography",
          question: "Which country has the longest coastline in the world?",
          answer: "Canada",
          traps: ["Norway", "Australia", "Russia"]
        },
        {
          type: "science",
          question: "How many bones does a shark have?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "history",
          question: "Who discovered America first?",
          answer: "Leif Erikson",
          traps: ["Christopher Columbus", "Amerigo Vespucci", "Magellan"]
        },
        {
          type: "culture",
          question: "Which country drinks the most tea per capita?",
          answer: "Turkey",
          traps: ["China", "India", "England"]
        },
        {
          type: "nature",
          question: "Which insect can lift 50 times its weight?",
          answer: "Ant",
          traps: ["Beetle", "Bee", "Grasshopper"]
        },
        {
          type: "science",
          question: "Which color absorbs the most heat?",
          answer: "Black",
          traps: ["Red", "Dark blue", "Purple"]
        },
        {
          type: "geography",
          question: "Which city is nicknamed the 'Venice of the North'?",
          answer: "Amsterdam",
          traps: ["Stockholm", "Bruges", "St. Petersburg"]
        },
        {
          type: "history",
          question: "Which empire lasted the longest?",
          answer: "Byzantine Empire",
          traps: ["Roman Empire", "Ottoman Empire", "British Empire"]
        },
        {
          type: "culture",
          question: "Which cheese is most consumed worldwide?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "nature",
          question: "Which animal sleeps the most per day?",
          answer: "Koala",
          traps: ["Sloth", "Cat", "Bat"]
        },
        {
          type: "science",
          question: "Which gas mainly composes the atmosphere?",
          answer: "Nitrogen",
          traps: ["Oxygen", "Carbon dioxide", "Argon"]
        },
        {
          type: "geography",
          question: "Which country has the most lakes in the world?",
          answer: "Finland",
          traps: ["Canada", "Sweden", "Russia"]
        },
        {
          type: "history",
          question: "Which war lasted the longest?",
          answer: "Hundred Years' War",
          traps: ["Thirty Years' War", "Cold War", "Reconquista"]
        },
        {
          type: "culture",
          question: "Which instrument has the most strings?",
          answer: "Piano",
          traps: ["Harp", "Guitar", "Violin"]
        },
        {
          type: "nature",
          question: "Which bird can fly backwards?",
          answer: "Hummingbird",
          traps: ["Eagle", "Falcon", "Sparrow"]
        },
        {
          type: "science",
          question: "What is the most abundant element in the universe?",
          answer: "Hydrogen",
          traps: ["Oxygen", "Carbon", "Helium"]
        },
        {
          type: "geography",
          question: "Which mountain grows every year?",
          answer: "Mount Everest",
          traps: ["Mont Blanc", "Kilimanjaro", "Mount Fuji"]
        },
        {
          type: "history",
          question: "Who invented the printing press?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "culture",
          question: "Which country produces the most coffee?",
          answer: "Brazil",
          traps: ["Colombia", "Vietnam", "Ethiopia"]
        },
        {
          type: "nature",
          question: "Which animal has the most stomachs?",
          answer: "Cow",
          traps: ["Sheep", "Horse", "Pig"]
        },
        {
          type: "science",
          question: "At what temperature is water most dense?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "geography",
          question: "Which country has the highest life expectancy?",
          answer: "Monaco",
          traps: ["Japan", "Switzerland", "Singapore"]
        },
        {
          type: "history",
          question: "Which revolution happened first?",
          answer: "English Revolution",
          traps: ["French Revolution", "American Revolution", "Russian Revolution"]
        },
        {
          type: "culture",
          question: "Which sport was invented first?",
          answer: "Wrestling",
          traps: ["Running", "Swimming", "Boxing"]
        },
        {
          type: "nature",
          question: "Which animal lives the longest?",
          answer: "Immortal Jellyfish",
          traps: ["Turtle", "Whale", "Shark"]
        },
        {
          type: "science",
          question: "How many dimensions does space-time have according to Einstein?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "geography",
          question: "Which river crosses the most countries?",
          answer: "Danube",
          traps: ["Nile", "Amazon", "Rhine"]
        },
        {
          type: "history",
          question: "What language did Jesus speak?",
          answer: "Aramaic",
          traps: ["Hebrew", "Latin", "Greek"]
        },
        {
          type: "culture",
          question: "Which country invented pasta?",
          answer: "China",
          traps: ["Italy", "Greece", "Persia"]
        }
      ],
      es: [
        {
          type: "cultura",
          question: "¿Dónde se inventó el croissant?",
          answer: "Austria",
          traps: ["Francia", "Italia", "Bélgica"]
        },
        {
          type: "naturaleza",
          question: "¿Cuál es el animal más rápido en tierra?",
          answer: "Guepardo",
          traps: ["Águila Real", "Liebre", "Cebra"]
        },
        {
          type: "arte",
          question: "¿Quién pintó la Mona Lisa?",
          answer: "Leonardo da Vinci",
          traps: ["Miguel Ángel", "Rafael", "Botticelli"]
        },
        {
          type: "geografía",
          question: "¿Cuál es la capital de Australia?",
          answer: "Canberra",
          traps: ["Sídney", "Melbourne", "Brisbane"]
        },
        {
          type: "geografía",
          question: "¿Cuál es el océano más grande del mundo?",
          answer: "Océano Pacífico",
          traps: ["Océano Atlántico", "Océano Índico", "Océano Ártico"]
        },
        {
          type: "historia",
          question: "¿Quién inventó la bombilla eléctrica?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "ciencia",
          question: "¿Cuántos corazones tiene un pulpo?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "cultura",
          question: "¿En qué país se inventó el sushi?",
          answer: "China",
          traps: ["Japón", "Corea", "Tailandia"]
        },
        {
          type: "naturaleza",
          question: "¿Qué animal no puede caminar hacia atrás?",
          answer: "Canguro",
          traps: ["Elefante", "Jirafa", "Pingüino"]
        },
        {
          type: "ciencia",
          question: "¿Qué planeta es el más caliente del sistema solar?",
          answer: "Venus",
          traps: ["Mercurio", "Marte", "Júpiter"]
        },
        {
          type: "geografía",
          question: "¿Qué país tiene más husos horarios?",
          answer: "Francia",
          traps: ["Rusia", "Estados Unidos", "China"]
        },
        {
          type: "historia",
          question: "¿Qué pueblo inventó el papel?",
          answer: "Chinos",
          traps: ["Egipcios", "Griegos", "Romanos"]
        },
        {
          type: "naturaleza",
          question: "¿Cuál es el mamífero terrestre más grande?",
          answer: "Elefante africano",
          traps: ["Ballena azul", "Rinoceronte", "Hipopótamo"]
        },
        {
          type: "cultura",
          question: "¿Qué bebida contiene más cafeína?",
          answer: "Té matcha",
          traps: ["Café espresso", "Red Bull", "Coca-Cola"]
        },
        {
          type: "ciencia",
          question: "¿Qué órgano humano consume más energía?",
          answer: "Cerebro",
          traps: ["Corazón", "Hígado", "Músculos"]
        },
        {
          type: "geografía",
          question: "¿Cuál es el desierto más grande del mundo?",
          answer: "Antártida",
          traps: ["Sahara", "Gobi", "Kalahari"]
        },
        {
          type: "historia",
          question: "¿Qué civilización inventó la escritura?",
          answer: "Sumerios",
          traps: ["Egipcios", "Chinos", "Griegos"]
        },
        {
          type: "naturaleza",
          question: "¿Qué fruta contiene más vitamina C?",
          answer: "Acerola",
          traps: ["Naranja", "Limón", "Kiwi"]
        },
        {
          type: "ciencia",
          question: "¿Qué metal es líquido a temperatura ambiente?",
          answer: "Mercurio",
          traps: ["Plomo", "Estaño", "Zinc"]
        },
        {
          type: "cultura",
          question: "¿Qué país inventó la pizza?",
          answer: "Grecia antigua",
          traps: ["Italia", "Estados Unidos", "Francia"]
        },
        {
          type: "naturaleza",
          question: "¿Qué animal tiene la mordida más fuerte?",
          answer: "Cocodrilo del Nilo",
          traps: ["Gran tiburón blanco", "León", "Hiena"]
        },
        {
          type: "geografía",
          question: "¿Qué país tiene la costa más larga del mundo?",
          answer: "Canadá",
          traps: ["Noruega", "Australia", "Rusia"]
        },
        {
          type: "ciencia",
          question: "¿Cuántos huesos tiene un tiburón?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "historia",
          question: "¿Quién descubrió América primero?",
          answer: "Leif Erikson",
          traps: ["Cristóbal Colón", "Amerigo Vespucci", "Magallanes"]
        },
        {
          type: "cultura",
          question: "¿Qué país bebe más té per cápita?",
          answer: "Turquía",
          traps: ["China", "India", "Inglaterra"]
        },
        {
          type: "naturaleza",
          question: "¿Qué insecto puede levantar 50 veces su peso?",
          answer: "Hormiga",
          traps: ["Escarabajo", "Abeja", "Saltamontes"]
        },
        {
          type: "ciencia",
          question: "¿Qué color absorbe más calor?",
          answer: "Negro",
          traps: ["Rojo", "Azul oscuro", "Morado"]
        },
        {
          type: "geografía",
          question: "¿Qué ciudad es apodada la 'Venecia del Norte'?",
          answer: "Ámsterdam",
          traps: ["Estocolmo", "Brujas", "San Petersburgo"]
        },
        {
          type: "historia",
          question: "¿Qué imperio duró más tiempo?",
          answer: "Imperio bizantino",
          traps: ["Imperio romano", "Imperio otomano", "Imperio británico"]
        },
        {
          type: "cultura",
          question: "¿Qué queso se consume más en el mundo?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "naturaleza",
          question: "¿Qué animal duerme más por día?",
          answer: "Koala",
          traps: ["Perezoso", "Gato", "Murciélago"]
        },
        {
          type: "ciencia",
          question: "¿Qué gas compone principalmente la atmósfera?",
          answer: "Nitrógeno",
          traps: ["Oxígeno", "Dióxido de carbono", "Argón"]
        },
        {
          type: "geografía",
          question: "¿Qué país tiene más lagos en el mundo?",
          answer: "Finlandia",
          traps: ["Canadá", "Suecia", "Rusia"]
        },
        {
          type: "historia",
          question: "¿Qué guerra duró más tiempo?",
          answer: "Guerra de los Cien Años",
          traps: ["Guerra de los Treinta Años", "Guerra Fría", "Reconquista"]
        },
        {
          type: "cultura",
          question: "¿Qué instrumento tiene más cuerdas?",
          answer: "Piano",
          traps: ["Arpa", "Guitarra", "Violín"]
        },
        {
          type: "naturaleza",
          question: "¿Qué ave puede volar hacia atrás?",
          answer: "Colibrí",
          traps: ["Águila", "Halcón", "Gorrión"]
        },
        {
          type: "ciencia",
          question: "¿Cuál es el elemento más abundante en el universo?",
          answer: "Hidrógeno",
          traps: ["Oxígeno", "Carbono", "Helio"]
        },
        {
          type: "geografía",
          question: "¿Qué montaña crece cada año?",
          answer: "Monte Everest",
          traps: ["Mont Blanc", "Kilimanjaro", "Monte Fuji"]
        },
        {
          type: "historia",
          question: "¿Quién inventó la imprenta?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "cultura",
          question: "¿Qué país produce más café?",
          answer: "Brasil",
          traps: ["Colombia", "Vietnam", "Etiopía"]
        },
        {
          type: "naturaleza",
          question: "¿Qué animal tiene más estómagos?",
          answer: "Vaca",
          traps: ["Oveja", "Caballo", "Cerdo"]
        },
        {
          type: "ciencia",
          question: "¿A qué temperatura es más densa el agua?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "geografía",
          question: "¿Qué país tiene la mayor esperanza de vida?",
          answer: "Mónaco",
          traps: ["Japón", "Suiza", "Singapur"]
        },
        {
          type: "historia",
          question: "¿Qué revolución ocurrió primero?",
          answer: "Revolución inglesa",
          traps: ["Revolución francesa", "Revolución americana", "Revolución rusa"]
        },
        {
          type: "cultura",
          question: "¿Qué deporte se inventó primero?",
          answer: "Lucha",
          traps: ["Carrera", "Natación", "Boxeo"]
        },
        {
          type: "naturaleza",
          question: "¿Qué animal vive más tiempo?",
          answer: "Medusa inmortal",
          traps: ["Tortuga", "Ballena", "Tiburón"]
        },
        {
          type: "ciencia",
          question: "¿Cuántas dimensiones tiene el espacio-tiempo según Einstein?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "geografía",
          question: "¿Qué río cruza más países?",
          answer: "Danubio",
          traps: ["Nilo", "Amazonas", "Rin"]
        },
        {
          type: "historia",
          question: "¿Qué idioma hablaba Jesús?",
          answer: "Arameo",
          traps: ["Hebreo", "Latín", "Griego"]
        },
        {
          type: "cultura",
          question: "¿Qué país inventó la pasta?",
          answer: "China",
          traps: ["Italia", "Grecia", "Persia"]
        }
      ],
      de: [
        {
          type: "kultur",
          question: "Wo wurde das Croissant erfunden?",
          answer: "Österreich",
          traps: ["Frankreich", "Italien", "Belgien"]
        },
        {
          type: "natur",
          question: "Welches ist das schnellste Tier an Land?",
          answer: "Gepard",
          traps: ["Steinadler", "Hase", "Zebra"]
        },
        {
          type: "kunst",
          question: "Wer hat die Mona Lisa gemalt?",
          answer: "Leonardo da Vinci",
          traps: ["Michelangelo", "Raffael", "Botticelli"]
        },
        {
          type: "geographie",
          question: "Was ist die Hauptstadt von Australien?",
          answer: "Canberra",
          traps: ["Sydney", "Melbourne", "Brisbane"]
        },
        {
          type: "geographie",
          question: "Welcher ist der größte Ozean der Welt?",
          answer: "Pazifischer Ozean",
          traps: ["Atlantischer Ozean", "Indischer Ozean", "Arktischer Ozean"]
        },
        {
          type: "geschichte",
          question: "Wer hat die Glühbirne erfunden?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "wissenschaft",
          question: "Wie viele Herzen hat ein Oktopus?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "kultur",
          question: "In welchem Land wurde Sushi erfunden?",
          answer: "China",
          traps: ["Japan", "Korea", "Thailand"]
        },
        {
          type: "natur",
          question: "Welches Tier kann nicht rückwärts gehen?",
          answer: "Känguru",
          traps: ["Elefant", "Giraffe", "Pinguin"]
        },
        {
          type: "wissenschaft",
          question: "Welcher Planet ist der heißeste in unserem Sonnensystem?",
          answer: "Venus",
          traps: ["Merkur", "Mars", "Jupiter"]
        },
        {
          type: "geographie",
          question: "Welches Land hat die meisten Zeitzonen?",
          answer: "Frankreich",
          traps: ["Russland", "USA", "China"]
        },
        {
          type: "geschichte",
          question: "Welches Volk hat das Papier erfunden?",
          answer: "Chinesen",
          traps: ["Ägypter", "Griechen", "Römer"]
        },
        {
          type: "natur",
          question: "Was ist das größte Landtier?",
          answer: "Afrikanischer Elefant",
          traps: ["Blauwal", "Nashorn", "Nilpferd"]
        },
        {
          type: "kultur",
          question: "Welches Getränk enthält am meisten Koffein?",
          answer: "Matcha-Tee",
          traps: ["Espresso", "Red Bull", "Coca-Cola"]
        },
        {
          type: "wissenschaft",
          question: "Welches menschliche Organ verbraucht am meisten Energie?",
          answer: "Gehirn",
          traps: ["Herz", "Leber", "Muskeln"]
        },
        {
          type: "geographie",
          question: "Welche ist die größte Wüste der Welt?",
          answer: "Antarktis",
          traps: ["Sahara", "Gobi", "Kalahari"]
        },
        {
          type: "geschichte",
          question: "Welche Zivilisation hat die Schrift erfunden?",
          answer: "Sumerer",
          traps: ["Ägypter", "Chinesen", "Griechen"]
        },
        {
          type: "natur",
          question: "Welche Frucht enthält am meisten Vitamin C?",
          answer: "Acerola",
          traps: ["Orange", "Zitrone", "Kiwi"]
        },
        {
          type: "wissenschaft",
          question: "Welches Metall ist bei Raumtemperatur flüssig?",
          answer: "Quecksilber",
          traps: ["Blei", "Zinn", "Zink"]
        },
        {
          type: "kultur",
          question: "Welches Land hat die Pizza erfunden?",
          answer: "Antikes Griechenland",
          traps: ["Italien", "USA", "Frankreich"]
        },
        {
          type: "natur",
          question: "Welches Tier hat den stärksten Biss?",
          answer: "Nilkrokodil",
          traps: ["Weißer Hai", "Löwe", "Hyäne"]
        },
        {
          type: "geographie",
          question: "Welches Land hat die längste Küste der Welt?",
          answer: "Kanada",
          traps: ["Norwegen", "Australien", "Russland"]
        },
        {
          type: "wissenschaft",
          question: "Wie viele Knochen hat ein Hai?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "geschichte",
          question: "Wer entdeckte Amerika zuerst?",
          answer: "Leif Erikson",
          traps: ["Christoph Kolumbus", "Amerigo Vespucci", "Magellan"]
        },
        {
          type: "kultur",
          question: "Welches Land trinkt pro Kopf am meisten Tee?",
          answer: "Türkei",
          traps: ["China", "Indien", "England"]
        },
        {
          type: "natur",
          question: "Welches Insekt kann das 50-fache seines Gewichts heben?",
          answer: "Ameise",
          traps: ["Käfer", "Biene", "Heuschrecke"]
        },
        {
          type: "wissenschaft",
          question: "Welche Farbe absorbiert am meisten Wärme?",
          answer: "Schwarz",
          traps: ["Rot", "Dunkelblau", "Lila"]
        },
        {
          type: "geographie",
          question: "Welche Stadt wird 'Venedig des Nordens' genannt?",
          answer: "Amsterdam",
          traps: ["Stockholm", "Brügge", "St. Petersburg"]
        },
        {
          type: "geschichte",
          question: "Welches Reich bestand am längsten?",
          answer: "Byzantinisches Reich",
          traps: ["Römisches Reich", "Osmanisches Reich", "Britisches Reich"]
        },
        {
          type: "kultur",
          question: "Welcher Käse wird weltweit am meisten konsumiert?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "natur",
          question: "Welches Tier schläft pro Tag am meisten?",
          answer: "Koala",
          traps: ["Faultier", "Katze", "Fledermaus"]
        },
        {
          type: "wissenschaft",
          question: "Welches Gas macht hauptsächlich die Atmosphäre aus?",
          answer: "Stickstoff",
          traps: ["Sauerstoff", "Kohlendioxid", "Argon"]
        },
        {
          type: "geographie",
          question: "Welches Land hat die meisten Seen der Welt?",
          answer: "Finnland",
          traps: ["Kanada", "Schweden", "Russland"]
        },
        {
          type: "geschichte",
          question: "Welcher Krieg dauerte am längsten?",
          answer: "Hundertjähriger Krieg",
          traps: ["Dreißigjähriger Krieg", "Kalter Krieg", "Reconquista"]
        },
        {
          type: "kultur",
          question: "Welches Instrument hat die meisten Saiten?",
          answer: "Klavier",
          traps: ["Harfe", "Gitarre", "Geige"]
        },
        {
          type: "natur",
          question: "Welcher Vogel kann rückwärts fliegen?",
          answer: "Kolibri",
          traps: ["Adler", "Falke", "Spatz"]
        },
        {
          type: "wissenschaft",
          question: "Was ist das häufigste Element im Universum?",
          answer: "Wasserstoff",
          traps: ["Sauerstoff", "Kohlenstoff", "Helium"]
        },
        {
          type: "geographie",
          question: "Welcher Berg wächst jedes Jahr?",
          answer: "Mount Everest",
          traps: ["Mont Blanc", "Kilimandscharo", "Mount Fuji"]
        },
        {
          type: "geschichte",
          question: "Wer erfand den Buchdruck?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "kultur",
          question: "Welches Land produziert den meisten Kaffee?",
          answer: "Brasilien",
          traps: ["Kolumbien", "Vietnam", "Äthiopien"]
        },
        {
          type: "natur",
          question: "Welches Tier hat die meisten Mägen?",
          answer: "Kuh",
          traps: ["Schaf", "Pferd", "Schwein"]
        },
        {
          type: "wissenschaft",
          question: "Bei welcher Temperatur ist Wasser am dichtesten?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "geographie",
          question: "Welches Land hat die höchste Lebenserwartung?",
          answer: "Monaco",
          traps: ["Japan", "Schweiz", "Singapur"]
        },
        {
          type: "geschichte",
          question: "Welche Revolution geschah zuerst?",
          answer: "Englische Revolution",
          traps: ["Französische Revolution", "Amerikanische Revolution", "Russische Revolution"]
        },
        {
          type: "kultur",
          question: "Welcher Sport wurde zuerst erfunden?",
          answer: "Ringen",
          traps: ["Laufen", "Schwimmen", "Boxen"]
        },
        {
          type: "natur",
          question: "Welches Tier lebt am längsten?",
          answer: "Unsterbliche Qualle",
          traps: ["Schildkröte", "Wal", "Hai"]
        },
        {
          type: "wissenschaft",
          question: "Wie viele Dimensionen hat die Raumzeit nach Einstein?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "geographie",
          question: "Welcher Fluss durchquert die meisten Länder?",
          answer: "Donau",
          traps: ["Nil", "Amazonas", "Rhein"]
        },
        {
          type: "geschichte",
          question: "Welche Sprache sprach Jesus?",
          answer: "Aramäisch",
          traps: ["Hebräisch", "Latein", "Griechisch"]
        },
        {
          type: "kultur",
          question: "Welches Land erfand die Nudeln?",
          answer: "China",
          traps: ["Italien", "Griechenland", "Persien"]
        }
      ],
      it: [
        {
          type: "cultura",
          question: "Dove è stato inventato il croissant?",
          answer: "Austria",
          traps: ["Francia", "Italia", "Belgio"]
        },
        {
          type: "natura",
          question: "Qual è l'animale più veloce sulla terra?",
          answer: "Ghepardo",
          traps: ["Aquila reale", "Lepre", "Zebra"]
        },
        {
          type: "arte",
          question: "Chi ha dipinto la Gioconda?",
          answer: "Leonardo da Vinci",
          traps: ["Michelangelo", "Raffaello", "Botticelli"]
        },
        {
          type: "geografia",
          question: "Qual è la capitale dell'Australia?",
          answer: "Canberra",
          traps: ["Sydney", "Melbourne", "Brisbane"]
        },
        {
          type: "geografia",
          question: "Qual è l'oceano più grande del mondo?",
          answer: "Oceano Pacifico",
          traps: ["Oceano Atlantico", "Oceano Indiano", "Oceano Artico"]
        },
        {
          type: "storia",
          question: "Chi ha inventato la lampadina elettrica?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "scienza",
          question: "Quanti cuori ha un polpo?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "cultura",
          question: "In quale paese è stato inventato il sushi?",
          answer: "Cina",
          traps: ["Giappone", "Corea", "Tailandia"]
        },
        {
          type: "natura",
          question: "Quale animale non può camminare all'indietro?",
          answer: "Canguro",
          traps: ["Elefante", "Giraffa", "Pinguino"]
        },
        {
          type: "scienza",
          question: "Quale pianeta è il più caldo del sistema solare?",
          answer: "Venere",
          traps: ["Mercurio", "Marte", "Giove"]
        },
        {
          type: "geografia",
          question: "Quale paese ha più fusi orari?",
          answer: "Francia",
          traps: ["Russia", "Stati Uniti", "Cina"]
        },
        {
          type: "storia",
          question: "Quale popolo ha inventato la carta?",
          answer: "Cinesi",
          traps: ["Egizi", "Greci", "Romani"]
        },
        {
          type: "natura",
          question: "Qual è il mammifero terrestre più grande?",
          answer: "Elefante africano",
          traps: ["Balenottera azzurra", "Rinoceronte", "Ippopotamo"]
        },
        {
          type: "cultura",
          question: "Quale bevanda contiene più caffeina?",
          answer: "Tè matcha",
          traps: ["Caffè espresso", "Red Bull", "Coca-Cola"]
        },
        {
          type: "scienza",
          question: "Quale organo umano consume più energia?",
          answer: "Cervello",
          traps: ["Cuore", "Fegato", "Muscoli"]
        },
        {
          type: "geografia",
          question: "Qual è il deserto più grande del mondo?",
          answer: "Antartide",
          traps: ["Sahara", "Gobi", "Kalahari"]
        },
        {
          type: "storia",
          question: "Quale civiltà ha inventato la scrittura?",
          answer: "Sumeri",
          traps: ["Egizi", "Cinesi", "Greci"]
        },
        {
          type: "natura",
          question: "Quale frutto contiene più vitamina C?",
          answer: "Acerola",
          traps: ["Arancia", "Limone", "Kiwi"]
        },
        {
          type: "scienza",
          question: "Quale metallo è liquido a temperatura ambiente?",
          answer: "Mercurio",
          traps: ["Piombo", "Stagno", "Zinco"]
        },
        {
          type: "cultura",
          question: "Quale paese ha inventato la pizza?",
          answer: "Grecia antica",
          traps: ["Italia", "Stati Uniti", "Francia"]
        },
        {
          type: "natura",
          question: "Quale animale ha il morso più forte?",
          answer: "Coccodrillo del Nilo",
          traps: ["Grande squalo bianco", "Leone", "Iena"]
        },
        {
          type: "geografia",
          question: "Quale paese ha la costa più lunga del mondo?",
          answer: "Canada",
          traps: ["Norvegia", "Australia", "Russia"]
        },
        {
          type: "scienza",
          question: "Quante ossa ha uno squalo?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "storia",
          question: "Chi ha scoperto l'America per primo?",
          answer: "Leif Erikson",
          traps: ["Cristoforo Colombo", "Amerigo Vespucci", "Magellano"]
        },
        {
          type: "cultura",
          question: "Quale paese beve più tè pro capite?",
          answer: "Turchia",
          traps: ["Cina", "India", "Inghilterra"]
        },
        {
          type: "natura",
          question: "Quale insetto può sollevare 50 volte il suo peso?",
          answer: "Formiga",
          traps: ["Scarabeo", "Ape", "Cavalletta"]
        },
        {
          type: "scienza",
          question: "Quale colore assorbe più calore?",
          answer: "Nero",
          traps: ["Rosso", "Blu scuro", "Viola"]
        },
        {
          type: "geografia",
          question: "Quale città è soprannominata la 'Venezia del Nord'?",
          answer: "Amsterdam",
          traps: ["Stoccolma", "Bruges", "San Pietroburgo"]
        },
        {
          type: "storia",
          question: "Quale impero è durato più a lungo?",
          answer: "Impero bizantino",
          traps: ["Impero romano", "Impero ottomano", "Impero britannico"]
        },
        {
          type: "cultura",
          question: "Quale formaggio è più consumato al mondo?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "natura",
          question: "Quale animale dorme di più al giorno?",
          answer: "Koala",
          traps: ["Bradipo", "Gatto", "Pipistrello"]
        },
        {
          type: "scienza",
          question: "Quale gas compone principalmente l'atmosfera?",
          answer: "Azoto",
          traps: ["Ossigeno", "Anidride carbonica", "Argon"]
        },
        {
          type: "geografia",
          question: "Quale paese ha più laghi al mondo?",
          answer: "Finlandia",
          traps: ["Canada", "Svezia", "Russia"]
        },
        {
          type: "storia",
          question: "Quale guerra è durata più a lungo?",
          answer: "Guerra dei Cent'anni",
          traps: ["Guerra dei Trent'anni", "Guerra fredda", "Reconquista"]
        },
        {
          type: "cultura",
          question: "Quale strumento ha più corde?",
          answer: "Pianoforte",
          traps: ["Arpa", "Chitarra", "Violino"]
        },
        {
          type: "natura",
          question: "Quale uccello può volare all'indietro?",
          answer: "Colibrì",
          traps: ["Aquila", "Falco", "Passero"]
        },
        {
          type: "scienza",
          question: "Qual è l'elemento più abbondante nell'universo?",
          answer: "Idrogeno",
          traps: ["Ossigeno", "Carbonio", "Elio"]
        },
        {
          type: "geografia",
          question: "Quale montagna cresce ogni anno?",
          answer: "Monte Everest",
          traps: ["Monte Bianco", "Kilimanjaro", "Monte Fuji"]
        },
        {
          type: "storia",
          question: "Chi ha inventato la stampa?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "cultura",
          question: "Quale paese produce più caffè?",
          answer: "Brasile",
          traps: ["Colombia", "Vietnam", "Etiopia"]
        },
        {
          type: "natura",
          question: "Quale animale ha più stomaci?",
          answer: "Mucca",
          traps: ["Pecora", "Cavallo", "Maiale"]
        },
        {
          type: "scienza",
          question: "A che temperatura l'acqua è più densa?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "geografia",
          question: "Quale paese ha la più alta aspettativa di vita?",
          answer: "Monaco",
          traps: ["Giappone", "Svizzera", "Singapore"]
        },
        {
          type: "storia",
          question: "Quale rivoluzione è avvenuta per prima?",
          answer: "Rivoluzione inglese",
          traps: ["Rivoluzione francese", "Rivoluzione americana", "Rivoluzione russa"]
        },
        {
          type: "cultura",
          question: "Quale sport è stato inventato per primo?",
          answer: "Lotta",
          traps: ["Corsa", "Nuoto", "Boxe"]
        },
        {
          type: "natura",
          question: "Quale animale vive più a lungo?",
          answer: "Medusa immortale",
          traps: ["Tartaruga", "Balena", "Squalo"]
        },
        {
          type: "scienza",
          question: "Quante dimensioni ha lo spazio-tempo secondo Einstein?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "geografia",
          question: "Quale fiume attraversa più paesi?",
          answer: "Danubio",
          traps: ["Nilo", "Rio delle Amazzoni", "Reno"]
        },
        {
          type: "storia",
          question: "Che lingua parlava Gesù?",
          answer: "Aramaico",
          traps: ["Ebraico", "Latino", "Greco"]
        },
        {
          type: "cultura",
          question: "Quale paese ha inventato la pasta?",
          answer: "Cina",
          traps: ["Italia", "Grecia", "Persia"]
        }
      ],
      pt: [
        {
          type: "cultura",
          question: "Onde foi inventado o croissant?",
          answer: "Áustria",
          traps: ["França", "Itália", "Bélgica"]
        },
        {
          type: "natureza",
          question: "Qual é o animal mais rápido em terra?",
          answer: "Guepardo",
          traps: ["Águia-real", "Lebre", "Zebra"]
        },
        {
          type: "arte",
          question: "Quem pintou a Mona Lisa?",
          answer: "Leonardo da Vinci",
          traps: ["Michelangelo", "Rafael", "Botticelli"]
        },
        {
          type: "geografia",
          question: "Qual é a capital da Austrália?",
          answer: "Canberra",
          traps: ["Sydney", "Melbourne", "Brisbane"]
        },
        {
          type: "geografia",
          question: "Qual é o maior oceano do mundo?",
          answer: "Oceano Pacífico",
          traps: ["Oceano Atlântico", "Oceano Índico", "Oceano Ártico"]
        },
        {
          type: "história",
          question: "Quem inventou a lâmpada elétrica?",
          answer: "Thomas Edison",
          traps: ["Nikola Tesla", "Benjamin Franklin", "Alexander Bell"]
        },
        {
          type: "ciência",
          question: "Quantos corações tem um polvo?",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "cultura",
          question: "Em que país foi inventado o sushi?",
          answer: "China",
          traps: ["Japão", "Coreia", "Tailândia"]
        },
        {
          type: "natureza",
          question: "Que animal não consegue andar para trás?",
          answer: "Canguru",
          traps: ["Elefante", "Girafa", "Pinguim"]
        },
        {
          type: "ciência",
          question: "Que planeta é o mais quente do sistema solar?",
          answer: "Vênus",
          traps: ["Mercúrio", "Marte", "Júpiter"]
        },
        {
          type: "geografia",
          question: "Que país tem mais fusos horários?",
          answer: "França",
          traps: ["Rússia", "Estados Unidos", "China"]
        },
        {
          type: "história",
          question: "Que povo inventou o papel?",
          answer: "Chineses",
          traps: ["Egípcios", "Gregos", "Romanos"]
        },
        {
          type: "natureza",
          question: "Qual é o maior mamífero terrestre?",
          answer: "Elefante africano",
          traps: ["Baleia azul", "Rinoceronte", "Hipopótamo"]
        },
        {
          type: "cultura",
          question: "Que bebida contém mais cafeína?",
          answer: "Chá matcha",
          traps: ["Café expresso", "Red Bull", "Coca-Cola"]
        },
        {
          type: "ciência",
          question: "Que órgão humano consome mais energia?",
          answer: "Cérebro",
          traps: ["Coração", "Fígado", "Músculos"]
        },
        {
          type: "geografia",
          question: "Qual é o maior deserto do mundo?",
          answer: "Antártica",
          traps: ["Saara", "Gobi", "Kalahari"]
        },
        {
          type: "história",
          question: "Que civilização inventou a escrita?",
          answer: "Sumérios",
          traps: ["Egípcios", "Chineses", "Gregos"]
        },
        {
          type: "natureza",
          question: "Que fruta contém mais vitamina C?",
          answer: "Acerola",
          traps: ["Laranja", "Limão", "Kiwi"]
        },
        {
          type: "ciência",
          question: "Que metal é líquido à temperatura ambiente?",
          answer: "Mercúrio",
          traps: ["Chumbo", "Estanho", "Zinco"]
        },
        {
          type: "cultura",
          question: "Que país inventou a pizza?",
          answer: "Grécia antiga",
          traps: ["Itália", "Estados Unidos", "França"]
        },
        {
          type: "natureza",
          question: "Que animal tem a mordida mais forte?",
          answer: "Crocodilo do Nilo",
          traps: ["Grande tubarão branco", "Leão", "Hiena"]
        },
        {
          type: "geografia",
          question: "Que país tem a costa mais longa do mundo?",
          answer: "Canadá",
          traps: ["Noruega", "Austrália", "Rússia"]
        },
        {
          type: "ciência",
          question: "Quantos ossos tem um tubarão?",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "história",
          question: "Quem descobriu a América primeiro?",
          answer: "Leif Erikson",
          traps: ["Cristóvão Colombo", "Américo Vespúcio", "Magalhães"]
        },
        {
          type: "cultura",
          question: "Que país bebe mais chá per capita?",
          answer: "Turquia",
          traps: ["China", "Índia", "Inglaterra"]
        },
        {
          type: "natureza",
          question: "Que inseto pode levantar 50 vezes o seu peso?",
          answer: "Formiga",
          traps: ["Besouro", "Abelha", "Gafanhoto"]
        },
        {
          type: "ciência",
          question: "Que cor absorve mais calor?",
          answer: "Preto",
          traps: ["Vermelho", "Azul escuro", "Roxo"]
        },
        {
          type: "geografia",
          question: "Que cidade é apelidada de 'Veneza do Norte'?",
          answer: "Amesterdão",
          traps: ["Estocolmo", "Bruges", "São Petersburgo"]
        },
        {
          type: "história",
          question: "Que império durou mais tempo?",
          answer: "Império bizantino",
          traps: ["Império romano", "Império otomano", "Império britânico"]
        },
        {
          type: "cultura",
          question: "Que queijo é mais consumido no mundo?",
          answer: "Mozzarella",
          traps: ["Cheddar", "Gouda", "Camembert"]
        },
        {
          type: "natureza",
          question: "Que animal dorme mais por dia?",
          answer: "Coala",
          traps: ["Preguiça", "Gato", "Morcego"]
        },
        {
          type: "ciência",
          question: "Que gás compõe principalmente a atmosfera?",
          answer: "Nitrogênio",
          traps: ["Oxigênio", "Dióxido de carbono", "Argônio"]
        },
        {
          type: "geografia",
          question: "Que país tem mais lagos no mundo?",
          answer: "Finlândia",
          traps: ["Canadá", "Suécia", "Rússia"]
        },
        {
          type: "história",
          question: "Que guerra durou mais tempo?",
          answer: "Guerra dos Cem Anos",
          traps: ["Guerra dos Trinta Anos", "Guerra Fria", "Reconquista"]
        },
        {
          type: "cultura",
          question: "Que instrumento tem mais cordas?",
          answer: "Piano",
          traps: ["Harpa", "Guitarra", "Violino"]
        },
        {
          type: "natureza",
          question: "Que ave pode voar para trás?",
          answer: "Beija-flor",
          traps: ["Águia", "Falcão", "Pardal"]
        },
        {
          type: "ciência",
          question: "Qual é o elemento mais abundante no universo?",
          answer: "Hidrogênio",
          traps: ["Oxigênio", "Carbono", "Hélio"]
        },
        {
          type: "geografia",
          question: "Que montanha cresce todos os anos?",
          answer: "Monte Everest",
          traps: ["Mont Blanc", "Kilimanjaro", "Monte Fuji"]
        },
        {
          type: "história",
          question: "Quem inventou a imprensa?",
          answer: "Bi Sheng",
          traps: ["Gutenberg", "Caxton", "Plantin"]
        },
        {
          type: "cultura",
          question: "Que país produz mais café?",
          answer: "Brasil",
          traps: ["Colômbia", "Vietnã", "Etiópia"]
        },
        {
          type: "natureza",
          question: "Que animal tem mais estômagos?",
          answer: "Vaca",
          traps: ["Ovelha", "Cavalo", "Porco"]
        },
        {
          type: "ciência",
          question: "A que temperatura a água é mais densa?",
          answer: "4°C",
          traps: ["0°C", "20°C", "100°C"]
        },
        {
          type: "geografia",
          question: "Que país tem a maior expectativa de vida?",
          answer: "Mônaco",
          traps: ["Japão", "Suíça", "Singapura"]
        },
        {
          type: "história",
          question: "Que revolução aconteceu primeiro?",
          answer: "Revolução inglesa",
          traps: ["Revolução francesa", "Revolução americana", "Revolução russa"]
        },
        {
          type: "cultura",
          question: "Que esporte foi inventado primeiro?",
          answer: "Luta",
          traps: ["Corrida", "Natação", "Boxe"]
        },
        {
          type: "natureza",
          question: "Que animal vive mais tempo?",
          answer: "Água-viva imortal",
          traps: ["Tartaruga", "Baleia", "Tubarão"]
        },
        {
          type: "ciência",
          question: "Quantas dimensões tem o espaço-tempo segundo Einstein?",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "geografia",
          question: "Que rio atravessa mais países?",
          answer: "Danúbio",
          traps: ["Nilo", "Amazonas", "Reno"]
        },
        {
          type: "história",
          question: "Que língua Jesus falava?",
          answer: "Aramaico",
          traps: ["Hebraico", "Latim", "Grego"]
        },
        {
          type: "cultura",
          question: "Que país inventou a massa?",
          answer: "China",
          traps: ["Itália", "Grécia", "Pérsia"]
        }
      ],
      ar: [
        {
          type: "ثقافة",
          question: "أين تم اختراع الكرواسون؟",
          answer: "النمسا",
          traps: ["فرنسا", "إيطاليا", "بلجيكا"]
        },
        {
          type: "طبيعة",
          question: "ما هو أسرع حيوان على الأرض؟",
          answer: "الفهد",
          traps: ["النسر الذهبي", "الأرنب", "الحمار الوحشي"]
        },
        {
          type: "فن",
          question: "من رسم الموناليزا؟",
          answer: "ليوناردو دافنشي",
          traps: ["مايكل أنجلو", "رافائيل", "بوتيتشيلي"]
        },
        {
          type: "جغرافيا",
          question: "ما هي عاصمة أستراليا؟",
          answer: "كانبرا",
          traps: ["سيدني", "ملبورن", "بريزبن"]
        },
        {
          type: "جغرافيا",
          question: "ما هو أكبر محيط في العالم؟",
          answer: "المحيط الهادئ",
          traps: ["المحيط الأطلسي", "المحيط الهندي", "المحيط المتجمد الشمالي"]
        },
        {
          type: "تاريخ",
          question: "من اخترع المصباح الكهربائي؟",
          answer: "توماس إديسون",
          traps: ["نيكولا تيسلا", "بنجامين فرانكلين", "ألكسندر بيل"]
        },
        {
          type: "علم",
          question: "كم عدد القلوب في الأخطبوط؟",
          answer: "3",
          traps: ["1", "2", "4"]
        },
        {
          type: "ثقافة",
          question: "في أي بلد تم اختراع السوشي؟",
          answer: "الصين",
          traps: ["اليابان", "كوريا", "تايلاند"]
        },
        {
          type: "طبيعة",
          question: "أي حيوان لا يستطيع المشي للخلف؟",
          answer: "الكنغر",
          traps: ["الفيل", "الزرافة", "البطريق"]
        },
        {
          type: "علم",
          question: "أي كوكب هو الأسخن في النظام الشمسي؟",
          answer: "الزهرة",
          traps: ["عطارد", "المريخ", "المشتري"]
        },
        {
          type: "جغرافيا",
          question: "أي دولة لديها أكثر المناطق الزمنية؟",
          answer: "فرنسا",
          traps: ["روسيا", "الولايات المتحدة", "الصين"]
        },
        {
          type: "تاريخ",
          question: "أي شعب اخترع الورق؟",
          answer: "الصينيون",
          traps: ["المصريون", "اليونانيون", "الرومان"]
        },
        {
          type: "طبيعة",
          question: "ما هو أكبر حيوان ثديي على الأرض؟",
          answer: "الفيل الأفريقي",
          traps: ["الحوت الأزرق", "وحيد القرن", "فرس النهر"]
        },
        {
          type: "ثقافة",
          question: "أي مشروب يحتوي على أكثر كافيين؟",
          answer: "شاي الماتشا",
          traps: ["قهوة إسبريسو", "ريد بول", "كوكا كولا"]
        },
        {
          type: "علم",
          question: "أي عضو بشري يستهلك أكثر طاقة؟",
          answer: "الدماغ",
          traps: ["القلب", "الكبد", "العضلات"]
        },
        {
          type: "جغرافيا",
          question: "ما هي أكبر صحراء في العالم؟",
          answer: "القارة القطبية الجنوبية",
          traps: ["الصحراء الكبرى", "جوبي", "كالاهاري"]
        },
        {
          type: "تاريخ",
          question: "أي حضارة اخترعت الكتابة؟",
          answer: "السومريون",
          traps: ["المصريون", "الصينيون", "اليونانيون"]
        },
        {
          type: "طبيعة",
          question: "أي فاكهة تحتوي على أكثر فيتامين سي؟",
          answer: "الأسيرولا",
          traps: ["البرتقال", "الليمون", "الكيوي"]
        },
        {
          type: "علم",
          question: "أي معدن سائل في درجة حرارة الغرفة؟",
          answer: "الزئبق",
          traps: ["الرصاص", "القصدير", "الزنك"]
        },
        {
          type: "ثقافة",
          question: "أي دولة اخترعت البيتزا؟",
          answer: "اليونان القديمة",
          traps: ["إيطاليا", "الولايات المتحدة", "فرنسا"]
        },
        {
          type: "طبيعة",
          question: "أي حيوان له أقوى عضة؟",
          answer: "تمساح النيل",
          traps: ["القرش الأبيض الكبير", "الأسد", "الضبع"]
        },
        {
          type: "جغرافيا",
          question: "أي دولة لديها أطول ساحل في العالم؟",
          answer: "كندا",
          traps: ["النرويج", "أستراليا", "روسيا"]
        },
        {
          type: "علم",
          question: "كم عدد العظام في القرش؟",
          answer: "0",
          traps: ["206", "150", "300"]
        },
        {
          type: "تاريخ",
          question: "من اكتشف أمريكا أولاً؟",
          answer: "ليف إريكسون",
          traps: ["كريستوفر كولومبوس", "أمريكو فيسبوتشي", "ماجلان"]
        },
        {
          type: "ثقافة",
          question: "أي دولة تشرب أكثر شاي للفرد؟",
          answer: "تركيا",
          traps: ["الصين", "الهند", "إنجلترا"]
        },
        {
          type: "طبيعة",
          question: "أي حشرة يمكنها رفع 50 ضعف وزنها؟",
          answer: "النملة",
          traps: ["الخنفساء", "النحلة", "الجندب"]
        },
        {
          type: "علم",
          question: "أي لون يمتص أكثر حرارة؟",
          answer: "الأسود",
          traps: ["الأحمر", "الأزرق الداكن", "البنفسجي"]
        },
        {
          type: "جغرافيا",
          question: "أي مدينة تُلقب بـ'البندقية الشمالية'؟",
          answer: "أمستردام",
          traps: ["ستوكهولم", "بروج", "سان بطرسبرغ"]
        },
        {
          type: "تاريخ",
          question: "أي إمبراطورية استمرت أطول فترة؟",
          answer: "الإمبراطورية البيزنطية",
          traps: ["الإمبراطورية الرومانية", "الإمبراطورية العثمانية", "الإمبراطورية البريطانية"]
        },
        {
          type: "ثقافة",
          question: "أي جبن يُستهلك أكثر في العالم؟",
          answer: "الموزاريلا",
          traps: ["التشيدار", "الجودا", "الكامامبير"]
        },
        {
          type: "طبيعة",
          question: "أي حيوان ينام أكثر في اليوم؟",
          answer: "الكوالا",
          traps: ["الكسلان", "القط", "الخفاش"]
        },
        {
          type: "علم",
          question: "أي غاز يشكل الغلاف الجوي بشكل أساسي؟",
          answer: "النيتروجين",
          traps: ["الأكسجين", "ثاني أكسيد الكربون", "الأرجون"]
        },
        {
          type: "جغرافيا",
          question: "أي دولة لديها أكثر بحيرات في العالم؟",
          answer: "فنلندا",
          traps: ["كندا", "السويد", "روسيا"]
        },
        {
          type: "تاريخ",
          question: "أي حرب استمرت أطول فترة؟",
          answer: "حرب المائة عام",
          traps: ["حرب الثلاثين عاماً", "الحرب الباردة", "الاسترداد"]
        },
        {
          type: "ثقافة",
          question: "أي آلة موسيقية لديها أكثر أوتار؟",
          answer: "البيانو",
          traps: ["القيثارة", "الجيتار", "الكمان"]
        },
        {
          type: "طبيعة",
          question: "أي طائر يمكنه الطيران للخلف؟",
          answer: "الطائر الطنان",
          traps: ["النسر", "الصقر", "العصفور"]
        },
        {
          type: "علم",
          question: "ما هو أكثر عنصر وفرة في الكون؟",
          answer: "الهيدروجين",
          traps: ["الأكسجين", "الكربون", "الهيليوم"]
        },
        {
          type: "جغرافيا",
          question: "أي جبل ينمو كل عام؟",
          answer: "جبل إيفرست",
          traps: ["مون بلان", "كليمنجارو", "جبل فوجي"]
        },
        {
          type: "تاريخ",
          question: "من اخترع المطبعة؟",
          answer: "بي شينغ",
          traps: ["جوتنبرغ", "كاكستون", "بلانتين"]
        },
        {
          type: "ثقافة",
          question: "أي دولة تنتج أكثر قهوة؟",
          answer: "البرازيل",
          traps: ["كولومبيا", "فيتنام", "إثيوبيا"]
        },
        {
          type: "طبيعة",
          question: "أي حيوان لديه أكثر معدات؟",
          answer: "البقرة",
          traps: ["الخروف", "الحصان", "الخنزير"]
        },
        {
          type: "علم",
          question: "في أي درجة حرارة يكون الماء أكثر كثافة؟",
          answer: "4 درجات مئوية",
          traps: ["0 درجة مئوية", "20 درجة مئوية", "100 درجة مئوية"]
        },
        {
          type: "جغرافيا",
          question: "أي دولة لديها أعلى متوسط عمر متوقع؟",
          answer: "موناكو",
          traps: ["اليابان", "سويسرا", "سنغافورة"]
        },
        {
          type: "تاريخ",
          question: "أي ثورة حدثت أولاً؟",
          answer: "الثورة الإنجليزية",
          traps: ["الثورة الفرنسية", "الثورة الأمريكية", "الثورة الروسية"]
        },
        {
          type: "ثقافة",
          question: "أي رياضة تم اختراعها أولاً؟",
          answer: "المصارعة",
          traps: ["الجري", "السباحة", "الملاكمة"]
        },
        {
          type: "طبيعة",
          question: "أي حيوان يعيش أطول فترة؟",
          answer: "قنديل البحر الخالد",
          traps: ["السلحفاة", "الحوت", "القرش"]
        },
        {
          type: "علم",
          question: "كم عدد أبعاد المكان-الزمن حسب أينشتاين؟",
          answer: "4",
          traps: ["3", "5", "11"]
        },
        {
          type: "جغرافيا",
          question: "أي نهر يعبر أكثر دول؟",
          answer: "الدانوب",
          traps: ["النيل", "الأمازون", "الراين"]
        },
        {
          type: "تاريخ",
          question: "أي لغة كان يتكلم بها المسيح؟",
          answer: "الآرامية",
          traps: ["العبرية", "اللاتينية", "اليونانية"]
        },
        {
          type: "ثقافة",
          question: "أي دولة اخترعت المعكرونة؟",
          answer: "الصين",
          traps: ["إيطاليا", "اليونان", "فارس"]
        }
      ]
    }
  },
  'quiz-halloween': {
  translations: {
    fr: [
      {
        type: "Halloween",
        question: "Quel est le nom du personnage principal du film 'Halloween' ?",
        answer: "Michael Myers",
        traps: ["Jason Voorhees", "Freddy Krueger", "Chucky"]
      },
      {
        type: "Halloween",
        question: "Dans quelle ville se déroule principalement le film 'Halloween' ?",
        answer: "Haddonfield",
        traps: ["Springfield", "Crystal Lake", "Elm Street"]
      },
      {
        type: "Halloween",
        question: "Quel est l'objet fétiche de Michael Myers ?",
        answer: "Un couteau de cuisine",
        traps: ["Une machette", "Des griffes métalliques", "Une hache"]
      },
      {
        type: "Halloween",
        question: "Quel est le vrai nom de la fête d'Halloween ?",
        answer: "Samhain",
        traps: ["Beltane", "Yule", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "Quel légume était traditionnellement utilisé pour les lanternes avant la citrouille ?",
        answer: "Le navet",
        traps: ["Le potiron", "Le chou", "La courge"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la sorcière la plus célèbre d'Halloween ?",
        answer: "La sorcière de l'Ouest",
        traps: ["Maléfique", "Cendrillon", "Blanche-Neige"]
      },
      {
        type: "Halloween",
        question: "Quelle couleur est traditionnellement associée à Halloween ?",
        answer: "Orange et noir",
        traps: ["Rouge et noir", "Vert et noir", "Violet et noir"]
      },
      {
        type: "Halloween",
        question: "Quel animal est souvent associé aux sorcières ?",
        answer: "Le chat noir",
        traps: ["La chauve-souris", "L'araignée", "Le hibou"]
      },
      {
        type: "Halloween",
        question: "Quelle est l'origine celtique d'Halloween ?",
        answer: "Samhain",
        traps: ["Beltane", "Lughnasadh", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la pratique consistant à sculpter des légumes à Halloween ?",
        answer: "Jack-o'-lantern",
        traps: ["Pumpkin carving", "Vegetable art", "Halloween sculpture"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la pratique de demander des bonbons le soir d'Halloween ?",
        answer: "Trick or treat",
        traps: ["Candy hunt", "Sweet seeking", "Treat begging"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du fantôme le plus célèbre de la littérature ?",
        answer: "Le fantôme de Hamlet",
        traps: ["Casper", "Le fantôme de Canterville", "Le fantôme de l'Opéra"]
      },
      {
        type: "Halloween",
        question: "Quelle créature mythique est souvent représentée à Halloween ?",
        answer: "Le vampire",
        traps: ["Le loup-garou", "Le zombie", "Le fantôme"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la pratique consistant à se déguiser à Halloween ?",
        answer: "Costume",
        traps: ["Déguisement", "Masque", "Travestissement"]
      },
      {
        type: "Halloween",
        question: "Quelle est la date traditionnelle d'Halloween ?",
        answer: "31 octobre",
        traps: ["30 octobre", "1er novembre", "2 novembre"]
      },
      {
        type: "Halloween",
        question: "Dans quel pays Halloween est-il originaire ?",
        answer: "Irlande",
        traps: ["États-Unis", "Angleterre", "Écosse"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du comte vampire le plus célèbre ?",
        answer: "Dracula",
        traps: ["Nosferatu", "Lestat", "Carmilla"]
      },
      {
        type: "Halloween",
        question: "Dans quel film apparaît le personnage de Beetlejuice ?",
        answer: "Beetlejuice",
        traps: ["L'étrange Noël de Mr. Jack", "Les Noces funèbres", "Edward aux mains d'argent"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la poupée possédée dans les films d'horreur ?",
        answer: "Annabelle",
        traps: ["Chucky", "Robert", "Billy"]
      },
      {
        type: "Halloween",
        question: "Quelle est la couleur des yeux de Michael Myers dans le film 'Halloween' ?",
        answer: "Noirs",
        traps: ["Rouges", "Blancs", "Bleus"]
      },
      {
        type: "Halloween",
        question: "Quel bonbon est le plus distribué à Halloween aux États-Unis ?",
        answer: "Reese's Peanut Butter Cups",
        traps: ["M&M's", "Snickers", "Kit Kat"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du clown tueur dans 'Ça' de Stephen King ?",
        answer: "Pennywise",
        traps: ["Art le Clown", "Captain Spaulding", "Twisty"]
      },
      {
        type: "Halloween",
        question: "Quelle est la signification du mot 'Halloween' ?",
        answer: "La veille de la Toussaint",
        traps: ["La nuit des morts", "La fête des citrouilles", "La nuit des sorcières"]
      },
      {
        type: "Halloween",
        question: "Dans quel film apparaît Freddy Krueger ?",
        answer: "Les Griffes de la nuit",
        traps: ["Halloween", "Vendredi 13", "Scream"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la famille dans 'La Famille Addams' ?",
        answer: "Addams",
        traps: ["Munster", "Adams", "Morticia"]
      },
      {
        type: "Halloween",
        question: "Combien de fois faut-il dire 'Bloody Mary' devant un miroir selon la légende ?",
        answer: "3 fois",
        traps: ["5 fois", "7 fois", "13 fois"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du groupe de rock qui a chanté 'Thriller' ?",
        answer: "Michael Jackson",
        traps: ["The Rolling Stones", "Queen", "AC/DC"]
      },
      {
        type: "Halloween",
        question: "Dans quel film un garçon voit-il des morts ?",
        answer: "Sixième Sens",
        traps: ["The Others", "L'Orphelinat", "Paranormal Activity"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de l'hôtel hanté dans 'The Shining' ?",
        answer: "L'Overlook Hotel",
        traps: ["Le Bates Motel", "Le Stanley Hotel", "Le Cortez Hotel"]
      },
      {
        type: "Halloween",
        question: "Quelle créature se transforme lors de la pleine lune ?",
        answer: "Le loup-garou",
        traps: ["Le vampire", "Le zombie", "La momie"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la sorcière dans 'Le Magicien d'Oz' ?",
        answer: "La Méchante Sorcière de l'Ouest",
        traps: ["Glinda", "Elphaba", "Maleficent"]
      },
      {
        type: "Halloween",
        question: "Dans quel film une vidéo maudite tue en 7 jours ?",
        answer: "The Ring",
        traps: ["The Grudge", "Dark Water", "Sinister"]
      },
      {
        type: "Halloween",
        question: "Quel est le symbole principal d'Halloween ?",
        answer: "La citrouille",
        traps: ["Le fantôme", "La sorcière", "Le chat noir"]
      },
      {
        type: "Halloween",
        question: "Comment s'appelle le chien fantôme dans 'L'étrange Noël de Mr. Jack' ?",
        answer: "Zero",
        traps: ["Ghost", "Spooky", "Phantom"]
      },
      {
        type: "Halloween",
        question: "Quelle est la phobie de la peur d'Halloween ?",
        answer: "Samhainophobie",
        traps: ["Halloweenphobie", "Octobréphobie", "Citrouilleophobie"]
      },
      {
        type: "Halloween",
        question: "Quel acteur joue Hannibal Lecter dans 'Le Silence des agneaux' ?",
        answer: "Anthony Hopkins",
        traps: ["Brian Cox", "Mads Mikkelsen", "Gary Oldman"]
      },
      {
        type: "Halloween",
        question: "Dans quelle décennie Halloween est-il devenu populaire aux États-Unis ?",
        answer: "Années 1950",
        traps: ["Années 1920", "Années 1940", "Années 1970"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du masque porté dans le film 'Scream' ?",
        answer: "Ghostface",
        traps: ["Scream Mask", "Death Mask", "Horror Face"]
      },
      {
        type: "Halloween",
        question: "Quelle actrice joue Laurie Strode dans 'Halloween' ?",
        answer: "Jamie Lee Curtis",
        traps: ["Neve Campbell", "Jennifer Love Hewitt", "Sarah Michelle Gellar"]
      },
      {
        type: "Halloween",
        question: "Quel fruit est traditionnellement associé aux jeux d'Halloween ?",
        answer: "La pomme",
        traps: ["L'orange", "La poire", "La citrouille"]
      },
      {
        type: "Halloween",
        question: "Dans quel pays le 'Día de los Muertos' est-il célébré ?",
        answer: "Mexique",
        traps: ["Espagne", "Argentine", "Brésil"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom de la maison hantée la plus célèbre de Disneyland ?",
        answer: "Haunted Mansion",
        traps: ["Ghost House", "Horror Castle", "Phantom Manor"]
      },
      {
        type: "Halloween",
        question: "Quelle chanson de Rockwell parle de paranoia ?",
        answer: "Somebody's Watching Me",
        traps: ["Thriller", "Monster Mash", "Ghostbusters"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du démon dans 'L'Exorciste' ?",
        answer: "Pazuzu",
        traps: ["Belzébuth", "Asmodée", "Lucifer"]
      },
      {
        type: "Halloween",
        question: "Dans quel film apparaît la phrase 'Redrum' ?",
        answer: "The Shining",
        traps: ["Psychose", "The Ring", "Poltergeist"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom complet de Jack Skellington ?",
        answer: "Jack Skellington",
        traps: ["Jack O'Lantern", "Jack Pumpkinhead", "Jack Skeleton"]
      },
      {
        type: "Halloween",
        question: "Quelle est la durée moyenne d'une citrouille sculptée avant qu'elle ne pourrisse ?",
        answer: "5 à 10 jours",
        traps: ["2 à 3 jours", "15 à 20 jours", "1 mois"]
      },
      {
        type: "Halloween",
        question: "Quel est le nom du bateau fantôme le plus célèbre ?",
        answer: "Le Hollandais Volant",
        traps: ["Le Black Pearl", "Le Queen Anne's Revenge", "Le Flying Dutchman"]
      },
      {
        type: "Halloween",
        question: "Dans quel film Tim Burton raconte-t-il l'histoire de Sleepy Hollow ?",
        answer: "Sleepy Hollow",
        traps: ["Edward aux mains d'argent", "Big Fish", "Dark Shadows"]
      },
      {
        type: "Halloween",
        question: "Quelle est la superstition concernant les chats noirs ?",
        answer: "Ils portent malheur",
        traps: ["Ils portent bonheur", "Ils sont immortels", "Ils voient les fantômes"]
      }
    ],
    en: [
      {
        type: "Halloween",
        question: "What is the name of the main character in the 'Halloween' movie?",
        answer: "Michael Myers",
        traps: ["Jason Voorhees", "Freddy Krueger", "Chucky"]
      },
      {
        type: "Halloween",
        question: "In which city does the 'Halloween' movie mainly take place?",
        answer: "Haddonfield",
        traps: ["Springfield", "Crystal Lake", "Elm Street"]
      },
      {
        type: "Halloween",
        question: "What is Michael Myers' signature weapon?",
        answer: "A kitchen knife",
        traps: ["A machete", "Metal claws", "An axe"]
      },
      {
        type: "Halloween",
        question: "What is the real name of the Halloween holiday?",
        answer: "Samhain",
        traps: ["Beltane", "Yule", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "What vegetable was traditionally used for lanterns before the pumpkin?",
        answer: "Turnip",
        traps: ["Pumpkin", "Cabbage", "Squash"]
      },
      {
        type: "Halloween",
        question: "What is the name of the most famous Halloween witch?",
        answer: "The Wicked Witch of the West",
        traps: ["Maleficent", "Cinderella", "Snow White"]
      },
      {
        type: "Halloween",
        question: "What colors are traditionally associated with Halloween?",
        answer: "Orange and black",
        traps: ["Red and black", "Green and black", "Purple and black"]
      },
      {
        type: "Halloween",
        question: "What animal is often associated with witches?",
        answer: "Black cat",
        traps: ["Bat", "Spider", "Owl"]
      },
      {
        type: "Halloween",
        question: "What is the Celtic origin of Halloween?",
        answer: "Samhain",
        traps: ["Beltane", "Lughnasadh", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "What is the name of the practice of carving vegetables at Halloween?",
        answer: "Jack-o'-lantern",
        traps: ["Pumpkin carving", "Vegetable art", "Halloween sculpture"]
      },
      {
        type: "Halloween",
        question: "What is the name of the practice of asking for candy on Halloween night?",
        answer: "Trick or treat",
        traps: ["Candy hunt", "Sweet seeking", "Treat begging"]
      },
      {
        type: "Halloween",
        question: "What is the name of the most famous ghost in literature?",
        answer: "Hamlet's ghost",
        traps: ["Casper", "The Canterville Ghost", "The Phantom of the Opera"]
      },
      {
        type: "Halloween",
        question: "What mythical creature is often represented at Halloween?",
        answer: "Vampire",
        traps: ["Werewolf", "Zombie", "Ghost"]
      },
      {
        type: "Halloween",
        question: "What is the name of the practice of dressing up at Halloween?",
        answer: "Costume",
        traps: ["Disguise", "Mask", "Cross-dressing"]
      },
      {
        type: "Halloween",
        question: "What is the traditional date of Halloween?",
        answer: "October 31st",
        traps: ["October 30th", "November 1st", "November 2nd"]
      },
      {
        type: "Halloween",
        question: "In which country did Halloween originate?",
        answer: "Ireland",
        traps: ["United States", "England", "Scotland"]
      },
      {
        type: "Halloween",
        question: "What is the name of the most famous vampire count?",
        answer: "Dracula",
        traps: ["Nosferatu", "Lestat", "Carmilla"]
      },
      {
        type: "Halloween",
        question: "In which film does the character Beetlejuice appear?",
        answer: "Beetlejuice",
        traps: ["The Nightmare Before Christmas", "Corpse Bride", "Edward Scissorhands"]
      },
      {
        type: "Halloween",
        question: "What is the name of the possessed doll in horror films?",
        answer: "Annabelle",
        traps: ["Chucky", "Robert", "Billy"]
      },
      {
        type: "Halloween",
        question: "What color are Michael Myers' eyes in the 'Halloween' film?",
        answer: "Black",
        traps: ["Red", "White", "Blue"]
      },
      {
        type: "Halloween",
        question: "What is the most distributed candy at Halloween in the United States?",
        answer: "Reese's Peanut Butter Cups",
        traps: ["M&M's", "Snickers", "Kit Kat"]
      },
      {
        type: "Halloween",
        question: "What is the name of the killer clown in Stephen King's 'It'?",
        answer: "Pennywise",
        traps: ["Art the Clown", "Captain Spaulding", "Twisty"]
      },
      {
        type: "Halloween",
        question: "What is the meaning of the word 'Halloween'?",
        answer: "All Hallows' Eve",
        traps: ["Night of the Dead", "Pumpkin Festival", "Night of Witches"]
      },
      {
        type: "Halloween",
        question: "In which film does Freddy Krueger appear?",
        answer: "A Nightmare on Elm Street",
        traps: ["Halloween", "Friday the 13th", "Scream"]
      },
      {
        type: "Halloween",
        question: "What is the surname of the family in 'The Addams Family'?",
        answer: "Addams",
        traps: ["Munster", "Adams", "Morticia"]
      },
      {
        type: "Halloween",
        question: "How many times must you say 'Bloody Mary' in front of a mirror according to legend?",
        answer: "3 times",
        traps: ["5 times", "7 times", "13 times"]
      },
      {
        type: "Halloween",
        question: "Who sang the song 'Thriller'?",
        answer: "Michael Jackson",
        traps: ["The Rolling Stones", "Queen", "AC/DC"]
      },
      {
        type: "Halloween",
        question: "In which film does a boy see dead people?",
        answer: "The Sixth Sense",
        traps: ["The Others", "The Orphanage", "Paranormal Activity"]
      },
      {
        type: "Halloween",
        question: "What is the name of the haunted hotel in 'The Shining'?",
        answer: "The Overlook Hotel",
        traps: ["The Bates Motel", "The Stanley Hotel", "The Cortez Hotel"]
      },
      {
        type: "Halloween",
        question: "What creature transforms during a full moon?",
        answer: "Werewolf",
        traps: ["Vampire", "Zombie", "Mummy"]
      },
      {
        type: "Halloween",
        question: "What is the name of the witch in 'The Wizard of Oz'?",
        answer: "The Wicked Witch of the West",
        traps: ["Glinda", "Elphaba", "Maleficent"]
      },
      {
        type: "Halloween",
        question: "In which film does a cursed video kill in 7 days?",
        answer: "The Ring",
        traps: ["The Grudge", "Dark Water", "Sinister"]
      },
      {
        type: "Halloween",
        question: "What is the main symbol of Halloween?",
        answer: "The pumpkin",
        traps: ["The ghost", "The witch", "The black cat"]
      },
      {
        type: "Halloween",
        question: "What is the name of the ghost dog in 'The Nightmare Before Christmas'?",
        answer: "Zero",
        traps: ["Ghost", "Spooky", "Phantom"]
      },
      {
        type: "Halloween",
        question: "What is the phobia of fear of Halloween called?",
        answer: "Samhainophobia",
        traps: ["Halloweenphobia", "Octoberphobia", "Pumpkinphobia"]
      },
      {
        type: "Halloween",
        question: "Which actor plays Hannibal Lecter in 'The Silence of the Lambs'?",
        answer: "Anthony Hopkins",
        traps: ["Brian Cox", "Mads Mikkelsen", "Gary Oldman"]
      },
      {
        type: "Halloween",
        question: "In which decade did Halloween become popular in the United States?",
        answer: "1950s",
        traps: ["1920s", "1940s", "1970s"]
      },
      {
        type: "Halloween",
        question: "What is the name of the mask worn in the film 'Scream'?",
        answer: "Ghostface",
        traps: ["Scream Mask", "Death Mask", "Horror Face"]
      },
      {
        type: "Halloween",
        question: "Which actress plays Laurie Strode in 'Halloween'?",
        answer: "Jamie Lee Curtis",
        traps: ["Neve Campbell", "Jennifer Love Hewitt", "Sarah Michelle Gellar"]
      },
      {
        type: "Halloween",
        question: "What fruit is traditionally associated with Halloween games?",
        answer: "Apple",
        traps: ["Orange", "Pear", "Pumpkin"]
      },
      {
        type: "Halloween",
        question: "In which country is 'Día de los Muertos' celebrated?",
        answer: "Mexico",
        traps: ["Spain", "Argentina", "Brazil"]
      },
      {
        type: "Halloween",
        question: "What is the name of the most famous haunted house at Disneyland?",
        answer: "Haunted Mansion",
        traps: ["Ghost House", "Horror Castle", "Phantom Manor"]
      },
      {
        type: "Halloween",
        question: "Which Rockwell song is about paranoia?",
        answer: "Somebody's Watching Me",
        traps: ["Thriller", "Monster Mash", "Ghostbusters"]
      },
      {
        type: "Halloween",
        question: "What is the name of the demon in 'The Exorcist'?",
        answer: "Pazuzu",
        traps: ["Beelzebub", "Asmodeus", "Lucifer"]
      },
      {
        type: "Halloween",
        question: "In which film does the phrase 'Redrum' appear?",
        answer: "The Shining",
        traps: ["Psycho", "The Ring", "Poltergeist"]
      },
      {
        type: "Halloween",
        question: "What is Jack Skellington's full name?",
        answer: "Jack Skellington",
        traps: ["Jack O'Lantern", "Jack Pumpkinhead", "Jack Skeleton"]
      },
      {
        type: "Halloween",
        question: "What is the average duration of a carved pumpkin before it rots?",
        answer: "5 to 10 days",
        traps: ["2 to 3 days", "15 to 20 days", "1 month"]
      },
      {
        type: "Halloween",
        question: "What is the name of the most famous ghost ship?",
        answer: "The Flying Dutchman",
        traps: ["The Black Pearl", "The Queen Anne's Revenge", "The Flying Dutchman"]
      },
      {
        type: "Halloween",
        question: "In which Tim Burton film does he tell the story of Sleepy Hollow?",
        answer: "Sleepy Hollow",
        traps: ["Edward Scissorhands", "Big Fish", "Dark Shadows"]
      },
      {
        type: "Halloween",
        question: "What is the superstition about black cats?",
        answer: "They bring bad luck",
        traps: ["They bring good luck", "They are immortal", "They see ghosts"]
      }
    ],
    es: [
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del personaje principal de la película 'Halloween'?",
        answer: "Michael Myers",
        traps: ["Jason Voorhees", "Freddy Krueger", "Chucky"]
      },
      {
        type: "Halloween",
        question: "¿En qué ciudad se desarrolla principalmente la película 'Halloween'?",
        answer: "Haddonfield",
        traps: ["Springfield", "Crystal Lake", "Elm Street"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el arma característica de Michael Myers?",
        answer: "Un cuchillo de cocina",
        traps: ["Un machete", "Garras metálicas", "Un hacha"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el verdadero nombre de la fiesta de Halloween?",
        answer: "Samhain",
        traps: ["Beltane", "Yule", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "¿Qué verdura se usaba tradicionalmente para las linternas antes de la calabaza?",
        answer: "El nabo",
        traps: ["La calabaza", "El repollo", "La calabaza de verano"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la bruja más famosa de Halloween?",
        answer: "La Bruja Mala del Oeste",
        traps: ["Maléfica", "Cenicienta", "Blancanieves"]
      },
      {
        type: "Halloween",
        question: "¿Qué colores se asocian tradicionalmente con Halloween?",
        answer: "Naranja y negro",
        traps: ["Rojo y negro", "Verde y negro", "Púrpura y negro"]
      },
      {
        type: "Halloween",
        question: "¿Qué animal se asocia a menudo con las brujas?",
        answer: "Gato negro",
        traps: ["Murciélago", "Araña", "Búho"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el origen celta de Halloween?",
        answer: "Samhain",
        traps: ["Beltane", "Lughnasadh", "Imbolc"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la práctica de tallar verduras en Halloween?",
        answer: "Jack-o'-lantern",
        traps: ["Tallado de calabaza", "Arte vegetal", "Escultura de Halloween"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la práctica de pedir dulces en la noche de Halloween?",
        answer: "Truco o trato",
        traps: ["Caza de dulces", "Búsqueda de dulces", "Mendigar dulces"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del fantasma más famoso de la literatura?",
        answer: "El fantasma de Hamlet",
        traps: ["Casper", "El fantasma de Canterville", "El fantasma de la ópera"]
      },
      {
        type: "Halloween",
        question: "¿Qué criatura mítica se representa a menudo en Halloween?",
        answer: "Vampiro",
        traps: ["Hombre lobo", "Zombie", "Fantasma"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la práctica de disfrazarse en Halloween?",
        answer: "Disfraz",
        traps: ["Disfraz", "Máscara", "Travestismo"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es la fecha tradicional de Halloween?",
        answer: "31 de octubre",
        traps: ["30 de octubre", "1 de noviembre", "2 de noviembre"]
      },
      {
        type: "Halloween",
        question: "¿En qué país se originó Halloween?",
        answer: "Irlanda",
        traps: ["Estados Unidos", "Inglaterra", "Escocia"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del conde vampiro más famoso?",
        answer: "Drácula",
        traps: ["Nosferatu", "Lestat", "Carmilla"]
      },
      {
        type: "Halloween",
        question: "¿En qué película aparece el personaje de Beetlejuice?",
        answer: "Beetlejuice",
        traps: ["El extraño mundo de Jack", "La novia cadáver", "Eduardo Manostijeras"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la muñeca poseída en las películas de terror?",
        answer: "Annabelle",
        traps: ["Chucky", "Robert", "Billy"]
      },
      {
        type: "Halloween",
        question: "¿De qué color son los ojos de Michael Myers en la película 'Halloween'?",
        answer: "Negros",
        traps: ["Rojos", "Blancos", "Azules"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el dulce más distribuido en Halloween en Estados Unidos?",
        answer: "Reese's Peanut Butter Cups",
        traps: ["M&M's", "Snickers", "Kit Kat"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del payaso asesino en 'Eso' de Stephen King?",
        answer: "Pennywise",
        traps: ["Art el Payaso", "Capitán Spaulding", "Twisty"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el significado de la palabra 'Halloween'?",
        answer: "Víspera de Todos los Santos",
        traps: ["Noche de los muertos", "Fiesta de las calabazas", "Noche de brujas"]
      },
      {
        type: "Halloween",
        question: "¿En qué película aparece Freddy Krueger?",
        answer: "Pesadilla en Elm Street",
        traps: ["Halloween", "Viernes 13", "Scream"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el apellido de la familia en 'La Familia Addams'?",
        answer: "Addams",
        traps: ["Munster", "Adams", "Morticia"]
      },
      {
        type: "Halloween",
        question: "¿Cuántas veces hay que decir 'Bloody Mary' frente a un espejo según la leyenda?",
        answer: "3 veces",
        traps: ["5 veces", "7 veces", "13 veces"]
      },
      {
        type: "Halloween",
        question: "¿Quién cantó la canción 'Thriller'?",
        answer: "Michael Jackson",
        traps: ["The Rolling Stones", "Queen", "AC/DC"]
      },
      {
        type: "Halloween",
        question: "¿En qué película un niño ve gente muerta?",
        answer: "El Sexto Sentido",
        traps: ["Los Otros", "El Orfanato", "Actividad Paranormal"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del hotel embrujado en 'El Resplandor'?",
        answer: "El Hotel Overlook",
        traps: ["El Motel Bates", "El Hotel Stanley", "El Hotel Cortez"]
      },
      {
        type: "Halloween",
        question: "¿Qué criatura se transforma durante la luna llena?",
        answer: "El hombre lobo",
        traps: ["El vampiro", "El zombie", "La momia"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la bruja en 'El Mago de Oz'?",
        answer: "La Bruja Mala del Oeste",
        traps: ["Glinda", "Elphaba", "Maléfica"]
      },
      {
        type: "Halloween",
        question: "¿En qué película un vídeo maldito mata en 7 días?",
        answer: "The Ring",
        traps: ["The Grudge", "Dark Water", "Sinister"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el símbolo principal de Halloween?",
        answer: "La calabaza",
        traps: ["El fantasma", "La bruja", "El gato negro"]
      },
      {
        type: "Halloween",
        question: "¿Cómo se llama el perro fantasma en 'El extraño mundo de Jack'?",
        answer: "Zero",
        traps: ["Ghost", "Spooky", "Phantom"]
      },
      {
        type: "Halloween",
        question: "¿Cómo se llama la fobia al miedo a Halloween?",
        answer: "Samhainofobia",
        traps: ["Halloweenfobia", "Octubrefobia", "Calabazafobia"]
      },
      {
        type: "Halloween",
        question: "¿Qué actor interpreta a Hannibal Lecter en 'El Silencio de los Corderos'?",
        answer: "Anthony Hopkins",
        traps: ["Brian Cox", "Mads Mikkelsen", "Gary Oldman"]
      },
      {
        type: "Halloween",
        question: "¿En qué década se popularizó Halloween en Estados Unidos?",
        answer: "Años 1950",
        traps: ["Años 1920", "Años 1940", "Años 1970"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la máscara usada en la película 'Scream'?",
        answer: "Ghostface",
        traps: ["Máscara Scream", "Máscara de la Muerte", "Cara de Horror"]
      },
      {
        type: "Halloween",
        question: "¿Qué actriz interpreta a Laurie Strode en 'Halloween'?",
        answer: "Jamie Lee Curtis",
        traps: ["Neve Campbell", "Jennifer Love Hewitt", "Sarah Michelle Gellar"]
      },
      {
        type: "Halloween",
        question: "¿Qué fruta se asocia tradicionalmente con los juegos de Halloween?",
        answer: "La manzana",
        traps: ["La naranja", "La pera", "La calabaza"]
      },
      {
        type: "Halloween",
        question: "¿En qué país se celebra el 'Día de los Muertos'?",
        answer: "México",
        traps: ["España", "Argentina", "Brasil"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre de la casa encantada más famosa de Disneyland?",
        answer: "Haunted Mansion",
        traps: ["Casa Fantasma", "Castillo del Horror", "Phantom Manor"]
      },
      {
        type: "Halloween",
        question: "¿Qué canción de Rockwell habla de paranoia?",
        answer: "Somebody's Watching Me",
        traps: ["Thriller", "Monster Mash", "Ghostbusters"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del demonio en 'El Exorcista'?",
        answer: "Pazuzu",
        traps: ["Belcebú", "Asmodeo", "Lucifer"]
      },
      {
        type: "Halloween",
        question: "¿En qué película aparece la frase 'Redrum'?",
        answer: "El Resplandor",
        traps: ["Psicosis", "The Ring", "Poltergeist"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre completo de Jack Skellington?",
        answer: "Jack Skellington",
        traps: ["Jack O'Lantern", "Jack Pumpkinhead", "Jack Skeleton"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es la duración promedio de una calabaza tallada antes de que se pudra?",
        answer: "5 a 10 días",
        traps: ["2 a 3 días", "15 a 20 días", "1 mes"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es el nombre del barco fantasma más famoso?",
        answer: "El Holandés Errante",
        traps: ["El Perla Negra", "El Queen Anne's Revenge", "El Flying Dutchman"]
      },
      {
        type: "Halloween",
        question: "¿En qué película de Tim Burton se cuenta la historia de Sleepy Hollow?",
        answer: "Sleepy Hollow",
        traps: ["Eduardo Manostijeras", "Big Fish", "Dark Shadows"]
      },
      {
        type: "Halloween",
        question: "¿Cuál es la superstición sobre los gatos negros?",
        answer: "Traen mala suerte",
        traps: ["Traen buena suerte", "Son inmortales", "Ven fantasmas"]
      }
    ]
  }
}
};

// Initialisation de Firebase et envoi des données
const uploadQuestionsToFirebase = async () => {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Pour chaque jeu, uploadez les questions
    for (const [gameId, content] of Object.entries(questions)) {
      // Upload des questions
      await setDoc(doc(db, 'gameQuestions', gameId), {
        translations: content.translations
      });

      // Créer ou mettre à jour l'entrée dans la collection gameReleases
      const gameRef = doc(db, 'gameReleases', gameId);
      await setDoc(gameRef, {
        name: gameId, // Vous pouvez ajouter un nom plus convivial si nécessaire
        notified: false,
        releaseDate: new Date(),
        isActive: true
      }, { merge: true }); // merge: true permet de mettre à jour sans écraser les autres champs

      console.log(`Questions pour ${gameId} ajoutées avec succès!`);
    }

    console.log('Upload des questions terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'upload des questions:', error);
  }
};

// Exécution de la fonction
uploadQuestionsToFirebase();