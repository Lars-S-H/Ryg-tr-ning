// Øvelsesbibliotek. Valgt til en ryg, der gør ondt ved fremadbøjning:
// neutral ryg, ingen sit-ups/krumning, og fokus på at bøje i hofterne i stedet for i lænden.

const Y = 161; // højde for en figur, der ligger på gulvet

// Hjælpere til stillinger
const supine = (o = {}) => ({
  hip: [150, Y], torso: 180, head: 180,
  nArm: [0, 0], fArm: [2, 2],
  nLeg: [50, -70], fLeg: [53, -67],
  ...o,
});
const standing = (o = {}) => ({
  hip: [120, 110], torso: 90, head: 90,
  nArm: [-95, -90], fArm: [-85, -90],
  nLeg: [-90, -90], fLeg: [-88, -92],
  ...o,
});
const quad = (o = {}) => ({
  hip: [100, 140], torso: 18, head: 10,
  nArm: [-90, -90], fArm: [-88, -92],
  nLeg: [-90, 180], fLeg: [-92, 182],
  ...o,
});
const sideLying = (o = {}) => ({
  hip: [140, 150], torso: 180, head: 175,
  nArm: [-80, -90], fArm: [-100, -95],
  nLeg: [-45, 200], fLeg: [-48, 197],
  ...o,
});

export const CATEGORIES = {
  start: 'Opvarmning',
  mobilitet: 'Bevægelighed',
  core: 'Mave & ryg',
  baller: 'Baller & ben',
};

export const EXERCISES = [
  {
    id: 'vejrtraekning',
    name: 'Mavevejrtrækning med spænd',
    cat: 'start',
    unit: 'reps', unitLabel: 'vejrtrækninger',
    purpose: 'Lærer dig at spænde op om ryggen uden at krumme den. Det "spænd" bruger du i alle de andre øvelser.',
    steps: [
      'Lig på ryggen med bøjede knæ og fødderne i gulvet. Læg en hånd på maven.',
      'Træk vejret roligt ind gennem næsen, så maven løfter sig under hånden.',
      'Pust langsomt ud og spænd let i maven – cirka 30 %, som hvis nogen skulle prikke dig i maven.',
      'Lænden ligger neutralt. Du skal ikke presse den ned i gulvet.',
    ],
    mistakes: ['Skuldrene løfter sig, når du trækker vejret', 'Du spænder 100 % i stedet for et let spænd'],
    anim: { move: 1800, hold: 700, frames: [
      supine({ belly: 3, nArm: [22, -8] }),
      supine({ belly: 9, nArm: [26, -4] }),
    ] },
  },
  {
    id: 'hoftebojer',
    name: 'Hoftebøjerstræk på knæ',
    cat: 'mobilitet', unit: 'sek', perSide: true,
    purpose: 'Gymnaster har ofte stramme hoftebøjere. De trækker i lænden og giver ekstra svaj.',
    steps: [
      'Stå på ét knæ med en pude under. Det andet ben står foran med foden i gulvet.',
      'Spænd let i maven og "vip halebenet ind under dig", så du ikke svajer i lænden.',
      'Skub hoften langsomt fremad, til du mærker et stræk foran på hoften af det bageste ben.',
      'Hold overkroppen rank. Ræk gerne armen i samme side som knæet op mod loftet.',
    ],
    mistakes: ['Svaj i lænden i stedet for stræk i hoften', 'Overkroppen læner sig frem'],
    anim: { frames: [
      { hip: [110, 140], torso: 90, head: 90, nArm: [-95, -90], fArm: [-85, -88], nLeg: [-90, 180], fLeg: [0, -90] },
      { hip: [120, 142], torso: 92, head: 90, nArm: [100, 95], fArm: [-85, -88], nLeg: [-112, 180], fLeg: [-4, -96] },
    ] },
  },
  {
    id: 'baglaar',
    name: 'Baglårsstræk med rem',
    cat: 'mobilitet', unit: 'sek', perSide: true, equipment: 'Rem, elastik eller håndklæde',
    purpose: 'Strækker baglåret UDEN at bøje ryggen forover. Det er netop fremadbøjningen, der gør ondt nu.',
    steps: [
      'Lig på ryggen og læg en rem, en elastik eller et håndklæde om den ene fod.',
      'Løft det strakte ben op, til du mærker et stræk bag på låret.',
      'Det andet ben ligger strakt i gulvet. Bøj det, hvis det trækker i ryggen.',
      'Lænden og hovedet bliver liggende på gulvet. Træk vejret roligt.',
    ],
    mistakes: ['Hoften løfter sig fra gulvet', 'Du trækker så hårdt, at det gør ondt'],
    avoid: 'Lav IKKE stående "rør tæerne"-stræk lige nu. De bøjer lænden.',
    anim: { frames: [
      supine({ nLeg: [42, 42], fLeg: [0, 0], nArm: [48, 38], fArm: [52, 40] }),
      supine({ nLeg: [72, 72], fLeg: [0, 0], nArm: [62, 58], fArm: [66, 60] }),
    ], props: [{ type: 'strap' }] },
  },
  {
    id: 'aabenbog',
    name: 'Åben bog',
    cat: 'mobilitet', unit: 'reps', perSide: true,
    purpose: 'Gør brystryggen mere bevægelig, så lænden ikke skal klare al bevægelsen i spring og rotationer.',
    steps: [
      'Lig på siden med hofter og knæ bøjet i 90 grader og en pude under hovedet.',
      'Stræk armene frem foran dig med håndfladerne mod hinanden.',
      'Løft den øverste arm op og over til den anden side, ligesom en bog der åbner sig. Følg hånden med blikket.',
      'Knæene bliver sammen i gulvet. Gå kun så langt, det føles godt, og før armen roligt tilbage.',
    ],
    mistakes: ['Knæene glider fra hinanden', 'Du tvinger bevægelsen'],
    note: 'Animationen ses oppefra: armen løftes op mod loftet og ned på den anden side.',
    anim: { move: 900, hold: 700, frames: [
      sideLying({ nArm: [-90, -90], nArmK: 1, head: 180 }),
      sideLying({ nArm: [-90, -90], nArmK: 0.15, head: 175, snap: true }),
      sideLying({ nArm: [90, 90], nArmK: 0.15, head: 172, snap: true }),
      sideLying({ nArm: [90, 92], nArmK: 1, head: 165 }),
    ] },
  },
  {
    id: 'ballestraek',
    name: 'Liggende ballestræk (figur 4)',
    cat: 'mobilitet', unit: 'sek', perSide: true,
    purpose: 'Løsner ballemusklerne og hoften, som tit er spændte, når lænden driller.',
    steps: [
      'Lig på ryggen med bøjede knæ. Læg den ene ankel over det andet knæ, så benene danner et 4-tal.',
      'Tag fat bag det nederste lår og træk det roligt ind mod dig.',
      'Hovedet og lænden bliver liggende i gulvet. Du skal mærke strækket i ballen.',
    ],
    mistakes: ['Hovedet og skuldrene løfter sig', 'Halebenet ruller op fra gulvet'],
    anim: { frames: [
      supine({ fLeg: [50, -70], nLeg: [35, -15], nArm: [10, 5], fArm: [8, 4] }),
      supine({ fLeg: [78, 5], nLeg: [58, -8], nArm: [40, 15], fArm: [42, 18] }),
    ] },
  },
  {
    id: 'deadbug',
    name: 'Dead bug',
    cat: 'core', unit: 'reps', perSide: true,
    purpose: 'Træner de dybe mavemuskler i at holde ryggen stabil, mens arme og ben bevæger sig. Det samme sker i spring.',
    steps: [
      'Lig på ryggen med armene lige op mod loftet og hofter og knæ i 90 grader ("bordplade").',
      'Spænd let i maven, så lænden holder sig rolig og neutral.',
      'Pust ud og stræk langsomt den ene arm bagud og det modsatte ben frem, uden at lænden svajer.',
      'Kom tilbage til bordpladen og skift side.',
    ],
    mistakes: ['Lænden løfter sig eller svajer', 'Det går for hurtigt'],
    easier: 'Bevæg kun benene og hold armene stille.',
    harder: 'Hold en lille bold eller vandflaske i hænderne.',
    anim: { frames: [
      supine({ nArm: [90, 90], fArm: [88, 88], nLeg: [90, 0], fLeg: [88, -2] }),
      supine({ nArm: [90, 90], fArm: [160, 170], nLeg: [18, 15], fLeg: [88, -2] }),
    ] },
  },
  {
    id: 'birddog',
    name: 'Bird dog',
    cat: 'core', unit: 'reps', perSide: true,
    purpose: 'Træner ryg, baller og skuldre i at arbejde sammen og holder lænden neutral og stabil.',
    steps: [
      'Stå på alle fire med hænderne under skuldrene og knæene under hofterne.',
      'Ryggen er lige. Forestil dig, at der står et glas vand på lænden.',
      'Stræk den ene arm frem og det modsatte ben bagud, til de er vandrette.',
      'Hold 3 sekunder, før dem roligt tilbage og skift side.',
    ],
    mistakes: ['Hoften drejer eller vipper', 'Du svajer i lænden, når benet løftes', 'Benet løftes højere end vandret'],
    anim: { frames: [
      quad(),
      quad({ nArm: [12, 12], fLeg: [182, 180], head: 14 }),
    ] },
  },
  {
    id: 'curlup',
    name: 'McGill curl-up',
    cat: 'core', unit: 'reps', unitLabel: 'gange (hold 8 sek)',
    purpose: 'Træner mavemusklerne UDEN at bøje lænden, i modsætning til sit-ups, som du skal undgå lige nu.',
    steps: [
      'Lig på ryggen med ét ben bøjet og ét strakt. Læg hænderne under lænden, så det naturlige svaj bevares.',
      'Spænd let i maven.',
      'Løft hoved og skuldre KUN få centimeter. Hoved og nakke er én blok, så du ikke trækker hagen ind.',
      'Hold i 8 sekunder med rolig vejrtrækning, og sænk så.',
    ],
    mistakes: ['Du løfter for højt og krummer ryggen', 'Du trækker i nakken'],
    avoid: 'Sit-ups og crunches med hele overkroppen skal du undgå lige nu.',
    anim: { move: 1000, hold: 900, frames: [
      supine({ nArm: [-4, 0], fArm: [-2, 0], nLeg: [50, -70], fLeg: [0, 0] }),
      supine({ torso: 174, head: 172, nArm: [-6, 2], fArm: [-4, 2], nLeg: [50, -70], fLeg: [0, 0] }),
    ] },
  },
  {
    id: 'sideplanke',
    name: 'Sideplanke',
    cat: 'core', unit: 'sek', perSide: true,
    purpose: 'Styrker musklerne på siden af kroppen, som holder lænden stabil, når du lander.',
    steps: [
      'Lig på siden med albuen lige under skulderen.',
      'Spænd i maven og ballerne, og løft hoften, så kroppen danner en lige linje.',
      'Hold positionen og træk vejret roligt.',
      'Fase 1: lav den med bøjede knæ. Senere: med strakte ben.',
    ],
    mistakes: ['Hoften hænger', 'Skulderen kryber op mod øret'],
    easier: 'Støt på knæene i stedet for fødderne.',
    harder: 'Løft det øverste ben lidt.',
    anim: { frames: [
      { hip: [111, 164], torso: 21, head: 15, nArm: [-90, 0], fArm: [-60, -20], nLeg: [186, 186], fLeg: [187, 186] },
      { hip: [111, 157], torso: 13, head: 13, nArm: [-90, 0], fArm: [-60, -20], nLeg: [192.6, 192.6], fLeg: [193, 192.6] },
    ] },
  },
  {
    id: 'planke',
    name: 'Planke på underarme',
    cat: 'core', unit: 'sek',
    purpose: 'Træner hele kroppen i at holde ryggen neutral, som i håndstand og landinger.',
    steps: [
      'Læg dig på underarmene med albuerne under skuldrene og fødderne samlet.',
      'Spænd i maven og ballerne. Kroppen skal være lige fra hoved til hæl.',
      'Kig ned i gulvet og træk vejret roligt.',
    ],
    mistakes: ['Svaj i lænden (hoften hænger)', 'Numsen stikker i vejret'],
    easier: 'Støt på knæene.',
    anim: { move: 1600, hold: 400, frames: [
      { hip: [111, 157], torso: 12.6, head: 8, nArm: [-90, 0], fArm: [-90, 2], nLeg: [192.6, 192.6], fLeg: [193, 193] },
      { hip: [111, 156], torso: 13.2, head: 6, nArm: [-90, 0], fArm: [-90, 2], nLeg: [192, 192], fLeg: [192.4, 192.4] },
    ] },
  },
  {
    id: 'pallof',
    name: 'Pallof press',
    cat: 'core', unit: 'reps', perSide: true, equipment: 'Elastikbånd',
    purpose: 'Lærer kroppen at stå imod rotation. Det giver stabilitet i skruer og landinger.',
    steps: [
      'Fastgør et elastikbånd i brysthøjde, fx i et dørhåndtag, og stå med siden til.',
      'Hold elastikken med begge hænder ind mod brystet. Stå med let bøjede knæ.',
      'Spænd i maven og pres armene lige frem, uden at kroppen drejer med.',
      'Hold 2 sekunder, og før hænderne tilbage til brystet.',
    ],
    mistakes: ['Kroppen drejer mod elastikken', 'Du svajer i lænden'],
    anim: { frames: [
      standing({ hip: [118, 112], nArm: [-70, 20], fArm: [-72, 22], nLeg: [-80, -98], fLeg: [-82, -96] }),
      standing({ hip: [118, 112], nArm: [0, 0], fArm: [2, 2], nLeg: [-80, -98], fLeg: [-82, -96] }),
    ] },
  },
  {
    id: 'hollow',
    name: 'Hollow hold (rygvenlig)',
    cat: 'core', unit: 'sek',
    purpose: 'Den klassiske gymnastikposition, i en forsigtig udgave. Kun når de andre øvelser er smertefri.',
    steps: [
      'Lig på ryggen og spænd maven, så lænden ligger roligt mod gulvet.',
      'Løft benene og armene lidt fra gulvet. Hold hovedet let løftet.',
      'Start med bøjede knæ. Stræk først benene, når det føles helt let.',
      'Stop med det samme, hvis det gør ondt i lænden.',
    ],
    mistakes: ['Lænden slipper gulvet og svajer', 'Du holder vejret'],
    easier: 'Bøj knæene og hold armene langs siden.',
    anim: { frames: [
      supine({ nArm: [0, 0], fArm: [2, 2], nLeg: [0, 0], fLeg: [2, 2] }),
      supine({ torso: 176, head: 170, nArm: [165, 170], fArm: [167, 172], nLeg: [20, 18], fLeg: [21, 19] }),
    ] },
  },
  {
    id: 'bridge',
    name: 'Bækkenløft',
    cat: 'baller', unit: 'reps',
    purpose: 'Stærke baller aflaster lænden og giver kraft i afsæt.',
    steps: [
      'Lig på ryggen med bøjede knæ og fødderne i hoftebredde.',
      'Spænd let i maven og klem ballerne sammen.',
      'Løft bækkenet, til knæ, hofte og skuldre er på en lige linje. Ikke højere, for så svajer du.',
      'Hold 2 sekunder, og rul roligt ned igen.',
    ],
    mistakes: ['Du løfter for højt og svajer', 'Du mærker det mest i baglårene. Flyt fødderne tættere på numsen.'],
    harder: 'Lav den på ét ben.',
    anim: { frames: [
      supine({ nArm: [-2, 0], fArm: [0, 0] }),
      supine({ hip: [143, 137], torso: 210, head: 188, nArm: [-2, 0], fArm: [0, 0], nLeg: [10, -78], fLeg: [12, -76] }),
    ] },
  },
  {
    id: 'bridge1',
    name: 'Bækkenløft på ét ben',
    cat: 'baller', unit: 'reps', perSide: true,
    purpose: 'Stærkere version af bækkenløft, som også træner balancen i hoften.',
    steps: [
      'Lig som til et almindeligt bækkenløft og stræk det ene ben.',
      'Løft bækkenet med det bøjede ben. Hoften må ikke tippe til siden.',
      'Hold 2 sekunder, og sænk roligt.',
    ],
    mistakes: ['Hoften tipper til den ene side', 'Svaj i lænden'],
    anim: { frames: [
      supine({ nArm: [-2, 0], fArm: [0, 0], nLeg: [25, 25] }),
      supine({ hip: [143, 137], torso: 210, head: 188, nArm: [-2, 0], fArm: [0, 0], fLeg: [12, -76], nLeg: [30, 30] }),
    ] },
  },
  {
    id: 'clamshell',
    name: 'Muslingen (clamshells)',
    cat: 'baller', unit: 'reps', perSide: true, equipment: 'Elastik om knæene (valgfrit)',
    purpose: 'Styrker den lille ballemuskel på siden af hoften, som styrer knæ og bækken ved landinger.',
    steps: [
      'Lig på siden med bøjede hofter og knæ. Støt hovedet på armen.',
      'Hold fødderne samlet og åbn det øverste knæ som en musling.',
      'Bækkenet må ikke rulle bagud. Det skal være en lille, kontrolleret bevægelse.',
      'Sænk knæet roligt igen.',
    ],
    mistakes: ['Bækkenet ruller med bagud', 'Du åbner for højt'],
    note: 'Animationen ses oppefra.',
    anim: { frames: [
      sideLying({ nArm: [-60, -100] }),
      sideLying({ nArm: [-60, -100], nLeg: [-5, 236] }),
    ] },
  },
  {
    id: 'hinge',
    name: 'Hoftehængsel med kost',
    cat: 'baller', unit: 'reps',
    purpose: 'DEN vigtigste øvelse lige nu: Du lærer at bøje forover med hofterne i stedet for med lænden.',
    steps: [
      'Stå med en kost langs ryggen. Den skal røre baghovedet, området mellem skulderbladene og halebenet.',
      'Bøj lidt i knæene og skub hofterne bagud, mens overkroppen læner sig frem.',
      'Kosten skal hele tiden røre de tre punkter. Så er ryggen lige.',
      'Stop, når du mærker stræk bag lårene. Skub hofterne frem og rejs dig op.',
      'Brug bevægelsen i hverdagen, fx når du samler noget op eller tager skoene på.',
    ],
    mistakes: ['Kosten slipper halebenet eller baghovedet = du krummer ryggen', 'Du bøjer for meget i knæene (så bliver det en squat)'],
    anim: { frames: [
      standing({ nArm: [150, 60], fArm: [-110, -45] }),
      standing({ hip: [112, 113], torso: 42, head: 38, nArm: [102, 12], fArm: [-160, -100], nLeg: [-70, -100], fLeg: [-68, -102] }),
    ], props: [{ type: 'stick' }] },
  },
  {
    id: 'squat',
    name: 'Squat til stol',
    cat: 'baller', unit: 'reps',
    purpose: 'Styrker ben og baller med neutral ryg. Det overføres direkte til afsæt og landinger.',
    steps: [
      'Stå foran en stol med fødderne i hoftebredde og armene strakt frem.',
      'Skub hofterne bagud og sæt dig langsomt ned, til numsen lige rører stolen.',
      'Brystet er oppe og ryggen lige. Knæene peger samme vej som tæerne.',
      'Pres op gennem hælene til stående.',
    ],
    mistakes: ['Ryggen krummer i bunden', 'Knæene falder indad'],
    anim: { frames: [
      standing({ nArm: [0, 0], fArm: [2, 2] }),
      standing({ hip: [95, 140], torso: 62, head: 55, nArm: [5, 5], fArm: [7, 7], nLeg: [0, -100], fLeg: [2, -98] }),
    ], props: [{ type: 'box', x: 58, y: 146, w: 40, h: 24 }] },
  },
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
