/* ============================================================
   Configuration du jeu — toutes les valeurs de réglage, aucune logique.
   ============================================================ */

/* ---------- plateau ---------- */
export const ROWS=12, COLS=10, DIRS=[[-1,0],[1,0],[0,-1],[0,1]];

/* carte de secours si la génération échoue */
export const FALLBACK=[
"#uu.O.uc.#",
".c.fr.f#..",
"u.#.r.#.f.",
".B.cr..cB.",
"f.f#rr.c.#",
".u#.rrB.u.",
".u.Brr.#u.",
"#.c.rr#f.f",
".Bc..rc.B.",
".f.#.r.#.u",
"..#f.rf.c.",
"#.cu.H.uu#"];

/* ---------- génération procédurale ---------- */
export const MAPGEN={
  MAX_ATTEMPTS:120,
  CLUSTERS:[
    {terrain:'u',count:3,min:2,max:4},   // ruines
    {terrain:'f',count:3,min:2,max:4},   // bois
    {terrain:'c',count:4,min:1,max:3},   // cratères
    {terrain:'#',count:5,min:1,max:3}    // rochers
  ],
  HQ_COL_MARGIN:2,        // la forteresse reste à 2 colonnes des bords
  ROAD_TURN_PROB:.35,     // probabilité d'écart latéral de la route
  BASTION_COUNT:3,        // bastions par demi-carte
  BASTION_SPACING:4,      // distance Manhattan minimale entre bastions
  BASTION_HQ_DIST:3,      // distance minimale bastion → forteresse
  FLANK_LEFT_COL:2,       // au moins un bastion en colonne <= 2
  FLANK_RIGHT_OFFSET:3,   // ... et un en colonne >= COLS-3
  REPAIR_ITERATIONS:40,   // passes maximales de réparation de connexité
  DENSITY_MIN:.42, DENSITY_MAX:.66,
  HQ_MIN_OPEN:2,          // cases praticables minimales autour de la forteresse
  DEPLOY_SLOTS:6          // cases de déploiement initial cherchées
};

/* armées initiales, dans l'ordre de pose sur les cases de déploiement */
export const INITIAL_FORCES={sm:['dev','tac','tac','pre','spe'], ork:['loo','boy','boy','nob','boy','bug']};

/* ---------- terrain ---------- */
export const TNAME={'.':'Plaine cendreuse','r':'Route impériale','f':'Bois calcinés','u':'Ruines','c':'Cratère','#':'Rocher','B':'Bastion','H':'Forteresse Astartes','O':'Forteresse Ork'};
export const TDEF ={'.':0,'r':0,'f':2,'u':3,'c':1,'#':0,'B':3,'H':4,'O':4};
export const COST={
  pied:     {'.':1,'r':1,'f':2,'u':2,'c':2,'B':1,'H':1,'O':1},
  marcheur: {'.':1,'r':1,'f':2,'u':1,'c':1,'B':1,'H':1,'O':1},
  vehicule: {'.':1,'r':1,'f':3,'u':3,'c':2,'B':1,'H':1,'O':1},
  antigrav: {'.':1,'r':1,'f':1,'u':1,'c':1,'B':1,'H':1,'O':1}
};

/* ---------- unités ---------- */
export const U={
 tac:{n:"Marine tactique",  s:'sm', mv:3, cls:'pied',     rng:[1,1], armor:'inf', df:0, cost:3, inf:1, dmg:{inf:55,veh:15}, note:"Polyvalent, capture les objectifs."},
 asl:{n:"Escouade d'assaut",s:'sm', mv:5, cls:'antigrav', rng:[1,1], armor:'inf', df:0, cost:5, inf:1, dmg:{inf:65,veh:25}, note:"Réacteurs dorsaux : ignore le terrain."},
 dev:{n:"Devastator",       s:'sm', mv:2, cls:'pied',     rng:[2,3], armor:'inf', df:0, cost:6, inf:1, dmg:{inf:70,veh:55}, note:"Tir indirect. Doit rester immobile."},
 dre:{n:"Dreadnought",      s:'sm', mv:3, cls:'marcheur', rng:[1,1], armor:'veh', df:2, cost:8,        dmg:{inf:75,veh:65}, note:"Marcheur blindé, franchit les ruines."},
 pre:{n:"Predator",         s:'sm', mv:5, cls:'vehicule', rng:[1,1], armor:'veh', df:1, cost:9,        dmg:{inf:80,veh:75}, note:"Char de bataille. Fuit les forêts."},
 spe:{n:"Land Speeder",     s:'sm', mv:7, cls:'antigrav', rng:[1,1], armor:'veh', df:0, cost:5,        dmg:{inf:50,veh:25}, note:"Antigrav. Rapide mais fragile."},
 boy:{n:"Ork Boyz",         s:'ork',mv:3, cls:'pied',     rng:[1,1], armor:'inf', df:0, cost:2, inf:1, dmg:{inf:50,veh:12}, note:"Chair à canon. Nombreux, donc forts."},
 nob:{n:"Nobz",             s:'ork',mv:3, cls:'pied',     rng:[1,1], armor:'inf', df:1, cost:5, inf:1, dmg:{inf:70,veh:30}, note:"Gros bras en armure de bric et de broc."},
 loo:{n:"Lootas",           s:'ork',mv:2, cls:'pied',     rng:[2,3], armor:'inf', df:0, cost:6, inf:1, dmg:{inf:65,veh:50}, note:"Tir indirect. Doit rester immobile."},
 ddr:{n:"Deff Dread",       s:'ork',mv:3, cls:'marcheur', rng:[1,1], armor:'veh', df:2, cost:8,        dmg:{inf:80,veh:60}, note:"Marcheur à scies. Brutal au contact."},
 bug:{n:"Warbuggy",         s:'ork',mv:7, cls:'vehicule', rng:[1,1], armor:'veh', df:0, cost:4,        dmg:{inf:45,veh:20}, note:"Roule vite, casse aussi vite."},
 bat:{n:"Battlewagon",      s:'ork',mv:5, cls:'vehicule', rng:[1,1], armor:'veh', df:1, cost:9,        dmg:{inf:75,veh:70}, note:"Forteresse roulante hérissée de pointes."}
};
export const ROSTER={sm:['tac','asl','dev','spe','dre','pre'], ork:['boy','bug','nob','loo','ddr','bat']};
export const FNAME={sm:"Adeptus Astartes", ork:"Waaagh! Grimskull"};

/* ---------- combat & économie ---------- */
export const UNIT_MAX_HP=100;
export const HP_PER_BAR=10;      // 1 barre de PV affichée = 10 points de dégâts
export const BARS_MAX=10;        // une unité à pleine santé affiche 10 barres
export const MIN_DAMAGE=5;       // plancher de dégâts par coup
export const CODEX_FLOOR=.6;     // Discipline du Codex : ratio minimal Astartes
export const WAAAGH_PCT=5;       // % de bonus de dégâts par ork adjacent
export const WAAAGH_MAX_ADJ=3;   // orks adjacents pris en compte au maximum
export const DEF_POINT_PCT=5;    // % de réduction par point de couvert ou de blindage
export const CAPTURE_GAUGE=20;   // jauge de capture d'un bâtiment
export const START_REQUISITION=5;
export const BUILDING_HEAL=20;   // PV récupérés par cycle sur un bâtiment allié

/* ---------- IA Ork ---------- */
export const AI={
  ATTACK_THRESHOLD:4,      // l'IA n'attaque que si le score dépasse ce seuil
  KILL_BONUS:70,           // bonus pour un kill confirmé
  COUNTER_WEIGHT:.9,       // pondération de la contre-attaque subie
  TERRAIN_WEIGHT:3,        // pondération du couvert de la case de tir
  COST_WEIGHT:2,           // pondération du coût de la cible
  INDIRECT_BONUS:12,       // bonus pour cibler une unité à tir indirect
  ADVANCE_COVER_WEIGHT:.3, // pondération du couvert dans le choix du point d'avance
  OBJ_WEIGHT_INF:-3,       // attrait des objectifs pour l'infanterie (négatif = plus attirant)
  OBJ_WEIGHT_NONINF:6,
  BUY:[                    // premier profil éligible retenu (réquisition >= req, tirage < p)
    {t:'bat',req:9,p:.4},
    {t:'ddr',req:8,p:.5},
    {t:'loo',req:6,p:.4},
    {t:'nob',req:5,p:.5},
    {t:'bug',req:4,p:.35},
    {t:'boy',req:2,p:1}
  ]
};

/* ---------- délais d'animation (ms) ---------- */
export const T={
  PLAYER_STEP:85,        // entre deux pas d'animation du joueur
  AI_STEP:80,            // entre deux pas d'animation de l'IA
  STRIKE_PAUSE:300,      // entre le retrait des PV et la suite
  HIT_ANIM:260,          // durée de l'animation de touche
  FX_LIFETIME:960,       // durée de vie de l'effet flottant de dégâts
  COUNTER_DELAY:180,     // avant la riposte (tour joueur)
  AI_COUNTER_DELAY:150,  // avant la riposte (tour IA)
  AI_TURN_START:700,     // entre la fin du cycle joueur et le tour IA
  AI_OPENING:350,        // pause initiale du tour IA
  AI_UNIT_PAUSE:200,     // entre deux unités IA
  AI_CLOSING:250         // pause finale avant retour au joueur
};

/* ---------- mise en page ---------- */
export const MIN_TILE=26;     // taille minimale d'une tuile (px)
export const BOARD_MARGIN=14; // marge de la zone de jeu (px)

/* ---------- son / vibration ---------- */
export const AUDIO={
  SELECT:{f:520,d:.05},
  STEP:{f:320,d:.02,type:'sine',vol:.02},
  HIT_SM:{f:180,d:.12,type:'square',vol:.06},
  HIT_ORK:{f:120,d:.12,type:'square',vol:.06},
  DESTROY:{f:70,d:.3,type:'sawtooth',vol:.05},
  CAPTURE:{f:440,d:.12,type:'triangle',vol:.05},
  DEPLOY:{f:660,d:.1,type:'triangle',vol:.05},
  BUTTON:{f:700,d:.04,type:'square',vol:.03},
  SHOP:{f:700,d:.04},
  VICTORY:{f:520,d:.5,type:'triangle',vol:.06},
  DEFEAT:{f:160,d:.5,type:'triangle',vol:.06}
};
export const VIB={HIT:25,BUTTON:10};
