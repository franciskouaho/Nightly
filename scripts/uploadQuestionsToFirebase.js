import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

//node scripts/uploadQuestionsToFirebase.js

const firebaseConfig = {
  apiKey: 'AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA',
  authDomain: 'drink-dare.firebaseapp.com',
  projectId: 'drink-dare',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questions = {
  'listen-but-don-t-judge': [
    'Si {playerName} devait confesser un péché mignon, lequel serait-ce ?',
    "Quelle est la pire habitude de {playerName} qu'il/elle n'admettra jamais publiquement ?",
    'Comment {playerName} réagirait face à un compliment sincère mais inattendu ?',
    'Quel secret {playerName} serait-il/elle prêt(e) à partager uniquement dans cette pièce ?',
    'Quelle émotion {playerName} a-t-il/elle le plus de mal à exprimer ?',
    "Dans quel domaine {playerName} aimerait-il/elle être meilleur(e) mais a peur d'essayer ?",
    'Si {playerName} devait écrire une lettre à son "moi" passé, quel conseil donnerait-il/elle ?',
    'Quelle situation fait le plus douter {playerName} de ses capacités ?',
  ],
   "truth-or-dare": [
    {
      type: "action",
      text: "Fais une déclaration d’amour brûlante à un objet dans la pièce, comme si ta vie en dépendait."
    },
    {
      type: "action",
      text: "Danse collé-serré pendant 30 secondes… avec un coussin. Regarde quelqu’un du groupe droit dans les yeux pendant toute la danse."
    },
    {
      type: "action",
      text: "Chuchote dans l’oreille de la personne de ton choix ce que tu ferais si vous étiez seuls tous les deux dans un jacuzzi… L’autre personne doit juste répondre \"intéressant\"."
    },
    {
      type: "action",
      text: "À genoux, fais une demande en mariage dramatique à ton verre/ta boisson. Avec discours inclus."
    },
    {
      type: "action",
      text: "Ferme les yeux. Quelqu’un te fait goûter 3 trucs. Tu dois deviner ce que c’est. Si tu te trompes 2 fois, tu bois un mélange de tout."
    },
    {
      type: "action",
      text: "Reproduis la pose la plus sexy que tu connais sur un meuble."
    },
    {
      type: "action",
      text: "Fais un massage de 30 secondes à la personne la plus timide de la pièce (ou choisis-en une si personne n’assume)."
    },
    {
      type: "action",
      text: "Fais un striptease… avec ta veste ou ton pull uniquement. Musique sensuelle obligatoire."
    },
    {
      type: "action",
      text: "Imitation sexy : prends une voix de pub et fais la pub de la personne de ton choix dans la pièce comme si c'était un sextoy."
    },
    {
      type: "action",
      text: "Selfie time : fais une duck face + grimace coquine et envoie-la à ton ex ou crush."
    },
    {
      type: "action",
      text: "Prends un objet dans la pièce et mime une scène d’un film d’amour torride en utilisant cet objet comme partenaire."
    },
    {
      type: "action",
      text: "Fais deviner au groupe une de tes positions uniquement en mimant."
    },
    {
      type: "action",
      text: "Tu es une célébrité gênante surprise par les paparazzis. Joue la scène en 20 secondes, émotion dramatique incluse."
    },
    {
      type: "action",
      text: "Va t’asseoir sur les genoux de la personne de ton choix et reste-y 1 minute. Interdiction de rire."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Faites ensemble une chorégraphie improvisée sur un slow… sans musique."
    },
    {
      type: "action",
      text: "Lis un passage ultra cucul d’un livre (ou invente-le) comme si c’était une poésie sulfureuse."
    },
    {
      type: "action",
      text: "Chante un générique de dessin animé en mode sensuel, en regardant quelqu’un fixement."
    },
    {
      type: "action",
      text: "Enlève une chaussure. Elle devient ton \"micro\". Fais une confession gênante avec."
    },
    {
      type: "action",
      text: "Demande à quelqu’un de mimer ta plus grosse honte. Tu dois deviner laquelle c’est."
    },
    {
      type: "action",
      text: "Trouve un objet que tu peux porter comme accessoire sexy. Garde-le sur toi pendant 3 tours."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Chacun dit à l’autre son top 3 de ce qu’il/elle trouve attirant physiquement chez l’autre. Honnêteté obligatoire."
    },
    {
      type: "action",
      text: "Laisse le groupe décider d’une phrase sexy que tu dois glisser dans une conversation normale dans les 10 prochaines minutes."
    },
    {
      type: "action",
      text: "Fais une pub sérieuse (30 sec) pour un lubrifiant, un préservatif ou un jouet (imaginé ou réel)."
    },
    {
      type: "action",
      text: "Inventez une rumeur torride sur la personne à ta droite. Elle doit dire si elle aurait aimé que ce soit vrai."
    },
    {
      type: "action",
      text: "Pose tes deux mains sur les épaules de quelqu’un et fixe-le dans les yeux en répétant 2 fois : \"Toi. Moi. Ce soir.\""
    },
    {
      type: "action",
      text: "Choisis un partenaire et mimez ensemble une scène romantique façon télénovela espagnole."
    },
    {
      type: "action",
      text: "Fais 3 compliments torrides à 3 personnes différentes dans le groupe (pas les mêmes compliments !)."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Pendant 2 tours, à chaque fois que tu fais une action, il doit en faire une version miroir."
    },
    {
      type: "action",
      text: "Raconte ton plus grand fail romantique comme si c’était une grande épopée héroïque."
    },
    {
      type: "action",
      text: "Fais semblant de draguer quelqu’un en utilisant uniquement des noms de plats ou d’ingrédients."
    },
    {
      type: "action",
      text: "Dis à la personne à ta gauche ce que tu imagines être sa zone érogène préférée. Elle doit confirmer ou infirmer."
    },
    {
      type: "action",
      text: "Tu es un prof de séduction. Donne un mini cours d’1 minute au groupe en mimant les gestes."
    },
    {
      type: "action",
      text: "Fais un compliment déguisé en insulte… à la personne de ton choix."
    },
    {
      type: "action",
      text: "Demande à quelqu’un de te poser une question torride. Tu es obligé(e) de répondre."
    },
    {
      type: "action",
      text: "Prends la pose la plus Instagram sexy que tu peux… et laisse le groupe noter sur 10."
    },
    {
      type: "action",
      text: "Donne une note à la voix de chaque joueur. Celui qui a la voix la plus \"ASMR sexy\" remporte un gage de ton choix."
    },
    {
      type: "action",
      text: "Improvise une chanson d’amour avec au moins 3 mots choisis par le groupe. Tu dois la chanter à quelqu’un."
    },
    {
      type: "action",
      text: "Imitation : fais la démarche la plus sexy que tu puisses faire… puis celle d’un canard amoureux."
    },
    {
      type: "action",
      text: "Inventez un langage secret avec un partenaire, et communiquez avec pendant 3 minutes."
    },
    {
      type: "action",
      text: "Prends une posture de yoga sexy. Tiens-la pendant que tu racontes un souvenir gênant."
    },
    {
      type: "action",
      text: "Prends ton téléphone, active l’appareil photo avant, et fais-toi une déclaration en mode selfie amoureux."
    },
    {
      type: "action",
      text: "Dessine un cœur quelque part sur ton corps avec un doigt, puis demande à quelqu’un de le retrouver sans aide."
    },
    {
      type: "action",
      text: "Récite un texte ou une poésie façon ASMR ultra sensuelle. Chuchote dans l’oreille de ton voisin."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Pendant un tour entier, chaque fois que tu parles, tu dois le faire en mode \"rendez-vous galant intense\"."
    },
    {
      type: "action",
      text: "Fais semblant d’être au téléphone avec ton crush et laisse le groupe entendre ta moitié de conversation (ultra gênante et fleur bleue)."
    },
    {
      type: "action",
      text: "Fais semblant de recevoir une sextape par erreur. Joue la scène, avec panique, honte et... curiosité."
    },
    {
      type: "action",
      text: "Choisis deux personnes. Donne-leur un scénario de rupture ultra cliché qu’ils doivent jouer devant le groupe."
    },
    {
      type: "action",
      text: "Trouve un objet, et drague-le comme si c'était ton crush le plus inaccessible."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Chacun chuchote à l’autre sa plus grande envie cachée du moment (non sexuelle). Puis dites à haute voix l’envie de l’autre, pas la vôtre."
    },
    {
      type: "action",
      text: "Fais la pub de ton application de rencontre idéale, avec ton slogan de drague inclus."
    },
    {
      type: "action",
      text: "Fais semblant de séduire un fantôme hyper sexy dans la pièce. Avec passion et frustration."
    },
    {
      type: "action",
      text: "Fais une battle de compliments torrides avec la personne en face de toi. Le groupe vote le plus."
    },
    {
      type: "action",
      text: "Improvise un speed dating de 30 secondes avec 3 personnes différentes. Tu dois les convaincre que tu es \"le/la partenaire idéal(e)\"."
    },
    {
      type: "action",
      text: "Raconte le moment exact où tu as réalisé que tu étais attiré par quelqu’un… mais invente les 50% les plus gênants."
    },
    {
      type: "action",
      text: "Tu deviens influenceur \"sexy gênant\". Vends-nous ta routine du matin sans filtre."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Tenez-vous par la main pendant 2 tours et faites comme si vous étiez en couple depuis 10 ans."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Tenez-vous par la main pendant 2 tours et faites comme si vous étiez en couple depuis 10 ans."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Tenez-vous par la main pendant 2 tours et faites comme si vous étiez en couple depuis 10 ans."
    },
    {
      type: "action",
      text: "Mime une scène de film d’horreur… sauf que c’est toi le monstre sexy. Grrrr."
    },
    {
      type: "action",
      text: "Improvise une version torride de \"Pierre-Feuille-Ciseaux\". Perds volontairement au 3e coup."
    },
    {
      type: "action",
      text: "Fais un compliment sincère à la personne la plus \"low profile\" du groupe. Puis un compliment sexy à la plus exubérante."
    },
    {
      type: "action",
      text: "Choisis un joueur qui devra t’envoyer une note vocale très douce ou très sale (au choix du groupe !)."
    },
    {
      type: "action",
      text: "Tu es l’assistant personnel de la personne à ta droite. Pendant 5 minutes, tu exécutes ses ordres… raisonnables."
    },
    {
      type: "action",
      text: "Tu dois lécher une partie de ton propre corps (accessible) de manière sexy. Si tu n’y arrives pas, mime que tu dois lécher une autre personne de manière sexy."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Décrivez vos fantasmes de vacances en couple… en 3 phrases, mais avec des légumes inclus."
    },
    {
      type: "action",
      text: "Propose une question torride au groupe. Tu dois répondre en premier."
    },
    {
      type: "action",
      text: "Attrape un objet mou et mime un câlin passionné avec. Ne dis pas un mot."
    },
    {
      type: "action",
      text: "Tu es dans un jeu de télé-réalité de drague. Fais ton portrait de présentation en 20 secondes."
    },
    {
      type: "action",
      text: "Fais une imitation de quelqu’un du groupe… comme s’il/elle était en plein rencard torride."
    },
    {
      type: "action",
      text: "Tu dois deviner la couleur des sous-vêtements de 2 personnes. S’il y a une erreur… tu bois une gorgée (ou un gage)."
    },
    {
      type: "action",
      text: "Regarde la personne de ton choix pendant 10 secondes et dis ce que tu ressens exactement maintenant. Même si c’est bizarre."
    },
    {
      type: "action",
      text: "Donne un surnom sexy à chaque personne du groupe. Ils doivent t’appeler comme ça pendant 3 tours."
    },
    {
      type: "action",
      text: "Danse un slow avec la chaise la plus sexy de la pièce."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Faites le \"jeu du miroir\" : mimez l’un l’autre à l’identique pendant 1 minute."
    },
    {
      type: "action",
      text: "Donne ta meilleure punchline de drague. Si quelqu’un en a une meilleure, vous faites une battle."
    },
    {
      type: "action",
      text: "Raconte une anecdote vraie que tu n’as JAMAIS ou presque dite à personne. Et elle doit être croustillante."
    },
    {
      type: "action",
      text: "Fais un compliment torride à un joueur... en utilisant uniquement des métaphores culinaires."
    },
    {
      type: "action",
      text: "Tu deviens un coach love. Donne un conseil de séduction à chacun."
    },
    {
      type: "action",
      text: "Écris ton prénom sexy d’artiste et invente une bio d’influenceur sulfureux/se."
    },
    {
      type: "action",
      text: "Fais semblant d’être dans un clip de RnB lent. Chante et mime ce que tu ressens."
    },
    {
      type: "action",
      text: "Fais deviner au groupe ta technique de drague secrète. Ils doivent te mimer en train de l’utiliser."
    },
    {
      type: "action",
      text: "Improvise une scène où tu retrouves ton ex dans un supermarché… et c’est gênant."
    },
    {
      type: "action",
      text: "Dessine une moustache ou un cœur au feutre sur ta joue, selon ton humeur. Tu le gardes 3 tours."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Regardez-vous dans les yeux sans rire pendant 30 secondes. Si l’un rit, il/elle fait un mini massage à l’autre."
    },
    {
      type: "action",
      text: "Fais semblant d’avoir un orgasme en mangeant un aliment imaginaire."
    },
    {
      type: "action",
      text: "Lis un extrait d’un mode d’emploi (vraiment technique) comme si c’était une lettre d’amour torride."
    },
    {
      type: "action",
      text: "Pose pour une fausse couverture de magazine \"Hot People du mois\". On te prend en photo dans la pose la plus assumée."
    },
    {
      type: "action",
      text: "Tu deviens le narrateur d’un film romantique… mais en voix off pendant que deux joueurs se regardent amoureusement."
    },
    {
      type: "action",
      text: "Choisis un joueur. Donne-lui un défi sexy à faire maintenant ou un secret à révéler. S’il refuse, c’est à toi de le faire."
    },
    {
      type: "action",
      text: "Mime un animal en chaleur pendant 10 secondes (restons dans le bon goût )."
    },
    {
      type: "action",
      text: "Fais un slow en solo… mais imagine que tu es deux personnes. Tourne-toi dans les bras de ton double invisible."
    },
    {
      type: "action",
      text: "Choisis un partenaire et faites une scène où vous êtes deux collègues qui cachent leur relation... mais se retrouvent coincés dans l’ascenseur."
    },
    {
      type: "action",
      text: "Raconte un rêve érotique que tu n’as jamais osé raconter. Sinon, invente-le, mais joue-le sérieusement."
    },
    {
      type: "action",
      text: "Envoie un message vocal à quelqu’un en simulant une dispute de couple passionnée… seul."
    },
    {
      type: "action",
      text: "Imitation extrême : mime un joueur qui tente de draguer maladroitement. Rends-le drôle mais attendrissant."
    },
    {
      type: "action",
      text: "Fais un gage ou dis une vérité avec ta voix la plus sexy possible. Le groupe juge."
    },
    {
      type: "action",
      text: "Tu es dans un jeu de télé-réalité : explique pourquoi les autres candidats devraient craquer pour toi."
    },
    {
      type: "action",
      text: "Choisis un joueur au hasard. Pendant 2 tours, tout ce que tu dis doit commencer par son prénom."
    },
    {
      type: "action",
      text: "Tu es hypnotisé : dès qu’on dit le mot \"bisou\", tu dois faire une danse ridicule. Effet valable 2 fois."
    },
    {
      type: "action",
      text: "Tu dois inventer un surnom de couple pour toi et la personne à ta droite… et durant 3 tours vous vous appellerez par ce surnom."
    },
    {
      type: "action",
      text: "Invente une technique de drague totalement absurde, mais vends-la comme si c’était révolutionnaire."
    },
    {
      type: "action",
      text: "Tu dois faire une confession gênante en gardant ton sérieux absolu. Si tu ris, double confession."
    },
    {
      type: "action",
      text: "Choisis un joueur. Donnez-vous mutuellement un défi… puis échangez les défis !"
    },
    {
      type: "action",
      text: "Lis les 3 derniers emojis que tu as envoyés. Explique à qui et pourquoi."
    },
    {
      type: "action",
      text: "Tu deviens prof de bisous. Décris en détail, pédagogiquement, comment réussir un baiser parfait (sans le montrer)."
    },
    {
      type: "action",
      text: "Tu dois choisir un joueur qui t’attire le plus… et lui faire ta déclaration"
    },
    {
      type: "action",
      text: "Fais une battle de regards langoureux avec quelqu’un. Celui qui craque doit avouer son plus grand \"crush impossible\"."
    },
    {
      type: "action",
      text: "Choisis un joueur. Devinez simultanément l’un pour l’autre : la partie du corps que vous préférez chez l’autre."
    },
    {
      type: "action",
      text: "Fais une improvisation : ton ex débarque dans la soirée et c’est hyper gênant. À toi de gérer."
    },
    {
      type: "action",
      text: "Choisis un joueur et donne-lui un rôle dans un film torride. Il/elle te donne le tien."
    },
    {
      type: "action",
      text: "Mime une scène de film romantique version “18+” sans un mot. Le groupe doit deviner le film."
    },
    {
      type: "action",
      text: "Choisis un joueur. Dites à tour de rôle une phrase de drague nulle jusqu’à ce que l’un abandonne en riant."
    },
    {
      type: "action",
      text: "Prends un vêtement ou accessoire d’un autre joueur et explique pourquoi ça te rend fou/folle."
    },
    {
      type: "action",
      text: "Tu es professeur de \"dirty talk\" : donne 3 phrases d'exemple, sans rire."
    },
    {
      type: "action",
      text: "Choisis une personne et décrivez ensemble votre premier rendez-vous dans un monde parallèle."
    },
    {
      type: "action",
      text: "Raconte ta pire situation \"presque hot\" qui s’est transformée en gros fail."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Pendant 3 tours, chaque fois que vous croisez le regard, vous devez rougir (ou faire semblant)."
    },
    {
      type: "action",
      text: "Tu es dans un film érotique… mais il est doublé très mal. Joue une scène avec des bruits exagérés."
    },
    {
      type: "action",
      text: "Fais semblant d’avoir une obsession pour les pieds. Convaincs le groupe que c’est la nouvelle mode."
    },
    {
      type: "action",
      text: "Donne un surnom mignon mais ultra gênant à chaque joueur."
    },
    {
      type: "action",
      text: "Tu dois écrire un mot torride avec ton doigt sur la peau (épaule, bras) de la personne de ton choix… sans le dire à voix haute."
    },
    {
      type: "action",
      text: "Tu es influenceur sur OnlyFans : présente ton contenu (sans te trahir !)"
    },
    {
      type: "action",
      text: "Crée un profil de rencontre pour un des joueurs. Sois drôle, mais flatteur."
    },
    {
      type: "action",
      text: "Invente une technique de flirt qui inclut obligatoirement une grimace et un bruit bizarre. Montre-la."
    },
    {
      type: "action",
      text: "Tu es en train de rompre avec une peluche. Joue la scène avec émotion et dignité."
    },
    {
      type: "action",
      text: "Choisis un joueur. Décrivez une scène de film où vous êtes coincés dans une salle… et ça devient très intense."
    },
    {
      type: "action",
      text: "Donne un défi gênant à faire en duo… que tu dois faire aussi si la personne accepte !"
    },
    {
      type: "action",
      text: "Fais une déclaration de rupture à quelqu’un… alors que vous n’avez jamais été ensemble."
    },
    {
      type: "action",
      text: "Choisis un partenaire et rejouez une scène de film… où vous êtes deux espions infiltrés qui tombent amoureux malgré eux."
    },
    {
      type: "action",
      text: "Décris ce que serait un rendez-vous parfait avec la personne à ta gauche, mais façon comédie musicale."
    },
    {
      type: "action",
      text: "Tu es en manque affectif. Joue une scène où tu supplies une personne du groupe de t’aimer."
    },
    {
      type: "action",
      text: "Choisis un joueur et raconte une histoire où il/elle devient ton/ta crush... mais dans un monde post-apocalyptique."
    },
    {
      type: "action",
      text: "Chante \"Je t’aime\" en regardant quelqu’un… mais avec une voix ridicule de cartoon."
    },
    {
      type: "action",
      text: "Simule une situation où tu dois absolument cacher une trace de suçon… et improvise une excuse."
    },
    {
      type: "action",
      text: "Tu es “coupable de charme”. Plaide ta cause comme si tu étais au tribunal."
    },
    {
      type: "action",
      text: "Invente une scène où tu es surpris en train d’embrasser quelqu’un du groupe… par erreur."
    },
    {
      type: "action",
      text: "Prends le téléphone de ton voisin et lis un vieux message qui te fait rire. Explique-le (ou invente)."
    },
    {
      type: "action",
      text: "Choisis un joueur. Donnez-vous mutuellement un “non-dit gênant” à avouer à haute voix."
    },
    {
      type: "action",
      text: "Fais semblant de te faire draguer par un robot. Fais la voix du robot."
    },
    {
      type: "action",
      text: "Choisis un joueur. Vous devez créer ensemble un slogan de drague pour votre \"duo sexy\"."
    },
    {
      type: "action",
      text: "Tu es soudainement attiré par une table. Fais-lui la cour avec élégance."
    },
    {
      type: "action",
      text: "Donne ton “kink” inventé le plus absurde. Fais croire qu’il est réel."
    },
    {
      type: "action",
      text: "Pose tes mains sur les joues de quelqu’un et dis-lui : “Je ne pensais pas tomber amoureux/se… et pourtant.”"
    },
    {
      type: "action",
      text: "Tu es dans une émission de télé réalité. Raconte ton triangle amoureux avec deux personnes ici."
    },
    {
      type: "action",
      text: "Choisis un joueur. Vous devez parler à la 3e personne tout le long du prochain tour."
    },
    {
      type: "action",
      text: "Choisis un joueur. Vous devez parler à la 3e personne tout le long du prochain tour."
    },
    {
      type: "action",
      text: "Choisis un joueur. Vous devez parler à la 3e personne tout le long du prochain tour."
    },
    {
      type: "action",
      text: "Fais une imitation sensuelle d’un animal de ton choix pendant 10 secondes."
    },
    {
      type: "action",
      text: "Fais semblant d’avoir un énorme secret amoureux à révéler… mais en parlant dans une langue inventée."
    },
    {
      type: "action",
      text: "Compose un “message vocal de rupture gênant” à envoyer à une plante, une chaise ou ton coussin."
    },
    {
      type: "action",
      text: "Fais un massage de l’air à une personne en mimant chaque geste avec un maximum de sensualité absurde."
    },
    {
      type: "action",
      text: "Imagine que tu découvres que tu as matché sur Tinder avec quelqu’un ici. Joue la réaction."
    },
    {
      type: "action",
      text: "Donne un nom sexy à une partie de ton corps, et présente-la comme une star mondiale."
    },
    {
      type: "action",
      text: "Fais semblant de lire une lettre d’amour… qui a été écrite pour toi par erreur."
    },
    {
      type: "action",
      text: "Choisis un joueur. Vous êtes deux stars du porno. Inventez vos noms de scène et une bande-annonce."
    },
    {
      type: "action",
      text: "Tu es en date… et tu réalises que c’est avec ta cousine. Improvise la scène en 30 secondes."
    },
    {
      type: "action",
      text: "Crée ton propre langage de séduction et utilise-le pour séduire quelqu’un du groupe."
    },
    {
      type: "action",
      text: "Regarde la personne en face de toi et raconte votre lune de miel… dans un chalet isolé avec tempête de neige."
    },
    {
      type: "action",
      text: "Tu es un expert en \"dirty poetry\" : invente une strophe chaude mais poétique pour la personne à ta droite."
    },
    {
      type: "action",
      text: "Donne une critique de ta dernière performance romantique comme si tu étais un critique cinéma."
    },
    {
      type: "action",
      text: "Tu es prof de séduction à l’ancienne. Donne 3 règles “classiques” de flirt d’époque."
    },
    {
      type: "action",
      text: "Invente un dicton sexy complètement absurde… mais dis-le avec sérieux et sagesse."
    },
    {
      type: "action",
      text: "Choisis un joueur. Faites semblant de vivre un chagrin d’amour ensemble. Grosse scène, larmes et tout."
    },
    {
      type: "action",
      text: "Tu es obsédé par le regard d’un joueur. Fais un monologue dramatique en parlant de ses yeux."
    },
    {
      type: "action",
      text: "Invente le nom d’une secte de l’amour, et fais ton discours de recrutement à tout le groupe."
    },
    {
      type: "action",
      text: "Tu es dans un épisode de télé réalité “séduction à l’aveugle”. Fais ton pitch de présentation sans utiliser le mot “amour”."
    },
    {
      type: "action",
      text: "Choisis deux personnes et invente un scénario torride où elles se rencontrent dans un train."
    },
    {
      type: "action",
      text: "Tu es acteur dans une pub de parfum sensuel. Fais la voix off + le regard caméra."
    },
    {
      type: "action",
      text: "Le groupe désigne la personne la plus \"mystérieuse\". Cette personne doit révéler un secret… ou donner un gage collectif à tout le monde."
    },
    {
      type: "action",
      text: "Faites une chaîne humaine : chaque joueur doit murmurer à l’oreille de son voisin son \"fantasme de vacances\". Le dernier dit tout à voix haute (sans révéler les prénoms !)."
    },
    {
      type: "action",
      text: "Tout le monde ferme les yeux. L’organisateur touche discrètement 2 personnes. Elles doivent se lancer un regard intense sans rien dire pendant 1 tour. Le reste du groupe essaie de les deviner."
    },
    {
      type: "action",
      text: "Faites un vote à main levée : qui aurait le plus de chance de finir en couple avec quelqu’un ici ? Le ou la gagnante choisit un partenaire pour une danse lente improvisée."
    },
    {
      type: "action",
      text: "Le groupe forme deux équipes. Chacune doit inventer une “publicité sexy” pour une boisson imaginaire. Présentation obligatoire devant tout le monde !"
    },
    {
      type: "action",
      text: "Tout le monde mime une technique de drague en même temps. Le groupe vote pour la plus convaincante… et la plus ridicule."
    },
    {
      type: "action",
      text: "Organisez une fausse “élection du crush de la soirée” : chaque joueur vote anonymement. Le ou la gagnante donne un gage à quelqu’un."
    },
    {
      type: "action",
      text: "Chaque joueur écrit un compliment chaud ou gênant anonymement. On les tire au sort, et chacun doit deviner qui l’a écrit."
    },
    {
      type: "action",
      text: "En binômes : créez un faux couple avec une histoire commune. Vous devez convaincre le reste du groupe de votre amour éternel."
    },
    {
      type: "action",
      text: "Tout le monde écrit un mot “tabou” sur un papier. Si quelqu’un prononce l’un de ces mots pendant 10 minutes, il doit relever un gage collectif."
    },
    {
      type: "action",
      text: "Choisissez ensemble le joueur qui aurait le plus de chances de survivre à une orgie apocalyptique. Il/elle donne un ordre de style sexy à tous les autres (regard, posture, mot à dire)."
    },
    {
      type: "action",
      text: "Tout le monde doit faire un compliment sensuel à la personne à sa droite… mais en chuchotant à son oreille."
    },
    {
      type: "action",
      text: "Un joueur commence une histoire coquine avec une phrase. Chacun ajoute une phrase dans le sens des aiguilles d'une montre. Dernier joueur : fin inattendue obligatoire."
    },
    {
      type: "action",
      text: "Tout le monde ferme les yeux sauf un joueur. Il/elle doit caresser la main de 3 personnes. Ces 3 doivent deviner qui les a touché."
    },
    {
      type: "action",
      text: "Chaque joueur écrit un fantasme imaginaire. On lit tous les fantasmes à voix haute et vote pour celui qui pourrait être réel."
    },
    {
      type: "action",
      text: "Faites un \"tour d’imitations\" : chaque joueur imite la démarche de quelqu’un d’autre ici. Le groupe doit deviner la cible."
    },
    {
      type: "action",
      text: "Formez deux groupes. Chaque groupe doit inventer une position de câlin avec un nom stylé. Présentation à la fin avec mime."
    },
    {
      type: "action",
      text: "Chacun dit un mot sexy au hasard. Le joueur qui arrive à créer une phrase cohérente (et torride) gagne un privilège : choisir qui doit faire un duo."
    },
    {
      type: "action",
      text: "Tout le monde fait un mime d’orgasme en 3 secondes. Le plus convaincant donne un gage à quelqu’un."
    },
    {
      type: "action",
      text: "Le joueur le plus jeune désigne 2 joueurs pour jouer une scène \"premier rendez-vous gênant\". Impro devant tout le monde."
    },
    {
      type: "action",
      text: "Tous les joueurs votent pour “la personne qui a sûrement un dossier très chaud dans son téléphone”. Le/la gagnant doit avouer ou inventer une histoire plausible."
    },
    {
      type: "action",
      text: "Le groupe choisit 3 objets dans la pièce. Chacun doit inventer une déclaration d’amour torride à l’un d’eux."
    },
    {
      type: "action",
      text: "En ronde, chaque joueur doit dire la partie du corps qu’il trouve la plus sexy chez les autres (pas les mêmes !). Aucun droit de se répéter."
    },
    {
      type: "action",
      text: "Faites un blind test “sons de plaisir”… mais en imitant vous-mêmes. Le plus convaincant devient le “maître du jeu” pour 2 tours."
    },
    {
      type: "action",
      text: "Le joueur le plus fashion distribue un accessoire ridicule à chaque personne. Tous doivent le porter pendant 3 tours."
    },
    {
      type: "action",
      text: "Par équipe de 2 : composez une petite chanson de drague en 3 phrases et chantez-la à tour de rôle."
    },
    {
      type: "action",
      text: "Faites un “top 3 des couples impossibles” dans la pièce. Chaque “couple” désigné doit se faire un compliment sincère."
    },
    {
      type: "action",
      text: "Tout le monde fait une imitation d’un.e ex toxique pendant 15 secondes. Le groupe vote pour la plus réaliste."
    },
    {
      type: "action",
      text: "Le joueur au plus grand sourire lance un défi à l’ensemble du groupe : tous doivent le réaliser en même temps (danse, phrase, mimique…)."
    },
    {
      type: "action",
      text: "Le groupe désigne celui ou celle qui “cacherait le plus de secrets”. Cette personne doit répondre à 3 mini-questions (osées mais pas trop) posées par le groupe."
    },
    {
      type: "action",
      text: "Formez des duos. Chaque duo fait une impro : “comment j’ai dragué dans une bibliothèque”."
    },
    {
      type: "action",
      text: "Tout le monde donne une note de 1 à 10 à la “vibe sexy” des autres. Moyenne à calculer. Le ou la gagnant donne un gage au dernier."
    },
    {
      type: "action",
      text: "Tous les joueurs doivent se présenter comme dans une émission de dating TV… mais avec un accessoire ridicule."
    },
    {
      type: "action",
      text: "En cercle : chacun dit “le mot qui le fait rougir” (réel ou inventé). Le plus marrant fait une impro de pub avec ce mot."
    },
    {
      type: "action",
      text: "Faites un “challenge du regard” collectif. Chacun fixe quelqu’un. Celui qui rit en premier reçoit un gage collectif."
    },
    {
      type: "action",
      text: "En binôme : simulez votre premier matin au lit ensemble… sans jamais parler."
    },
    {
      type: "action",
      text: "Choisissez ensemble “le joueur le plus discret”. Il ou elle doit se faire passer pour le plus chaud/chaude pendant 1 minute."
    },
    {
      type: "action",
      text: "Faites un “débat” en équipe : est-ce mieux un baiser long ou court ? Chaque équipe doit défendre sa position… passionnément."
    },
    {
      type: "action",
      text: "Tour de rôle : chacun doit raconter une mini-honte amoureuse. Le plus gênant gagne… le droit de faire faire un gage."
    },
    {
      type: "action",
      text: "Un joueur commence une phrase sexy, chaque personne ajoute un mot pour créer une phrase finale qui doit avoir du sens (et du style !)."
    },
    {
      type: "action",
      text: "Tout le monde se lève. Faites une choré collective improvisée sur une musique sexy. Le plus à fond devient chorégraphe officiel du groupe."
    },
    {
      type: "action",
      text: "Tour express : chacun mime sa plus grande peur en amour. Les autres doivent deviner."
    },
    {
      type: "action",
      text: "À tour de rôle : chaque joueur doit complimenter la personne qu’il pense être “la plus dangereusement attirante” dans la pièce."
    },
    {
      type: "action",
      text: "En cercle : dites chacun un mot doux, un mot coquin et un mot complètement absurde. L’ensemble devient un slogan."
    },
    {
      type: "action",
      text: "Tour de “télépathie sexy” : chaque joueur écrit en secret la personne qu’il/elle embrasserait. Si deux se matchent, ils partagent une anecdote coquine."
    },
    {
      type: "action",
      text: "Faites le jeu du “chaud-froid” avec un objet : le groupe guide un joueur jusqu’à un objet “sexy symbolique” caché dans la pièce."
    },
    {
      type: "action",
      text: "Par équipe : créez une mascotte sexy de soirée. Dressez son portrait et son slogan. Présentez-la au public."
    },
    {
      type: "action",
      text: "Tout le monde écrit une \"situation de tension romantique\" plausible. On tire au sort, et deux joueurs l’improvisent."
    },
    {
      type: "action",
      text: "En groupe, imaginez le scénario d’un film où tous les joueurs sont colocataires… avec secrets amoureux. Mettez un twist à la fin."
    },
    {
      type: "action",
      text: "Faites un concours de la meilleure phrase de drague… mais façon Shakespeare, poétique et ridicule à la fois. Applaudimètre à la fin."
    },
    {
      type: "verite",
      text: "As-tu déjà eu un rêve sexy impliquant quelqu’un ici ? Tu peux répondre juste par \"oui\" ou \"non\"."
    },
    {
      type: "verite",
      text: "Quelle est la dernière chose que tu as faite en secret et que personne ici ne soupçonnerait ?"
    },
    {
      type: "verite",
      text: "Quelle est la pensée la plus torride que tu aies eue cette semaine ?"
    },
    {
      type: "verite",
      text: "Qui ici te ferait potentiellement craquer... dans d'autres circonstances ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grosse honte liée à un moment intime ?"
    },
    {
      type: "verite",
      text: "As-tu déjà simulé quelque chose (un orgasme, un fou rire, un intérêt amoureux) ? Quand et pourquoi ?"
    },
    {
      type: "verite",
      text: "Quel est ton \"kink\" ou fantasme que tu assumes à moitié ?"
    },
    {
      type: "verite",
      text: "As-tu déjà espionné quelqu’un ici sur les réseaux en scred ? Qui et pourquoi ?"
    },
    {
      type: "verite",
      text: "Quel est le plus grand malentendu amoureux ou sexuel que tu aies vécu ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été attiré(e) par le copain / la copine de quelqu’un que tu connaissais ?"
    },
    {
      type: "verite",
      text: "Quelle est l’habitude la plus étrange que tu as quand personne ne te regarde ?"
    },
    {
      type: "verite",
      text: "As-tu déjà menti pour éviter un rencard ? Quelle était ta meilleure excuse ?"
    },
    {
      type: "verite",
      text: "Avec qui ici pourrais-tu envisager un plan \"juste une fois\" ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus osée que tu aies postée… et supprimée aussitôt ?"
    },
    {
      type: "verite",
      text: "Es-tu déjà tombé(e) amoureux(se) sans jamais oser le dire ? À qui ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été surpris(e) dans un moment... embarrassant ? Raconte."
    },
    {
      type: "verite",
      text: "Quelle est la phrase qu’on t’a dite au lit qui t’a fait exploser de rire ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais effacer un seul souvenir intime, lequel serait-ce ?"
    },
    {
      type: "verite",
      text: "Es-tu déjà sorti(e) avec deux personnes en même temps, sans qu’elles le sachent ?"
    },
    {
      type: "verite",
      text: "Quelle est ta pire anecdote de date raté ?"
    },
    {
      type: "verite",
      text: "As-tu déjà fantasmé sur une scène de film au point de vouloir la rejouer ?"
    },
    {
      type: "verite",
      text: "Quelle est la dernière personne que tu as stalkée sur Insta, et pourquoi ?"
    },
    {
      type: "verite",
      text: "Quelle est ta zone érogène préférée (à toi) et celle que tu aimes le plus chez l’autre ?"
    },
    {
      type: "verite",
      text: "As-tu déjà regretté d’avoir couché avec quelqu’un ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grande gêne dans les jeux de ce soir jusqu’ici ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus inattendue qui t’a excité un jour ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu envie d’embrasser quelqu’un ici ? (Tu peux dire \"peut-être\"... ou \"préciser\".)"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu n’as jamais osé faire… mais que tu aimerais essayer ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grosse honte liée à ton corps que tu as appris à accepter ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais faire un bisou à quelqu’un ici... en toute impunité... ce serait qui ?"
    },
    {
      type: "verite",
      text: "Quelle est la situation la plus gênante que tu aies vécue dans un moment intime ?"
    },
    {
      type: "verite",
      text: "As-tu déjà flirté juste pour te venger de quelqu’un ?"
    },
    {
      type: "verite",
      text: "As-tu déjà envoyé un message sexy... à la mauvaise personne ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu n’avoues jamais sur tes goûts amoureux ?"
    },
    {
      type: "verite",
      text: "As-tu déjà pensé à quelqu’un d’autre pendant un moment intime ? (Sans dire qui.)"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus stupide que tu aies faite pour te faire remarquer par quelqu’un ?"
    },
    {
      type: "verite",
      text: "Es-tu déjà tombé(e) amoureux(se) de quelqu’un qui ne te connaissait même pas ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus taboue qui t’intrigue ?"
    },
    {
      type: "verite",
      text: "Quelle est la personne ici qui t’a surpris(e) le plus ce soir (positivement ou pas) ?"
    },
    {
      type: "verite",
      text: "As-tu déjà fait semblant d’être plus innocent que tu ne l’es vraiment ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grosse contradiction amoureuse (ex : tu veux ça, mais tu fais l’inverse) ?"
    },
    {
      type: "verite",
      text: "Si quelqu’un ici te proposait un massage sensuel, accepterais-tu ? Si oui, qui ?"
    },
    {
      type: "verite",
      text: "Quelle est l’odeur ou le détail physique qui peut te faire craquer sans raison ?"
    },
    {
      type: "verite",
      text: "As-tu déjà inventé une version \"romantique\" d’une histoire juste pour ne pas passer pour un chaud(e) ?"
    },
    {
      type: "verite",
      text: "Es-tu plus du genre à fuir ou à foncer quand tu ressens quelque chose de fort ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu une relation ou un coup de cœur qui t’a un peu obsédé ?"
    },
    {
      type: "verite",
      text: "Quelle est la chanson qui te donne envie de t’ambiancer… dans un lit ?"
    },
    {
      type: "verite",
      text: "Es-tu déjà tombé amoureux(se) d’un ami/une amie ? L’as-tu avoué ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que personne ici ne soupçonnerait sur ta vie amoureuse ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus débile que tu aies faite sous pression sociale ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais changer une seule chose dans ton passé, ce serait quoi ?"
    },
    {
      type: "verite",
      text: "As-tu déjà inventé un mensonge énorme pour impressionner quelqu’un ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu fais toujours en cachette alors que tu sais que ce n’est pas très mature ?"
    },
    {
      type: "verite",
      text: "Quel est le film ou la série que tu adores mais que tu as honte d’aimer ?"
    },
    {
      type: "verite",
      text: "Quelle est la première impression (vraiment honnête) que tu as eue du joueur à ta gauche ?"
    },
    {
      type: "verite",
      text: "Quelle est la première impression (vraiment honnête) que tu as eue du joueur à ta droite ?"
    },
    {
      type: "verite",
      text: "Si tu étais invisible pendant 24h, quelle est la toute première chose que tu ferais ?"
    },
    {
      type: "verite",
      text: "Es-tu déjà tombé(e) très bas dans une embrouille ou un drama ? Raconte."
    },
    {
      type: "verite",
      text: "Quelle est la personne de ton entourage à qui tu mens le plus souvent (pour des broutilles) ?"
    },
    {
      type: "verite",
      text: "Si on regardait ton historique de navigation d’aujourd’hui, quelle est la recherche la plus absurde qu’on y trouverait ?"
    },
    {
      type: "verite",
      text: "Si on regardait ton historique de navigation privée de la semaine, quelle est la recherche que tu voudrais le plus cacher ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grande honte d’enfance ?"
    },
    {
      type: "verite",
      text: "Si tu devais revivre un moment de ton adolescence, ce serait lequel (et pourquoi) ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire excuse que tu aies utilisée pour éviter de sortir / faire quelque chose ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire excuse que tu aies utilisée pour refuser des avances ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire avance qu’on t’ai faite ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire avance qu’on tu aies faite ?"
    },
    {
      type: "verite",
      text: "Si tu devais éliminer une de tes habitudes chelou, ce serait laquelle ?"
    },
    {
      type: "verite",
      text: "Quel est ton moment préféré de la journée, et pourquoi ?"
    },
    {
      type: "verite",
      text: "Quelle est la plus grosse dépense inutile que tu as faite récemment ?"
    },
    {
      type: "verite",
      text: "Quel est ton plat \"réconfort\" ultime, celui que tu manges en cachette ou quand tu as le cafard ?"
    },
    {
      type: "verite",
      text: "Es-tu plutôt rancunier ou du genre à tout oublier ?"
    },
    {
      type: "verite",
      text: "Quel est ton plus grand défaut… que tu n’arrives pas à corriger ?"
    },
    {
      type: "verite",
      text: "As-tu déjà menti dans un jeu comme celui-ci pour éviter une vérité ?"
    },
    {
      type: "verite",
      text: "Quelle est ta phobie la plus irrationnelle ?"
    },
    {
      type: "verite",
      text: "Si tu devais échanger ta vie avec celle de quelqu’un ici pendant 3 jours, qui choisirais-tu ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus stupide pour laquelle tu t’es déjà battu(e) ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose qui te rend jaloux plus vite que tu ne veux l’admettre ?"
    },
    {
      type: "verite",
      text: "Quel est l’objet que tu possèdes et dont tu aurais vraiment honte s’il tombait entre de mauvaises mains ?"
    },
    {
      type: "verite",
      text: "Si un film était basé sur ta vie, ce serait une comédie, un drame ou un thriller ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quelle est la dernière chose qui t’a fait pleurer (même un peu) ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus inutile que tu sais faire parfaitement ?"
    },
    {
      type: "verite",
      text: "Quelle est la qualité que tu envies secrètement chez quelqu’un ici ?"
    },
    {
      type: "verite",
      text: "As-tu déjà trahi quelqu’un (même un tout petit peu) pour sauver ta peau ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été convaincu que quelqu’un t’aimait bien… et découvert que non ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire critique qu’on t’ait jamais faite ?"
    },
    {
      type: "verite",
      text: "Si tu devais écrire une lettre à ton \"toi\" du passé, que lui dirais-tu en une phrase ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose qui te fait perdre toute patience, même quand tu essaies de rester zen ?"
    },
    {
      type: "verite",
      text: "As-tu déjà gardé un secret très longtemps, au point de l’oublier toi-même ?"
    },
    {
      type: "verite",
      text: "Quelle est ta pire gaffe en public ?"
    },
    {
      type: "verite",
      text: "Si tu devais vivre sans une technologie que tu utilises quotidiennement pendant 1 mois, laquelle ce serait (et pourquoi) ?"
    },
    {
      type: "verite",
      text: "Quel est ton rituel bizarre ou inavoué quand tu es seul(e) chez toi ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grande réussite personnelle que peu de gens connaissent ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été jaloux(se) de l’amitié entre deux autres personnes ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu dis toujours… mais que tu ne fais jamais ?"
    },
    {
      type: "verite",
      text: "Quel est ton “talent inutile” préféré ?"
    },
    {
      type: "verite",
      text: "Quelle est la plus grande leçon que tu aies apprise cette année ?"
    },
    {
      type: "verite",
      text: "Si tu devais redémarrer à zéro dans un autre pays, lequel choisirais-tu ?"
    },
    {
      type: "verite",
      text: "Quelle est l’erreur que tu refais tout le temps, malgré toi ?"
    },
    {
      type: "verite",
      text: "As-tu déjà abandonné un projet qui te tenait à cœur ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quel est le truc le plus idiot que tu aies cru… bien trop longtemps ?"
    },
    {
      type: "verite",
      text: "As-tu déjà fait semblant d’aimer quelque chose (musique, film, hobby) juste pour te faire accepter ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais demander pardon à quelqu’un, ce serait à qui, et pour quoi ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu fais trop souvent mais que tu assumes à moitié ?"
    },
    {
      type: "verite",
      text: "Qui ici aurait le plus de chances de devenir célèbre un jour ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quel est le plus gros défaut qu’on pardonne trop facilement dans la société ?"
    },
    {
      type: "verite",
      text: "Entre tous les joueurs, qui a l’air d’avoir eu la pire période au collège ?"
    },
    {
      type: "verite",
      text: "Si quelqu’un ici devait devenir président, qui ce serait ? Et quel serait son premier décret ?"
    },
    {
      type: "verite",
      text: "Quelle est, selon vous, la meilleure qualité pour une relation longue ? Et la pire ?"
    },
    {
      type: "verite",
      text: "Si on faisait un classement de \"qui est le plus menteur ici\", qui serait sur le podium ?"
    },
    {
      type: "verite",
      text: "Quel est le joueur qui, selon toi, a le plus de secrets inavoués ?"
    },
    {
      type: "verite",
      text: "Est-ce mieux d’être trop honnête ou un peu manipulateur dans la vie ?"
    },
    {
      type: "verite",
      text: "Qui ici semble le plus \"suspectement calme\" ? Que cache-t-il ?"
    },
    {
      type: "verite",
      text: "Peut-on être ami avec quelqu’un dont on ne respecte pas les choix de vie ?"
    },
    {
      type: "verite",
      text: "Si on devait tous échanger nos téléphones, qui aurait le plus peur ? (Vote à main levée.)"
    },
    {
      type: "verite",
      text: "Quelle est, selon vous, la plus grande hypocrisie dans les relations actuelles ?"
    },
    {
      type: "verite",
      text: "Quel est le joueur ici qui aurait le plus de chances de tout plaquer et partir vivre à l’étranger sans prévenir ?"
    },
    {
      type: "verite",
      text: "Faut-il toujours dire ce qu’on pense ou savoir se taire ? Donne un exemple concret."
    },
    {
      type: "verite",
      text: "Dans cette pièce, qui aurait le plus de mal à survivre sans Internet pendant une semaine ?"
    },
    {
      type: "verite",
      text: "Si un joueur ici devait devenir influenceur, qui ce serait et dans quel domaine ?"
    },
    {
      type: "verite",
      text: "Est-ce plus grave de trahir un ami ou de mentir à toute une famille ?"
    },
    {
      type: "verite",
      text: "Qui ici semble avoir le plus de \"drama potentiel\" dans sa vie ?"
    },
    {
      type: "verite",
      text: "Lequel d’entre vous finirait le plus vite dans un \"triangle amoureux\" sans le vouloir ?"
    },
    {
      type: "verite",
      text: "Est-ce qu’on peut aimer deux personnes sincèrement en même temps ? Qui ici aurait déjà pu le faire ?"
    },
    {
      type: "verite",
      text: "Quelle est la qualité qu’on surestime le plus chez les gens ?"
    },
    {
      type: "verite",
      text: "Si on devait faire une alliance de survie, qui serait le stratège ? Qui serait sacrifié en premier ?"
    },
    {
      type: "verite",
      text: "Est-ce que tout se pardonne ? Donne un exemple où tu penses que non."
    },
    {
      type: "verite",
      text: "Dans cette pièce, qui a l’air le plus naïf ? Et le plus manipulateur ?"
    },
    {
      type: "verite",
      text: "Est-ce que l’amitié fille-garçon fonctionne vraiment ? Justifiez avec un exemple vécu."
    },
    {
      type: "verite",
      text: "Qui ici cache probablement un crush dans cette salle, et sur qui ?"
    },
    {
      type: "verite",
      text: "Entre l’intelligence, l’humour, et le physique, que faut-il prioriser ? (Chacun donne son ordre.)"
    },
    {
      type: "verite",
      text: "Quelle est la chose qu’on juge trop vite chez les autres ?"
    },
    {
      type: "verite",
      text: "Si on échangeait tous nos comptes Insta pendant 5 min, qui aurait le plus à perdre ?"
    },
    {
      type: "verite",
      text: "Est-ce mieux de toujours plaire à tout le monde ou d’assumer d’être clivant ?"
    },
    {
      type: "verite",
      text: "Qui dans cette pièce aurait le plus de chances de finir en télé-réalité ? Et pourquoi ?"
    },
    {
      type: "verite",
      text: "Est-ce que l’amour à distance peut vraiment fonctionner ? Qui ici y croit encore ?"
    },
    {
      type: "verite",
      text: "Dans cette salle, qui pourrait tenir le plus longtemps dans un mensonge ?"
    },
    {
      type: "verite",
      text: "Est-ce qu’on peut vraiment changer quelqu’un ? Ou les gens ne changent jamais ?"
    },
    {
      type: "verite",
      text: "Est-ce que les apparences comptent plus qu’on veut bien l’avouer ? Chacun répond."
    },
    {
      type: "verite",
      text: "Quelle est la meilleure chose qu’on pourrait faire tous ensemble en tant que groupe ?"
    },
    {
      type: "verite",
      text: "Si on devait faire un \"groupe de potes pour la vie\", qui seraient les deux premiers choisis ?"
    },
    {
      type: "verite",
      text: "Quelle est la plus grande peur sociale que vous avez, même si c’est irrationnel ?"
    },
    {
      type: "verite",
      text: "Qui ici a l’air de donner les meilleurs conseils ? Et qui les pires ?"
    },
    {
      type: "verite",
      text: "Est-ce qu’il vaut mieux blesser par la vérité ou mentir pour protéger ?"
    },
    {
      type: "verite",
      text: "Si on devait élire le roi ou la reine de cette soirée, qui serait couronné ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Est-ce que l’on peut être totalement soi-même dans un groupe ? Chacun répond par oui ou non (et pourquoi)."
    },
    {
      type: "verite",
      text: "Qui ici serait un excellent colocataire ? Et qui serait insupportable à vivre ?"
    },
    {
      type: "verite",
      text: "Est-ce que le fait de tout partager (argent, infos, sentiments) est une bonne idée ou une illusion ?"
    },
    {
      type: "verite",
      text: "Quelle est la plus grande injustice que tu as vue dans ton entourage ?"
    },
    {
      type: "verite",
      text: "Dans un escape game, qui serait le cerveau ? Qui paniquerait ? Qui ne servirait à rien ?"
    },
    {
      type: "verite",
      text: "Si tu devais créer une règle pour ce groupe de potes, laquelle ce serait ?"
    },
    {
      type: "verite",
      text: "Est-ce qu’un secret peut vraiment ne jamais ressortir ? Donnez un contre-exemple vécu ou imaginé."
    },
    {
      type: "verite",
      text: "À qui ici tu ferais confiance pour gérer ton compte bancaire ? Et qui jamais de la vie ?"
    },
    {
      type: "verite",
      text: "Si ce groupe devait créer une entreprise ensemble, qui serait le boss ? Qui serait viré en premier ?"
    },
    {
      type: "verite",
      text: "As-tu déjà couché avec quelqu’un juste pour voir ce que ça donnerait ? Regret ou pas ?"
    },
    {
      type: "verite",
      text: "Quelle est la tenue dans laquelle tu te sens le plus sexy, même si personne ne le sait ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus osée que tu aies faite dans un lieu public ?"
    },
    {
      type: "verite",
      text: "Quel est ton plus gros fantasme que tu n’as encore jamais osé tenter ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu une relation purement physique qui a mal tourné ? Que s’est-il passé ?"
    },
    {
      type: "verite",
      text: "Quel est ton \"red flag\" préféré (celui qui devrait t’alerter, mais que tu trouves sexy) ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu une aventure avec une personne dont tu ne te souviens même pas du prénom ?"
    },
    {
      type: "verite",
      text: "Quelle est la partie de ton corps que tu préfères chez toi, quand tu es nu(e) ?"
    },
    {
      type: "verite",
      text: "As-tu déjà couché avec quelqu’un en pensant à une autre personne ?"
    },
    {
      type: "verite",
      text: "Quel est le plus long moment sans sexe que tu aies vécu ? Et le plus court entre deux plans ?"
    },
    {
      type: "verite",
      text: "As-tu déjà envoyé une photo \"sensible\" à quelqu’un que tu ne connaissais pas très bien ?"
    },
    {
      type: "verite",
      text: "Quelle est la situation la plus gênante qui t’ait coupé net dans un moment intime ?"
    },
    {
      type: "verite",
      text: "Quelle est la plus grosse prise de risque que tu as faite pour avoir un rapport ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été surpris(e) par un coloc, un parent ou un inconnu pendant l’acte ?"
    },
    {
      type: "verite",
      text: "As-tu déjà fantasmé sur un(e) professeur(e), un supérieur hiérarchique ou quelqu’un d'inaccessible ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose la plus étrange qui t’a excité(e) un jour ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu une période où tu enchaînais les conquêtes ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quel est le lieu le plus inapproprié où tu as déjà eu une pensée très chaude ?"
    },
    {
      type: "verite",
      text: "Tu dois passer une nuit avec une personne ici... mais sans jamais l’avouer. Qui choisis-tu ?"
    },
    {
      type: "verite",
      text: "As-tu déjà simulé par pure politesse ou pour que ça s’arrête plus vite ? Raconte."
    },
    {
      type: "verite",
      text: "Quelle est la chanson qui te met direct en \"mode chaud\" ?"
    },
    {
      type: "verite",
      text: "As-tu déjà couché avec quelqu’un le jour même de votre rencontre ? Raconte si c’était une réussite… ou pas."
    },
    {
      type: "verite",
      text: "Es-tu déjà resté(e) avec quelqu’un juste parce que le sexe était bon ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais revivre une nuit, ce serait laquelle ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu as déjà faite sous la couette… et que tu pensais ne jamais oser faire ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été tenté(e) par un plan à trois ? Est-ce que tu l’as fait ?"
    },
    {
      type: "verite",
      text: "Quel est le scénario de film ou de série qui t’a le plus fait fantasmer ?"
    },
    {
      type: "verite",
      text: "Quelle est la phrase de drague la plus directe qu’on t’ait dite… et qui a (ou pas) marché ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été attiré(e) par deux personnes en même temps, dans une même soirée ?"
    },
    {
      type: "verite",
      text: "As-tu déjà regretté de ne pas avoir couché avec quelqu’un ? Qu’est-ce qui t’a retenu ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu un \"crush sexuel\" sur quelqu’un ici ? Même juste physique ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grosse erreur de choix au lit (partenaire, lieu, moment...) ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu un fou rire incontrôlable pendant l’acte ? Pourquoi ?"
    },
    {
      type: "verite",
      text: "Quelle est la chose que tu n’avoues jamais sur tes envies... mais que tu espères secrètement ?"
    },
    {
      type: "verite",
      text: "As-tu déjà utilisé des objets du quotidien pour pimenter tes moments intimes ?"
    },
    {
      type: "verite",
      text: "Si tu pouvais choisir un seul fantasme à réaliser cette semaine, ce serait lequel ?"
    },
    {
      type: "verite",
      text: "As-tu déjà flirté lourdement juste pour le jeu, sans vouloir aller plus loin ?"
    },
    {
      type: "verite",
      text: "Quel est ton avis sur les coups d’un soir ? C’est un bon souvenir ou une suite d’échecs ?"
    },
    {
      type: "verite",
      text: "Es-tu plus dominant(e), dominé(e), ou ça dépend des gens ?"
    },
    {
      type: "verite",
      text: "Quelle est ta pire gaffe juste avant ou pendant un rapport ?"
    },
    {
      type: "verite",
      text: "As-tu déjà dit “je t’aime” juste pour obtenir quelque chose de charnel ?"
    },
    {
      type: "verite",
      text: "Quelle est ta plus grande fierté \"non assumée\" au lit ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu une aventure avec un(e) ex juste pour \"réessayer\" ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été tenté(e) par l’échange, l’ouverture de couple, ou quelque chose hors norme ?"
    },
    {
      type: "verite",
      text: "Quelle est la pire chose que quelqu’un t’ait dite juste après l’acte ?"
    },
    {
      type: "verite",
      text: "As-tu déjà eu un moment intime à moitié improvisé… et qui a tourné au désastre ?"
    },
    {
      type: "verite",
      text: "Quel est l’endroit où tu rêves de faire l’amour un jour ?"
    },
    {
      type: "verite",
      text: "As-tu déjà caché à tes potes une histoire torride parce que \"c’était trop\" ?"
    },
    {
      type: "verite",
      text: "As-tu déjà été vraiment déçu(e) par une personne qui te faisait fantasmer depuis longtemps ?"
    },
    {
      type: "verite",
      text: "Es-tu du genre à prendre ton temps… ou à foncer direct quand il y a une forte tension ?"
    },
    { type: "verite", text: "Faut-il dire à un ami qu’on n’aime pas son ou sa partenaire ?" },
    { type: "verite", text: "Peut-on vraiment rester ami avec un ex ? Ou est-ce toujours une bombe à retardement ?" },
    { type: "verite", text: "Vaut-il mieux être extrêmement beau ou extrêmement intelligent ?" },
    { type: "verite", text: "Est-ce que pardonner une trahison, c’est forcément être faible ?" },
    { type: "verite", text: "Peut-on construire une vraie relation sans jamais se disputer ?" },
    { type: "verite", text: "Est-ce que les réseaux sociaux ont pourri nos relations… ou les ont rendues plus authentiques ?" },
    { type: "verite", text: "Est-ce que l’argent rend les gens plus heureux ou juste plus seuls ?" },
    { type: "verite", text: "Mieux vaut vivre une passion intense qui ne dure pas… ou une relation tranquille et stable ?" },
    { type: "verite", text: "Est-ce que tout le monde mérite une seconde chance ?" },
    { type: "verite", text: "Peut-on vraiment tomber amoureux sans jamais se voir en vrai ?" },
    { type: "verite", text: "Est-ce que le pardon doit être automatique dans une amitié forte ?" },
    { type: "verite", text: "Est-ce qu’on peut être heureux en couple si on n’a pas confiance à 100 % ?" },
    { type: "verite", text: "L’infidélité émotionnelle est-elle pire que l’infidélité physique ?" },
    { type: "verite", text: "Est-ce qu’on peut réussir sa vie sans jamais tomber amoureux ?" },
    { type: "verite", text: "Est-ce qu’il faut dire la vérité à quelqu’un qui ne veut pas l’entendre ?" },
    { type: "verite", text: "Est-ce que la jalousie est une preuve d’amour… ou un poison inutile ?" },
    { type: "verite", text: "Mieux vaut vivre seul que mal accompagné… ou l’inverse ?" },
    { type: "verite", text: "Est-ce qu’on peut vraiment \"changer\" quelqu’un qu’on aime, ou faut-il l’accepter comme il est ?" },
    { type: "verite", text: "Est-ce que l’humour peut sauver une relation en crise ?" },
    { type: "verite", text: "Est-ce que les opposés s’attirent… ou se détruisent ?" }
  ]
};

async function uploadQuestions() {
  for (const [gameId, questionsArray] of Object.entries(questions)) {
    await setDoc(doc(db, 'gameQuestions', gameId), {
      questions: questionsArray
    });
    console.log(`Questions uploaded for ${gameId}`);
  }
  process.exit(0);
}

uploadQuestions().catch(console.error);