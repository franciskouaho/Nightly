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
      text: "Fais une déclaration d'amour brûlante à un objet dans la pièce, comme si ta vie en dépendait."
    },
    {
      type: "action",
      text: "Danse collé-serré pendant 30 secondes… avec un coussin. Regarde quelqu'un du groupe droit dans les yeux pendant toute la danse."
    },
    {
      type: "action",
      text: "Chuchote dans l'oreille de la personne de ton choix ce que tu ferais si vous étiez seuls tous les deux dans un jacuzzi… L'autre personne doit juste répondre \"intéressant\"."
    },
    {
      type: "action",
      text: "À genoux, fais une demande en mariage dramatique à ton verre/ta boisson. Avec discours inclus."
    },
    {
      type: "action",
      text: "Ferme les yeux. Quelqu'un te fait goûter 3 trucs. Tu dois deviner ce que c'est. Si tu te trompes 2 fois, tu bois un mélange de tout."
    },
    {
      type: "action",
      text: "Reproduis la pose la plus sexy que tu connais sur un meuble."
    },
    {
      type: "action",
      text: "Fais un massage de 30 secondes à la personne la plus timide de la pièce (ou choisis-en une si personne n'assume)."
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
      text: "Prends un objet dans la pièce et mime une scène d'un film d'amour torride en utilisant cet objet comme partenaire."
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
      text: "Va t'asseoir sur les genoux de la personne de ton choix et reste-y 1 minute. Interdiction de rire."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Faites ensemble une chorégraphie improvisée sur un slow… sans musique."
    },
    {
      type: "action",
      text: "Lis un passage ultra cucul d'un livre (ou invente-le) comme si c'était une poésie sulfureuse."
    },
    {
      type: "action",
      text: "Chante un générique de dessin animé en mode sensuel, en regardant quelqu'un fixement."
    },
    {
      type: "action",
      text: "Enlève une chaussure. Elle devient ton \"micro\". Fais une confession gênante avec."
    },
    {
      type: "action",
      text: "Demande à quelqu'un de mimer ta plus grosse honte. Tu dois deviner laquelle c'est."
    },
    {
      type: "action",
      text: "Trouve un objet que tu peux porter comme accessoire sexy. Garde-le sur toi pendant 3 tours."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Chacun dit à l'autre son top 3 de ce qu'il/elle trouve attirant physiquement chez l'autre. Honnêteté obligatoire."
    },
    {
      type: "action",
      text: "Laisse le groupe décider d'une phrase sexy que tu dois glisser dans une conversation normale dans les 10 prochaines minutes."
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
      text: "Pose tes deux mains sur les épaules de quelqu'un et fixe-le dans les yeux en répétant 2 fois : \"Toi. Moi. Ce soir.\""
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
      text: "Raconte ton plus grand fail romantique comme si c'était une grande épopée héroïque."
    },
    {
      type: "action",
      text: "Fais semblant de draguer quelqu'un en utilisant uniquement des noms de plats ou d'ingrédients."
    },
    {
      type: "action",
      text: "Dis à la personne à ta gauche ce que tu imagines être sa zone érogène préférée. Elle doit confirmer ou infirmer."
    },
    {
      type: "action",
      text: "Tu es un prof de séduction. Donne un mini cours d'1 minute au groupe en mimant les gestes."
    },
    {
      type: "action",
      text: "Fais un compliment déguisé en insulte… à la personne de ton choix."
    },
    {
      type: "action",
      text: "Demande à quelqu'un de te poser une question torride. Tu es obligé(e) de répondre."
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
      text: "Improvise une chanson d'amour avec au moins 3 mots choisis par le groupe. Tu dois la chanter à quelqu'un."
    },
    {
      type: "action",
      text: "Imitation : fais la démarche la plus sexy que tu puisses faire… puis celle d'un canard amoureux."
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
      text: "Prends ton téléphone, active l'appareil photo avant, et fais-toi une déclaration en mode selfie amoureux."
    },
    {
      type: "action",
      text: "Dessine un cœur quelque part sur ton corps avec un doigt, puis demande à quelqu'un de le retrouver sans aide."
    },
    {
      type: "action",
      text: "Récite un texte ou une poésie façon ASMR ultra sensuelle. Chuchote dans l'oreille de ton voisin."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Pendant un tour entier, chaque fois que tu parles, tu dois le faire en mode \"rendez-vous galant intense\"."
    },
    {
      type: "action",
      text: "Fais semblant d'être au téléphone avec ton crush et laisse le groupe entendre ta moitié de conversation (ultra gênante et fleur bleue)."
    },
    {
      type: "action",
      text: "Fais semblant de recevoir une sextape par erreur. Joue la scène, avec panique, honte et... curiosité."
    },
    {
      type: "action",
      text: "Choisis deux personnes. Donne-leur un scénario de rupture ultra cliché qu'ils doivent jouer devant le groupe."
    },
    {
      type: "action",
      text: "Trouve un objet, et drague-le comme si c'était ton crush le plus inaccessible."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Chacun chuchote à l'autre sa plus grande envie cachée du moment (non sexuelle). Puis dites à haute voix l'envie de l'autre, pas la vôtre."
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
      text: "Raconte le moment exact où tu as réalisé que tu étais attiré par quelqu'un… mais invente les 50% les plus gênants."
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
      text: "Mime une scène de film d'horreur… sauf que c'est toi le monstre sexy. Grrrr."
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
      text: "Choisis un joueur qui devra t'envoyer une note vocale très douce ou très sale (au choix du groupe !)."
    },
    {
      type: "action",
      text: "Tu es l'assistant personnel de la personne à ta droite. Pendant 5 minutes, tu exécutes ses ordres… raisonnables."
    },
    {
      type: "action",
      text: "Tu dois lécher une partie de ton propre corps (accessible) de manière sexy. Si tu n'y arrives pas, mime que tu dois lécher une autre personne de manière sexy."
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
      text: "Fais une imitation de quelqu'un du groupe… comme s'il/elle était en plein rencard torride."
    },
    {
      type: "action",
      text: "Tu dois deviner la couleur des sous-vêtements de 2 personnes. S'il y a une erreur… tu bois une gorgée (ou un gage)."
    },
    {
      type: "action",
      text: "Regarde la personne de ton choix pendant 10 secondes et dis ce que tu ressens exactement maintenant. Même si c'est bizarre."
    },
    {
      type: "action",
      text: "Donne un surnom sexy à chaque personne du groupe. Ils doivent t'appeler comme ça pendant 3 tours."
    },
    {
      type: "action",
      text: "Danse un slow avec la chaise la plus sexy de la pièce."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Faites le \"jeu du miroir\" : mimez l'un l'autre à l'identique pendant 1 minute."
    },
    {
      type: "action",
      text: "Donne ta meilleure punchline de drague. Si quelqu'un en a une meilleure, vous faites une battle."
    },
    {
      type: "action",
      text: "Raconte une anecdote vraie que tu n'as JAMAIS ou presque dite à personne. Et elle doit être croustillante."
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
      text: "Écris ton prénom sexy d'artiste et invente une bio d'influenceur sulfureux/se."
    },
    {
      type: "action",
      text: "Fais semblant d'être dans un clip de RnB lent. Chante et mime ce que tu ressens."
    },
    {
      type: "action",
      text: "Fais deviner au groupe ta technique de drague secrète. Ils doivent te mimer en train de l'utiliser."
    },
    {
      type: "action",
      text: "Improvise une scène où tu retrouves ton ex dans un supermarché… et c'est gênant."
    },
    {
      type: "action",
      text: "Dessine une moustache ou un cœur au feutre sur ta joue, selon ton humeur. Tu le gardes 3 tours."
    },
    {
      type: "action",
      text: "Choisis un partenaire. Regardez-vous dans les yeux sans rire pendant 30 secondes. Si l'un rit, il/elle fait un mini massage à l'autre."
    },
    {
      type: "action",
      text: "Fais semblant d'avoir un orgasme en mangeant un aliment imaginaire."
    },
    {
      type: "action",
      text: "Lis un extrait d'un mode d'emploi (vraiment technique) comme si c'était une lettre d'amour torride."
    },
    {
      type: "action",
      text: "Pose pour une fausse couverture de magazine \"Hot People du mois\". On te prend en photo dans la pose la plus assumée."
    },
    {
      type: "action",
      text: "Tu deviens le narrateur d'un film romantique… mais en voix off pendant que deux joueurs se regardent amoureusement."
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
  ],
  "genius-or-liar": [
    { type: "cultureG", question: "Quel est le plus long fleuve du monde ?", answer: "Le Nil" },
    { type: "cultureG", question: "Quelle est la monnaie utilisée au Royaume-Uni ?", answer: "La livre sterling" },
    { type: "cultureG", question: "Quel est le plus haut sommet du monde ?", answer: "L'Everest" },
    { type: "cultureG", question: "Quel métal a pour symbole chimique Fe ?", answer: "Le fer" },
    { type: "cultureG", question: "Quelle est la capitale du Maroc ?", answer: "Rabat" },
    { type: "cultureG", question: "Dans quel pays se trouve la ville de Kyoto ?", answer: "Japon" },
    { type: "cultureG", question: "Combien de continents existe-t-il ?", answer: "7" },
    { type: "cultureG", question: "Quel est l'auteur du roman '1984' ?", answer: "George Orwell" },
    { type: "cultureG", question: "Dans quel océan se trouve Madagascar ?", answer: "Océan Indien" },
    { type: "cultureG", question: "Combien de pattes possède une araignée ?", answer: "8" },
    { type: "cultureG", question: "Quelle est la capitale de la Norvège ?", answer: "Oslo" },
    { type: "cultureG", question: "Quelle est la planète la plus proche du Soleil ?", answer: "Mercure" },
    { type: "cultureG", question: "Quelle est la devise de la France ?", answer: "Liberté, Égalité, Fraternité" },
    { type: "cultureG", question: "Quel est le nom du fleuve qui traverse Paris ?", answer: "La Seine" },
    { type: "cultureG", question: "Qui a peint 'La Cène' ?", answer: "Léonard de Vinci" },
    { type: "cultureG", question: "Quel est le plus petit pays du monde ?", answer: "Le Vatican" },
    { type: "cultureG", question: "Combien de joueurs y a-t-il dans une équipe de football ?", answer: "11" },
    { type: "cultureG", question: "Quelle est la langue officielle du Brésil ?", answer: "Le portugais" },
    { type: "cultureG", question: "Combien y a-t-il de jours dans une année bissextile ?", answer: "366" },
    { type: "cultureG", question: "Quel est le symbole chimique de l'eau ?", answer: "H2O" },
    { type: "cultureG", question: "Qui a écrit 'L'Étranger' ?", answer: "Albert Camus" },
    { type: "cultureG", question: "Quel est le sport national du Japon ?", answer: "Le sumo" },
    { type: "cultureG", question: "Quel est l’organe principal de la respiration humaine ?", answer: "Les poumons" },
    { type: "cultureG", question: "Quelle est la couleur du sang des poulpes ?", answer: "Bleu" },
    { type: "cultureG", question: "Quel pays est le berceau des Jeux Olympiques ?", answer: "La Grèce" },
    { type: "cultureG", question: "Quelle est la capitale de l’Argentine ?", answer: "Buenos Aires" },
    { type: "cultureG", question: "Quel est l’animal le plus rapide du monde ?", answer: "Le guépard" },
    { type: "cultureG", question: "Quel est le plus grand désert chaud du monde ?", answer: "Le Sahara" },
    { type: "cultureG", question: "Qui a inventé l’imprimerie ?", answer: "Gutenberg" },
    { type: "cultureG", question: "Quel est le plus grand archipel du monde ?", answer: "L'Indonésie" },
    { type: "cultureG", question: "Combien de dents possède un adulte normalement constitué ?", answer: "32" },
    { type: "cultureG", question: "Quelle est la capitale de la Turquie ?", answer: "Ankara" },
    { type: "cultureG", question: "Quel est l’ingrédient principal du guacamole ?", answer: "L'avocat" },
    { type: "cultureG", question: "Quel pays est aussi appelé le Pays des Mille Collines ?", answer: "Le Rwanda" },
    { type: "cultureG", question: "Quelle est la langue officielle de l’Égypte ?", answer: "L’arabe" },
    { type: "cultureG", question: "Combien de couleurs composent l’arc-en-ciel ?", answer: "7" },
    { type: "cultureG", question: "Quel animal est le symbole de la sagesse ?", answer: "Le hibou" },
    { type: "cultureG", question: "Quel est le métal liquide à température ambiante ?", answer: "Le mercure" },
    { type: "cultureG", question: "Qui a découvert la pénicilline ?", answer: "Alexander Fleming" },
    { type: "cultureG", question: "Quel est le nom du satellite naturel de la Terre ?", answer: "La Lune" },
    { type: "cultureG", question: "Quel pays a pour drapeau une feuille d’érable ?", answer: "Le Canada" },
    { type: "cultureG", question: "Quel fruit est aussi appelé ‘fruit défendu’ ?", answer: "La pomme" },
    { type: "cultureG", question: "Quelle est la monnaie utilisée en Allemagne ?", answer: "L’euro" },
    { type: "cultureG", question: "Combien de côtés possède un hexagone ?", answer: "6" },
    { type: "cultureG", question: "Quelle est la formule chimique du dioxyde de carbone ?", answer: "CO2" },
    { type: "cultureG", question: "Qui a écrit 'Le Petit Prince' ?", answer: "Antoine de Saint-Exupéry" },
    { type: "cultureG", question: "Quel est le fleuve qui traverse l’Égypte ?", answer: "Le Nil" },
    { type: "cultureG", question: "Combien de zéros y a-t-il dans un milliard ?", answer: "9" },
    { type: "cultureG", question: "Quel est le plus grand pays d’Europe ?", answer: "La Russie" },
    { type: "cultureG", question: "Quelle est la capitale de la Suisse ?", answer: "Berne" },
    { type: "cultureG", question: "Quel est le nom du président actuel de la France (2024) ?", answer: "Emmanuel Macron" },
    { type: "cultureG", question: "Quelle est la ville la plus peuplée du monde ?", answer: "Tokyo" },
    { type: "cultureG", question: "Quel est le pays le plus grand du monde par superficie ?", answer: "La Russie" },
    { type: "cultureG", question: "Quel est le plus grand lac du monde ?", answer: "La mer Caspienne" },
    { type: "cultureG", question: "Quelle est la capitale de l'Australie ?", answer: "Canberra" },
    { type: "cultureG", question: "Quel est le plus grand océan du monde ?", answer: "L'océan Pacifique" },
    { type: "cultureG", question: "Qui a écrit 'Les Misérables' ?", answer: "Victor Hugo" },
    { type: "cultureG", question: "En quelle année a eu lieu la chute du mur de Berlin ?", answer: "1989" },
    { type: "cultureG", question: "Quelle est la langue la plus parlée dans le monde ?", answer: "Le mandarin" },
    { type: "cultureG", question: "Quel est le pays le plus récent à avoir été reconnu par l'ONU ?", answer: "Le Sud-Soudan" },
    { type: "cultureG", question: "Quel est le plus grand mammifère terrestre ?", answer: "L'éléphant d'Afrique" },
  
    { type: "cultureGHard", question: "Quel est le seul pays au monde situé sur deux continents ?", answer: "La Turquie" },
    { type: "cultureGHard", question: "Quel est le nom de la montagne la plus haute située entièrement en Europe ?", answer: "Le Mont Elbrouz" },
    { type: "cultureGHard", question: "Quel est le plus grand désert froid du monde ?", answer: "L'Antarctique" },
    { type: "cultureGHard", question: "Quel est le nom du plus long tunnel ferroviaire du monde ?", answer: "Le tunnel de base du Gothard" },
    { type: "cultureGHard", question: "Quelle est la mer qui a la plus haute salinité naturelle ?", answer: "La mer Morte" },
    { type: "cultureGHard", question: "Quel est le plus haut sommet d’Amérique du Sud ?", answer: "L'Aconcagua" },
    { type: "cultureGHard", question: "Quel est le nom de la plus grande barrière de corail au monde ?", answer: "La Grande Barrière de corail" },
    { type: "cultureGHard", question: "Quelle est la capitale du Kazakhstan ?", answer: "Astana" },
    { type: "cultureGHard", question: "Quel pays est entouré entièrement par l’Afrique du Sud ?", answer: "Le Lesotho" },
    { type: "cultureGHard", question: "Quel est le nom du canal qui relie la mer Méditerranée à la mer Rouge ?", answer: "Le canal de Suez" },
    { type: "cultureGHard", question: "Quelle est la langue officielle de l’Iran ?", answer: "Le persan" },
    { type: "cultureGHard", question: "Quel pays possède le plus grand nombre d’îles au monde ?", answer: "La Suède" },
    { type: "cultureGHard", question: "Quel est le nom du volcan le plus actif d’Italie ?", answer: "L’Etna" },
    { type: "cultureGHard", question: "Quel est le nom du courant océanique chaud qui influence le climat européen ?", answer: "Le Gulf Stream" },
    { type: "cultureGHard", question: "Quel est le nom du détroit entre l’Afrique et l’Europe ?", answer: "Le détroit de Gibraltar" },
    { type: "cultureGHard", question: "Quelle est la deuxième langue la plus parlée au monde ?", answer: "L'espagnol" },
    { type: "cultureGHard", question: "Quel pays a été le premier à accorder le droit de vote aux femmes ?", answer: "La Nouvelle-Zélande" },
    { type: "cultureGHard", question: "Quel est le nom de l’auteur de 'Guerre et Paix' ?", answer: "Léon Tolstoï" },
    { type: "cultureGHard", question: "Quelle ville est surnommée la 'Venise du Nord' ?", answer: "Bruges" },
    { type: "cultureGHard", question: "Quel est le nom de l’ancien empire ayant pour capitale Tenochtitlan ?", answer: "L’Empire aztèque" },  { type: "cultureGHard", question: "Quelle est la capitale de la Mongolie ?", answer: "Oulan-Bator" },
    { type: "cultureGHard", question: "Quel est le plus long fleuve d'Asie ?", answer: "Le Yangtsé" },
    { type: "cultureGHard", question: "Qui a composé la Symphonie No. 9 en ré mineur ?", answer: "Ludwig van Beethoven" },
    { type: "cultureGHard", question: "Quel est le point culminant de l'Amérique du Nord ?", answer: "Le Denali (Mont McKinley)" },
    { type: "cultureGHard", question: "Quel physicien a proposé la théorie de la relativité ?", answer: "Albert Einstein" },
    { type: "cultureGHard", question: "Quel est le nom de l'opéra célèbre composé par Georges Bizet ?", answer: "Carmen" },
    { type: "cultureGHard", question: "Quel pays a les codes téléphoniques internationaux '0041' ?", answer: "La Suisse" },
    { type: "cultureGHard", question: "Quelle est la langue officielle du Suriname ?", answer: "Le néerlandais" },
    { type: "cultureGHard", question: "Quel est le nom latin de l'étoile du Berger ?", answer: "Vénus" },
    { type: "cultureGHard", question: "Quelle est la capitale de l'Éthiopie ?", answer: "Addis-Abeba" },
  
    { type: "culturePop", question: "Quel film a popularisé la réplique 'Je suis ton père' ?", answer: "Star Wars" },
    { type: "culturePop", question: "Quel chanteur est surnommé 'The Boss' ?", answer: "Bruce Springsteen" },
    { type: "culturePop", question: "Quel film a révélé Leonardo DiCaprio au grand public ?", answer: "Titanic" },
    { type: "culturePop", question: "Dans quelle série trouve-t-on le personnage de Sheldon Cooper ?", answer: "The Big Bang Theory" },
    { type: "culturePop", question: "Quel chanteur est l'auteur de la chanson 'Shape of You' ?", answer: "Ed Sheeran" },
    { type: "culturePop", question: "Dans quel film apparaît le personnage Jack Sparrow ?", answer: "Pirates des Caraïbes" },
    { type: "culturePop", question: "Quel est le nom complet de Lady Gaga ?", answer: "Stefani Joanne Angelina Germanotta" },
    { type: "culturePop", question: "Quel groupe est connu pour l’album 'Dark Side of the Moon' ?", answer: "Pink Floyd" },
    { type: "culturePop", question: "Quelle série met en scène un trône de fer ?", answer: "Game of Thrones" },
    { type: "culturePop", question: "Qui chante 'Like a Prayer' ?", answer: "Madonna" },
    { type: "culturePop", question: "Quel film d’animation met en scène un poisson clown nommé Nemo ?", answer: "Le Monde de Nemo" },
    { type: "culturePop", question: "Dans quel film trouve-t-on le personnage du Joker incarné par Heath Ledger ?", answer: "The Dark Knight" },
    { type: "culturePop", question: "Quel est le vrai nom de Snoop Dogg ?", answer: "Calvin Cordozar Broadus Jr." },
    { type: "culturePop", question: "Quelle série Netflix met en scène des jeunes avec des super-pouvoirs dans une école ?", answer: "Umbrella Academy" },
    { type: "culturePop", question: "Qui a popularisé la danse du 'moonwalk' ?", answer: "Michael Jackson" },
    { type: "culturePop", question: "Dans quel pays est né le chanteur Stromae ?", answer: "Belgique" },
    { type: "culturePop", question: "Quel est le prénom du sorcier joué par Daniel Radcliffe ?", answer: "Harry" },
    { type: "culturePop", question: "Quelle actrice joue Black Widow dans les films Marvel ?", answer: "Scarlett Johansson" },
    { type: "culturePop", question: "Quel groupe a sorti la chanson 'Yellow' ?", answer: "Coldplay" },
    { type: "culturePop", question: "Quel personnage de dessin animé est un chat bleu venant du futur ?", answer: "Doraemon" },
    { type: "culturePop", question: "Dans quelle série apparaît Eleven ?", answer: "Stranger Things" },
    { type: "culturePop", question: "Quel est le nom du chanteur principal de U2 ?", answer: "Bono" },
    { type: "culturePop", question: "Quelle émission télévisée a révélé Jenifer en France ?", answer: "Star Academy" },
    { type: "culturePop", question: "Quel film musical raconte l’histoire de P.T. Barnum ?", answer: "The Greatest Showman" },
    { type: "culturePop", question: "Dans quel jeu vidéo trouve-t-on la princesse Zelda ?", answer: "The Legend of Zelda" },
    { type: "culturePop", question: "Quel rappeur français est connu pour 'Bande organisée' ?", answer: "Jul" },
    { type: "culturePop", question: "Qui joue le rôle de Deadpool ?", answer: "Ryan Reynolds" },
    { type: "culturePop", question: "Quel est le vrai nom de l’artiste The Weeknd ?", answer: "Abel Tesfaye" },
    { type: "culturePop", question: "Dans quelle saga retrouve-t-on Katniss Everdeen ?", answer: "Hunger Games" },
    { type: "culturePop", question: "Quelle est la ville d’origine des Beatles ?", answer: "Liverpool" },
    { type: "culturePop", question: "Quel film Pixar met en scène des émotions personnifiées ?", answer: "Vice-Versa (Inside Out)" },
    { type: "culturePop", question: "Quel duo comique français est composé d'Omar et Fred ?", answer: "Omar et Fred" },
    { type: "culturePop", question: "Quel chanteur canadien est célèbre pour la chanson 'Baby' ?", answer: "Justin Bieber" },
    { type: "culturePop", question: "Qui est le réalisateur du film 'Pulp Fiction' ?", answer: "Quentin Tarantino" },
    { type: "culturePop", question: "Quelle émission télé française met en scène des agriculteurs célibataires ?", answer: "L'amour est dans le pré" },
    { type: "culturePop", question: "Quel groupe de K-pop a conquis le monde avec 'Dynamite' ?", answer: "BTS" },
    { type: "culturePop", question: "Quel personnage Marvel est aussi appelé 'Tony Stark' ?", answer: "Iron Man" },
    { type: "culturePop", question: "Quelle chanteuse a joué dans 'A Star is Born' ?", answer: "Lady Gaga" },
    { type: "culturePop", question: "Quel acteur a incarné James Bond dans 'Skyfall' ?", answer: "Daniel Craig" },
    { type: "culturePop", question: "Dans quel dessin animé trouve-t-on le personnage de Rick Sanchez ?", answer: "Rick et Morty" },
    { type: "culturePop", question: "Quel film Disney met en scène une reine des glaces ?", answer: "La Reine des Neiges" },
    { type: "culturePop", question: "Quelle chanteuse a sorti l’album 'Lemonade' ?", answer: "Beyoncé" },
    { type: "culturePop", question: "Quel film met en scène un panda expert en kung-fu ?", answer: "Kung Fu Panda" },
    { type: "culturePop", question: "Quel acteur joue Wolverine ?", answer: "Hugh Jackman" },
    { type: "culturePop", question: "Quelle série raconte les aventures d’une famille royale britannique ?", answer: "The Crown" },
    { type: "culturePop", question: "Quel film a rendu célèbre la chanson 'My Heart Will Go On' ?", answer: "Titanic" },
    { type: "culturePop", question: "Quel personnage de Pixar est un cow-boy ?", answer: "Woody" },
    { type: "culturePop", question: "Quel est le nom de l’univers partagé des films Marvel ?", answer: "MCU (Marvel Cinematic Universe)" },
    { type: "culturePop", question: "Quel acteur a joué Forrest Gump ?", answer: "Tom Hanks" },
    { type: "culturePop", question: "Quel chanteur a popularisé 'Blinding Lights' ?", answer: "The Weeknd" },
    { type: "culturePop", question: "Dans quelle série peut-on voir des dragons et des Marcheurs Blancs ?", answer: "Game of Thrones" },
    { type: "culturePop", question: "Quelle série met en scène un bar nommé 'MacLaren’s Pub' ?", answer: "How I Met Your Mother" },
    { type: "culturePop", question: "Quel est le nom de la poupée star des années 2000 aux grands yeux ?", answer: "Bratz" },
    { type: "culturePop", question: "Quel groupe a chanté 'Bohemian Rhapsody' ?", answer: "Queen" },
    { type: "culturePop", question: "Quel film a remporté l'Oscar du meilleur film en 2020 ?", answer: "Parasite" },
    { type: "culturePop", question: "Qui est connu comme le Roi de la Pop ?", answer: "Michael Jackson" },
    { type: "culturePop", question: "Dans quelle série télévisée trouve-t-on le personnage de Walter White ?", answer: "Breaking Bad" },
    { type: "culturePop", question: "Quel artiste a sorti l'album 'Thriller' ?", answer: "Michael Jackson" },
    { type: "culturePop", question: "Quel film d'animation met en scène Woody et Buzz l'Éclair ?", answer: "Toy Story" },
    { type: "culturePop", question: "Qui a réalisé le film 'Inception' ?", answer: "Christopher Nolan" },
    { type: "culturePop", question: "Quel personnage de film dit souvent 'Hasta la vista, baby' ?", answer: "Terminator" },
    { type: "culturePop", question: "Quelle chanteuse est surnommée 'Queen B' ?", answer: "Beyoncé" },
    { type: "culturePop", question: "Quel film de 1994 met en vedette John Travolta et Samuel L. Jackson ?", answer: "Pulp Fiction" },
  
    { type: "cultureGeek", question: "Quel est le vrai nom de Iron Man ?", answer: "Tony Stark" },
    { type: "cultureGeek", question: "Quel est le nom du marteau de Thor ?", answer: "Mjölnir" },
    { type: "cultureGeek", question: "Quel est le nom de la planète des Saiyans ?", answer: "Végéta" },
    { type: "cultureGeek", question: "Quel est le nom de la ville principale dans 'The Legend of Zelda: Breath of the Wild' ?", answer: "Hyrule" },
    { type: "cultureGeek", question: "Dans quel jeu vidéo retrouve-t-on les personnages de Mario, Luigi et Bowser ?", answer: "Super Mario Bros" },
    { type: "cultureGeek", question: "Quel est le nom du chasseur de primes dans 'The Mandalorian' ?", answer: "Din Djarin" },
    { type: "cultureGeek", question: "Quel est le nom de l'école des X-Men ?", answer: "Institut Xavier" },
    { type: "cultureGeek", question: "Dans quel manga trouve-t-on un Death Note ?", answer: "Death Note" },
    { type: "cultureGeek", question: "Quel super-héros porte un costume rouge et noir et casse souvent le 4e mur ?", answer: "Deadpool" },
    { type: "cultureGeek", question: "Dans quel jeu incarne-t-on Geralt de Riv ?", answer: "The Witcher" },
    { type: "cultureGeek", question: "Quel est le nom de l’entreprise responsable de l'épidémie zombie dans Resident Evil ?", answer: "Umbrella Corporation" },
    { type: "cultureGeek", question: "Quel est le nom du sorcier suprême dans l’univers Marvel ?", answer: "Doctor Strange" },
    { type: "cultureGeek", question: "Quel est le nom du vaisseau de Spock dans Star Trek ?", answer: "Enterprise" },
    { type: "cultureGeek", question: "Quel est le pouvoir principal de Magneto ?", answer: "Contrôler le métal" },
    { type: "cultureGeek", question: "Dans 'Naruto', quel est le nom du démon renard à neuf queues ?", answer: "Kurama" },
    { type: "cultureGeek", question: "Quel est le nom du détective dans la série 'Sherlock' jouée par Benedict Cumberbatch ?", answer: "Sherlock Holmes" },
    { type: "cultureGeek", question: "Quelle entreprise développe le jeu 'Fortnite' ?", answer: "Epic Games" },
    { type: "cultureGeek", question: "Quel est le nom du monde virtuel dans 'Ready Player One' ?", answer: "OASIS" },
    { type: "cultureGeek", question: "Quelle série animée met en scène des pierres magiques appelées 'Gemmes du Chaos' ?", answer: "Steven Universe" },
    { type: "cultureGeek", question: "Qui est l’ennemi juré de Sonic ?", answer: "Dr. Robotnik (Eggman)" },
    { type: "cultureGeek", question: "Dans quel univers évolue le personnage de Sephiroth ?", answer: "Final Fantasy VII" },
    { type: "cultureGeek", question: "Quel est le nom du jeu de rôle en ligne massivement multijoueur de Blizzard ?", answer: "World of Warcraft" },
    { type: "cultureGeek", question: "Quel est le vrai nom de Hulk ?", answer: "Bruce Banner" },
    { type: "cultureGeek", question: "Dans quel film les humains combattent des machines dirigées par une intelligence appelée Skynet ?", answer: "Terminator" },
    { type: "cultureGeek", question: "Dans 'Stranger Things', quel est le nom de la dimension parallèle ?", answer: "Upside Down" },
    { type: "cultureGeek", question: "Quel est le nom de la console portable de Nintendo sortie en 1989 ?", answer: "Game Boy" },
    { type: "cultureGeek", question: "Quel est le nom du héros principal de la série 'Attack on Titan' ?", answer: "Eren Jäger" },
    { type: "cultureGeek", question: "Quel est le nom du célèbre plombier de Nintendo ?", answer: "Mario" },
    { type: "cultureGeek", question: "Quel est le nom du sabre laser violet dans Star Wars ?", answer: "Celui de Mace Windu" },
    { type: "cultureGeek", question: "Quel est le nom du programme informatique maléfique dans 'Tron' ?", answer: "MCP (Master Control Program)" },
    { type: "cultureGeek", question: "Dans quelle saga trouve-t-on le One Ring ?", answer: "Le Seigneur des Anneaux" },
    { type: "cultureGeek", question: "Quel est le nom de l'ennemi principal de Batman ?", answer: "Le Joker" },
    { type: "cultureGeek", question: "Quel est le nom du virus informatique dans 'Resident Evil' ?", answer: "Virus-T" },
    { type: "cultureGeek", question: "Quel est le nom du frère adoptif de Thor ?", answer: "Loki" },
    { type: "cultureGeek", question: "Quel personnage a une armure faite de vibranium ?", answer: "Black Panther" },
    { type: "cultureGeek", question: "Quel jeu de société implique de conquérir des territoires avec des dés ?", answer: "Risk" },
    { type: "cultureGeek", question: "Quel est le nom du créateur de Facebook ?", answer: "Mark Zuckerberg" },
    { type: "cultureGeek", question: "Quelle série met en scène un chimiste devenu fabricant de drogue ?", answer: "Breaking Bad" },
    { type: "cultureGeek", question: "Dans 'One Piece', qui est le capitaine de l’équipage du chapeau de paille ?", answer: "Monkey D. Luffy" },
    { type: "cultureGeek", question: "Quel film met en scène un personnage appelé WALL-E ?", answer: "WALL-E" },
      
  
    { type: "cultureGeek", question: "Quel est le vrai nom de Spider-Man ?", answer: "Peter Parker" },
    { type: "cultureGeek", question: "Quelle série met en scène un docteur voyageant dans le temps dans une cabine téléphonique bleue ?", answer: "Doctor Who" },
    { type: "cultureGeek", question: "Quel est le nom du monde dans lequel se déroule 'World of Warcraft' ?", answer: "Azeroth" },
    { type: "cultureGeek", question: "Quel est le nom du jeu dans lequel des créatures appelées 'Creepers' explosent ?", answer: "Minecraft" },
    { type: "cultureGeek", question: "Quel est le surnom de Bruce Wayne ?", answer: "Batman" },
    { type: "cultureGeek", question: "Quel personnage est célèbre pour la phrase 'I am Groot' ?", answer: "Groot" },
    { type: "cultureGeek", question: "Dans 'Pokémon', quel est le Pokémon n°25 du Pokédex ?", answer: "Pikachu" },
    { type: "cultureGeek", question: "Quel est le nom du robot géant dans 'Evangelion' ?", answer: "Eva Unit-01" },
    { type: "cultureGeek", question: "Quelle est la couleur du sabre laser de Yoda ?", answer: "Vert" },
    { type: "cultureGeek", question: "Quel est le nom complet de Neo dans 'Matrix' ?", answer: "Thomas Anderson" },  { type: "cultureGeek", question: "Quel est le nom de la planète natale de Superman ?", answer: "Krypton" },
    { type: "cultureGeek", question: "Dans quel jeu vidéo incarne-t-on un personnage nommé Link ?", answer: "The Legend of Zelda" },
    { type: "cultureGeek", question: "Quel est le nom de l'école de magie dans 'Harry Potter' ?", answer: "Poudlard" },
    { type: "cultureGeek", question: "Qui est l'auteur de la série de romans 'Le Seigneur des Anneaux' ?", answer: "J.R.R. Tolkien" },
    { type: "cultureGeek", question: "Dans 'Star Wars', quel est le nom du vaisseau de Han Solo ?", answer: "Le Faucon Millenium" },
    { type: "cultureGeek", question: "Quel jeu vidéo met en scène des équipes de personnages se battant dans des arènes, souvent abrégé en 'LOL' ?", answer: "League of Legends" },
    { type: "cultureGeek", question: "Quel est le nom du super-héros aveugle de Marvel ?", answer: "Daredevil" },
    { type: "cultureGeek", question: "Dans quel univers de jeu vidéo trouve-t-on le personnage de Master Chief ?", answer: "Halo" },
    { type: "cultureGeek", question: "Quel est le nom de l'IA antagoniste dans le jeu 'Portal' ?", answer: "GLaDOS" },
    { type: "cultureGeek", question: "Quel super-héros est connu sous le nom de 'L'homme chauve-souris' ?", answer: "Batman" },
  
    { type: "cultureArt", question: "Quel est le prénom de Mozart ?", answer: "Wolfgang Amadeus" },
    { type: "cultureArt", question: "Quel mouvement artistique est Salvador Dalí associé ?", answer: "Surréalisme" },
    { type: "cultureArt", question: "Qui a peint 'Les Nymphéas' ?", answer: "Claude Monet" },
    { type: "cultureArt", question: "Quel est le nom du célèbre tableau représentant un repas biblique ?", answer: "La Cène" },
    { type: "cultureArt", question: "Quel écrivain a écrit 'Les Fleurs du Mal' ?", answer: "Charles Baudelaire" },
    { type: "cultureArt", question: "Quel compositeur est connu pour la 'Symphonie Pastorale' ?", answer: "Ludwig van Beethoven" },
    { type: "cultureArt", question: "Qui a sculpté 'La Pietà' ?", answer: "Michel-Ange" },
    { type: "cultureArt", question: "Quel peintre est célèbre pour ses autoportraits ?", answer: "Frida Kahlo" },
    { type: "cultureArt", question: "Quel écrivain russe a écrit 'Crime et Châtiment' ?", answer: "Fiodor Dostoïevski" },
    { type: "cultureArt", question: "Quel est le nom du célèbre théâtre de l'opéra de Paris ?", answer: "Palais Garnier" },
    { type: "cultureArt", question: "Quel auteur a écrit 'Notre-Dame de Paris' ?", answer: "Victor Hugo" },
    { type: "cultureArt", question: "Quel peintre hollandais est connu pour ses autoportraits et 'La Ronde de nuit' ?", answer: "Rembrandt" },
    { type: "cultureArt", question: "Quel instrument est au centre du concerto de Tchaïkovski le plus célèbre ?", answer: "Le violon" },
    { type: "cultureArt", question: "Quelle est la nationalité de l’artiste Egon Schiele ?", answer: "Autrichienne" },
    { type: "cultureArt", question: "Quel écrivain est l’auteur de 'Bel-Ami' ?", answer: "Guy de Maupassant" },
    { type: "cultureArt", question: "Qui a composé 'Les Quatre Saisons' ?", answer: "Antonio Vivaldi" },
    { type: "cultureArt", question: "Quel mouvement artistique est Andy Warhol associé ?", answer: "Pop Art" },
    { type: "cultureArt", question: "Quelle est la nationalité du peintre Gustav Klimt ?", answer: "Autrichienne" },
    { type: "cultureArt", question: "Quel poète a écrit 'Le Bateau Ivre' ?", answer: "Arthur Rimbaud" },
    { type: "cultureArt", question: "Quel ballet raconte l’histoire d’une poupée mécanique ?", answer: "Coppélia" },
    { type: "cultureArt", question: "Quel musée est situé dans une ancienne gare à Paris ?", answer: "Musée d'Orsay" },
    { type: "cultureArt", question: "Quel peintre espagnol a eu une période 'bleue' ?", answer: "Pablo Picasso" },
    { type: "cultureArt", question: "Quel dramaturge anglais est l’auteur de 'Macbeth' ?", answer: "William Shakespeare" },
    { type: "cultureArt", question: "Quelle artiste est connue pour ses performances avec des légumes ?", answer: "Marina Abramović" },
    { type: "cultureArt", question: "Quel est le nom du célèbre ballet avec la danse des petits cygnes ?", answer: "Le Lac des cygnes" },
    { type: "cultureArt", question: "Quel est le nom du sculpteur de 'La Liberté éclairant le monde' ?", answer: "Frédéric Auguste Bartholdi" },
    { type: "cultureArt", question: "Quelle pièce de théâtre française met en scène Harpagon ?", answer: "L'Avare" },
    { type: "cultureArt", question: "Quel architecte a conçu la Sagrada Familia ?", answer: "Antoni Gaudí" },
    { type: "cultureArt", question: "Qui a peint 'Le Déjeuner sur l’herbe' ?", answer: "Édouard Manet" },
    { type: "cultureArt", question: "Quel écrivain est l’auteur du 'Comte de Monte-Cristo' ?", answer: "Alexandre Dumas" },
    { type: "cultureArt", question: "Quel est le nom du peintre italien auteur de 'La Naissance de Vénus' ?", answer: "Botticelli" },
    { type: "cultureArt", question: "Quel opéra de Puccini met en scène une geisha ?", answer: "Madama Butterfly" },
    { type: "cultureArt", question: "Quel peintre est l’auteur de 'La Jeune Fille à la perle' ?", answer: "Johannes Vermeer" },
    { type: "cultureArt", question: "Quel écrivain allemand a écrit 'Faust' ?", answer: "Goethe" },
    { type: "cultureArt", question: "Quel artiste est célèbre pour son urinoir détourné en œuvre ?", answer: "Marcel Duchamp" },
    { type: "cultureArt", question: "Quel compositeur est connu pour la 'Marche nuptiale' ?", answer: "Mendelssohn" },
    { type: "cultureArt", question: "Quel est le nom du mouvement littéraire de Zola ?", answer: "Naturalisme" },
    { type: "cultureArt", question: "Quel musicien est célèbre pour la 'Symphonie inachevée' ?", answer: "Franz Schubert" },
    { type: "cultureArt", question: "Quel est le nom du musée où se trouve 'La Joconde' ?", answer: "Le Louvre" },
    { type: "cultureArt", question: "Quel est le nom du dramaturge de 'Cyrano de Bergerac' ?", answer: "Edmond Rostand" },
    { type: "cultureArt", question: "Quel est le nom du théâtre antique de la tragédie grecque ?", answer: "Théâtre d'Épidaure" },
    { type: "cultureArt", question: "Quel est le nom de l’auteur de 'Les Liaisons dangereuses' ?", answer: "Choderlos de Laclos" },
    { type: "cultureArt", question: "Quel artiste est célèbre pour ses silhouettes noires ?", answer: "Kara Walker" },
    { type: "cultureArt", question: "Quel est le nom de la salle de concert parisienne connue pour sa coupole ?", answer: "L’Olympia" },
    { type: "cultureArt", question: "Quel écrivain italien a écrit 'La Divine Comédie' ?", answer: "Dante Alighieri" },
    { type: "cultureArt", question: "Quel musicien est à l’origine de la 'Symphonie fantastique' ?", answer: "Hector Berlioz" },
    { type: "cultureArt", question: "Quel artiste est associé à l’œuvre 'Campbell's Soup Cans' ?", answer: "Andy Warhol" },
    { type: "cultureArt", question: "Quel écrivain français est connu pour 'Les Confessions' ?", answer: "Jean-Jacques Rousseau" },
    { type: "cultureArt", question: "Quel ballet met en scène des poupées mécaniques ?", answer: "Coppélia" },
    { type: "cultureArt", question: "Quel est le nom du célèbre théâtre londonien associé à Shakespeare ?", answer: "The Globe Theatre" },
    { type: "cultureArt", question: "Quel est le titre de la célèbre sculpture de Michel-Ange représentant Moïse ?", answer: "Moïse" },
    { type: "cultureArt", question: "Quel est le nom de l’œuvre musicale qui accompagne souvent les feux d’artifice ?", answer: "Musique pour les feux d’artifice royaux (Haendel)" },
    { type: "cultureArt", question: "Qui a peint 'Guernica' ?", answer: "Pablo Picasso" },
    { type: "cultureArt", question: "Quel est le nom du sculpteur du 'Penseur' ?", answer: "Auguste Rodin" },
    { type: "cultureArt", question: "Quel est le nom du compositeur de 'La Flûte enchantée' ?", answer: "Wolfgang Amadeus Mozart" },
    { type: "cultureArt", question: "Quel courant artistique est associé à Claude Monet ?", answer: "Impressionnisme" },
    { type: "cultureArt", question: "Quel peintre est célèbre pour ses tournesols ?", answer: "Vincent van Gogh" },
    { type: "cultureArt", question: "Qui a écrit 'Le Malade Imaginaire' ?", answer: "Molière" },
    { type: "cultureArt", question: "Quelle danse est originaire d'Argentine ?", answer: "Le tango" },
    { type: "cultureArt", question: "Quel artiste est connu pour ses œuvres de type 'dripping' ?", answer: "Jackson Pollock" },
    { type: "cultureArt", question: "Quel opéra met en scène Carmen ?", answer: "Carmen" },
    { type: "cultureArt", question: "Quel peintre est célèbre pour 'Le Cri' ?", answer: "Edvard Munch" },  { type: "cultureArt", question: "Qui a peint 'La Joconde' ?", answer: "Léonard de Vinci" },
    { type: "cultureArt", question: "Quel compositeur a écrit la 'Symphonie du Nouveau Monde' ?", answer: "Antonín Dvořák" },
    { type: "cultureArt", question: "Qui est l'auteur de la pièce de théâtre 'Hamlet' ?", answer: "William Shakespeare" },
    { type: "cultureArt", question: "Quel artiste est connu pour ses œuvres de pop art, notamment des boîtes de soupe Campbell ?", answer: "Andy Warhol" },
    { type: "cultureArt", question: "Quel peintre espagnol est célèbre pour avoir cofondé le cubisme ?", answer: "Pablo Picasso" },
    { type: "cultureArt", question: "Quel ballet de Tchaïkovski raconte l'histoire de la princesse Odette ?", answer: "Le Lac des cygnes" },
    { type: "cultureArt", question: "Qui a sculpté 'Le David' ?", answer: "Michel-Ange" },
    { type: "cultureArt", question: "Quel écrivain français est connu pour 'À la recherche du temps perdu' ?", answer: "Marcel Proust" },
  
    { type: "hard", question: "Quel est le nombre exact de décimales de Pi connues à ce jour (approximatif) ?", answer: "Plus de 100 000 milliards" },
    { type: "hard", question: "Quel mathématicien grec est considéré comme le père de la géométrie ?", answer: "Euclide" },
    { type: "hard", question: "Quel est le nom du satellite naturel de Pluton ?", answer: "Charon" },
    { type: "hard", question: "Quel est le nom de la théorie unificatrice en physique ?", answer: "Théorie du tout" },
    { type: "hard", question: "Quel est le nom complet de l'équation d'Einstein ?", answer: "E = mc²" },
    { type: "hard", question: "Quelle est la température du zéro absolu en kelvin ?", answer: "0 K" },
    { type: "hard", question: "Quel est le nom de la plus ancienne université encore en activité ?", answer: "Université d'Al Quaraouiyine" },
    { type: "hard", question: "Quel mathématicien a résolu le dernier théorème de Fermat ?", answer: "Andrew Wiles" },
    { type: "hard", question: "Quel est le nom du paradoxe célèbre de la mécanique quantique impliquant un chat ?", answer: "Paradoxe du chat de Schrödinger" },
    { type: "hard", question: "Quel pays détient le plus grand nombre de prix Nobel ?", answer: "Les États-Unis" },
    { type: "hard", question: "Quel est le nom du premier ordinateur ?", answer: "ENIAC" },
    { type: "hard", question: "Quel est le nom du scientifique ayant découvert l’électromagnétisme ?", answer: "James Clerk Maxwell" },
    { type: "hard", question: "Quel est le nom de la particule associée à la masse ?", answer: "Boson de Higgs" },
    { type: "hard", question: "Quel philosophe grec a fondé l’Académie ?", answer: "Platon" },
    { type: "hard", question: "Quelle est la distance de la lumière parcourue en un an appelée ?", answer: "Année-lumière" },
    { type: "hard", question: "Quel est le nom du mathématicien célèbre pour son triangle ?", answer: "Pascal" },
    { type: "hard", question: "Quel physicien est célèbre pour ses lois du mouvement ?", answer: "Isaac Newton" },
    { type: "hard", question: "Quel est le nom du philosophe allemand auteur de 'La Critique de la raison pure' ?", answer: "Emmanuel Kant" },
    { type: "hard", question: "Quelle est la formule de l’énergie cinétique ?", answer: "Ec = 1/2 mv²" },
    { type: "hard", question: "Quel est le nom du processus qui transforme les neutrons en protons dans les étoiles ?", answer: "Fusion nucléaire" },
    { type: "hard", question: "Quel est le nom du plus grand télescope spatial lancé en 2021 ?", answer: "James Webb" },
    { type: "hard", question: "Quel est le nom du mathématicien ayant posé les bases de l’informatique ?", answer: "Alan Turing" },
    { type: "hard", question: "Quelle est l’unité de mesure de la fréquence ?", answer: "Hertz" },
    { type: "hard", question: "Quel est le nom du plus gros trou noir connu ?", answer: "TON 618" },
    { type: "hard", question: "Quel scientifique est connu pour ses travaux sur l’hérédité chez les pois ?", answer: "Gregor Mendel" },
    { type: "hard", question: "Quel est le PIB nominal du Luxembourg en 2020 ?", answer: "Environ 72 milliards de dollars" },
    { type: "hard", question: "Quelle est la valeur approximative de la constante de Planck ?", answer: "6,62607015 × 10⁻³⁴ J·s" },
    { type: "hard", question: "Qui a développé la théorie des invariants ?", answer: "David Hilbert" },
    { type: "hard", question: "Quel est le nom du plus ancien texte de mathématiques connu ?", answer: "Le Papyrus Rhind" },
    { type: "hard", question: "En quelle année a eu lieu la bataille de Pharsale ?", answer: "48 av. J.-C." },
    { type: "hard", question: "Distance Terre-Mars au plus proche ?", answer: "Environ 54,6 millions de kilomètres" },
  
    { type: "devinette", question: "Qu'est-ce qui est toujours devant vous mais que vous ne pouvez jamais atteindre ?", answer: "L'horizon" },
    { type: "devinette", question: "Je suis pris une fois par minute, deux fois par moment, mais jamais dans mille ans. Qui suis-je ?", answer: "La lettre 'm'" },
    { type: "devinette", question: "Plus je sèche, plus je grandis. Qui suis-je ?", answer: "Une serviette" },
    { type: "devinette", question: "Je suis léger comme une plume, mais même le plus fort ne peut me tenir longtemps. Qui suis-je ?", answer: "Le souffle" },
    { type: "devinette", question: "Je commence par un E, je finis par un E, mais je ne contiens qu'une lettre. Qui suis-je ?", answer: "Une enveloppe" },
    { type: "devinette", question: "Qu'est-ce qui a des clés mais ne peut pas ouvrir de portes ?", answer: "Un piano" },
    { type: "devinette", question: "Plus il y en a, moins vous en voyez. Qui suis-je ?", answer: "L'obscurité" },
    { type: "devinette", question: "Je peux être cassé sans être touché. Qui suis-je ?", answer: "Une promesse" },
    { type: "devinette", question: "Je suis en haut d'une montagne, j'ai une clé mais pas de porte. Qui suis-je ?", answer: "Un clavier" },
    { type: "devinette", question: "Qu'est-ce qui est noir quand c'est propre et blanc quand c'est sale ?", answer: "Un tableau noir" }
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