/* SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit — voir LICENSE */
(()=>{
'use strict';
/* ================= Langues ================= */
// trad(), LANG et LOCALE viennent de langue.js. Les messages partagés en ligne (journal, bannières, fin de partie)
// voyagent en français sous forme de modèle {k, v} : chaque joueur les lit dans sa propre langue grâce à tx().
const MSG=(k,v)=>({k,v});
function tx(m,d){d=d|0;if(m==null)return'';if(typeof m!=='object')return trad(String(m));if(d>3||typeof m.k!=='string')return'';
  const v={};if(m.v&&typeof m.v==='object')for(const k of Object.keys(m.v).slice(0,12))v[k]=tx(m.v[k],d+1);return trad(m.k,v);}
// Message reçu d'un autre joueur : texte ou modèle, taille bornée
function okMsg(m,d){d=d|0;if(m==null)return'';if(typeof m!=='object')return String(m).slice(0,400);if(d>3||typeof m.k!=='string')return'';
  const v={};if(m.v&&typeof m.v==='object')for(const k of Object.keys(m.v).slice(0,12))v[String(k).slice(0,20)]=okMsg(m.v[k],d+1);return{k:m.k.slice(0,400),v};}
/* ================= Cartes (1 unité ≈ 4 m) ================= */
const W=1600,H=1100;
/*MAPS*/
const MAPS={
lyon:{id:'lyon',name:'Lyon',sub:"2 rives · 13 ponts · 1 Presqu'île",
  desc:"Deux camps se font face de part et d'autre de la ville. Au centre, entre la Saône et le Rhône, la Presqu'île et la Croix-Rousse sont tenues par des milices.",
  sides:{A:{t:"Rive est, à l'est du Rhône. QG à Villeurbanne, gare de la Part-Dieu. Jeu offensif."},B:{t:"Rive ouest, à l'ouest de la Saône. QG à Tassin, colline de Fourvière, gare de Vaise. Jeu de position."}},
  water:{rivers:[
    {n:'Saône',de:'de la Saône',hw:12,pts:[[560,-30],[548,80],[528,170],[540,250],[575,305],[610,360],[630,420],[645,480],[640,540],[648,600],[668,680],[700,760],[740,840],[790,905]]},
    {n:'Rhône',de:'du Rhône',hw:17,pts:[[1270,-30],[1120,60],[1000,160],[900,250],[850,330],[828,420],[815,500],[806,580],[800,660],[798,740],[795,820],[790,905],[798,1000],[812,1130]]}]},
  deco:{center:[760,520],hills:[[515,505,150,120],[690,250,120,85]],parks:[[1005,212,80,52,0],[870,950,40,26,0.3]],ponds:[[990,222,32,13,-0.3]],
    rails:[[[745,620],[742,720],[752,815],[765,880],[745,990],[705,1110]],[[1112,-10],[1106,300],[1100,470],[1094,700],[1080,1110]],[[1100,470],[1180,520],[1300,560],[1610,600]],[[440,300],[520,330],[570,360]]],
    labels:[['SAÔNE',538,240,1.47,'r'],['SAÔNE',690,735,1.12,'r'],['RHÔNE',955,200,-0.78,'r'],['RHÔNE',803,1060,1.47,'r'],['RIVE OUEST',240,110,0,'B'],['RIVE EST',1320,110,0,'A'],['CENTRE',735,60,0,'C']]},
  nodes:[
    ['villeurbanne','Villeurbanne',1320,480,'base',{side:'A'}],['tassin','Tassin',230,510,'base',{side:'B'}],
    ['croixrousse','Croix-Rousse',715,290,'obj',{def:1.35,hill:1}],['hdv','Hôtel de Ville',725,425,'obj'],['bellecour','Bellecour',728,580,'obj'],['perrache','Perrache',738,690,'obj',{gare:1}],
    ['caluire','Caluire',735,140,'dist'],['confluence','Confluence',758,795,'dist'],
    ['ecully','Écully',240,250,'dist',{side:'B'}],['vaise','Vaise',440,300,'gare',{side:'B'}],['pointdujour','Point du Jour',385,470,'dist',{side:'B'}],
    ['fourviere','Fourvière',540,500,'dist',{def:1.35,hill:1,side:'B'}],['vieuxlyon','Vieux Lyon',603,560,'dist',{side:'B'}],['stjust','Saint-Just',500,650,'dist',{side:'B'}],
    ['saintefoy','Sainte-Foy',330,700,'dist',{side:'B'}],['oullins','Oullins',520,960,'dist',{side:'B'}],['mulatiere','La Mulatière',690,950,'dist',{side:'B'}],
    ['charpennes','Charpennes',1140,330,'dist',{side:'A'}],['tetedor',"Tête d'Or",1010,260,'dist',{side:'A'}],['brotteaux','Brotteaux',960,390,'dist',{side:'A'}],
    ['partdieu','Part-Dieu',1080,480,'gare',{def:1.3,side:'A'}],['guillotiere','Guillotière',905,590,'dist',{side:'A'}],['jeanmace','Jean Macé',930,730,'dist',{side:'A'}],
    ['monplaisir','Monplaisir',1150,690,'dist',{side:'A'}],['gerland','Gerland',920,890,'dist',{side:'A'}],['venissieux','Vénissieux',1180,960,'dist',{side:'A'}]],
  bridges:[['b_ilebarbe',"Pont de l'Île Barbe",532,150,'Saône'],['b_koenig',"Pont Kœnig",594,335,'Saône'],['b_feuillee',"Pont La Feuillée",638,450,'Saône'],['b_bonaparte',"Pont Bonaparte",646,585,'Saône'],['b_kitchener',"Pont Kitchener",678,705,'Saône'],['b_mulatiere',"Pont de la Mulatière",755,860,'Saône'],['b_churchill',"Pont Churchill",875,290,'Rhône'],['b_morand',"Pont Morand",834,395,'Rhône'],['b_lafayette',"Pont Lafayette",820,470,'Rhône'],['b_guillotiere',"Pont de la Guillotière",806,580,'Rhône'],['b_gallieni',"Pont Gallieni",799,700,'Rhône'],['b_pasteur',"Pont Pasteur",794,830,'Rhône'],['b_pierrebenite',"Pont de Pierre-Bénite",799,1010,'Rhône']],
  edges:`tassin-ecully tassin-pointdujour tassin-saintefoy ecully-vaise vaise-pointdujour vaise-b_ilebarbe vaise-b_koenig pointdujour-fourviere fourviere-vieuxlyon fourviere-stjust vieuxlyon-stjust vieuxlyon-b_feuillee vieuxlyon-b_bonaparte stjust-saintefoy stjust-b_kitchener saintefoy-oullins oullins-mulatiere stjust-mulatiere mulatiere-b_mulatiere mulatiere-b_pierrebenite
caluire-b_ilebarbe caluire-croixrousse croixrousse-b_koenig croixrousse-b_churchill croixrousse-hdv hdv-b_feuillee hdv-b_morand hdv-b_lafayette hdv-bellecour bellecour-b_bonaparte bellecour-b_guillotiere bellecour-perrache perrache-b_kitchener perrache-b_gallieni perrache-confluence confluence-b_pasteur confluence-b_mulatiere
villeurbanne-charpennes villeurbanne-monplaisir charpennes-partdieu charpennes-tetedor charpennes-brotteaux tetedor-brotteaux tetedor-b_churchill brotteaux-b_morand brotteaux-partdieu partdieu-b_lafayette partdieu-guillotiere partdieu-monplaisir guillotiere-b_guillotiere guillotiere-jeanmace jeanmace-b_gallieni jeanmace-gerland jeanmace-monplaisir monplaisir-venissieux gerland-venissieux gerland-b_pasteur gerland-b_pierrebenite`,
  obj:['croixrousse','hdv','bellecour','perrache'],hq:{A:'villeurbanne',B:'tassin'},
  arr:[{n:'Nord-Ouest',sub:'9e · Vaise, Fourvière',role:'qg',ids:['ecully','vaise','pointdujour','fourviere'],at:[330,370]},
    {n:'Sud-Ouest',sub:'5e · Vieux Lyon, Oullins',role:'inc',ids:['vieuxlyon','stjust','saintefoy','oullins','mulatiere'],at:[420,830]},
    {n:'Pentes et Terreaux',sub:'1er · 4e',role:'cpc',ids:['caluire','croixrousse','hdv'],at:[635,215]},
    {n:"Presqu'île",sub:'2e · Bellecour, Perrache',role:'cinc',ids:['bellecour','perrache','confluence'],at:[770,512]},
    {n:'Rive gauche nord',sub:'3e · 6e · Part-Dieu, Brotteaux',role:'qg',ids:['tetedor','charpennes','brotteaux','partdieu'],at:[1200,250]},
    {n:'Rive gauche sud',sub:'7e · 8e · Guillotière, Gerland',role:'inc',ids:['guillotiere','jeanmace','monplaisir','gerland','venissieux'],at:[1060,820]}],
  ev:{greve:'Grève des TCL',paper:'Le Progrès',fete:{node:'croixrousse',title:'Vogue des marrons',text:'La fête foraine de la Croix-Rousse'},riot:{node:'croixrousse',title:'Révolte des canuts'},
    match:{title:"Soir de match de l'OL",ids:['gerland','jeanmace','b_pasteur','b_pierrebenite'],text:'Gerland, Jean Macé et les ponts du sud'},party:{title:'Fête des Lumières',text:"Les lumignons s'allument aux fenêtres"},
    help:{t:"Demander l'aide de Paris",c:'La colonne de Paris'}},
  ref:'bellecour',prodA:1.04},

paris:{id:'paris',name:'Paris',sub:'1 fleuve · 13 ponts · 2 îles',
  desc:"La Seine coupe la ville en deux. Au centre, l'île de la Cité, l'île Saint-Louis, le Louvre et Saint-Michel sont tenus par des milices.",
  sides:{A:{t:'Rive droite, au nord de la Seine. QG à Montmartre, gare du Nord. Jeu offensif.'},B:{t:"Rive gauche, au sud de la Seine. QG à Montparnasse, Butte-aux-Cailles, gare d'Austerlitz. Jeu de position."}},
  water:{rivers:[{n:'Seine',de:'de la Seine',hw:16,pts:[[1640,820],[1500,760],[1360,690],[1220,620],[1080,560],[960,520],[840,500],[720,505],[600,525],[490,565],[390,620],[300,690],[220,770],[140,860],[60,950],[-40,1040]]}],
    lakes:[[850,507,150,56,0]],islands:[[795,510,60,22,0],[925,514,38,16,0]]},
  deco:{center:[820,520],hills:[[790,150,140,95],[1000,920,90,60],[900,735,80,55]],parks:[[70,560,60,210,0],[1560,620,55,150,0],[680,730,42,26,0],[375,745,22,62,0.55],[585,470,42,11,-0.05],[1260,300,42,30,0],[1085,655,30,18,0]],ponds:[[1255,305,12,8,0]],
    rails:[[[1040,210],[1060,-10]],[[690,310],[640,-10]],[[1230,575],[1640,700]],[[1170,720],[1640,990]],[[720,880],[560,1110]]],
    labels:[['SEINE',1300,662,0.46,'r'],['SEINE',345,652,-0.66,'r'],['RIVE DROITE',1290,90,0,'A'],['RIVE GAUCHE',1180,1060,0,'B']]},
  nodes:[
    ['montmartre','Montmartre',790,150,'base',{side:'A'}],['montparnasse','Montparnasse',720,880,'base',{side:'B'}],
    ['louvre','Louvre',670,440,'obj'],['cite','Île de la Cité',795,510,'obj'],['stlouis','Île Saint-Louis',925,514,'obj'],['stmichel','Saint-Michel',800,612,'obj'],
    ['hdv','Hôtel de Ville',985,440,'dist'],['plantes','Jardin des Plantes',1030,618,'dist'],
    ['batignolles','Batignolles',530,200,'dist',{side:'A'}],['opera','Opéra',690,310,'dist',{side:'A'}],['etoile','Étoile',320,350,'dist',{side:'A'}],
    ['concorde','Concorde',500,450,'dist',{side:'A'}],['trocadero','Trocadéro',230,560,'dist',{side:'A'}],['gdnord','Gare du Nord',1040,210,'gare',{def:1.3,side:'A'}],
    ['republique','République',1070,365,'dist',{side:'A'}],['bastille','Bastille',1200,500,'dist',{side:'A'}],['bercy','Bercy',1400,610,'dist',{side:'A'}],
    ['stgermain','Saint-Germain',610,640,'dist',{side:'B'}],['invalides','Invalides',440,700,'dist',{side:'B'}],['eiffel','Tour Eiffel',330,790,'dist',{side:'B'}],
    ['grenelle','Grenelle',290,960,'dist',{side:'B'}],['vaugirard','Vaugirard',500,890,'dist',{side:'B'}],['pantheon','Panthéon',900,730,'dist',{side:'B'}],
    ['butteaux','Butte-aux-Cailles',1000,920,'dist',{def:1.35,hill:1,side:'B'}],['austerlitz',"Gare d'Austerlitz",1170,720,'gare',{side:'B'}],['bibliotheque','Bibliothèque',1420,850,'dist',{side:'B'}]],
  bridges:[['b_bir','Pont de Bir-Hakeim',200,792,'Seine'],['b_iena',"Pont d'Iéna",280,710,'Seine'],['b_alexandre','Pont Alexandre-III',440,592,'Seine'],['b_concorde','Pont de la Concorde',545,545,'Seine'],
    ['b_arts','Pont des Arts',650,517,'Seine'],['b_neuf','Pont Neuf',728,500,'Seine'],['b_arcole',"Pont d'Arcole",850,474,'Seine'],['b_stmichel','Pont Saint-Michel',800,546,'Seine'],
    ['b_stlouis','Pont Saint-Louis',871,512,'Seine'],['b_marie','Pont Marie',932,478,'Seine'],['b_tournelle','Pont de la Tournelle',945,540,'Seine'],['b_austerlitz',"Pont d'Austerlitz",1170,598,'Seine'],['b_bercy','Pont de Bercy',1420,720,'Seine']],
  edges:`montmartre-batignolles montmartre-opera montmartre-gdnord batignolles-opera batignolles-etoile etoile-concorde etoile-trocadero opera-concorde opera-louvre concorde-louvre gdnord-republique republique-hdv republique-bastille bastille-hdv bastille-bercy
trocadero-b_bir trocadero-b_iena concorde-b_alexandre concorde-b_concorde louvre-b_arts louvre-b_neuf hdv-b_arcole hdv-b_marie bastille-b_austerlitz bercy-b_bercy
b_neuf-cite b_arcole-cite cite-b_stlouis b_stlouis-stlouis b_marie-stlouis cite-b_stmichel stlouis-b_tournelle
b_bir-grenelle b_iena-eiffel b_alexandre-invalides b_concorde-stgermain b_arts-stgermain b_stmichel-stmichel b_tournelle-plantes b_austerlitz-austerlitz b_bercy-bibliotheque
montparnasse-vaugirard montparnasse-stgermain montparnasse-pantheon stgermain-invalides stgermain-stmichel invalides-eiffel invalides-vaugirard eiffel-grenelle grenelle-vaugirard pantheon-stmichel pantheon-plantes pantheon-butteaux plantes-austerlitz austerlitz-butteaux austerlitz-bibliotheque`,
  obj:['louvre','cite','stlouis','stmichel'],hq:{A:'montmartre',B:'montparnasse'},
  arr:[{n:'Rive droite ouest',sub:'8e · 16e · 17e',role:'qg',ids:['batignolles','etoile','trocadero','concorde']},
    {n:'Rive droite est',sub:'9e · 10e · 11e · 12e',role:'inc',ids:['opera','gdnord','republique','bastille','bercy']},
    {n:'Louvre et Cité',sub:'1er · 4e',role:'cpc',ids:['louvre','cite','hdv']},
    {n:'Saint-Louis et Quartier latin',sub:'4e · 5e',role:'cinc',ids:['stlouis','stmichel','plantes']},
    {n:'Rive gauche ouest',sub:'7e · 15e',role:'qg',ids:['invalides','eiffel','grenelle','vaugirard']},
    {n:'Rive gauche est',sub:'6e · 13e · 14e',role:'inc',ids:['stgermain','pantheon','butteaux','austerlitz','bibliotheque']}],
  ev:{greve:'Grève de la RATP',paper:'Le Parisien',fete:{node:'hdv',title:'Paris Plages',text:'Paris Plages sur les quais'},riot:{node:'stmichel',title:'Barricades au Quartier latin'},
    match:{title:'Soir de match au Parc des Princes',ids:['trocadero','eiffel','grenelle','b_bir'],text:'Le Trocadéro, la tour Eiffel, Grenelle et le pont de Bir-Hakeim'},party:{title:'Nuit blanche',text:"Les monuments s'illuminent toute la nuit"},
    help:{t:'Appeler la garnison de Versailles',c:'La garnison de Versailles'}},
  ref:'cite',prodA:0.99},

marseille:{id:'marseille',name:'Marseille',sub:'1 port · 7 passages · 2 collines',
  desc:"Pas de grand fleuve : on se bat rue par rue, du Panier à Notre-Dame-de-la-Garde. Le Vieux-Port se traverse en ferry ou par le tunnel ; à l'est, le Jarret coupe la ville.",
  sides:{A:{t:'Quartiers nord. QG à la Belle de Mai, colline du Panier, gare Saint-Charles. Jeu offensif.'},B:{t:'Quartiers sud. QG au Prado, colline de Notre-Dame-de-la-Garde, gare de Castellane. Jeu de position.'}},
  water:{rivers:[{n:'Jarret',de:'du Jarret',hw:10,pts:[[1290,-30],[1272,170],[1250,330],[1246,430],[1246,555],[1246,680],[1250,780],[1272,940],[1290,1140]]}],
    sea:[[[-20,-20],[360,-20],[345,100],[350,220],[370,340],[385,440],[392,525],[650,525],[662,555],[650,585],[392,585],[385,670],[370,770],[350,890],[345,1010],[360,1130],[-20,1130]]],
    islands:[[120,560,70,22,-0.2],[160,628,40,14,0.1],[245,650,16,11,0]]},
  deco:{center:[760,555],hills:[[440,470,110,70],[440,650,130,85]],parks:[[960,300,40,24,0],[760,1060,70,30,0]],ponds:[],
    rails:[[[680,330],[700,-20]],[[680,330],[900,300],[1640,250]],[[680,780],[760,1130]]],
    labels:[['MÉDITERRANÉE',190,820,-1.35,'r'],['VIEUX-PORT',515,556,0,'r'],['JARRET',1260,630,1.57,'r'],['NORD',820,60,0,'A'],['SUD',820,1060,0,'B']],
    names:{'Vieux-Port':['Tempête sur le Vieux-Port','Le ferry et le tunnel du Vieux-Port sont paralysés : traversées très ralenties pendant 40 s.']}},
  nodes:[
    ['belledemai','La Belle de Mai',910,160,'base',{side:'A'}],['prado','Le Prado',910,950,'base',{side:'B'}],
    ['hdv','Hôtel de Ville',600,470,'obj'],['stvictor','Saint-Victor',600,640,'obj'],['canebiere','La Canebière',770,555,'obj'],['plaine','La Plaine',980,555,'obj'],
    ['reformes','Les Réformés',1130,555,'dist'],['stpierre','Saint-Pierre',1420,555,'dist'],
    ['panier','Le Panier',440,470,'dist',{def:1.35,hill:1,side:'A'}],['joliette','La Joliette',440,320,'dist',{side:'A'}],['stmauront','Saint-Mauront',680,150,'dist',{side:'A'}],
    ['stcharles','Gare Saint-Charles',680,330,'gare',{side:'A'}],['longchamp','Longchamp',930,350,'dist',{side:'A'}],['chartreux','Les Chartreux',1140,170,'dist',{side:'A'}],
    ['cinqav','Cinq-Avenues',1150,380,'dist',{side:'A'}],['stjust','Saint-Just',1400,170,'dist',{side:'A'}],['blancarde','La Blancarde',1410,400,'dist',{side:'A'}],
    ['notredame','Notre-Dame-de-la-Garde',440,640,'dist',{def:1.35,hill:1,side:'B'}],['endoume','Endoume',440,790,'dist',{side:'B'}],['perier','Périer',680,960,'dist',{side:'B'}],
    ['castellane','Castellane',680,780,'gare',{side:'B'}],['baille','Baille',930,760,'dist',{side:'B'}],['stemarg','Sainte-Marguerite',1140,940,'dist',{side:'B'}],
    ['timone','La Timone',1150,730,'dist',{side:'B'}],['stloup','Saint-Loup',1400,940,'dist',{side:'B'}],['pomme','La Pomme',1410,710,'dist',{side:'B'}]],
  bridges:[['b_tunnel','Tunnel du Vieux-Port',420,555,'Vieux-Port'],['b_ferry','Ferry-boat',600,555,'Vieux-Port'],
    ['b_stjust','Pont de Saint-Just',1272,170,'Jarret'],['b_blancarde','Pont de la Blancarde',1246,392,'Jarret'],['b_stpierre','Pont Saint-Pierre',1246,555,'Jarret'],['b_pomme','Pont de la Pomme',1246,718,'Jarret'],['b_stloup','Pont de Saint-Loup',1272,940,'Jarret']],
  edges:`belledemai-stmauront belledemai-chartreux belledemai-longchamp stmauront-stcharles joliette-stcharles joliette-panier stcharles-longchamp longchamp-cinqav chartreux-cinqav
panier-hdv stcharles-hdv hdv-canebiere longchamp-plaine cinqav-reformes canebiere-plaine plaine-reformes canebiere-stvictor
prado-perier prado-stemarg prado-baille perier-castellane endoume-castellane endoume-notredame castellane-baille baille-timone stemarg-timone
notredame-stvictor castellane-stvictor baille-plaine timone-reformes
stjust-blancarde blancarde-stpierre stpierre-pomme pomme-stloup
panier-b_tunnel b_tunnel-notredame hdv-b_ferry b_ferry-stvictor chartreux-b_stjust b_stjust-stjust cinqav-b_blancarde b_blancarde-blancarde reformes-b_stpierre b_stpierre-stpierre timone-b_pomme b_pomme-pomme stemarg-b_stloup b_stloup-stloup`,
  obj:['hdv','stvictor','canebiere','plaine'],hq:{A:'belledemai',B:'prado'},
  arr:[{n:'Joliette et Panier',sub:'2e · 3e',role:'qg',ids:['panier','joliette','stmauront','stcharles']},
    {n:'Quartiers nord-est',sub:'4e · 13e · 14e',role:'inc',ids:['longchamp','chartreux','cinqav','stjust','blancarde']},
    {n:'Vieux-Port',sub:'1er · 7e',role:'cpc',ids:['hdv','stvictor','canebiere']},
    {n:'La Plaine',sub:'5e · 6e',role:'cinc',ids:['plaine','reformes','stpierre']},
    {n:'Corniche',sub:'6e · 7e',role:'qg',ids:['notredame','endoume','castellane','perier']},
    {n:'Quartiers sud-est',sub:'5e · 10e · 11e',role:'inc',ids:['baille','timone','stemarg','stloup','pomme']}],
  ev:{greve:'Grève de la RTM',paper:'La Provence',fete:{node:'canebiere',title:'Foire aux santons',text:'La foire aux santons de la Canebière'},riot:{node:'plaine',title:'Émeute à La Plaine'},
    match:{title:"Soir de match de l'OM",ids:['baille','castellane','timone','perier'],text:'Baille, Castellane, la Timone et Périer'},party:{title:'Fête de la musique',text:'La ville danse sur le Vieux-Port'},
    help:{t:"Demander l'aide d'Aix",c:"La colonne d'Aix"}},
  ref:'canebiere',prodA:1.21},

bordeaux:{id:'bordeaux',name:'Bordeaux',sub:'1 fleuve · 6 ponts · 2 rives à tenir',
  desc:"La Garonne traverse les deux camps : chacun doit tenir ses deux rives. Le centre historique et La Bastide, de part et d'autre du Pont de Pierre, sont tenus par des milices.",
  sides:{A:{t:'Le nord, sur les deux rives. QG au Lac, Chartrons, hauts de Cenon. Jeu offensif.'},B:{t:'Le sud, sur les deux rives. QG à Talence, gare Saint-Jean, coteau de Bouliac. Jeu de position.'}},
  water:{rivers:[{n:'Garonne',de:'de la Garonne',hw:22,pts:[[880,-30],[890,100],[930,220],[990,330],[1020,450],[1025,555],[1020,660],[990,780],[930,890],[890,1010],[880,1140]]}],
    lakes:[[420,30,180,48,0]]},
  deco:{center:[760,555],hills:[[1450,360,150,115],[1450,750,150,115]],parks:[[570,300,36,22,0],[240,470,40,26,0],[1180,470,30,20,0]],ponds:[[700,212,36,11,0.35],[722,250,36,11,0.35]],
    rails:[[[860,780],[700,1130]],[[860,780],[1005,800],[1640,840]],[[1420,360],[1640,300]]],
    labels:[['GARONNE',958,275,1.07,'r'],['GARONNE',958,835,-1.07,'r'],['LE LAC',420,36,0,'r'],['NORD',1290,60,0,'A'],['SUD',1290,1060,0,'B']],
    names:{Garonne:['Mascaret sur la Garonne','Le mascaret remonte le fleuve : les ponts de la Garonne sont très ralentis pendant 40 s.']}},
  nodes:[
    ['lac','Le Lac',560,160,'base',{side:'A'}],['talence','Talence',560,950,'base',{side:'B'}],
    ['standre','Saint-André',600,555,'obj'],['quinconces','Quinconces',870,450,'obj'],['stmichel','Saint-Michel',870,660,'obj'],['bastide','La Bastide',1180,555,'obj'],
    ['cauderan','Caudéran',300,555,'dist'],['artigues','Artigues',1440,555,'dist'],
    ['bruges','Bruges',250,170,'dist',{side:'A'}],['bassins','Bassins à flot',790,190,'dist',{side:'A'}],['bouscat','Le Bouscat',300,350,'dist',{side:'A'}],
    ['jardin','Jardin public',570,340,'dist',{side:'A'}],['chartrons','Chartrons',850,330,'dist',{side:'A'}],['lormont','Lormont',1170,180,'dist',{side:'A'}],
    ['bassens','Bassens',1440,180,'dist',{side:'A'}],['brazza','Brazza',1160,350,'dist',{side:'A'}],['cenon','Cenon',1420,360,'gare',{def:1.35,hill:1,side:'A'}],
    ['pessac','Pessac',250,940,'dist',{side:'B'}],['begles','Bègles',790,920,'dist',{side:'B'}],['merignac','Mérignac',300,760,'dist',{side:'B'}],
    ['stgenes','Saint-Genès',570,770,'dist',{side:'B'}],['stjean','Gare Saint-Jean',850,780,'gare',{side:'B'}],['latresne','Latresne',1170,930,'dist',{side:'B'}],
    ['carignan','Carignan',1440,930,'dist',{side:'B'}],['floirac','Floirac',1160,760,'dist',{side:'B'}],['bouliac','Bouliac',1420,750,'dist',{def:1.35,hill:1,side:'B'}]],
  bridges:[['b_aquitaine',"Pont d'Aquitaine",913,170,'Garonne'],['b_chaban','Pont Chaban-Delmas',994,345,'Garonne'],['b_pierre','Pont de Pierre',1023,505,'Garonne'],
    ['b_stjean','Pont Saint-Jean',1023,605,'Garonne'],['b_simoneveil','Pont Simone-Veil',994,765,'Garonne'],['b_mitterrand','Pont François-Mitterrand',913,940,'Garonne']],
  edges:`lac-bruges lac-jardin lac-bassins bruges-bouscat bouscat-jardin jardin-chartrons bassins-chartrons lormont-bassens lormont-brazza bassens-cenon brazza-cenon
bassins-b_aquitaine b_aquitaine-lormont chartrons-b_chaban b_chaban-brazza
cauderan-bouscat cauderan-merignac cauderan-standre jardin-standre stgenes-standre standre-quinconces standre-stmichel chartrons-quinconces quinconces-stmichel stmichel-stjean
brazza-bastide floirac-bastide bastide-artigues cenon-artigues bouliac-artigues quinconces-b_pierre b_pierre-bastide stmichel-b_stjean b_stjean-bastide
talence-pessac talence-stgenes talence-begles pessac-merignac merignac-stgenes stgenes-stjean begles-stjean latresne-carignan latresne-floirac carignan-bouliac floirac-bouliac
stjean-b_simoneveil b_simoneveil-floirac begles-b_mitterrand b_mitterrand-latresne`,
  obj:['standre','quinconces','stmichel','bastide'],hq:{A:'lac',B:'talence'},
  arr:[{n:'Rive gauche nord',sub:'Chartrons, Bacalan',role:'inc',ids:['bruges','bouscat','jardin','chartrons','bassins']},
    {n:'Rive droite nord',sub:'Lormont, Cenon',role:'qg',ids:['lormont','bassens','brazza','cenon']},
    {n:'Centre historique',sub:'Saint-Pierre, Mériadeck',role:'cinc',ids:['cauderan','standre','quinconces','stmichel']},
    {n:'La Bastide',sub:'Rive droite',role:'cpc',ids:['bastide','artigues']},
    {n:'Rive gauche sud',sub:'Saint-Jean, Bègles',role:'inc',ids:['pessac','merignac','stgenes','stjean','begles']},
    {n:'Rive droite sud',sub:'Floirac, Bouliac',role:'qg',ids:['floirac','bouliac','latresne','carignan']}],
  ev:{greve:'Grève de TBM',paper:'Sud Ouest',fete:{node:'quinconces',title:'Fête du vin',text:'La Fête du vin sur les quais'},riot:{node:'stmichel',title:'Émeute à Saint-Michel'},
    match:{title:'Soir de match des Girondins',ids:['bruges','bassins','b_aquitaine','lormont'],text:"Bruges, les Bassins à flot et le pont d'Aquitaine"},party:{title:'Fête du fleuve',text:"Les quais s'illuminent"},
    help:{t:"Demander l'aide de Toulouse",c:'La colonne de Toulouse'}},
  ref:'quinconces',prodA:1.12},

strasbourg:{id:'strasbourg',name:'Strasbourg',sub:'1 île · 8 ponts · 4 objectifs',
  desc:"L'Ill enserre la Grande Île, cœur de la ville : la Petite France, Kléber, la cathédrale et Broglie sont tenus par des milices. Huit ponts y mènent.",
  sides:{A:{t:"Nord-ouest de l'Ill. QG à Cronenbourg, gare centrale, Neustadt. Jeu offensif."},B:{t:"Sud-est de l'Ill. QG au Neuhof, Neudorf, gare de Krimmeri. Jeu de position."}},
  water:{rivers:[{n:'Ill',de:"de l'Ill",hw:14,pts:[[-30,1010],[200,900],[400,760],[560,640],[790,555],[1020,470],[1180,350],[1380,210],[1610,100]]}],
    lakes:[[790,555,265,95,-0.33]],islands:[[790,555,222,58,-0.33]]},
  deco:{center:[790,555],hills:[],parks:[[1150,190,52,34,0],[430,970,50,30,0],[1040,820,40,24,0]],ponds:[[1160,200,14,8,0]],
    rails:[[[540,420],[-20,520]],[[540,420],[600,-20]],[[1020,910],[1100,1130]],[[1020,910],[1640,1000]]],
    labels:[['ILL',300,815,-0.6,'r'],['ILL',1290,265,-0.6,'r'],['NORD-OUEST',250,90,0,'A'],['SUD-EST',1330,1040,0,'B'],['GRANDE ÎLE',790,420,-0.33,'C']]},
  nodes:[
    ['cronenbourg','Cronenbourg',360,330,'base',{side:'A'}],['neuhof','Neuhof',1220,780,'base',{side:'B'}],
    ['petitefrance','Petite France',629,610,'obj'],['kleber','Kléber',736,573,'obj'],['cathedrale','Cathédrale',844,537,'obj'],['broglie','Broglie',951,500,'obj'],
    ['hautepierre','Hautepierre',160,340,'dist',{side:'A'}],['koenigshoffen','Koenigshoffen',250,540,'dist',{side:'A'}],['gare','Gare centrale',540,420,'gare',{side:'A'}],
    ['schiltigheim','Schiltigheim',560,200,'dist',{side:'A'}],['wacken','Wacken',800,220,'dist',{side:'A'}],['contades','Contades',800,390,'dist',{side:'A'}],
    ['republique','République',990,380,'dist',{side:'A'}],['orangerie','Orangerie',1130,250,'dist',{side:'A'}],['robertsau','Robertsau',1340,140,'dist',{side:'A'}],
    ['portdurhin','Port du Rhin',1420,770,'dist',{side:'B'}],['esplanade','Esplanade',1330,570,'dist',{side:'B'}],['krutenau','Krutenau',1040,690,'dist',{side:'B'}],
    ['krimmeri','Krimmeri',1020,910,'gare',{side:'B'}],['meinau','Meinau',780,890,'dist',{side:'B'}],['neudorf','Neudorf',780,720,'dist',{side:'B'}],
    ['montagneverte','Montagne Verte',590,730,'dist',{side:'B'}],['elsau','Elsau',450,860,'dist',{side:'B'}],['ostwald','Ostwald',240,970,'dist',{side:'B'}]],
  bridges:[['b_kuss','Pont Kuss',637,541,'Ill'],['b_paris','Pont de Paris',765,483,'Ill'],['b_theatre','Pont du Théâtre',912,449,'Ill'],
    ['b_madeleine','Pont Sainte-Madeleine',943,569,'Ill'],['b_corbeau','Pont du Corbeau',815,627,'Ill'],['b_couverts','Ponts couverts',668,661,'Ill'],
    ['b_elsau',"Pont de l'Elsau",300,830,'Ill'],['b_orangerie',"Pont de l'Orangerie",1280,280,'Ill']],
  edges:`cronenbourg-hautepierre cronenbourg-koenigshoffen cronenbourg-gare cronenbourg-schiltigheim hautepierre-koenigshoffen gare-contades gare-schiltigheim schiltigheim-wacken wacken-contades contades-republique republique-orangerie orangerie-robertsau wacken-republique
gare-b_kuss contades-b_paris republique-b_theatre koenigshoffen-b_elsau orangerie-b_orangerie
b_kuss-petitefrance b_paris-kleber b_theatre-broglie petitefrance-kleber kleber-cathedrale cathedrale-broglie
b_madeleine-broglie b_corbeau-cathedrale b_couverts-petitefrance
neuhof-portdurhin neuhof-esplanade neuhof-krutenau neuhof-krimmeri portdurhin-esplanade krutenau-neudorf krutenau-krimmeri krimmeri-meinau meinau-neudorf neudorf-montagneverte montagneverte-elsau elsau-ostwald meinau-montagneverte
krutenau-b_madeleine neudorf-b_corbeau montagneverte-b_couverts esplanade-b_orangerie elsau-b_elsau`,
  obj:['petitefrance','kleber','cathedrale','broglie'],hq:{A:'cronenbourg',B:'neuhof'},
  arr:[{n:'Cronenbourg et gare',sub:'Ouest',role:'qg',ids:['hautepierre','koenigshoffen','gare','schiltigheim']},
    {n:'Neustadt et Robertsau',sub:'Nord-est',role:'inc',ids:['wacken','contades','republique','orangerie','robertsau']},
    {n:'Petite France et Kléber',sub:'Grande Île ouest',role:'cpc',ids:['petitefrance','kleber']},
    {n:'Cathédrale et Broglie',sub:'Grande Île est',role:'cinc',ids:['cathedrale','broglie']},
    {n:'Esplanade et Port du Rhin',sub:'Est',role:'qg',ids:['portdurhin','esplanade','krutenau','krimmeri']},
    {n:'Neudorf et Montagne Verte',sub:'Sud-ouest',role:'inc',ids:['meinau','neudorf','montagneverte','elsau','ostwald']}],
  ev:{greve:'Grève de la CTS',paper:'Les DNA',fete:{node:'cathedrale',title:'Marché de Noël',text:'Le marché de Noël au pied de la cathédrale'},riot:{node:'petitefrance',title:'Révolte des tanneurs'},
    match:{title:'Soir de match du Racing',ids:['meinau','neudorf','krimmeri','b_corbeau'],text:'La Meinau, Neudorf, Krimmeri et le pont du Corbeau'},party:{title:'Fête de la musique',text:"Les places de la Grande Île s'animent"},
    help:{t:"Demander l'aide de Metz",c:'La colonne de Metz'}},
  ref:'kleber',prodA:1.06}
};
const MAP_ORDER=['lyon','paris','marseille','bordeaux','strasbourg'];
/*ENDMAPS*/
/*WATER*/
function dSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;let t=((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1);t=Math.max(0,Math.min(1,t));return Math.hypot(ax+t*dx-px,ay+t*dy-py);}
function dPoly(px,py,p){let m=1e9;for(let i=0;i<p.length-1;i++)m=Math.min(m,dSeg(px,py,p[i][0],p[i][1],p[i+1][0],p[i+1][1]));return m;}
function inEll(x,y,e,m){const[cx,cy,rx,ry,r]=e,c=Math.cos(r||0),s=Math.sin(r||0),dx=x-cx,dy=y-cy,u=dx*c+dy*s,v=-dx*s+dy*c,a=rx+(m||0),b=ry+(m||0);return a>0&&b>0&&(u*u)/(a*a)+(v*v)/(b*b)<1;}
function inPoly(x,y,p){let o=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)o=!o;}return o;}
function waterAt(wd,x,y,m){m=m||0;if(!wd)return false;
  if(wd.islands)for(const e of wd.islands)if(inEll(x,y,e,-m))return false;
  if(wd.rivers)for(const r of wd.rivers)if(dPoly(x,y,r.pts)<r.hw+1+m)return true;
  if(wd.lakes)for(const e of wd.lakes)if(inEll(x,y,e,m))return true;
  if(wd.sea)for(const p of wd.sea){if(inPoly(x,y,p))return true;if(m>0){for(let i=0;i<p.length-1;i++)if(dSeg(x,y,p[i][0],p[i][1],p[i+1][0],p[i+1][1])<m)return true;}}
  return false;}
/*ENDWATER*/
const TYPES={
  base:{prod:1.1,cap:220,def:2.4,r:21,label:'QG',inc:0.4},
  obj:{prod:0.65,cap:90,def:1.15,r:19,label:'Objectif',inc:0.32},
  gare:{prod:0.65,cap:70,def:1.0,r:16,label:'Gare',inc:0.3},
  dist:{prod:0.36,cap:60,def:1.0,r:15,label:'Quartier',inc:0.2},
  bridge:{prod:0.08,cap:30,def:1.35,r:11,label:'Pont',inc:0.06}
};
const BONUS={qg:{b:{qg:0.6},d:'+0,6 soldat/s au QG',n:'Soldats au QG'},inc:{b:{inc:0.7},d:'+0,7 ravitaillement/s',n:'Ravitaillement'},
  cpc:{b:{qg:0.6,pc:1},d:'+0,6 soldat/s au QG et +1 PC toutes les 2 min 30',n:'Soldats et PC'},cinc:{b:{inc:1,upk:0.75},d:'+1 ravitaillement/s et solde des troupes −25 %',n:'Ravitaillement et solde'}};
let MAP=MAPS.lyon,N=0,ED=[],OBJ=[],ARR=[],HQ={A:0,B:0},HOMECOUNT={A:0,B:0},EDADJ=[],ELEN=[],adj=[];
const nodes=[],idx={};

/* ================= Équilibrage ================= */
const BAL={
  speed:28,ownRoad:1.35,cutDef:0.8,startCr:{A:150,B:150},startSup:{A:50,B:50},prep:75,
  decEvery:150,decFirst:{A:190,B:210},decWindow:50,evFirst:170,evMin:90,evMax:140,
  prodSide:{A:1.04,B:1},defSide:{A:1,B:1},wall:0.6,occProd:0.6,occInc:0.5,disT:15,disDef:0.75,
  start:{base:50,home:10},neutral:{obj:30,dist:12,bridge:6},allObjMult:1.5,rate:0.5,homeDef:1.25,
  upkeep:0.0022,unpaid:0.6,stretch:0.025,stretchFrom:16,pcEvery:100,pcCapMax:6,rebuildCost:120,rebuildT:45,phaseAt:[0.3,0.6]
};
const FORMATS=[{n:'Rapide',dur:780},{n:'Standard',dur:1080},{n:'Longue',dur:1500}];
const DIFF=[{think:1.5,prod:0.94,aggr:1.25,name:'Facile'},{think:1.5,prod:1.0,aggr:1.25,name:'Normal'},{think:1.5,prod:1.06,aggr:1.25,name:'Difficile'}];
const PHN=['','Mobilisation','Escalade','Guerre totale'],ROM=['','I','II','III'];
const ST={
  caserne:{n:'Caserne',k:'C',c:[60,100],t:[25,38],ph:[1,2],noBridge:1,d:['60 % de soldats en plus sur ce point','120 % de soldats en plus sur ce point']},
  depot:{n:'Dépôt',k:'D',c:[65,105],t:[25,38],ph:[1,2],noBridge:1,d:['+0,4 ravit./s, voisins +20 % de soldats','+0,8 ravit./s, voisins +35 % de soldats']},
  fortin:{n:'Fortin',k:'F',c:[60,100],t:[30,45],ph:[2,3],d:['40 % de soldats en plus pour le prendre','80 % de soldats en plus pour le prendre']},
  mortier:{n:'Mortier',k:'M',c:[90,130],t:[30,45],ph:[2,3],d:['Tue 1,6 soldat/s ennemi à portée','Tue 3 soldats/s ennemis à portée']},
  bar:{n:'Barricades',k:'B',c:[20,35],t:[10,15],ph:[1,2],d:['20 % de soldats en plus pour le prendre','40 % de soldats en plus pour le prendre']}
};
const STV={caserne:{prod:[1.6,2.2],cap:[40,80]},fortin:{def:[1.4,1.8]},depot:{inc:[0.4,0.8],adj:[0.2,0.35]},mortier:{dmg:[4,6],per:[2.5,2],range:170},bar:{def:[1.2,1.4]}};
const TECH={
  rec:{n:'Recrutement',lv:[{n:'Conscription',c:90,t:50,ph:1,d:'Production +10 %'},{n:'Mobilisation générale',c:160,t:75,ph:3,d:'Production +20 %'}]},
  log:{n:'Logistique',lv:[{n:'Camions',c:70,t:50,ph:1,d:'Vitesse +20 %'},{n:'Convois motorisés',c:130,t:75,ph:3,d:'Vitesse +35 %, ravitaillement +10 %'}]},
  pro:{n:'Protection',lv:[{n:'Gilets pare-balles',c:80,t:50,ph:1,d:'Défense +10 %'},{n:'Casques et blindage',c:140,t:75,ph:3,d:'Défense +20 %'}]},
  arm:{n:'Armes',lv:[{n:"Fusils d'assaut",c:90,t:50,ph:2,d:'Attaque +15 %'},{n:'Mitrailleuses lourdes',c:150,t:75,ph:3,d:'Attaque +30 %'}]},
  art:{n:'Artillerie',lv:[{n:'Obus explosifs',c:80,t:50,ph:2,d:'Mortiers +40 %'},{n:'Observateurs',c:140,t:75,ph:3,d:'Mortiers +80 %, portée +25 %, bombardement −50 %'}]}
};
const TV={arm:[1,1.15,1.3],pro:[1,1.1,1.2],log:[1,1.2,1.35],art:[1,1.4,1.8],rec:[1,1.1,1.2]};
const ABL={
  A:[
    {key:'renforts',name:'Renforts',cost:0,ph:1,cd:110,target:null,desc:'+25 soldats au QG'},
    {key:'marche',name:'Marche forcée',cost:1,ph:1,cd:100,target:null,desc:'Vos colonnes vont 50 % plus vite pendant 25 s'},
    {key:'bombard',name:'Bombardement',cost:2,ph:2,cd:100,target:'enemy',desc:'Tue 35 % de la garnison d\'une cible'},
    {key:'sabotage',name:'Sabotage',cost:2,ph:2,cd:110,target:'enemyOwned',desc:'Un point ennemi ne produit plus et défend 20 % moins bien pendant 30 s'},
    {key:'assaut',name:'Assaut général',cost:3,ph:3,cd:160,target:null,desc:'100 de vos soldats en valent 130 à l\'attaque pendant 25 s'}
  ],
  B:[
    {key:'hold',name:'Tenir la position',cost:0,ph:1,cd:110,target:'own',desc:'Un de vos points demande 60 % de soldats en plus pour être pris, pendant 30 s'},
    {key:'mobil',name:'Mobilisation civile',cost:1,ph:1,cd:130,target:null,desc:'+3 soldats sur chacun de vos points d\'origine'},
    {key:'bombard',name:'Bombardement',cost:2,ph:2,cd:100,target:'enemy',desc:'Tue 35 % de la garnison d\'une cible'},
    {key:'barrages',name:'Barrages routiers',cost:2,ph:2,cd:120,target:null,desc:'Les colonnes ennemies avancent 40 % moins vite pendant 25 s'},
    {key:'ligne',name:'Ligne de résistance',cost:3,ph:3,cd:160,target:null,desc:'Tous vos points demandent 30 % de soldats en plus pour être pris, pendant 25 s'}
  ]
};

/* ================= Icônes (viewBox 24×24) ================= */
const ICONS={
  caserne:[{d:'M3 11L12 3L21 11H19V21H5V11Z M10 21V15H14V21Z',r:'evenodd'},
           {d:'M1 12L6 7L11 12H13L18 7L23 12H21V21H3V12Z M10 21V16H14V21Z M12 1.5H13V9.5H12Z M13 1.5L18 3.2L13 5Z',r:'evenodd'}],
  depot:[{d:'M4 7H20V21H4Z M6 9H18V19H6Z M6.8 9H9L17.2 19H15Z',r:'evenodd'},
         {d:'M2 10L12 4L22 10V21H2Z M5 21V13H19V21Z M7 21V16H11.5V21Z M12.5 21V17.5H17V21Z',r:'evenodd'}],
  fortin:[{d:'M6 21V8H8V5H10V8H11V5H13V8H14V5H16V8H18V21Z M10.5 21V16.5A1.5 1.5 0 0 1 13.5 16.5V21Z',r:'evenodd'},
          {d:'M2 21V8H4V6H6V8H7V6H9V21Z M15 21V8H17V6H19V8H20V6H22V21Z M9 21V12H15V21Z M10.5 21V17H13.5V21Z M9 12V10.5H10.5V12Z M11.25 12V10.5H12.75V12Z M13.5 12V10.5H15V12Z',r:'evenodd'}],
  mortier:[{d:'M3 18H15V21H3Z M6 16L15 5L18.5 8L9.5 19Z M18.5 3.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0Z',r:'nonzero'},
           {d:'M3 14L17 5L18.6 7.6L4.6 16.6Z M6 12.5H15V16H6Z M6.5 19.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0Z M12 19.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0Z M19 3a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z',r:'nonzero'}],
  bar:[{d:'M2 12.5H22V15H2Z M4 20H5.8L11 7H9.2Z M9.2 20H11L5.8 7H4Z M13 20H14.8L20 7H18.2Z M18.2 20H20L14.8 7H13Z',r:'nonzero'},
       {d:'M2 16H7.6V21H2Z M8.2 16H15.8V21H8.2Z M16.4 16H22V21H16.4Z M5 10.5H11.6V15.4H5Z M12.4 10.5H19V15.4H12.4Z M8.6 5H15.4V9.9H8.6Z',r:'nonzero'}],
  pont:[{d:'M2 14H22V16H2Z M4 16H6V21H4Z M18 16H20V21H18Z M3 14Q12 3 21 14H18.6Q12 7 5.4 14Z',r:'nonzero'}]
};
const P2D={};for(const k in ICONS)P2D[k]=ICONS[k].map(o=>({p:new Path2D(o.d),r:o.r}));
const iconSVG=(k,l)=>{const o=ICONS[k][Math.min(l,ICONS[k].length)-1];return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${o.d}" fill="currentColor" fill-rule="${o.r}"/></svg>`;};

/* ================= Graphe ================= */
const elen=(a,b)=>ELEN[a][b];
const isObj=n=>!!n.ob;
const qgOf=s=>nodes[HQ[s]];
const own=(o,k)=>typeof k==='string'&&Object.prototype.hasOwnProperty.call(o,k);
function parseEdges(e){return typeof e==='string'?e.split(/\s+/).filter(Boolean).map(x=>x.split('-')):(e||[]).map(x=>[x[0],x[1]]);}
function deOf(r){const rv=((MAP.water||{}).rivers||[]).find(x=>x.n===r);if(rv&&rv.de)return rv.de;const d=(MAP.water||{}).de;return d&&d[r]||('de '+r);}
function loadMap(m){
  MAP=m;nodes.length=0;for(const k in idx)delete idx[k];
  for(const[id,name,x,y,type,o]of m.nodes){const t=TYPES[type]||TYPES.dist;idx[id]=nodes.length;nodes.push({i:nodes.length,id,name,x,y,type:TYPES[type]?type:'dist',prod:o&&o.prod||t.prod,cap:t.cap,def:o&&o.def||t.def,r:t.r,inc:t.inc,hill:!!(o&&o.hill),gare:type==='gare'||!!(o&&o.gare),side:o&&o.side||'N'});}
  for(const[id,name,x,y,rn]of m.bridges||[]){const t=TYPES.bridge;idx[id]=nodes.length;nodes.push({i:nodes.length,id,name,x,y,type:'bridge',prod:t.prod,cap:t.cap,def:t.def,r:t.r,inc:t.inc,river:rn,side:'N'});}
  N=nodes.length;
  ELEN=[];for(let a=0;a<N;a++){ELEN[a]=[];for(let b=0;b<N;b++)ELEN[a][b]=Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y);}
  ED=parseEdges(m.edges).filter(([a,b])=>idx[a]!=null&&idx[b]!=null&&a!==b);
  OBJ=(m.obj||[]).filter(id=>idx[id]!=null);for(const n of nodes)n.ob=OBJ.includes(n.id);
  HQ={A:idx[m.hq.A],B:idx[m.hq.B]};
  HOMECOUNT={A:nodes.filter(n=>n.side==='A').length,B:nodes.filter(n=>n.side==='B').length};
  ARR=(m.arr||[]).map(a=>{const bt=BONUS[a.role]||BONUS.inc;return{n:a.n,sub:a.sub||'',role:a.role,b:bt.b,d:bt.d,at:a.at,ids:a.ids.filter(id=>idx[id]!=null&&nodes[idx[id]].type!=='bridge')};}).filter(a=>a.ids.length);
  for(const n of nodes)n.arr=-1;
  ARR.forEach((a,k)=>{a.ix=a.ids.map(id=>idx[id]);for(const i of a.ix)nodes[i].arr=k;});
  arrOwn=ARR.map(()=>null);
  EDADJ=nodes.map(()=>[]);for(const[a,b]of ED){EDADJ[idx[a]].push(idx[b]);EDADJ[idx[b]].push(idx[a]);}
  BAL.prodSide.A=m.prodA||1.04;
  {const h=DECS.B.find(d=>d.id==='paris');if(h)h.title=m.ev&&m.ev.help?m.ev.help.t:'Appeler des renforts';}
  computeTerritory();buildBg();terrDirty=true;adj=nodes.map(()=>new Set());
  setMapTexts();
}
/* ================= Couleurs ================= */
const css=getComputedStyle(document.documentElement);
const C={};for(const k of['ink','land','block','water','quay','park','text','muted','atk','def','neu','gold','line','good','soft'])C[k]=css.getPropertyValue('--'+k).trim();
const OC={A:C.atk,B:C.def,N:C.neu,X:'#555b63'};
const hexRGB=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
const RGB={A:hexRGB(C.atk),B:hexRGB(C.def),N:hexRGB(C.neu)};
const FD="'Saira Condensed','Arial Narrow',sans-serif",FB="'Barlow','Segoe UI',sans-serif";
const DEC=new Intl.NumberFormat(LOCALE).format(1.5).charAt(1);
const fr=(v,d=1)=>v.toFixed(d).replace('.',DEC);

/* ================= Territoire ================= */
const CS=6,GW=Math.ceil(W/CS),GH=Math.ceil(H/CS);
const comp=new Int16Array(GW*GH),cellNode=new Int16Array(GW*GH);
const isWater=(x,y,m)=>waterAt(MAP.water,x,y,m);
function computeTerritory(){
  comp.fill(-1);cellNode.fill(-1);
  for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const x=gx*CS+CS/2,y=gy*CS+CS/2;if(isWater(x,y))comp[gy*GW+gx]=-2;}
  let c=0;const st=[];
  for(let k=0;k<GW*GH;k++){if(comp[k]!==-1)continue;comp[k]=c;st.push(k);
    while(st.length){const p=st.pop(),px=p%GW,py=(p/GW)|0;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=px+dx,ny=py+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const q=ny*GW+nx;if(comp[q]===-1){comp[q]=c;st.push(q);}}}
    c++;}
  for(const n of nodes)n.comp=n.type==='bridge'?-3:comp[Math.max(0,Math.min(GH-1,(n.y/CS)|0))*GW+Math.max(0,Math.min(GW-1,(n.x/CS)|0))];
  for(let k=0;k<GW*GH;k++){if(comp[k]<0)continue;const x=(k%GW)*CS+CS/2,y=((k/GW)|0)*CS+CS/2;let best=-1,bd=330*330;
    for(const n of nodes){if(n.comp!==comp[k])continue;const d=(n.x-x)**2+(n.y-y)**2;if(d<bd){bd=d;best=n.i;}}cellNode[k]=best;}
  placeArrLabels();
}
const compAt=(x,y)=>(x<0||y<0||x>=W||y>=H)?-2:comp[((y/CS)|0)*GW+((x/CS)|0)];
const cellAt=(x,y)=>(x<0||y<0||x>=W||y>=H)?-1:cellNode[((y/CS)|0)*GW+((x/CS)|0)];
function placeArrLabels(){
  ARR.forEach((a,k)=>{if(a.at){a.lx=a.at[0];a.ly=a.at[1];return;}
    let cx=0,cy=0;for(const i of a.ix){cx+=nodes[i].x;cy+=nodes[i].y;}cx/=a.ix.length;cy/=a.ix.length;
    let best=null,bs=-1e9;
    for(let gy=2;gy<GH-2;gy+=2)for(let gx=2;gx<GW-2;gx+=2){const ni=cellNode[gy*GW+gx];if(ni<0||nodes[ni].arr!==k)continue;
      const x=gx*CS+CS/2,y=gy*CS+CS/2;if(x<100||x>W-100||y<40||y>H-40)continue;
      let md=1e9;for(const n of nodes){const d=Math.hypot((x-n.x)/2.6,(y+6-n.y)/1.15)-n.r*0.7;if(d<md)md=d;}
      const l=cellAt(x-62,y),r=cellAt(x+62,y);
      const sc=Math.min(md,55)+(l>=0&&nodes[l].arr===k?12:0)+(r>=0&&nodes[r].arr===k?12:0)-0.12*Math.hypot(x-cx,y-cy);
      if(sc>bs){bs=sc;best=[x,y];}}
    [a.lx,a.ly]=best||[cx,cy-30];});
}

/* ================= Fond de carte ================= */
const bg=document.createElement('canvas');
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};}
function strokePoly(g,p){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.stroke();}
function hashStr(s){let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))%2147483647;return h||1;}
function drawWater(g,wd,lw){lw=lw==null?1:lw;wd=wd||{};
  const sea=wd.sea||[],lakes=wd.lakes||[],rivers=wd.rivers||[],isl=wd.islands||[];
  g.save();g.lineCap='round';g.lineJoin='round';
  const poly=p=>{g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();};
  const ell=e=>{g.beginPath();g.ellipse(e[0],e[1],e[2],e[3],e[4]||0,0,Math.PI*2);};
  g.strokeStyle=C.quay;g.lineWidth=5*lw;
  for(const p of sea){poly(p);g.stroke();}for(const e of lakes){ell(e);g.stroke();}
  for(const r of rivers)if(r.pts.length>1){g.lineWidth=r.hw*2+5*lw;strokePoly(g,r.pts);}
  g.fillStyle=C.water;g.strokeStyle=C.water;
  for(const p of sea){poly(p);g.fill();}for(const e of lakes){ell(e);g.fill();}
  for(const r of rivers)if(r.pts.length>1){g.lineWidth=r.hw*2;strokePoly(g,r.pts);}
  if(lw>=1){g.strokeStyle='rgba(140,200,215,0.10)';g.lineWidth=2;g.setLineDash([14,18]);for(const r of rivers)if(r.pts.length>1)strokePoly(g,r.pts);g.setLineDash([]);}
  for(const e of isl){ell(e);g.strokeStyle=C.quay;g.lineWidth=5*lw;g.stroke();g.fillStyle=C.land;g.fill();}
  g.restore();}
function buildBg(){
  const s=innerWidth>900?2:1.3;bg.width=W*s;bg.height=H*s;const g=bg.getContext('2d');g.setTransform(s,0,0,s,0,0);
  const D=MAP.deco||{},R=rng(hashStr(MAP.id||MAP.name||'x'));
  const hills=D.hills||[],parks=D.parks||[];
  g.fillStyle=C.land;g.fillRect(0,0,W,H);
  for(const[hx,hy,rx,ry]of hills){const gr=g.createRadialGradient(hx,hy,0,hx,hy,rx);gr.addColorStop(0,'rgba(216,180,95,0.07)');gr.addColorStop(1,'rgba(216,180,95,0)');g.fillStyle=gr;g.fillRect(hx-rx,hy-ry*1.4,rx*2,ry*2.8);}
  drawWater(g,MAP.water);
  g.strokeStyle='rgba(216,180,95,0.11)';g.lineWidth=1;
  for(const[hx,hy,rx,ry]of hills)for(let k=1;k<=7;k++){const f=k/7;g.beginPath();let pen=false;
    for(let a=0;a<=64;a++){const t=a/64*Math.PI*2;const w=1+0.07*Math.sin(t*3+k)+0.05*Math.cos(t*5-k);const x=hx+Math.cos(t)*rx*f*w,y=hy+Math.sin(t)*ry*f*w;if(compAt(x,y)<0){pen=false;continue;}pen?g.lineTo(x,y):g.moveTo(x,y);pen=true;}g.stroke();}
  const[ccx,ccy]=D.center||[W/2,H/2],seed=hashStr(MAP.id||'');
  const cang=ci=>(((ci*7919+seed)%1000)/1000-0.5)*0.8;
  g.fillStyle=C.block;
  for(let y=-10;y<H+10;y+=19)for(let x=-10;x<W+10;x+=23){
    const jx=x+(R()-0.5)*4,jy=y+(R()-0.5)*4;const ci=compAt(jx,jy);if(ci<0)continue;
    if(isWater(jx,jy,13))continue;
    const dc=Math.hypot(jx-ccx,jy-ccy);const keep=dc<420?0.92:dc<650?0.7:0.45;if(R()>keep)continue;
    if(parks.some(e=>inEll(jx,jy,e,6)))continue;
    if(hills.some(([hx,hy,rx,ry])=>Math.hypot((jx-hx)/(rx*0.8),(jy-hy)/(ry*0.58))<1)&&R()<0.6)continue;
    g.save();g.translate(jx,jy);g.rotate(cang(ci)+0.2*Math.sin(jx*0.011+ci)+0.12*Math.cos(jy*0.013));const w=13+R()*6,h=10+R()*5;g.globalAlpha=0.55+R()*0.45;g.fillRect(-w/2,-h/2,w,h);g.restore();}
  g.globalAlpha=1;
  g.fillStyle=C.park;for(const e of parks){g.beginPath();g.ellipse(e[0],e[1],e[2],e[3],e[4]||0,0,Math.PI*2);g.fill();}
  g.fillStyle=C.water;for(const e of D.ponds||[]){g.beginPath();g.ellipse(e[0],e[1],e[2],e[3],e[4]||0,0,Math.PI*2);g.fill();}
  g.strokeStyle='rgba(232,227,216,0.22)';g.lineWidth=1.6;
  for(const r of D.rails||[]){
    strokePoly(g,r);for(let i=0;i<r.length-1;i++){const[ax,ay]=r[i],[bx,by]=r[i+1];const L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L;for(let d=5;d<L;d+=10){const x=ax+ux*d,y=ay+uy*d;if(compAt(x,y)<0)continue;g.beginPath();g.moveTo(x-uy*3,y+ux*3);g.lineTo(x+uy*3,y-ux*3);g.stroke();}}}
  g.textAlign='center';g.textBaseline='middle';
  for(const[t,x,y,a,st]of D.labels||[]){g.save();g.translate(x,y);g.rotate(a||0);
    if(st==='r'){g.font=`700 13px ${FD}`;g.fillStyle='rgba(150,205,220,0.75)';if('letterSpacing'in g)g.letterSpacing='6px';}
    else{g.font=`800 22px ${FD}`;g.fillStyle=st==='A'?'rgba(226,104,63,0.3)':st==='B'?'rgba(78,149,220,0.3)':'rgba(216,180,95,0.3)';if('letterSpacing'in g)g.letterSpacing='8px';}
    g.fillText(trad(t),0,1);g.restore();}
  if('letterSpacing'in g)g.letterSpacing='0px';
  g.fillStyle='rgba(216,180,95,0.42)';
  for(let k=0;k<GW*GH;k++){const ni=cellNode[k];if(ni<0)continue;const a=nodes[ni].arr,x=k%GW,y=(k/GW)|0;
    if(x+1<GW){const nj=cellNode[k+1];if(nj>=0&&nodes[nj].arr!==a&&comp[k+1]===comp[k]&&((x+y)&1))g.fillRect((x+1)*CS-1,y*CS,2,CS);}
    if(y+1<GH){const nj=cellNode[k+GW];if(nj>=0&&nodes[nj].arr!==a&&comp[k+GW]===comp[k]&&((x+y)&1))g.fillRect(x*CS,(y+1)*CS-1,CS,2);}}
  g.textAlign='center';g.textBaseline='middle';
  for(const a of ARR){if(a.lx==null)continue;g.font=`800 19px ${FD}`;if('letterSpacing'in g)g.letterSpacing='3px';g.fillStyle='rgba(216,180,95,0.38)';g.fillText(trad(a.n).toUpperCase(),a.lx,a.ly);
    g.font=`600 11px ${FB}`;if('letterSpacing'in g)g.letterSpacing='1px';g.fillStyle='rgba(216,180,95,0.32)';g.fillText(trad(a.sub),a.lx,a.ly+15);}
  if('letterSpacing'in g)g.letterSpacing='0px';
  g.save();g.translate(1545,180);g.fillStyle='rgba(232,227,216,0.5)';g.beginPath();g.moveTo(0,-22);g.lineTo(6,6);g.lineTo(0,1);g.lineTo(-6,6);g.closePath();g.fill();g.font=`700 13px ${FD}`;g.textAlign='center';g.fillText('N',0,-34);g.restore();
  g.save();g.translate(40,1040);g.strokeStyle='rgba(232,227,216,0.55)';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-5);g.lineTo(0,0);g.lineTo(125,0);g.lineTo(125,-5);g.moveTo(62.5,0);g.lineTo(62.5,-3);g.stroke();
  g.fillStyle='rgba(232,227,216,0.55)';g.font=`600 12px ${FB}`;g.textAlign='left';g.fillText('0',-3,16);g.textAlign='center';g.fillText('250',62.5,16);g.fillText('500 m',125,16);g.restore();
  g.strokeStyle='rgba(232,227,216,0.12)';g.lineWidth=2;g.strokeRect(1,1,W-2,H-2);
}
const terr=document.createElement('canvas');terr.width=GW;terr.height=GH;const tg=terr.getContext('2d');const timg=tg.createImageData(GW,GH);
let terrDirty=true;
function drawTerritory(){
  const d=timg.data;
  for(let k=0;k<GW*GH;k++){const ni=cellNode[k];const o=k*4;if(ni<0){d[o+3]=0;continue;}
    const own=nodes[ni].owner;const c=RGB[own]||RGB.N;let a=own==='N'?18:58;
    const x=k%GW,y=(k/GW)|0;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const nj=cellNode[ny*GW+nx];if(nj>=0&&nodes[nj].owner!==own){a=own==='N'?60:150;break;}}
    d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=a;}
  tg.putImageData(timg,0,0);terrDirty=false;
}

/* ================= État de partie ================= */
const SIM={on:false};
let player='A',ctrl={A:'human',B:'ai'},lvl={A:1,B:1},diff=1,fmtIdx=1,FMT=FORMATS[1];
let state='menu',paused=false,speed=1,ratio=0.5,menuOpen=false;
let time=0,squads=[],effects=[],sel=new Set(),selDead=-1,abMode=-1,sqId=0,truce=0,evClock=0,mods=[],pending=[],decP={A:null,B:null},series=[],seriesT=0,rallyT=0,alertT=0,alertCd={},drops=[],offerS={A:null,B:null},curPhase=1,prepDone=false;
let tut=-1,spectate=false,autoM={A:'off',B:'off'},autoT={A:0,B:0},autoB={A:false,B:false},autoBT={A:0,B:0},planned=[],floaters=[];
const NET={on:false,role:null,rs:new Set()};
let TEAM=false,mySec=0,aiSec={A:0,B:0},aiSecT={A:0,B:0},SECN={A:{1:'1',2:'2'},B:{1:'1',2:'2'}},secAx={A:null,B:null};
const P={};
const feeds={A:[],B:[]};
const enemyOf=s=>s==='A'?'B':'A';
const sideName=(s,pl)=>s==='A'?(pl?'attaquants':'Attaquants'):(pl?'défenseurs':'Défenseurs');
function newSide(s){const ab={};for(const a of ABL[s])ab[a.key]={u:a.cost===0?1:0,cd:0};
  return{cr:BAL.startCr[s],sup:BAL.startSup[s],score:0,pc:0,pcT:0,pcCaps:0,tech:{arm:0,pro:0,log:0,art:0,rec:0},res:null,ab,charges:2,dynCd:0,perm:{prod:1,inc:1,home:1},perk:{atk:1,speed:1,upkeep:1,build:1,research:1,rebuild:1},objCaps:0,perks:[],
  lost:0,caps:0,built:0,spent:0,nextDec:BAL.decFirst[s],taken:new Set(),aiClock:s==='A'?0:0.7,decisions:[]};}
function rebuildAdj(){adj=nodes.map(()=>new Set());for(const[a,b]of ED){const i=idx[a],j=idx[b];if(!nodes[i].alive||!nodes[j].alive)continue;adj[i].add(j);adj[j].add(i);}}
function reset(){
  for(const n of nodes){n.accS=0;n.accI=0;n.flT=Math.random()*5;n.flA=false;n.alive=true;n.hold=0;n.flash=0;n.st=null;n.lvl=0;n.bar=0;n.build=0;n.bbuild=0;n.fireT=1;n.sup=true;n.dis=0;n.rally=-1;n.sab=0;n.collapse=0;n.rebuild=null;
    if(n.side==='A'||n.side==='B'){n.owner=n.side;n.troops=n.type==='base'?BAL.start.base:BAL.start.home;}
    else{n.owner='N';n.troops=n.type==='bridge'?BAL.neutral.bridge:isObj(n)?BAL.neutral.obj:BAL.neutral.dist;}
    n.home=n.owner;}
  rebuildAdj();setupSectors();
  time=0;squads=[];effects=[];sel.clear();selDead=-1;abMode=-1;truce=0;evClock=BAL.evFirst;mods=[];pending=[];decP={A:null,B:null};series=[];seriesT=0;rallyT=0;alertT=0;alertCd={};drops=[];offerS={A:null,B:null};curPhase=1;prepDone=false;planned=[];floaters=[];
  autoM={A:'off',B:'off'};autoB={A:false,B:false};autoT={A:0,B:0};autoBT={A:0,B:0};
  P.A=newSide('A');P.B=newSide('B');
  feeds.A.length=0;feeds.B.length=0;if(!SIM.on)renderFeed();terrDirty=true;computeSupply();updWall();
}
const phaseAt=p=>p<=1?0:FMT.dur*BAL.phaseAt[p-2];
function phaseOf(t){return t<FMT.dur*BAL.phaseAt[0]?1:t<FMT.dur*BAL.phaseAt[1]?2:3;}

/* ---------- Modificateurs ---------- */
function addMod(s,stat,mult,t,label,good,extra){mods.push(Object.assign({s,stat,mult,t,T:t,label,good},extra||{}));}
function modOf(s,stat){let m=1;for(const x of mods)if(x.stat===stat&&(x.s===s||x.s==='*'))m*=x.mult;return m;}
function flag(stat,s){return mods.some(x=>x.stat===stat&&(!s||x.s===s||x.s==='*'));}
let wallCache={A:false,B:false},stretchF={A:1,B:1},army={A:0,B:0},arrOwn=ARR.map(()=>null);
const arrSum=(s,k)=>{let v=0;ARR.forEach((a,i)=>{if(arrOwn[i]===s&&a.b[k])v+=a.b[k];});return v;};
const upkMult=s=>{let m=P[s].perk.upkeep;ARR.forEach((a,i)=>{if(arrOwn[i]===s&&a.b.upk)m*=a.b.upk;});return m;};
function updArr(){ARR.forEach((ar,i)=>{const o=nodes[ar.ix[0]].owner;const w=(o==='A'||o==='B')&&ar.ix.every(k=>nodes[k].alive&&nodes[k].owner===o)?o:null;
    if(w!==arrOwn[i]&&!SIM.on&&state==='play'&&NET.role!=='guest'){if(w)log(MSG("Les {camp} tiennent tout l'arrondissement {arr} : {bonus}",{camp:sideName(w,1),arr:ar.n,bonus:ar.d}),w);else if(arrOwn[i])log(MSG('Les {camp} perdent le bonus {arr}',{camp:sideName(arrOwn[i],1),arr:ar.n}),arrOwn[i]);}arrOwn[i]=w;});}
function updWall(){updArr();let a=0,b=0;for(const n of nodes){if(!n.alive)continue;if(n.owner==='A')a++;else if(n.owner==='B')b++;}
  wallCache={A:a<HOMECOUNT.A*BAL.wall,B:b<HOMECOUNT.B*BAL.wall};
  stretchF={A:1/(1+BAL.stretch*Math.max(0,a-BAL.stretchFrom)),B:1/(1+BAL.stretch*Math.max(0,b-BAL.stretchFrom))};}
const aiF=s=>ctrl[s]==='ai'?DIFF[lvl[s]].prod:1;
const supF=s=>0.85+P[s].sup*0.003;
function addSup(s,d){P[s].sup=Math.max(0,Math.min(100,P[s].sup+d));}
const prodMult=s=>(P[s].cr<=0?BAL.unpaid:1)*stretchF[s]*(wallCache[s]?1.25:1)*BAL.prodSide[s]*aiF(s)*TV.rec[P[s].tech.rec]*supF(s)*P[s].perm.prod*modOf(s,'prod');
const incMult=s=>aiF(s)*P[s].perm.inc*modOf(s,'inc')*(P[s].tech.log>=2?1.1:1);
const atkMult=s=>TV.arm[P[s].tech.arm]*modOf(s,'atk')*P[s].perk.atk;
const speedMult=s=>TV.log[P[s].tech.log]*modOf(s,'speed')*P[s].perk.speed;
const active=(n,k)=>n.st===k&&n.build<=0;
const occupied=n=>(n.home==='A'||n.home==='B')&&n.owner!==n.home&&(n.owner==='A'||n.owner==='B');
const mineN=n=>n.owner==='A'||n.owner==='B';
/* ---------- 2 contre 2 : secteurs de commandement ---------- */
function setupSectors(){
  secAx={A:null,B:null};SECN={A:{1:'1',2:'2'},B:{1:'1',2:'2'}};
  for(const n of nodes){n.sec=0;n.secOwner=n.owner;}
  if(!TEAM)return;
  for(const s of['A','B']){const q=qgOf(s),e=qgOf(enemyOf(s));if(!q||!e)continue;
    let dx=e.x-q.x,dy=e.y-q.y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;const px=-dy,py=dx;
    const list=nodes.filter(n=>n.home===s&&n.type!=='base');
    const pr=list.map(n=>(n.x-q.x)*px+(n.y-q.y)*py).sort((a,b)=>a-b);
    const mid=pr.length?(pr[Math.floor((pr.length-1)/2)]+pr[Math.ceil((pr.length-1)/2)])/2:0;
    secAx[s]={qx:q.x,qy:q.y,px,py,mid};
    for(const n of list){n.sec=secByPos(s,n);n.secOwner=s;}
    const c={1:[0,0,0],2:[0,0,0]};for(const n of list){const k=c[n.sec];k[0]+=n.x;k[1]+=n.y;k[2]++;}
    const m1=[c[1][0]/(c[1][2]||1),c[1][1]/(c[1][2]||1)],m2=[c[2][0]/(c[2][2]||1),c[2][1]/(c[2][2]||1)];
    if(Math.abs(m1[1]-m2[1])>=Math.abs(m1[0]-m2[0]))SECN[s]=m1[1]<m2[1]?{1:'nord',2:'sud'}:{1:'sud',2:'nord'};
    else SECN[s]=m1[0]<m2[0]?{1:'ouest',2:'est'}:{1:'est',2:'ouest'};}
}
function secByPos(s,n){const a=secAx[s];if(!a)return 1;const v=(n.x-a.qx)*a.px+(n.y-a.qy)*a.py;return v<=a.mid?1:2;}
function secOf(n){if(!TEAM||!n||n.type==='base'||!(n.owner==='A'||n.owner==='B'))return 0;if(n.secOwner!==n.owner||!(n.sec===1||n.sec===2)){n.sec=secByPos(n.owner,n);n.secOwner=n.owner;}return n.sec;}
function canCmd(side,sec,n){if(!n||!n.alive||n.owner!==side)return false;if(!TEAM||!sec)return true;const k=secOf(n);return !k||k===sec;}
const myCmd=n=>canCmd(player,mySec,n);
const isMulti=()=>mode==='local'||mode==='online';
function resetTeam(){TEAM=false;mySec=0;aiSec={A:0,B:0};}

function capOf(n){return n.cap+(active(n,'caserne')?STV.caserne.cap[n.lvl-1]:0);}
function prodOf(n){
  if(!n.sup||!mineN(n)||n.dis>0)return 0;
  let p=n.prod*prodMult(n.owner)*(occupied(n)?BAL.occProd:1);
  if(active(n,'caserne'))p*=STV.caserne.prod[n.lvl-1];
  let dep=0;for(const j of adj[n.i]){const m=nodes[j];if(m.owner===n.owner&&active(m,'depot')&&m.sup)dep=Math.max(dep,STV.depot.adj[m.lvl-1]);}
  return p*(1+dep)+(n.type==='base'?arrSum(n.owner,'qg'):0);
}
function incOf(n){
  if(!n.sup||!mineN(n))return 0;
  return (n.inc+(active(n,'depot')?STV.depot.inc[n.lvl-1]:0))*incMult(n.owner)*(occupied(n)?BAL.occInc:1);
}
function defMult(n){
  let m=n.def;const s=n.owner;
  if(mineN(n)){
    m*=BAL.defSide[s]*TV.pro[P[s].tech.pro];
    if(active(n,'fortin'))m*=STV.fortin.def[n.lvl-1];
    if(n.bar>0&&n.bbuild<=0)m*=STV.bar.def[n.bar-1];
    if(n.hold>0)m*=1.6;
    if(!n.sup)m*=BAL.cutDef;
    if(n.home===s)m*=P[s].perm.home*BAL.homeDef;
    if(wallCache[s])m*=1.15;
    if(n.dis>0)m*=BAL.disDef;
    m*=modOf(s,'def');
  }
  return m;
}

/* ---------- Ravitaillement ---------- */
function computeSupply(){
  for(const n of nodes)n.sup=true;
  for(const s of['A','B']){
    const q=[],seen=new Uint8Array(N);
    for(const n of nodes)if(n.alive&&n.owner===s&&n.sab<=0&&(n.type==='base'||isObj(n))){seen[n.i]=1;q.push(n.i);}
    while(q.length){const u=q.pop();for(const v of adj[u])if(!seen[v]&&nodes[v].owner===s&&nodes[v].sab<=0){seen[v]=1;q.push(v);}}
    for(const n of nodes)if(n.owner===s)n.sup=!!seen[n.i];
  }
}

/* ---------- Chemins & envois ---------- */
function path(a,b){
  const dist=new Array(N).fill(Infinity),prev=new Array(N).fill(-1),done=new Uint8Array(N);dist[a]=0;
  for(;;){let u=-1,bd=Infinity;for(let i=0;i<N;i++)if(!done[i]&&dist[i]<bd){bd=dist[i];u=i;}if(u<0||u===b)break;done[u]=1;
    for(const v of adj[u]){const nd=dist[u]+elen(u,v);if(nd<dist[v]){dist[v]=nd;prev[v]=u;}}}
  if(dist[b]===Infinity)return null;const p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p;
}
function dispatch(src,p,amount,sec){
  if(truce>0||time<BAL.prep)return false;
  amount=Math.floor(Math.min(amount,src.troops));if(amount<1||!p||p.length<2)return false;
  const sq=TEAM?(secOf(src)||sec||0):0;src.troops-=amount;squads.push({id:sqId++,owner:src.owner,n:amount,path:p,seg:0,d:0,sec:sq});return true;
}
function sendSelection(target){
  const from=[...sel].filter(i=>{const s=nodes[i];return s!==target&&myCmd(s);});
  if(!from.length)return 0;
  act('send',{f:from,t:target.i,r:ratio});tutFlag.sent=true;
  if(time>=BAL.prep&&truce<=0)effects.push({type:'ping',x:target.x,y:target.y,t:0,c:OC[player]});
  return from.length;
}
function doSend(side,from,ti,r,sec){
  const target=nodes[ti];if(!target||!target.alive)return 0;
  if(time<BAL.prep||mode==='local'){let k=0;for(const i of from){const s=nodes[i];if(s===target||!canCmd(side,sec,s))continue;planned=planned.filter(p=>p.from!==i);planned.push({s:side,from:i,to:ti,ratio:r,sec:sec||0});k++;}
    if(k)log(MSG(k>1?'Attaque planifiée : {n} points vers {cible} ({pct} %), {quand}':'Attaque planifiée : {n} point vers {cible} ({pct} %), {quand}',{n:k,cible:target.name,pct:Math.round(r*100),quand:time<BAL.prep?'lancée à la fin de la préparation':'lancée au début de la manche'}),side,ti,side);return 0;}
  if(truce>0){log('Cessez-le-feu : aucun envoi possible','X',undefined,side);return 0;}
  let sent=0;
  for(const i of from){const s=nodes[i];if(s===target||!canCmd(side,sec,s))continue;const amt=Math.floor(s.troops*r);if(amt<1)continue;const p=path(s.i,target.i);if(dispatch(s,p,amt,sec))sent+=amt;}
  return sent;
}
function setRally(target){const from=[...sel].filter(i=>myCmd(nodes[i])&&i!==target.i);if(!from.length)return;act('rally',{f:from,t:target.i});tutFlag.rally=true;}
function doRally(side,from,ti,sec){const target=nodes[ti];if(!target||!target.alive)return false;let k=0;for(const i of from){const n=nodes[i];if(!canCmd(side,sec,n)||n===target)continue;n.rally=ti;k++;}
  if(k)log(MSG(k>1?'Route permanente : {n} points vers {cible}':'Route permanente : {n} point vers {cible}',{n:k,cible:target.name}),side,ti,side);return k>0;}
function clearRally(){act('unrally',{f:sel.size?[...sel]:null});}
function doUnrally(side,from,sec){let k=0;const list=(from?from.map(i=>nodes[i]):nodes).filter(n=>canCmd(side,sec,n));
  for(const n of list){if(n.rally>=0){n.rally=-1;k++;}const b=planned.length;planned=planned.filter(p=>!(p.from===n.i&&p.s===side));k+=b-planned.length;}
  if(k)log(MSG(k>1?'{n} routes arrêtées':'{n} route arrêtée',{n:k}),side,undefined,side);return k>0;}
/* ---------- Ordres : un seul point d'entrée (local, hôte ou invité en ligne) ---------- */
function act(kind,a){if(isLocked())return false;if(NET.role==='guest'){netCmd(kind,a||{});return true;}return applyAct(player,kind,a||{},mySec,mySeat());}
function applyAct(side,kind,a,sec,seat){
  if(!a||typeof a!=='object')return false;sec=TEAM?(sec|0):0;
  const nd=i=>Number.isInteger(i)&&i>=0&&i<N?nodes[i]:null;
  const list=v=>Array.isArray(v)?v.filter(i=>Number.isInteger(i)&&i>=0&&i<N).slice(0,80):[];
  switch(kind){
    case 'send':{const r=[0.25,0.5,0.75,1].includes(a.r)?a.r:0.5;return nd(a.t)?doSend(side,list(a.f),a.t,r,sec):false;}
    case 'rally':return nd(a.t)?doRally(side,list(a.f),a.t,sec):false;
    case 'unrally':return doUnrally(side,a.f==null?null:list(a.f),sec);
    case 'build':{const n=nd(a.n);return n&&own(ST,a.k)&&canCmd(side,sec,n)?doBuild(side,n,a.k):false;}
    case 'cede':{const n=nd(a.n);if(!TEAM||!n||!sec||!canCmd(side,sec,n)||secOf(n)!==sec)return false;n.sec=3-sec;n.secOwner=n.owner;n.rally=-1;planned=planned.filter(p=>p.from!==n.i);log(MSG('{nom} confié au secteur {secteur}',{nom:n.name,secteur:SECN[side][3-sec]}),side,n.i,side);return true;}
    case 'res':return own(TECH,a.k)?startResearch(side,a.k):false;
    case 'unlock':return Number.isInteger(a.i)&&ABL[side][a.i]?unlockAbility(side,a.i):false;
    case 'ab':return Number.isInteger(a.i)&&ABL[side][a.i]?useAbility(side,a.i,nd(a.n)):false;
    case 'dyn':return useDyn(side,nd(a.n));
    case 'rebuild':return startRebuild(side,nd(a.n));
    case 'dec':{const dp=decP[side];if(!dp||!dp.ids.includes(a.id))return false;const d=DECS[side].find(x=>x.id===a.id);if(!d)return false;takeDecision(side,d);decP[side]=null;return true;}
    case 'decskip':decP[side]=null;return true;
    case 'offer':{const of=offerS[side];if(!of)return false;const o=OFFERS[of.key];if(P[side].cr<o.cost)return false;P[side].cr-=o.cost;o.apply(side);log(MSG('Offre acceptée : {offre}',{offre:of.key==='marchand'?'armes du marchand':'ingénieurs'}),side,undefined,side);offerS[side]=null;return true;}
    case 'auto':{if(isMulti()||!['off','def','atk'].includes(a.m))return false;autoM[side]=a.m;log(a.m==='off'?'Mode manuel':a.m==='def'?'Défense automatique : vos points tiennent le front':'Attaque automatique : vos points attaquent les cibles faibles',side,undefined,side);return true;}
    case 'autob':if(isMulti())return false;autoB[side]=!!a.v;log(a.v?'Améliorations automatiques activées':'Améliorations manuelles',side,undefined,side);return true;
    case 'vote':return voteStart(seat,a);
    case 'ballot':return voteCast(seat,a);
  }
  return false;
}

function floatAt(n,txt,col){if(SIM.on)return;if(NET.role==='host')netEv(['f',n.i,txt,col,'']);pushFloat(n.i,txt,col);}
function prodFloat(n,txt,col){if(NET.role==='host'&&NET.rs.has(n.owner))netEv(['f',n.i,txt,col,n.owner]);if(NET.role!=='host'||n.owner===player)pushFloat(n.i,txt,col);}
function pushFloat(i,txt,col){floaters.push({n:i,txt:tx(txt),col,t:0,dur:2.2});if(floaters.length>60)floaters.shift();}
/* ---------- Journal ---------- */
const feedEl=document.getElementById('feed');
function log(msg,cls,node,aud){if(SIM.on)return;
  if(NET.role==='host'&&(aud==null||NET.rs.has(aud)))netEv(['l',msg,cls||'',node==null?-1:node,aud||'']);
  pushFeed(msg,cls,node,aud);}
function pushFeed(msg,cls,node,side){const it={msg,cls,t:time,node:node==null||node<0?undefined:node};for(const s of side==='A'||side==='B'?[side]:['A','B']){feeds[s].unshift(it);if(feeds[s].length>6)feeds[s].pop();}renderFeed();}
function renderFeed(){feedEl.innerHTML='';for(const f of(feeds[player]||feeds.A)){let d;
  if(f.node!=null){d=document.createElement('button');d.textContent=tx(f.msg);const sm=document.createElement('small');sm.textContent=trad('Voir');d.appendChild(sm);d.onclick=()=>centerOn(nodes[f.node]);}
  else{d=document.createElement('div');d.textContent=tx(f.msg);}
  d.className=f.cls;feedEl.appendChild(d);}}

/* ---------- Combat ---------- */
function capture(n,prev,by){
  terrDirty=true;P[by].caps++;n.hold=0;n.bar=0;n.bbuild=0;n.dis=BAL.disT;n.rally=-1;n.sab=0;
  if(n.st){if(n.build>0){n.st=null;n.lvl=0;n.build=0;}else n.lvl=1;}
  if(isObj(n)||n.type==='base'){addSup(by,5);if(prev==='A'||prev==='B')addSup(prev,-5);}
  if(isObj(n)){P[by].objCaps++;if(P[by].pcCaps<BAL.pcCapMax){P[by].pc++;P[by].pcCaps++;}}
  effects.push({type:'ring',x:n.x,y:n.y,t:0,c:OC[by]});
  if(prev===player&&sel.has(n.i))sel.delete(n.i);
  if(isObj(n)||n.type!=='dist'||prev!=='N'||n.st)log(MSG(prev==='N'?'{nom} pris par les {camp}':'{nom} arraché par les {camp}',{nom:n.name,camp:sideName(by,1)}),by,isObj(n)?n.i:undefined);
  if(n.type==='base'&&n.home!==by)endGame(by,MSG('Le QG adverse ({nom}) est tombé.',{nom:n.name}),'qg');
}
function arrive(s,n){
  if(!n.alive){P[s.owner].lost+=s.n;return;}
  n.flash=1;
  if(n.owner===s.owner){n.troops+=s.n;return;}
  const atk=atkMult(s.owner);let m=defMult(n);if(n.owner==='N')m*=modOf(s.owner,'neutralDef');
  const power=s.n*atk,defU=n.troops*m,prev=n.owner;
  if(power>defU){if(prev!=='N')P[prev].lost+=n.troops;P[s.owner].lost+=defU/atk;n.owner=s.owner;n.troops=(power-defU)/atk;if(TEAM){n.sec=s.sec||secByPos(s.owner,n);n.secOwner=s.owner;}capture(n,prev,s.owner);computeSupply();}
  else{P[s.owner].lost+=s.n;if(prev!=='N')P[prev].lost+=power/m;n.troops=Math.max(0,n.troops-power/m);}
}

/* ---------- Constructions & recherche ---------- */
const nextLvl=(n,k)=>k==='bar'?n.bar:(n.st===k?n.lvl:0);
function buildCost(n,k){if(k!=='bar'&&n.st&&n.st!==k)return null;const lv=nextLvl(n,k);return lv>=2?null:ST[k].c[lv];}
function buildPhase(n,k){const lv=nextLvl(n,k);return lv>=2?null:ST[k].ph[lv];}
function canBuild(s,n,k){
  if(!n||!n.alive||n.owner!==s||!n.sup)return false;
  if(ST[k].noBridge&&n.type==='bridge')return false;
  if(k==='bar'){if(n.bbuild>0)return false;}else if(n.build>0)return false;
  const ph=buildPhase(n,k);if(ph==null||curPhase<ph)return false;
  const c=buildCost(n,k);return c!=null&&P[s].cr>=c;
}
function doBuild(s,n,k){
  if(!canBuild(s,n,k))return false;const c=buildCost(n,k);P[s].cr-=c;P[s].spent+=c;P[s].built++;
  if(k==='bar'){n.bar++;n.bbuild=ST.bar.t[n.bar-1];}
  else{const up=n.st===k;n.st=k;n.lvl=up?2:1;n.build=ST[k].t[n.lvl-1];if(k==='mortier')n.fireT=1;}
  effects.push({type:'ring',x:n.x,y:n.y,t:0,c:C.gold});if(s===player)tutFlag.built=true;
  return true;
}
const techAvail=(k,lv)=>lv<2&&curPhase>=TECH[k].lv[lv].ph;
function startResearch(s,k){
  const p=P[s];if(p.res)return false;const lv=p.tech[k];if(!techAvail(k,lv))return false;const L=TECH[k].lv[lv];if(p.cr<L.c)return false;
  p.cr-=L.c;p.spent+=L.c;p.res={k,t:L.t,T:L.t};if(s===player)tutFlag.research=true;return true;
}
const rbCost=s=>Math.round(BAL.rebuildCost*P[s].perk.rebuild),rbTime=s=>Math.round(BAL.rebuildT*P[s].perk.rebuild);
function canRebuild(s,n){return n&&!n.alive&&n.type==='bridge'&&!n.rebuild&&EDADJ[n.i].some(j=>nodes[j].alive&&nodes[j].owner===s)&&P[s].cr>=rbCost(s);}
function startRebuild(s,n){if(!canRebuild(s,n))return false;const c=rbCost(s);P[s].cr-=c;P[s].spent+=c;n.rebuild={s,t:rbTime(s),T:rbTime(s)};log(MSG('Reconstruction du {nom} lancée par les {camp}',{nom:n.name,camp:sideName(s,1)}),s,n.i);return true;}

/* ---------- Capacités ---------- */
function abBlock(side,i){
  const a=ABL[side][i];
  if(time<BAL.prep)return trad('Après la préparation');
  if(a.key==='bombard'&&flag('fog'))return trad('Brouillard');
  if(a.key==='bombard'&&flag('nobomb',side))return trad('Couloirs humanitaires');
  if((a.key==='bombard'||a.key==='sabotage')&&truce>0)return trad('Cessez-le-feu');
  if(a.key==='renforts'&&(!qgOf(side)||qgOf(side).owner!==side))return trad('QG perdu');
  return null;
}
function abReady(side,i){const a=ABL[side][i],st=P[side].ab[a.key];return !!st.u&&st.cd<=0&&!abBlock(side,i);}
function canUnlock(side,i){const a=ABL[side][i],st=P[side].ab[a.key];return !st.u&&P[side].pc>=a.cost&&curPhase>=a.ph;}
function unlockAbility(side,i){if(!canUnlock(side,i))return false;const a=ABL[side][i];P[side].pc-=a.cost;P[side].ab[a.key].u=1;if(ctrl[side]==='human')log(MSG('Capacité débloquée : {nom}',{nom:a.name}),side,undefined,side);if(side===player)tutFlag.unlock=true;return true;}
function validTarget(side,i,n){const t=ABL[side][i].target;if(!n||!n.alive)return false;
  if(t==='enemy')return n.owner!==side;if(t==='enemyOwned')return n.owner===enemyOf(side);if(t==='own')return n.owner===side;if(t==='bridge')return n.type==='bridge';return true;}
function useAbility(side,i,n){
  if(!abReady(side,i))return false;const a=ABL[side][i];
  if(a.target&&!validTarget(side,i,n))return false;
  switch(a.key){
    case 'renforts':{const b=qgOf(side);b.troops+=25;floatAt(b,'+25 sold.',C.gold);effects.push({type:'ring',x:b.x,y:b.y,t:0,c:C.gold});log('Renforts arrivés au QG : +25 soldats',side);break;}
    case 'marche':addMod(side,'speed',1.5,25,'Marche forcée',1);log('Marche forcée : vos colonnes accélèrent',side);break;
    case 'assaut':addMod(side,'atk',1.3,25,'Assaut général',1);log('Assaut général : attaque +30 %',side);break;
    case 'ligne':addMod(side,'def',1.3,25,'Ligne de résistance',1);log('Ligne de résistance : défense +30 %',side);break;
    case 'barrages':addMod(enemyOf(side),'speed',0.6,25,'Barrages routiers');log('Barrages routiers : les colonnes ennemies ralentissent',side);break;
    case 'mobil':{for(const m of nodes)if(m.alive&&m.owner===side&&m.home===side){m.troops+=3;floatAt(m,'+3',C.gold);}log('Mobilisation civile : +3 soldats sur vos points d\'origine',side);break;}
    case 'bombard':{const f=P[side].tech.art>=2?0.5:0.35;const lost=n.troops*f;n.troops-=lost;if(mineN(n))P[n.owner].lost+=lost;addSup(side,-2);
      for(let k=0;k<6;k++)effects.push({type:'boom',x:n.x+(Math.random()-0.5)*40,y:n.y+(Math.random()-0.5)*40,t:-k*0.08,c:OC[side]});log(MSG('Bombardement sur {nom}',{nom:n.name}),side,n.i);break;}
    case 'sabotage':n.sab=30;computeSupply();effects.push({type:'ring',x:n.x,y:n.y,t:0,c:C.gold});log(MSG('Sabotage : {nom} coupé de son ravitaillement',{nom:n.name}),side,n.i);break;
    case 'hold':n.hold=30;effects.push({type:'ring',x:n.x,y:n.y,t:0,c:C.gold});log(MSG('{nom} tient la position',{nom:n.name}),side);break;
  }
  P[side].ab[a.key].cd=a.cd;
  if(side===player)tutFlag.ability=true;
  return true;
}
function dynBlock(s){if(time<BAL.prep)return trad('Après la préparation');if(P[s].charges<=0)return trad('Plus de charges');if(P[s].dynCd>0)return trad('Prête dans {n} s',{n:Math.ceil(P[s].dynCd)});if(truce>0)return trad('Cessez-le-feu');return null;}
function useDyn(s,n){if(dynBlock(s)||!n||!n.alive||n.type!=='bridge')return false;P[s].charges--;P[s].dynCd=45;blowBridge(n,MSG('{nom} dynamité par les {camp}',{nom:n.name,camp:sideName(s,1)}));if(s===player)tutFlag.ability=true;return true;}
function blowBridge(n,how){
  n.alive=false;if(mineN(n))P[n.owner].lost+=n.troops;n.troops=0;n.owner='X';n.st=null;n.bar=0;n.rally=-1;n.collapse=0;n.rebuild=null;n.hold=0;n.sab=0;
  for(const j of adj[n.i])adj[j].delete(n.i);adj[n.i].clear();
  for(const m of nodes)if(m.rally===n.i)m.rally=-1;
  squads=squads.filter(s=>{const a=s.path[s.seg],b=s.path[s.seg+1];if(a===n.i||b===n.i){P[s.owner].lost+=s.n;return false;}return true;});
  sel.delete(n.i);drops=drops.filter(d=>d.n!==n.i);terrDirty=true;computeSupply();
  for(let i=0;i<9;i++)effects.push({type:'boom',x:n.x+(Math.random()-0.5)*30,y:n.y+(Math.random()-0.5)*30,t:-i*0.06,c:C.gold});
  log(how,'X',n.i);
}

/* ---------- Événements aléatoires ---------- */
function strength(s){let t=P[s].cr*0.3+P[s].score*0.5;for(const n of nodes)if(n.alive&&n.owner===s)t+=n.troops;for(const q of squads)if(q.owner===s)t+=q.n;return t;}
const behind=()=>strength('A')<strength('B')?'A':'B';
const pickR=a=>a[(Math.random()*a.length)|0];
function keyNode(s){const own=nodes.filter(n=>n.alive&&n.owner===s);if(!own.length)return null;
  const pref=own.filter(n=>n.type==='base'||isObj(n));const L=pref.length?pref:own;return L.reduce((a,b)=>a.troops<b.troops?a:b);}
const OFFERS={
  marchand:{cost:80,label:'Acheter (80)',apply(s){addMod(s,'atk',1.2,60,'Armes du marchand',1);}},
  ingenieurs:{cost:60,label:'Engager (60)',apply(s){addMod(s,'buildSpeed',2,60,'Ingénieurs',1);}}
};
function makeOffer(key){for(const s of['A','B']){const o=OFFERS[key];if(ctrl[s]==='ai'){if(P[s].cr>=o.cost+80&&Math.random()<0.7){P[s].cr-=o.cost;o.apply(s);}}else offerS[s]={key,t:mode==='local'?turn.R+15:20};}}
const EVENTS=[
  {id:'greve',w:1,title:'Grève',run(){this.title=MAP.ev&&MAP.ev.greve||'Grève des transports';addMod('*','speed',0.7,45,this.title);return 'Tous les déplacements sont ralentis de 30 % pendant 45 s.';}},
  {id:'crue',w:1,title:'Crue',cond:()=>nodes.some(n=>n.type==='bridge'&&n.alive),run(){const rivs=[...new Set(nodes.filter(n=>n.type==='bridge'&&n.alive).map(n=>n.river))];const r=pickR(rivs);const nm=(MAP.deco&&MAP.deco.names||{})[r];
    this.title=nm?nm[0]:MSG('Crue {de}',{de:deOf(r),riviere:r});addMod('*','crue',1,40,this.title,0,{river:r});return nm?nm[1]:MSG('Les ponts {de} sont submergés : traversées très ralenties pendant 40 s.',{de:deOf(r),riviere:r});}},
  {id:'brouillard',w:0.9,title:'Brouillard sur la ville',run(){addMod('*','fog',1,35,'Brouillard');return 'Mortiers et bombardements sont aveugles pendant 35 s.';}},
  {id:'fragile',w:1,cond:()=>nodes.some(n=>n.type==='bridge'&&n.alive&&!n.collapse),title:'Pont fragilisé',run(){const n=pickR(nodes.filter(n=>n.type==='bridge'&&n.alive&&!n.collapse));n.collapse=25;return MSG("Le {nom} menace de s'effondrer dans 25 s. Tout ce qui s'y trouvera sera perdu.",{nom:n.name});},node:true},
  {id:'largage',w:1.1,title:'Largage de ravitaillement',run(){const pool=nodes.filter(n=>n.alive&&(isObj(n)||n.side==='N'));const n=pickR(pool);drops.push({n:n.i,t:40});return MSG('Une cargaison tombe sur {nom}. Le camp qui tiendra ce point dans 40 s gagne 120 de ravitaillement et 1 PC.',{nom:n.name});}},
  {id:'soulevement',w:1,cond:()=>nodes.some(occupied),title:'Soulèvement',run(){const n=pickR(nodes.filter(occupied));const o=n.owner,l=n.troops*0.5;n.troops-=l;P[o].lost+=l;
    if(n.troops<8){const h=n.home;n.owner=h;n.troops=10;n.dis=10;n.rally=-1;n.bar=0;terrDirty=true;sel.delete(n.i);computeSupply();return MSG("{nom} se soulève contre l'occupant et revient aux {camp}.",{nom:n.name,camp:sideName(h,1)});}
    return MSG("La population de {nom} se soulève : l'occupant y perd la moitié de ses hommes.",{nom:n.name});}},
  {id:'incendie',w:0.9,cond:()=>nodes.some(n=>n.alive&&mineN(n)&&n.type==='dist'),title:'Incendie',run(){const n=pickR(nodes.filter(n=>n.alive&&mineN(n)&&n.type==='dist'));const l=n.troops*0.3;n.troops-=l;P[n.owner].lost+=l;n.dis=20;return MSG('Un incendie ravage {nom} : garnison −30 %, production arrêtée 20 s.',{nom:n.name});}},
  {id:'defection',w:0.9,title:'Défection',run(){const s=P.A.sup<P.B.sup?'A':P.B.sup<P.A.sup?'B':pickR(['A','B']);const e=enemyOf(s);
    const src=nodes.filter(n=>n.alive&&n.owner===s&&n.troops>=20&&[...adj[n.i]].some(j=>nodes[j].owner===e));if(!src.length)return 'Une compagnie hésite à changer de camp, puis se ravise.';
    const n=pickR(src),dst=nodes[[...adj[n.i]].find(j=>nodes[j].owner===e)];n.troops-=10;dst.troops+=10;return MSG("Démoralisés, 10 soldats des {camp} passent à l'ennemi depuis {nom}.",{camp:sideName(s,1),nom:n.name});}},
  {id:'marchand',w:0.9,title:"Marchand d'armes",run(){makeOffer('marchand');return 'Un trafiquant propose des armes aux deux camps : 80 de ravitaillement pour +20 % d\'attaque pendant 60 s.';},offer:'marchand'},
  {id:'ingenieurs',w:0.8,title:'Ingénieurs suisses',run(){makeOffer('ingenieurs');return 'Une équipe du génie offre ses services : 60 de ravitaillement pour des chantiers deux fois plus rapides pendant 60 s.';},offer:'ingenieurs'},
  {id:'match',w:0.7,title:'Soir de match',cond:()=>!!(MAP.ev&&MAP.ev.match&&MAP.ev.match.ids.some(id=>idx[id]!=null)),run(){const m=MAP.ev.match;this.title=m.title;addMod('*','slow',1,45,'Soir de match',0,{nodes:m.ids.filter(id=>idx[id]!=null).map(id=>idx[id])});return MSG('Supporters dans les rues : {lieux} sont deux fois plus lents à traverser pendant 45 s.',{lieux:m.text});}},
  {id:'neige',w:0.7,title:'Neige',run(){this.title=MSG('Neige sur {ville}',{ville:MAP.name});addMod('*','speed',0.75,50,'Neige');addMod('*','prod',0.9,50,'Neige');return 'Les rues sont blanches : déplacements −25 % et production −10 % pour tous pendant 50 s.';}},
  {id:'vogue',w:0.7,cond:()=>{const f=MAP.ev&&MAP.ev.fete;return !!(f&&idx[f.node]!=null&&mineN(nodes[idx[f.node]]));},title:'Fête',run(){const f=MAP.ev.fete;this.title=f.title;const o=nodes[idx[f.node]].owner;addSup(o,6);P[o].cr+=60;return MSG('{fete} profite aux {camp} : soutien +6 et 60 de ravitaillement.',{fete:f.text,camp:sideName(o,1)});}},
  {id:'canuts',w:0.6,cond:()=>{const f=MAP.ev&&MAP.ev.riot;return !!(f&&idx[f.node]!=null&&mineN(nodes[idx[f.node]]));},title:'Révolte',run(){
    const f=MAP.ev.riot;this.title=f.title;const n=nodes[idx[f.node]],o=n.owner,l=n.troops*0.5;n.troops-=l;P[o].lost+=l;
    if(n.troops<8){n.owner='N';n.troops=14;n.st=null;n.lvl=0;n.bar=0;n.rally=-1;terrDirty=true;sel.delete(n.i);computeSupply();return MSG('{nom} se soulève et chasse les {camp}. Le quartier redevient neutre.',{nom:n.name,camp:sideName(o,1)});}
    return MSG('{nom} se soulève : les {camp} y perdent la moitié de leurs hommes.',{nom:n.name,camp:sideName(o,1)});}},
  {id:'convoi',w:0.8,title:'Convoi de ravitaillement',run(){const s=behind();P[s].cr+=80;return MSG('Un convoi rejoint les {camp} : +80 ravitaillement.',{camp:sideName(s,1)});}},
  {id:'lumieres',w:0.6,title:'Fête',run(){const f=MAP.ev&&MAP.ev.party||{title:'Fête de la musique',text:'La ville danse dans les rues'};this.title=f.title;addMod('*','prod',1.3,35,f.title,1);addSup('A',4);addSup('B',4);return MSG('{fete} : production +30 % pour tous pendant 35 s.',{fete:f.text});}},
  {id:'panne',w:0.8,title:'Panne de courant',run(){addMod('*','inc',0.5,35,'Panne de courant');return 'La ville est plongée dans le noir : ravitaillement −50 % pour tous pendant 35 s.';}},
  {id:'desertion',w:1.2,cond:()=>P.A.sup<35||P.B.sup<35,title:'Désertions',run(){const s=P.A.sup<P.B.sup?'A':'B';let l=0;for(const n of nodes)if(n.alive&&n.owner===s){const d=n.troops*0.15;n.troops-=d;l+=d;}P[s].lost+=l;return MSG("Le moral s'effondre chez les {camp} : {n} soldats désertent.",{camp:sideName(s,1),n:Math.round(l)});}},
  {id:'presse',w:0.7,title:'Scandale dans la presse',run(){const s=pickR(['A','B']);addSup(s,-10);return MSG('Révélations dans {journal} : une bavure des {camp} fait chuter leur soutien de 10.',{journal:MAP.ev&&MAP.ev.paper||'la presse locale',camp:sideName(s,1)});}},
  {id:'orage',w:0.7,title:'Orage',run(){this.title=MSG('Orage sur {ville}',{ville:MAP.name});addMod('*','atk',0.85,30,'Orage');return 'Visibilité nulle : attaque −15 % pour tous pendant 30 s.';}}
];
let bannerT=0;
function announce(lab,title,text,offerKey){
  const mine=offerKey&&offerS[player]&&offerS[player].key===offerKey&&ctrl[player]==='human';
  showBanner(lab,title,text,mine?OFFERS[offerKey].label:null);
  if(NET.role==='host')netEv(['b',lab,title,text,offerKey||'']);
}
function showBanner(lab,title,text,btn){if(SIM.on)return;$('bnL').textContent=tx(lab);$('bnT').textContent=tx(title);$('bnX').textContent=tx(text);banner.hidden=false;bannerT=btn?20:8;const b=$('bnBtn');b.hidden=!btn;if(btn)b.textContent=tx(btn);}
function triggerEvent(){
  const pool=EVENTS.filter(e=>!e.cond||e.cond());let tot=pool.reduce((a,e)=>a+e.w,0),r=Math.random()*tot,e=pool[0];
  for(const x of pool){r-=x.w;if(r<=0){e=x;break;}}
  const text=e.run();log(e.title,'X');
  announce('Événement',e.title,text,e.offer);
}

/* ---------- Décisions politiques ---------- */
const objHeld=s=>OBJ.filter(id=>nodes[idx[id]].owner===s).length;
function scoreRate(s){const d=objHeld(s)-objHeld(enemyOf(s));if(d<=0)return 0;return BAL.rate*d*(OBJ.length>1&&objHeld(s)===OBJ.length?BAL.allObjMult:1);}
const PENDING={paris(){const q=qgOf('B'),n=q&&q.owner==='B'?q:keyNode('B');if(!n)return;n.troops+=50;effects.push({type:'ring',x:n.x,y:n.y,t:0,c:C.def});log(MSG('{colonne} arrive à {nom} : +50 soldats',{colonne:MAP.ev&&MAP.ev.help?MAP.ev.help.c:'La colonne de renfort',nom:n.name}),'B',n.i);}};
const DECS={
  A:[
    {id:'loi',once:1,title:'Loi martiale',text:'Production +20 % jusqu\'à la fin. Ravitaillement −20 %. Soutien −10.',apply(s){P[s].perm.prod*=1.2;P[s].perm.inc*=0.8;addSup(s,-10);},ai:s=>P[s].sup>45?4:1.5},
    {id:'amnistie',title:"Promesse d'amnistie",text:'Les milices neutres ne résistent qu\'à moitié contre vous pendant 90 s. Soutien +8.',cond:()=>nodes.filter(n=>n.alive&&n.owner==='N').length>=3,apply(s){addMod(s,'neutralDef',0.5,90,'Amnistie',1);addSup(s,8);},ai:()=>nodes.filter(n=>n.alive&&n.owner==='N').length*0.35},
    {id:'merc',title:'Engager des mercenaires',text:'+35 soldats au QG. Ravitaillement −30 % pendant 90 s.',cond:s=>qgOf(s).owner===s,apply(s){qgOf(s).troops+=35;addMod(s,'inc',0.7,90,'Mercenaires');},ai:()=>4},
    {id:'propa',title:'Campagne de propagande',text:'Coûte 40 de ravitaillement. Production adverse −15 % pendant 90 s, soutien adverse −8.',cond:s=>P[s].cr>=40,apply(s){P[s].cr-=40;const e=enemyOf(s);addMod(e,'prod',0.85,90,'Propagande');addSup(e,-8);},ai:()=>3},
    {id:'pillage',once:1,title:'Autoriser le pillage',text:'+150 de ravitaillement tout de suite. Soutien −15.',apply(s){P[s].cr+=150;addSup(s,-15);},ai:s=>P[s].cr<80?5:1.5},
    {id:'ultimatum',title:'Ultimatum au maire',text:'Si vous tenez au moins 2 objectifs, les garnisons des objectifs adverses perdent 30 %. Sinon, soutien −10.',apply(s){if(objHeld(s)>=2){for(const id of OBJ){const n=nodes[idx[id]];if(n.owner===enemyOf(s)){const l=n.troops*0.3;n.troops-=l;P[n.owner].lost+=l;}}log('Le maire plie : les objectifs adverses se vident',s);}else{addSup(s,-10);log('Ultimatum ignoré : la ville se moque de vous',enemyOf(s));}},ai:s=>objHeld(s)>=2&&objHeld(enemyOf(s))>0?7:0},
    {id:'couloirs',title:'Couloirs humanitaires',text:'Soutien +12. Bombardement indisponible pendant 60 s.',apply(s){addSup(s,12);addMod(s,'nobomb',1,60,'Couloirs humanitaires');},ai:s=>P[s].sup<40?5:1},
    {id:'emprunt',title:'Emprunt de guerre',text:'+120 de ravitaillement tout de suite. Ravitaillement −35 % pendant 120 s.',apply(s){P[s].cr+=120;addMod(s,'inc',0.65,120,'Emprunt à rembourser');},ai:s=>P[s].cr<60?3.5:1.5}
  ],
  B:[
    {id:'couvre',title:'Couvre-feu',text:'Déplacements adverses −20 % pendant 90 s. Soutien −6.',apply(s){addMod(enemyOf(s),'speed',0.8,90,'Couvre-feu');addSup(s,-6);},ai:()=>3.5},
    {id:'requis',once:1,title:'Réquisitions',text:'+150 de ravitaillement tout de suite. Soutien −12.',apply(s){P[s].cr+=150;addSup(s,-12);},ai:s=>P[s].cr<80?5:1.5},
    {id:'garde',once:1,title:'Appel à la Garde nationale',text:'+15 soldats sur chaque objectif tenu et au QG. Ravitaillement −15 % jusqu\'à la fin.',apply(s){for(const n of nodes)if(n.owner===s&&(isObj(n)||n.type==='base'))n.troops+=15;P[s].perm.inc*=0.85;},ai:s=>1+objHeld(s)*1.3},
    {id:'paris',once:1,title:"Demander l'aide de Paris",text:'Dans 60 s, une colonne de 50 soldats arrive au QG. Soutien −4.',apply(s){addSup(s,-4);pending.push({t:60,k:'paris'});addMod(s,'paris',1,60,'Renforts en route',1);},ai:()=>4.5},
    {id:'rive',once:1,title:'Fortifier vos quartiers',text:'Défense de tous vos points d\'origine +25 % jusqu\'à la fin. Ravitaillement −10 %.',apply(s){P[s].perm.home=1.25;P[s].perm.inc*=0.9;},ai:()=>3},
    {id:'nego',once:1,title:'Ouvrir des négociations',text:'Cessez-le-feu de 25 s : les colonnes s\'arrêtent et personne ne peut envoyer de troupes. Soutien +10.',apply(s){truce=25;addSup(s,10);log('Cessez-le-feu : les armes se taisent pour 25 s','X');},ai:s=>P[enemyOf(s)].score>P[s].score+60&&objHeld(enemyOf(s))>=2?6:1},
    {id:'emprunt',title:'Emprunt de guerre',text:'+120 de ravitaillement tout de suite. Ravitaillement −35 % pendant 120 s.',apply(s){P[s].cr+=120;addMod(s,'inc',0.65,120,'Emprunt à rembourser');},ai:s=>P[s].cr<60?3.5:1.5},
    {id:'illum',title:'Illuminer la ville',text:'Soutien +15. Ravitaillement −20 % pendant 60 s.',apply(s){addSup(s,15);addMod(s,'inc',0.8,60,'Illuminations');},ai:s=>P[s].sup<45?5:1}
  ]
};
function offerDecisions(s){
  const pool=DECS[s].filter(d=>!(d.once&&P[s].taken.has(d.id))&&(!d.cond||d.cond(s)));
  for(let i=pool.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,3);
}
function takeDecision(s,d){P[s].taken.add(d.id);P[s].decisions.push(d.title);d.apply(s);log(MSG('Décision : {titre}',{titre:d.title}),s,undefined,s);log(MSG('Décision des {camp} : {titre}',{camp:sideName(s,1),titre:d.title}),s,undefined,enemyOf(s));}
function aiDecide(s){const opts=offerDecisions(s);if(!opts.length)return;let best=opts[0],bs=-1;for(const d of opts){const sc=d.ai(s)+Math.random()*1.5;if(sc>bs){bs=sc;best=d;}}takeDecision(s,best);}

/* ================= IA ================= */
const VAL={obj:4.5,base:4,gare:2.2,dist:1.4,bridge:1.7};
function arrVal(side,t){if(t.arr<0)return 1;const a=ARR[t.arr];if(arrOwn[t.arr]&&arrOwn[t.arr]!==side)return 1.35;const rest=a.ix.filter(i=>i!==t.i);return rest.every(i=>nodes[i].owner===side)?1.6:1;}
function bestEnemyAdj(side,minT,ownedOnly){let best=null,bs=0;for(const n of nodes){if(!n.alive||n.owner===side||n.troops<minT)continue;if(ownedOnly&&n.owner!==enemyOf(side))continue;
  if(![...adj[n.i]].some(j=>nodes[j].owner===side))continue;const sc=VAL[n.type]*(isObj(n)?1.4:1)*Math.min(n.troops*defMult(n),90);if(sc>bs){bs=sc;best=n;}}return best;}
function aiAbilities(side,incE,own){
  const list=ABL[side];
  let cheapest=-1;for(let i=0;i<list.length;i++)if(canUnlock(side,i)&&(cheapest<0||list[i].cost<list[cheapest].cost))cheapest=i;
  if(cheapest>=0)unlockAbility(side,cheapest);
  if(time<BAL.prep)return;
  for(let i=0;i<list.length;i++){if(!abReady(side,i))continue;const a=list[i];let tgt=null,ok=false;
    switch(a.key){
      case 'renforts':ok=true;break;
      case 'marche':{let m=0;for(const s of squads)if(s.owner===side)m+=s.n;ok=m>=30;break;}
      case 'assaut':{let m=0;for(const s of squads)if(s.owner===side&&nodes[s.path[s.path.length-1]].owner!==side)m+=s.n;ok=m>=40;break;}
      case 'bombard':tgt=bestEnemyAdj(side,12,false);ok=!!tgt;break;
      case 'sabotage':tgt=bestEnemyAdj(side,15,true);ok=!!tgt;break;
      case 'mobil':ok=own.filter(n=>n.home===side).length>=5;break;
      case 'ligne':{let t=0;for(const n of own)t+=incE[n.i];ok=t>=60;break;}
      case 'hold':{let bs=0;for(const n of own){const sc=incE[n.i]-n.troops*defMult(n)*0.6+((isObj(n)||n.type==='base')?incE[n.i]*0.5:0);if(incE[n.i]>10&&sc>bs){bs=sc;tgt=n;}}ok=!!tgt;break;}
      case 'barrages':{let t=0;for(const n of own)t+=incE[n.i];ok=t>=50;break;}
    }
    if(ok)useAbility(side,i,tgt);
  }
  if(!dynBlock(side)){let bs=35,tgt=null;const e=enemyOf(side);
    for(const b of nodes){if(b.type!=='bridge'||!b.alive)continue;let th=b.owner===e?b.troops:0,mine=false;
      for(const j of adj[b.i]){const m=nodes[j];if(m.owner===e)th+=m.troops*0.6;if(m.owner===side&&(isObj(m)||m.home===side||m.type==='base'))mine=true;}
      for(const s of squads)if(s.owner===e&&(s.path[s.seg+1]===b.i||s.path[s.seg]===b.i))th+=s.n;
      if(mine&&th>bs){bs=th;tgt=b;}}
    if(tgt)useDyn(side,tgt);}
}
function incoming(side){const incE=new Float32Array(N),incO=new Float32Array(N);
  for(const s of squads){const t=s.path[s.seg+1];if(s.owner===side)incO[t]+=s.n;else incE[t]+=s.n*atkMult(s.owner);}return[incE,incO];}
function aiThink(side){
  const[incE]=incoming(side),own=nodes.filter(n=>n.alive&&n.owner===side);
  if(time>=BAL.prep&&!(tut>=0&&tut<3)&&truce<=0)aiTroops(side,'full');
  aiEconomy(side,incE);
  aiAbilities(side,incE,own);
}
function aiTroops(side,mode,sec){
  const D=DIFF[lvl[side]],enemy=enemyOf(side),atk=atkMult(side),human=ctrl[side]==='human';
  const[incE,incO]=incoming(side);
  const own=nodes.filter(n=>n.alive&&n.owner===side&&!(human&&n.rally>=0)&&(!sec||secOf(n)===sec||(secOf(n)===0&&n.troops>90)));
  {
    const fd=new Array(N).fill(Infinity),q=[];
    for(const n of own){for(const j of adj[n.i])if(nodes[j].owner!==side){fd[n.i]=0;q.push(n.i);break;}}
    while(q.length){const u=q.shift();for(const v of adj[u])if(nodes[v].owner===side&&fd[v]===Infinity){fd[v]=fd[u]+1;q.push(v);}}
    const reserveOf=n=>{const threat=incE[n.i];let r=threat>0?threat/defMult(n)*1.1+2:(fd[n.i]===0?3:0);
      if(n.type==='base')r=Math.max(r,fd[n.i]===0?60:35);else if(isObj(n))r=Math.max(r,fd[n.i]===0?18:8);return r;};
    const used=new Set();
    if(mode==='full'){
      const tg=new Set();for(const n of own)if(fd[n.i]===0)for(const j of adj[n.i])if(nodes[j].owner!==side&&nodes[j].alive)tg.add(j);
      const list=[...tg].map(j=>{const t=nodes[j];let m=defMult(t);if(t.owner==='N')m*=modOf(side,'neutralDef');
        const need=(t.troops*m+(t.owner===enemy?incE[j]*0.5:0))/atk-incO[j]+3;let v=VAL[t.type]*(t.owner===enemy?1.2:1)*arrVal(side,t);if(isObj(t)||t.type==='base')v*=1.5;return{t,need,v};}).filter(o=>o.need>0).sort((a,b)=>b.v/(b.need+8)-a.v/(a.need+8));
      for(const o of list){const srcs=[...adj[o.t.i]].map(k=>nodes[k]).filter(x=>x.owner===side&&x.alive&&!used.has(x.i)&&!(human&&x.rally>=0));
        if(srcs.length<2)continue;const av=srcs.map(x=>Math.max(0,x.troops-reserveOf(x)));const sum=av.reduce((a,b)=>a+b,0);
        if(Math.max(...av)>o.need*D.aggr)continue;
        if(sum>o.need*D.aggr*1.15*(0.9+Math.random()*0.2)){const f=Math.min(1,(o.need*1.3+6)/sum);srcs.forEach((x,k)=>{if(av[k]>=4){dispatch(x,[x.i,o.t.i],av[k]*f);used.add(x.i);}});}}
    }
    for(const n of own){
      if(used.has(n.i))continue;
      const reserve=reserveOf(n);
      const avail=n.troops-reserve;if(avail<6)continue;
      if(fd[n.i]>0&&fd[n.i]<Infinity){
        if(avail<12&&n.troops<capOf(n)*0.5)continue;
        let next=null,bs=-1e9;for(const j of adj[n.i]){const m=nodes[j];if(m.owner!==side||fd[j]!==fd[n.i]-1)continue;const sc=incE[j]-m.troops+(isObj(m)?20:0)+(m.st?5:0);if(sc>bs){bs=sc;next=m;}}
        if(next)dispatch(n,[n.i,next.i],avail*0.8);continue;
      }
      let best=null,bsc=0,bneed=0;
      for(const j of adj[n.i]){const t=nodes[j];if(t.owner===side||!t.alive)continue;
        let m=defMult(t);if(t.owner==='N')m*=modOf(side,'neutralDef');
        const need=(t.troops*m+(t.owner===enemy?incE[j]*0.5:0))/atk-incO[j]+3;if(need<=0)continue;
        let v=(VAL[t.type]*(t.owner===enemy?1.2:1)+(t.st?t.lvl*1.5:0))*arrVal(side,t);if(isObj(t))v*=1.4;if(drops.some(d=>d.n===t.i))v*=1.5;
        const sc=v/(need+8)*(0.75+Math.random()*0.5);if(avail>need*D.aggr*(0.9+Math.random()*0.25)&&sc>bsc){bsc=sc;best=t;bneed=need;}}
      if(best&&mode==='full'){dispatch(n,[n.i,best.i],Math.min(avail,bneed*1.3+5));continue;}
      for(const j of adj[n.i]){const m=nodes[j];if(m.owner===side&&incE[j]>m.troops*defMult(m)&&avail>8){dispatch(n,[n.i,j],avail*0.6);break;}}
    }
  }
}
const AI_TECH={A:['rec','log','arm','art','pro','rec','arm','log','art','pro'],B:['pro','rec','art','arm','log','pro','rec','art','arm','log']};
function aiEconomy(side,incE,sec){
  const p=P[side],enemy=enemyOf(side);
  const reserve=15+army[side]*BAL.upkeep*20;
  let save=0;
  if(!p.res&&!sec){const cnt={};for(const k of AI_TECH[side]){cnt[k]=(cnt[k]||0)+1;if(p.tech[k]>=cnt[k])continue;if(!techAvail(k,p.tech[k]))continue;
    const c=TECH[k].lv[p.tech[k]].c;if(p.cr>=c+reserve)startResearch(side,k);else save=c*0.6;break;}}
  if(!sec&&p.cr>BAL.rebuildCost+reserve+80&&Math.random()<0.15){const b=nodes.find(n=>n.type==='bridge'&&canRebuild(side,n));if(b)startRebuild(side,b);}
  let best=null,bs=0;
  const cand=(n,k,sc)=>{if(ST[k].noBridge&&n.type==='bridge')return;const c=buildCost(n,k);if(c==null)return;const ph=buildPhase(n,k);if(ph==null||curPhase<ph)return;const v=sc/Math.sqrt(c);if(v>bs){bs=v;best={n,k,c};}};
  for(const n of nodes){
    if(!n.alive||n.owner!==side||!n.sup||(sec&&secOf(n)!==sec))continue;
    const front=[...adj[n.i]].some(j=>nodes[j].owner===enemy)||(time<BAL.prep&&[...adj[n.i]].some(j=>nodes[j].owner==='N'));
    const imp=isObj(n)?3:n.type==='base'?2.8:n.gare?1.6:n.type==='bridge'?1.3:1;
    const thr=incE[n.i]>0?1.5:1;
    if(front){
      if(n.bbuild<=0&&(imp>1||thr>1))cand(n,'bar',imp*1.1*thr);
      if(n.build<=0){
        if(!n.st){cand(n,'fortin',imp*1.7*thr);cand(n,'mortier',imp*2);}
        else if(n.lvl<2&&(n.st==='fortin'||n.st==='mortier'))cand(n,n.st,imp*1.6*thr);
      }
    }
    if(!front&&n.build<=0&&n.type!=='bridge'){
      const ownN=[...adj[n.i]].filter(j=>nodes[j].owner===side).length;
      if(!n.st){cand(n,'caserne',n.type==='base'?3.4:isObj(n)||n.gare?2.4:1.4);cand(n,'depot',ownN>=3?2:0.9);}
      else if(n.lvl<2&&(n.st==='caserne'||n.st==='depot'))cand(n,n.st,n.type==='base'?2.6:1.5);
    }
  }
  if(best&&p.cr>=best.c+reserve+(sec?70:0)+(bs>0.5?0:save))doBuild(side,best.n,best.k);
}

/* ================= Boucle de jeu ================= */
function update(dt){
  time+=dt;
  if(!prepDone&&time>=BAL.prep){prepDone=true;launchPlanned('Fin de la préparation');
    announce('Préparation terminée','La bataille commence','Vos troupes peuvent maintenant attaquer.');}
  const ph=phaseOf(time);if(ph!==curPhase){curPhase=ph;for(const s of['A','B'])P[s].pc++;log(MSG('Phase {num} : {nom} · +1 PC',{num:ROM[ph],nom:PHN[ph]}),'X');
    announce(MSG('Phase {num}',{num:ROM[ph]}),PHN[ph],ph===2?'Fortins, mortiers, niveau 2 des casernes, dépôts et barricades, armes et artillerie : débloqués. +1 PC.':'Niveau 2 des fortins et mortiers, toutes les recherches de niveau 2 : débloqués. +1 PC.');}
  if(truce>0)truce=Math.max(0,truce-dt);
  for(const m of mods)m.t-=dt;mods=mods.filter(m=>m.t>0);
  for(const p of pending)p.t-=dt;const due=pending.filter(p=>p.t<=0);pending=pending.filter(p=>p.t>0);for(const p of due)PENDING[p.k]();
  for(const s of['A','B'])if(offerS[s]){offerS[s].t-=dt;if(offerS[s].t<=0)offerS[s]=null;}
  if(time>=BAL.prep){evClock-=dt;if(evClock<=0){triggerEvent();evClock=BAL.evMin+Math.random()*(BAL.evMax-BAL.evMin);}}
  for(const d of drops){d.t-=dt;if(d.t<=0){const n=nodes[d.n];if(mineN(n)){P[n.owner].cr+=120;P[n.owner].pc++;floatAt(n,'+120 ravit. · +1 PC',C.gold);log(MSG('Largage récupéré à {nom} par les {camp} : +120 et 1 PC',{nom:n.name,camp:sideName(n.owner,1)}),n.owner,n.i);effects.push({type:'ring',x:n.x,y:n.y,t:0,c:C.gold});}else log(MSG('Le largage de {nom} est perdu',{nom:n.name}),'X');}}
  drops=drops.filter(d=>d.t>0);
  for(const s of['A','B']){const p=P[s];
    for(const k in p.ab)if(p.ab[k].cd>0)p.ab[k].cd=Math.max(0,p.ab[k].cd-dt);
    if(p.dynCd>0)p.dynCd=Math.max(0,p.dynCd-dt);
    if(p.res){p.res.t-=dt*p.perk.research;if(p.res.t<=0){const k=p.res.k;p.tech[k]++;p.res=null;if(ctrl[s]==='human')log(MSG('Recherche terminée : {nom}',{nom:TECH[k].lv[p.tech[k]-1].n}),s,undefined,s);}}
    if(time>=BAL.prep){
      p.pcT+=dt;if(p.pcT>=BAL.pcEvery){p.pcT=0;p.pc++;}
      p.nextDec-=dt;if(p.nextDec<=0){p.nextDec=BAL.decEvery;if(ctrl[s]==='ai')aiDecide(s);else if(!decP[s]){const opts=offerDecisions(s);if(opts.length)decP[s]={ids:opts.map(o=>o.id),t:BAL.decWindow};}}
      p.score+=dt*scoreRate(s);
    }
  }
  for(const s of['A','B'])if(decP[s]){decP[s].t-=dt;if(decP[s].t<=0){log('Décision ajournée : le conseil n\'a pas tranché','X',undefined,s);decP[s]=null;}}
  computeSupply();updWall();
  for(const n of nodes){
    if(!n.alive){if(n.rebuild){const s=n.rebuild.s;if(!EDADJ[n.i].some(j=>nodes[j].alive&&nodes[j].owner===s)){n.rebuild=null;log(MSG('Chantier du {nom} abandonné',{nom:n.name}),'X');continue;}
        n.rebuild.t-=dt*modOf(s,'buildSpeed');if(n.rebuild.t<=0){n.rebuild=null;n.alive=true;n.owner=s;n.troops=6;n.dis=0;rebuildAdj();computeSupply();terrDirty=true;effects.push({type:'ring',x:n.x,y:n.y,t:0,c:OC[s]});log(MSG('{nom} reconstruit par les {camp}',{nom:n.name,camp:sideName(s,1)}),s,n.i);}}
      continue;}
    if(n.flash>0)n.flash=Math.max(0,n.flash-dt*2.5);if(n.hold>0)n.hold=Math.max(0,n.hold-dt);if(n.sab>0)n.sab=Math.max(0,n.sab-dt);
    if(n.collapse>0){n.collapse-=dt;if(n.collapse<=0){n.collapse=0;blowBridge(n,MSG("{nom} s'est effondré",{nom:n.name}));continue;}}
    const bs=mineN(n)?modOf(n.owner,'buildSpeed')*P[n.owner].perk.build:1;
    if(n.dis>0)n.dis=Math.max(0,n.dis-dt);if(n.build>0)n.build=Math.max(0,n.build-dt*bs);if(n.bbuild>0)n.bbuild=Math.max(0,n.bbuild-dt*bs);
    if(mineN(n)){const c=capOf(n),b0=n.troops,ic=incOf(n)*dt;if(n.troops<c)n.troops=Math.min(c,n.troops+prodOf(n)*dt);P[n.owner].cr+=ic;
      if((n.owner===player||ctrl[n.owner]==='human')&&!SIM.on){n.accS+=n.troops-b0;n.accI+=ic;n.flT-=dt;if(n.flT<=0){n.flT=5;n.flA=!n.flA;
        if(n.flA&&n.accI>=1){const v=Math.floor(n.accI);n.accI-=v;prodFloat(n,MSG('+{n} ravit.',{n:v}),C.gold);}
        else if(!n.flA&&n.accS>=1){const v=Math.floor(n.accS);n.accS-=v;prodFloat(n,MSG('+{n} sold.',{n:v}),OC[n.owner]);}}}}}
  army={A:0,B:0};for(const n of nodes)if(mineN(n))army[n.owner]+=n.troops;for(const q of squads)army[q.owner]+=q.n;
  for(const s of['A','B']){const p=P[s];p.cr=Math.max(-1,p.cr-army[s]*BAL.upkeep*upkMult(s)*dt+arrSum(s,'inc')*dt*(time>=BAL.prep?1:0));
    if(arrSum(s,'pc')>0&&time>=BAL.prep){p.arrPcT=(p.arrPcT||0)+dt;if(p.arrPcT>=150){p.arrPcT=0;p.pc++;const z=ARR.find((a,i)=>arrOwn[i]===s&&a.b.pc);log(MSG('{arr} : +1 PC',{arr:z?z.n:'Arrondissement'}),s,undefined,s);}}}
  rallyT+=dt;if(rallyT>=3){rallyT=0;for(const n of nodes){if(n.rally<0||!mineN(n)||!n.alive)continue;const t=nodes[n.rally];if(!t.alive){n.rally=-1;continue;}
    const keep=isObj(n)||n.type==='base'?12:5;const amt=n.troops-keep;if(amt>=5){const p=path(n.i,t.i);if(p)dispatch(n,p,amt);else n.rally=-1;}}}
  if(truce<=0){
    const crue=mods.find(m=>m.stat==='crue'),slow=mods.find(m=>m.stat==='slow');
    for(const s of squads){if(s.n<=0)continue;
      const a=s.path[s.seg],b=s.path[s.seg+1];
      let v=BAL.speed*speedMult(s.owner);if(nodes[a].owner===s.owner&&nodes[b].owner===s.owner)v*=BAL.ownRoad;
      if(crue&&(nodes[a].river===crue.river||nodes[b].river===crue.river))v*=0.3;
      if(slow&&(slow.nodes.includes(a)||slow.nodes.includes(b)))v*=0.5;
      s.v=v;s.d+=v*dt;
      for(;;){const a2=s.path[s.seg],b2=s.path[s.seg+1],L=elen(a2,b2);if(s.d<L)break;s.d-=L;const nb=nodes[b2];
        if(s.seg+1===s.path.length-1||nb.owner!==s.owner){arrive(s,nb);s.n=0;break;}
        if(!adj[b2].has(s.path[s.seg+2])){arrive(s,nb);s.n=0;break;}
        s.seg++;}}
    const byEdge=new Map();
    for(const s of squads){if(s.n<=0)continue;const a=s.path[s.seg],b=s.path[s.seg+1];const k=Math.min(a,b)*1024+Math.max(a,b);let l=byEdge.get(k);if(!l)byEdge.set(k,l=[]);l.push(s);}
    for(const[k,list]of byEdge){if(list.length<2)continue;const lo=Math.floor(k/1024),hi=k%1024,L=elen(lo,hi);
      for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const s1=list[i],s2=list[j];if(s1.owner===s2.owner||s1.n<=0||s2.n<=0)continue;
        const f1=s1.path[s1.seg]===lo,f2=s2.path[s2.seg]===lo;if(f1===f2)continue;
        const fw=f1?s1:s2,bw=f1?s2:s1;if(fw.d>=L-bw.d-6){
          const a1=atkMult(fw.owner),a2=atkMult(bw.owner),p1=fw.n*a1,p2=bw.n*a2;
          if(p1>=p2){P[bw.owner].lost+=bw.n;P[fw.owner].lost+=p2/a1;fw.n=(p1-p2)/a1;bw.n=0;}else{P[fw.owner].lost+=fw.n;P[bw.owner].lost+=p1/a2;bw.n=(p2-p1)/a2;fw.n=0;}
          const t=Math.min(1,fw.d/L);effects.push({type:'boom',x:nodes[lo].x+(nodes[hi].x-nodes[lo].x)*t,y:nodes[lo].y+(nodes[hi].y-nodes[lo].y)*t,t:0,c:C.text});}}}
    squads=squads.filter(s=>s.n>0.5);
    if(!flag('fog'))for(const n of nodes){
      if(!n.alive||!active(n,'mortier')||!n.sup||!mineN(n))continue;
      n.fireT-=dt;if(n.fireT>0)continue;
      const o=n.owner,art=P[o].tech.art,dmg=STV.mortier.dmg[n.lvl-1]*TV.art[art],R=STV.mortier.range*(art>=2?1.25:1);
      let tgt=null,bd=R,tx=0,ty=0;
      for(const s of squads){if(s.owner===o)continue;const a=nodes[s.path[s.seg]],b=nodes[s.path[s.seg+1]],t=Math.min(1,s.d/elen(a.i,b.i));const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;const d=Math.hypot(x-n.x,y-n.y);if(d<bd){bd=d;tgt=s;tx=x;ty=y;}}
      if(tgt){const l=Math.min(tgt.n,dmg);tgt.n-=l;P[tgt.owner].lost+=l;}
      else{let m=null;for(const j of adj[n.i]){const t=nodes[j];if(t.owner===enemyOf(o)&&t.troops>1&&(!m||t.troops>m.troops))m=t;}
        if(m){const l=Math.min(m.troops,dmg*0.6);m.troops-=l;P[m.owner].lost+=l;tx=m.x;ty=m.y;tgt=m;}}
      if(tgt){n.fireT=STV.mortier.per[n.lvl-1];effects.push({type:'shell',x:n.x,y:n.y,x2:tx,y2:ty,t:0,c:OC[o]});effects.push({type:'boom',x:tx,y:ty,t:-0.35,c:OC[o]});}
      else n.fireT=0.3;
    }
    squads=squads.filter(s=>s.n>0.5);
  }
  alertTick(dt);
  if(!SIM.on&&!isMulti())for(const s of['A','B']){if(ctrl[s]!=='human')continue;
    if(autoB[s]){autoBT[s]+=dt;if(autoBT[s]>=2.5){autoBT[s]=0;const[ie]=incoming(s);aiEconomy(s,ie);
      let ch=-1;ABL[s].forEach((a,i)=>{if(canUnlock(s,i)&&(ch<0||a.cost<ABL[s][ch].cost))ch=i;});if(ch>=0)unlockAbility(s,ch);}}
    if(autoM[s]!=='off'&&time>=BAL.prep&&truce<=0){autoT[s]+=dt;if(autoT[s]>=1.5){autoT[s]=0;aiTroops(s,autoM[s]==='atk'?'full':'def');}}}
  if(TEAM)for(const s of['A','B'])if(ctrl[s]==='human'&&aiSec[s]){aiSecT[s]+=dt;if(aiSecT[s]>=1.5){aiSecT[s]=-Math.random()*0.5;if(time>=BAL.prep&&truce<=0)aiTroops(s,'full',aiSec[s]);const[ie]=incoming(s);aiEconomy(s,ie,aiSec[s]);}}
  for(const s of['A','B'])if(ctrl[s]==='ai'){P[s].aiClock+=dt;if(P[s].aiClock>=DIFF[lvl[s]].think){P[s].aiClock=-Math.random()*0.6;aiThink(s);}}
  for(const e of effects)e.t+=dt;effects=effects.filter(e=>e.t<1.2);
  seriesT+=dt;if(seriesT>=5){seriesT=0;series.push([Math.round(time),Math.round(army.A),Math.round(army.B),Math.round(P.A.score),Math.round(P.B.score)]);}
  if(state!=='play')return;
  const has=s=>nodes.some(n=>n.alive&&n.owner===s)||squads.some(q=>q.owner===s);
  if(!has('A'))endGame('B','Les attaquants ont été anéantis.');
  else if(!has('B'))endGame('A','Les défenseurs ont été anéantis.');
  else if(time>=FMT.dur){const a=P.A.score,b=P.B.score;if(Math.abs(a-b)<1)endGame(null,'Armistice : aucun QG n\'est tombé et le contrôle de la ville est à égalité.');else{const w=a>b?'A':'B';endGame(w,MSG("Armistice : aucun QG n'est tombé. Les {camp} l'emportent aux points de contrôle ({a} contre {b}).",{camp:sideName(w,1),a:Math.floor(Math.max(a,b)),b:Math.floor(Math.min(a,b))}));}}
}

function alertTick(dt){
  if(SIM.on||spectate)return;alertT+=dt;if(alertT<1)return;alertT=0;const threat={};
  for(const s of squads){if(s.owner===player)continue;const t=s.path[s.seg+1];if(t!=null&&nodes[t].owner===player)threat[t]=(threat[t]||0)+s.n*atkMult(s.owner);}
  for(const k in threat){const n=nodes[k];if(!(isObj(n)||n.type==='base'||n.st))continue;if(threat[k]<n.troops*defMult(n)*0.6)continue;if(alertCd[k]>time)continue;alertCd[k]=time+20;
    const al=MSG('{nom} menacé : {n} assaillants en approche',{nom:n.name,n:Math.round(threat[k])});if(NET.role==='guest')pushFeed(al,'alert',n.i);else log(al,'alert',n.i,player);}
}

/* ================= Caméra & rendu ================= */
const $=id=>document.getElementById(id);
const banner=$('banner');
const cv=$('map'),ctx=cv.getContext('2d');
let VW=0,VH=0,dpr=1,cam={x:W/2,y:H/2,z:1},fitZ=1,view={l:0,r:0,t:0,b:0},vcx=0,vcy=0;
function layout(){
  const top=$('topbar').offsetHeight,bot=$('cmdbar').offsetHeight;
  document.documentElement.style.setProperty('--toph',top+'px');document.documentElement.style.setProperty('--cmdh',bot+'px');
  const narrow=compact;
  view={l:narrow?0:$('lp').offsetWidth+20,r:narrow?0:$('rp').offsetWidth+20,t:top,b:bot};
  vcx=(view.l+VW-view.r)/2;vcy=(view.t+VH-view.b)/2;
  $('ctx').style.left=vcx+'px';$('ctx').style.maxWidth=Math.max(240,VW-view.l-view.r-16)+'px';banner.style.left=vcx+'px';
}
function resize(){applyCompact();dpr=Math.min(window.devicePixelRatio||1,2);VW=cv.clientWidth;VH=cv.clientHeight;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);layout();fit(true);}
function fit(soft){fitZ=Math.min((VW-view.l-view.r)/(W+20),(VH-view.t-view.b)/(H+20));if(!soft||cam.z<fitZ*0.7||!cam.set){cam.z=fitZ;cam.x=W/2;cam.y=H/2;cam.set=true;}}
const S=(x,y)=>[(x-cam.x)*cam.z+vcx,(y-cam.y)*cam.z+vcy];
const Wp=(sx,sy)=>[(sx-vcx)/cam.z+cam.x,(sy-vcy)/cam.z+cam.y];
function clampCam(){cam.z=Math.max(fitZ*0.7,Math.min(4,cam.z));cam.x=Math.max(0,Math.min(W,cam.x));cam.y=Math.max(0,Math.min(H,cam.y));}
function zoomAt(sx,sy,f){const[wx,wy]=Wp(sx,sy);cam.z*=f;clampCam();const[nx,ny]=Wp(sx,sy);cam.x+=wx-nx;cam.y+=wy-ny;clampCam();}
function centerOn(n){cam.x=n.x;cam.y=n.y;cam.z=Math.max(cam.z,fitZ*1.4);clampCam();effects.push({type:'ping',x:n.x,y:n.y,t:0,c:C.gold});}
const zs=()=>Math.max(0.6,Math.min(1.45,cam.z));
let hover=null,mouse={x:-1,y:-1},boxRect=null;

function shape(n,x,y,r){ctx.beginPath();
  if(n.type==='base')ctx.rect(x-r,y-r,r*2,r*2);
  else if(n.type==='bridge'){const w=r*1.5,h=r;ctx.roundRect?ctx.roundRect(x-w,y-h,w*2,h*2,3):ctx.rect(x-w,y-h,w*2,h*2);}
  else ctx.arc(x,y,r,0,Math.PI*2);}
function drawIcon(k,l,x,y,size,col){const o=P2D[k][Math.min(l,P2D[k].length)-1];ctx.save();ctx.translate(x-size/2,y-size/2);ctx.scale(size/24,size/24);ctx.fillStyle=col;ctx.fill(o.p,o.r);ctx.restore();}
function badge(k,l,bx,by,bs,building,frac){ctx.fillStyle=C.ink;ctx.strokeStyle=building?C.muted:C.gold;ctx.lineWidth=1.5;ctx.fillRect(bx-bs,by-bs,bs*2,bs*2);
  if(building){ctx.fillStyle='rgba(216,180,95,0.28)';ctx.fillRect(bx-bs,by+bs-2*bs*frac,bs*2,2*bs*frac);}
  ctx.strokeRect(bx-bs,by-bs,bs*2,bs*2);drawIcon(k,l,bx,by,bs*1.75,building?C.muted:C.gold);}
function arrow(x1,y1,x2,y2,r1,r2,col,alpha){const a=Math.atan2(y2-y1,x2-x1),sx=x1+Math.cos(a)*r1,sy=y1+Math.sin(a)*r1,ex=x2-Math.cos(a)*r2,ey=y2-Math.sin(a)*r2;
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.globalAlpha=alpha;ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-Math.cos(a-0.45)*9,ey-Math.sin(a-0.45)*9);ctx.lineTo(ex-Math.cos(a+0.45)*9,ey-Math.sin(a+0.45)*9);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineDashOffset=0;ctx.fillStyle=C.ink;ctx.fillRect(0,0,VW,VH);
  if(terrDirty)drawTerritory();
  const[ox,oy]=S(0,0);
  ctx.save();ctx.translate(ox,oy);ctx.scale(cam.z,cam.z);ctx.imageSmoothingEnabled=true;ctx.drawImage(bg,0,0,W,H);ctx.drawImage(terr,0,0,W,H);
  for(const n of nodes){if(!n.alive||n.st!=='mortier'||(n!==hover&&!sel.has(n.i)))continue;const R=STV.mortier.range*((P[n.owner]&&P[n.owner].tech.art>=2)?1.25:1);
    ctx.strokeStyle=OC[n.owner]||C.neu;ctx.globalAlpha=0.55;ctx.setLineDash([6/cam.z,6/cam.z]);ctx.lineWidth=1.5/cam.z;ctx.beginPath();ctx.arc(n.x,n.y,R,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
  ctx.restore();
  const z=zs();
  ctx.lineCap='round';
  for(let i=0;i<N;i++)for(const j of adj[i]){if(j<i)continue;const a=nodes[i],b=nodes[j];const[x1,y1]=S(a.x,a.y),[x2,y2]=S(b.x,b.y);
    const same=a.owner===b.owner&&mineN(a);ctx.strokeStyle=same?OC[a.owner]:'rgba(232,227,216,0.22)';ctx.globalAlpha=same?(a.sup&&b.sup?0.55:0.25):1;ctx.lineWidth=same?2.5:1.5;
    ctx.setLineDash(same?[]:[4,5]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  ctx.setLineDash([]);ctx.globalAlpha=1;
  for(const n of nodes){if(n.rally<0||n.owner!==player)continue;const t=nodes[n.rally];const[x1,y1]=S(n.x,n.y),[x2,y2]=S(t.x,t.y);arrow(x1,y1,x2,y2,n.r*z+4,t.r*z+6,C.gold,0.75);}
  for(const p of planned){const n=nodes[p.from],t=nodes[p.to];if(p.s!==player||n.owner!==player)continue;const pa=path(n.i,t.i);if(!pa)continue;
    ctx.strokeStyle=OC[player];ctx.lineWidth=2.5;ctx.globalAlpha=0.85;ctx.setLineDash([10,6]);ctx.beginPath();pa.forEach((k,m)=>{const[x,y]=S(nodes[k].x,nodes[k].y);m?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.setLineDash([]);
    const a=nodes[pa[pa.length-2]];const[x1,y1]=S(a.x,a.y),[x2,y2]=S(t.x,t.y);arrow(x1,y1,x2,y2,0,t.r*z+6,OC[player],0.85);
    const[mx,my]=S((n.x+a.x)/2,(n.y+a.y)/2);const lb=trad('{n} prévus',{n:Math.floor(n.troops*p.ratio)});ctx.font=`700 12px ${FD}`;const w=ctx.measureText(lb).width+10;ctx.fillStyle=C.ink;ctx.fillRect(mx-w/2,my-9,w,18);ctx.fillStyle=OC[player];ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lb,mx,my);}
  const preview=state==='play'&&hover&&hover.alive&&sel.size&&!(sel.size===1&&sel.has(hover.i));
  if(preview&&(abMode===-1||abMode===-2)){
    let tot=0;ctx.strokeStyle=abMode===-2?C.gold:OC[player];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-time*30;
    for(const i of sel){if(i===hover.i)continue;const p=path(i,hover.i);if(!p)continue;tot+=Math.floor(nodes[i].troops*ratio);ctx.beginPath();p.forEach((k,m)=>{const[x,y]=S(nodes[k].x,nodes[k].y);m?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}
    ctx.setLineDash([]);ctx.lineDashOffset=0;
    const[x,y]=S(hover.x,hover.y);let t;
    if(abMode===-2)t=trad('Route permanente');
    else if(tot>0){t=trad(time<BAL.prep?'Planifier {n}':'Envoyer {n}',{n:tot});if(hover.owner!==player){const need=Math.ceil(hover.troops*defMult(hover)*(hover.owner==='N'?modOf(player,'neutralDef'):1)/atkMult(player)+0.01);t+=' · '+trad(tot>need?'prise ({n} requis)':'insuffisant ({n} requis)',{n:need});}else t+=' '+trad('en renfort');}
    if(t){ctx.font=`700 15px ${FD}`;const w=ctx.measureText(t).width+12;ctx.fillStyle=abMode===-2?C.gold:OC[player];ctx.fillRect(x+hover.r*z+6,y-hover.r*z-22,w,20);ctx.fillStyle=C.ink;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(t,x+hover.r*z+12,y-hover.r*z-11);}
  }
  for(const s of squads){const a=nodes[s.path[s.seg]],b=nodes[s.path[s.seg+1]];const L=elen(a.i,b.i),t=Math.min(1,s.d/L);
    const[x,y]=S(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);const r=(3+Math.sqrt(s.n)*0.9)*z;const ang=Math.atan2(b.y-a.y,b.x-a.x);
    ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=OC[s.owner];ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(r*1.4,0);ctx.lineTo(-r,r);ctx.lineTo(-r*0.5,0);ctx.lineTo(-r,-r);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    if(s.n>=4&&cam.z>0.5){ctx.font=`700 ${Math.round(11*z)}px ${FD}`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle=C.ink;const tx=Math.floor(s.n)+'';ctx.strokeText(tx,x,y-r-2);ctx.fillStyle=C.text;ctx.fillText(tx,x,y-r-2);}}
  for(const n of nodes){const[x,y]=S(n.x,n.y);const r=n.r*z;
    if(!n.alive){
      if(selDead===n.i){ctx.strokeStyle=C.text;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(x,y,r+10*z,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
      if(n.rebuild){const f=1-n.rebuild.t/(n.rebuild.T||BAL.rebuildT);ctx.strokeStyle=OC[n.rebuild.s];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+5*z,-Math.PI/2,-Math.PI/2+Math.PI*2*f);ctx.stroke();drawIcon('pont',1,x,y,r*2,OC[n.rebuild.s]);}
      else{ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.globalAlpha=0.75;ctx.beginPath();ctx.moveTo(x-r,y-r*0.7);ctx.lineTo(x+r,y+r*0.7);ctx.moveTo(x+r,y-r*0.7);ctx.lineTo(x-r,y+r*0.7);ctx.stroke();ctx.globalAlpha=1;}
      if(cam.z>1.1||hover===n||selDead===n.i)label(n,x,y+r+4,'rgba(232,227,216,0.6)',11);continue;}
    const col=OC[n.owner],ob=isObj(n),mine=mineN(n);
    if(ob){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.strokeStyle=C.gold;ctx.lineWidth=2;const q=r+6*z;ctx.strokeRect(-q,-q,q*2,q*2);ctx.restore();}
    if(sel.has(n.i)){ctx.strokeStyle=C.text;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=time*20;ctx.beginPath();ctx.arc(x,y,r+(ob?16:11)*z,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0;}
    if(n.hold>0){ctx.strokeStyle=C.gold;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+3*z,-Math.PI/2,-Math.PI/2+Math.PI*2*(n.hold/30));ctx.stroke();}
    if(n.collapse>0){ctx.strokeStyle=C.atk;ctx.lineWidth=2.5;ctx.globalAlpha=0.5+0.5*Math.abs(Math.sin(time*6));ctx.beginPath();ctx.arc(x,y,r+8*z,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle=C.atk;ctx.font=`800 ${Math.round(12*z)}px ${FD}`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(`${Math.ceil(n.collapse)} s`,x,y-r-6*z);}
    shape(n,x,y,r);ctx.fillStyle=C.ink;ctx.fill();ctx.lineWidth=n.type==='bridge'?2:3;ctx.strokeStyle=col;
    if((!n.sup&&mine)||n.dis>0){ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);}else ctx.stroke();
    if(n.flash>0){shape(n,x,y,r);ctx.fillStyle=col;ctx.globalAlpha=n.flash*0.5;ctx.fill();ctx.globalAlpha=1;}
    if(TEAM&&n.owner===player&&!spectate){const k=secOf(n);if(k&&k!==mySec){const bx=x-r*0.85,by=y+r*0.85,br=Math.max(5,6*z);ctx.fillStyle=C.ink;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle=col;ctx.font=`800 ${Math.round(br*1.35)}px ${FD}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(trad(SECN[n.owner][k])[0].toUpperCase(),bx,by+0.5);}}
    if(hover===n&&state==='play'){shape(n,x,y,r+3);ctx.strokeStyle=(abMode>=0&&!validTarget(player,abMode,n))||(abMode===-3&&n.type!=='bridge')?'rgba(232,227,216,0.25)':C.text;ctx.lineWidth=1.5;ctx.stroke();}
    ctx.fillStyle=n.owner==='N'?'#c9ccd0':col;ctx.font=`700 ${Math.round((n.type==='bridge'?11:14)*z)}px ${FD}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.floor(n.troops),x,y+1);
    const bsz=9*z;
    if(n.st)badge(n.st,n.lvl,x+r+bsz*0.4,y-r-bsz*0.2,bsz,n.build>0,n.build>0?1-n.build/ST[n.st].t[n.lvl-1]:1);
    if(n.bar>0)badge('bar',n.bar,x-r-bsz*0.4,y-r-bsz*0.2,bsz,n.bbuild>0,n.bbuild>0?1-n.bbuild/ST.bar.t[n.bar-1]:1);
    if(!n.sup&&mine&&cam.z>0.55){ctx.fillStyle=C.atk;ctx.font=`800 ${Math.round(13*z)}px ${FD}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',x-r-2*z,y+r*0.6);}
    const d=drops.find(q=>q.n===n.i);
    if(d){const yy=y-r-(ob?22:18)*z;ctx.fillStyle=C.gold;ctx.globalAlpha=0.9;drawIcon('depot',1,x,yy,16*z,C.gold);ctx.globalAlpha=1;ctx.font=`800 ${Math.round(11*z)}px ${FD}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${Math.ceil(d.t)}`,x+9*z,yy);}
    if(n.type!=='bridge'||cam.z>1.15||hover===n)label(n,x,y+r+(ob?9:4)*z,ob?C.gold:C.text,n.type==='bridge'?10.5:12);
  }
  for(const e of effects){if(e.t<0)continue;const k=e.t/1.2;
    if(e.type==='shell'){if(e.t>0.35)continue;const f=e.t/0.35;const wx=e.x+(e.x2-e.x)*f,wy=e.y+(e.y2-e.y)*f-Math.sin(f*Math.PI)*40;const[x,y]=S(wx,wy);ctx.fillStyle=C.text;ctx.beginPath();ctx.arc(x,y,2.5*z,0,Math.PI*2);ctx.fill();continue;}
    const[x,y]=S(e.x,e.y);
    if(e.type==='ring'||e.type==='ping'){ctx.strokeStyle=e.c;ctx.globalAlpha=1-k;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,(e.type==='ping'?12*(1+k):20+50*k)*z,0,Math.PI*2);ctx.stroke();}
    else{ctx.fillStyle=e.c;ctx.globalAlpha=(1-k)*0.8;ctx.beginPath();ctx.arc(x,y,(4+18*k)*z,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;}
  for(const f of floaters){const n=nodes[f.n];const k=f.t/f.dur;const[x,y]=S(n.x,n.y);const yy=y-n.r*z-10-k*26;
    ctx.globalAlpha=Math.max(0,1-k*k);ctx.font=`700 ${Math.round(12.5*Math.max(0.9,Math.min(1.2,cam.z)))}px ${FD}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle=C.ink;
    ctx.strokeText(f.txt,x+n.r*z*0.6,yy);ctx.fillStyle=f.col;ctx.fillText(f.txt,x+n.r*z*0.6,yy);ctx.globalAlpha=1;}
  if(boxRect){ctx.strokeStyle=C.text;ctx.setLineDash([4,4]);ctx.lineWidth=1;ctx.fillStyle='rgba(232,227,216,0.06)';const[x1,y1,x2,y2]=boxRect;ctx.fillRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));ctx.strokeRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));ctx.setLineDash([]);}
}
function label(n,x,y,col,size){const fs=Math.round(size*Math.max(0.85,Math.min(1.25,cam.z)));ctx.font=`600 ${fs}px ${FB}`;ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';ctx.lineWidth=3.5;ctx.strokeStyle=C.ink;ctx.strokeText(n.name,x,y);ctx.fillStyle=col;ctx.fillText(n.name,x,y);}

/* ================= Interface ================= */
const objsEl=$('objs');
function setMapTexts(){
  $('brandName').textContent=trad('Bataille de {ville}',{ville:MAP.name});cv.setAttribute('aria-label',trad('Carte de {ville}',{ville:MAP.name}));
  objsEl.innerHTML='';OBJ.forEach(id=>{const d=document.createElement('div');d.className='obj';d.id='o_'+id;const sp=document.createElement('span');sp.textContent=nodes[idx[id]].name;d.appendChild(document.createElement('i'));d.appendChild(sp);objsEl.appendChild(d);});
  $('arrList').innerHTML='';
}
function fmt(t){t=Math.max(0,Math.ceil(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
const K=s=>`<span class="key">${s}</span>`;
$('legend').innerHTML=['caserne','depot','fortin','mortier','bar'].map(k=>`<div>${iconSVG(k,1)}${iconSVG(k,2)}<span>${trad('{nom} : niv. 1, niv. 2',{nom:trad(ST[k].n)})}</span></div>`).join('')+`<div>${iconSVG('pont',1)}<span>${trad('Pont en reconstruction')}</span></div>`;
$('rbIco').setAttribute('d',ICONS.pont[0].d);

function hud(){
  if(!P[player])return;
  const p=P[player];
  for(const id of OBJ)$('o_'+id).className='obj '+nodes[idx[id]].owner;
  const sub=$('clockSub');
  if(time<BAL.prep){$('timer').textContent=fmt(BAL.prep-time);sub.textContent=trad(paused?'En pause · préparation':'Préparation : construisez, recherchez');sub.className='clock-sub hot';}
  else{$('timer').textContent=fmt(FMT.dur-time);
    if(paused){sub.textContent=trad('En pause · donnez vos ordres');sub.className='clock-sub hot';}
    else if(truce>0){sub.textContent=trad('Cessez-le-feu : {n} s',{n:Math.ceil(truce)});sub.className='clock-sub hot';}
    else{sub.textContent=trad('Phase {num} · {nom}',{num:ROM[curPhase],nom:trad(PHN[curPhase])})+(curPhase<3?' · '+trad('{num} dans {temps}',{num:ROM[curPhase+1],temps:fmt(phaseAt(curPhase+1)-time)}):'');sub.className='clock-sub';}}
  const pb=$('pauseBtn');pb.classList.toggle('on',paused);pb.querySelector('span').textContent=trad(paused?'Reprendre':'Pause');
  const stot=Math.max(1,P.A.score+P.B.score);for(const s of['A','B']){$('sb'+s).style.width=(P.A.score+P.B.score<1?0:100*P[s].score/stot)+'%';$('sv'+s).textContent=Math.floor(P[s].score);}
  const ra=scoreRate('A'),rb=scoreRate('B');$('tgtTxt').textContent=trad('Points de contrôle')+(time<BAL.prep?'':' · '+(ra?trad('attaquants +{n}/s',{n:fr(ra,1)}):rb?trad('défenseurs +{n}/s',{n:fr(rb,1)}):trad('égalité')));
  let inc=0;for(const n of nodes)if(n.alive&&n.owner===player)inc+=incOf(n);const up=army[player]*BAL.upkeep*upkMult(player),net=inc+arrSum(player,'inc')-up;
  $('cr').textContent=Math.floor(Math.max(0,p.cr));const ie=$('inc');ie.textContent=`${net>=0?'+':'−'}${fr(Math.abs(net))}/s`;ie.className='inc'+(net<0?' neg':'');
  $('upk').textContent=trad('Solde {n}/s',{n:fr(up)});
  {const sp=Math.round((supF(player)-1)*100);$('supv').textContent=trad('{n} % · prod. {pct} %',{n:Math.round(p.sup),pct:(sp>=0?'+':'−')+Math.abs(sp)});}$('supbar').style.width=p.sup+'%';
  $('phv').textContent=time<BAL.prep?trad('Préparation · {temps}',{temps:fmt(BAL.prep-time)}):`${ROM[curPhase]} · ${trad(PHN[curPhase])}`;
  document.querySelectorAll('.phase i').forEach((e,i)=>e.classList.toggle('on',i<curPhase));
  $('decv').textContent=decP[player]?trad('à prendre'):fmt(Math.max(0,p.nextDec));
  const chips=[];
  if(p.cr<=0)chips.push(`<span class="chip bad">${trad('Solde impayée : production −40 %')}</span>`);
  if(autoM[player]!=='off'&&!spectate)chips.push(`<span class="chip good">${trad(autoM[player]==='def'?'Défense automatique':'Attaque automatique')}</span>`);
  if(autoB[player]&&!spectate)chips.push(`<span class="chip good">${trad('Améliorations automatiques')}</span>`);
  document.querySelectorAll('#autoSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===autoM[player])));$('autoBuildBtn').setAttribute('aria-pressed',String(!!autoB[player]));
  for(const m of mods){const forMe=m.s===player||m.s==='*';const onEnemy=m.s===enemyOf(player);if(!forMe&&!onEnemy)continue;if(m.stat==='paris'&&!forMe)continue;
    const good=m.good?forMe:onEnemy;chips.push(`<span class="chip ${good?'good':'bad'}">${esc(tx(m.label))}${onEnemy?' '+trad('(ennemi)'):''} ${Math.ceil(m.t)} s</span>`);}
  if(p.perm.prod!==1)chips.push(`<span class="chip good">${trad('Production +{n} %',{n:Math.round((p.perm.prod-1)*100)})}</span>`);
  if(p.perm.inc!==1)chips.push(`<span class="chip bad">${trad('Ravitaillement −{n} %',{n:Math.round((1-p.perm.inc)*100)})}</span>`);
  if(p.perm.home!==1)chips.push(`<span class="chip good">${trad('Quartiers fortifiés')}</span>`);
  if(wallCache[player])chips.push(`<span class="chip good">${trad('Dos au mur : production +25 %, défense +15 %')}</span>`);
  if(stretchF[player]<0.99)chips.push(`<span class="chip bad">${trad('Lignes étirées : production −{n} %',{n:Math.round((1-stretchF[player])*100)})}</span>`);
  const cut=nodes.filter(n=>n.alive&&n.owner===player&&!n.sup).length;if(cut)chips.push(`<span class="chip bad">${trad(cut>1?'{n} points encerclés':'{n} point encerclé',{n:cut})}</span>`);
  $('chips').innerHTML=chips.join('');
  [...feedEl.children].forEach((d,i)=>{const f=(feeds[player]||feeds.A)[i];if(f&&time-f.t>20)d.style.opacity=0.45;});
  hudMode();updateOffer();updateMobile();updateAdv();updateDec();updateSel();updateArrList();updateAb();updateArsenal();updateCtx();updateTut();
  const of=offerS[player];if(of&&!banner.hidden&&ctrl[player]==='human'){const b=$('bnBtn');b.disabled=P[player].cr<OFFERS[of.key].cost;}
  else if(!of)$('bnBtn').hidden=true;
}
function updateCtx(){
  const c=$('ctx');if(state!=='play'){c.hidden=true;return;}c.hidden=false;
  if(abMode>=0){const a=ABL[player][abMode];c.className='ctx armed';
    c.innerHTML=trad({enemy:'{nom} : cliquez un point ennemi ou neutre',enemyOwned:'{nom} : cliquez un point ennemi',own:'{nom} : cliquez un de vos points',bridge:'{nom} : cliquez un pont'}[a.target],{nom:trad(a.name)})+` · ${K(trad('Échap'))} ${trad('annuler')}`;return;}
  if(abMode===-2){c.className='ctx armed';c.innerHTML=`${trad('Route permanente : cliquez la destination')} · ${K(trad('Échap'))} ${trad('annuler')}`;return;}
  if(abMode===-3){c.className='ctx armed';c.innerHTML=`${trad(P[player].charges>1?'Dynamiter : cliquez le pont à détruire ({n} charges)':'Dynamiter : cliquez le pont à détruire ({n} charge)',{n:P[player].charges})} · ${K(trad('Échap'))} ${trad('annuler')}`;return;}
  c.className='ctx';
  const KS={esp:K(trad('Espace')),cg:K(trad('Clic gauche')),cd:K(trad('Clic droit')),ent:K(trad('Entrée')),gl:K(trad('Glisser')),v:K('V'),g:K('G'),x:K('X'),t:K('T'),q:`${K('1')}–${K('4')}`,b:`${K('C')}${K('D')}${K('F')}${K('M')}${K('B')}`};
  if(mode==='local'&&turn.phase==='exec'){c.innerHTML=trad('<b>Exécution de la manche {n}</b> · les plans des deux camps se jouent ensemble · {esp} pause',{n:turn.round,esp:KS.esp});return;}
  if(mode==='local'&&!sel.size&&turn.phase==='plan'){c.innerHTML=trad('<b>Manche {n}</b> · ordres des {camp} · {cg} sélectionner un de vos points · {ent} terminer votre tour',{n:turn.round,camp:trad(sideName(player,1)),cg:KS.cg,ent:KS.ent});return;}
  if(spectate){c.innerHTML=trad("<b>Simulation</b> · {esp} pause · vitesse dans la barre du bas · {v} suivre l'autre camp · {gl} déplacer la carte",KS);return;}
  const prep=time<BAL.prep?trad('<b>Préparation</b> : construisez et recherchez avant {temps}',{temps:fmt(BAL.prep-time)})+' · ':'';
  if(selDead>=0){c.innerHTML=prep+trad('Pont détruit : reconstruisez-le depuis le panneau de gauche si vous tenez une rive');return;}
  if(!sel.size){c.innerHTML=prep+trad('{cg} sélectionner un de vos points · {gl} cadre · {g} QG · {esp} pause',KS);return;}
  let tot=0;for(const i of sel)tot+=Math.floor(nodes[i].troops*ratio);
  if(mode==='local'){c.innerHTML=trad('<b>Manche {n}</b> · {cd} sur une cible : <b>planifier</b> une attaque de {tot} soldats · {x} annuler le plan · {ent} terminer votre tour',Object.assign({n:turn.round,tot},KS));return;}
  if(time<BAL.prep){c.innerHTML=trad('<b>Préparation</b> · {cd} sur une cible : <b>planifier</b> une attaque de {tot} soldats, lancée dans {temps} · {x} annuler le plan',Object.assign({tot,temps:fmt(BAL.prep-time)},KS));return;}
  c.innerHTML=prep+trad('{cd} sur une cible : envoyer <b>{tot}</b> soldats ({pct} %) · {q} quantité · {t} route permanente',Object.assign({tot,pct:Math.round(ratio*100)},KS))+(sel.size===1?' · '+trad('{b} construire',KS):'');
}
/* sélection & construction */
const BKEYS=['caserne','depot','fortin','mortier','bar'];
const needToTake=(n,mult)=>Math.ceil(n.troops*defMult(n)*(mult||1)/atkMult(enemyOf(n.owner))+0.01);
function buildEffect(n,k){
  const lv=nextLvl(n,k);if(lv>=2)return trad(ST[k].d[1]);
  switch(k){
    case 'caserne':{const curM=active(n,'caserne')?STV.caserne.prod[n.lvl-1]:1,base=(prodOf(n)-(n.type==='base'?arrSum(n.owner,'qg'):0))/curM;return trad('+{n} soldat/s ici · {a} → {b} max',{n:fr(base*(STV.caserne.prod[lv]-curM),2),a:capOf(n),b:n.cap+STV.caserne.cap[lv]});}
    case 'depot':{const ig=(STV.depot.inc[lv]-(lv?STV.depot.inc[0]:0))*incMult(n.owner);let nb=0;for(const j of adj[n.i]){const m=nodes[j];if(m.owner===n.owner)nb+=prodOf(m)*(STV.depot.adj[lv]-(lv?STV.depot.adj[0]:0));}return trad('+{a} ravit./s · voisins +{b} soldat/s',{a:fr(ig,2),b:fr(nb,2)});}
    case 'fortin':{const cur=active(n,'fortin')?STV.fortin.def[n.lvl-1]:1;return trad('Pour le prendre : {a} → {b} soldats',{a:needToTake(n),b:needToTake(n,STV.fortin.def[lv]/cur)});}
    case 'bar':{const cur=n.bar>0&&n.bbuild<=0?STV.bar.def[n.bar-1]:1;return trad('Pour le prendre : {a} → {b} soldats',{a:needToTake(n),b:needToTake(n,STV.bar.def[lv]/cur)});}
    case 'mortier':{const r=STV.mortier.dmg[lv]/STV.mortier.per[lv]*TV.art[P[n.owner].tech.art];return trad('Tue {n} soldat/s ennemi à moins de 680 m',{n:fr(r,1)});}
  }
}
const bGrid=$('bGrid');
BKEYS.forEach(k=>{const b=document.createElement('button');b.className='bopt';b.id='bo_'+k;b.innerHTML=`<span class="iw"></span><b></b><span class="c"></span><small></small><span class="key">${ST[k].k}</span>`;b.onclick=()=>{if(spectate)return;const n=selNode();if(n&&canBuild(player,n,k)){act('build',{n:n.i,k});hud();}};bGrid.appendChild(b);});
function selNode(){if(sel.size!==1)return null;const n=nodes[[...sel][0]];return myCmd(n)?n:null;}
function updateSel(){
  const list=[...sel].map(i=>nodes[i]).filter(n=>n.alive&&n.owner===player);
  const note=$('sNote');note.className='mini';
  $('rebuildBox').hidden=true;bGrid.hidden=false;$('selActs').hidden=false;
  if(selDead>=0){const n=nodes[selDead];bGrid.hidden=true;$('selActs').hidden=true;$('rebuildBox').hidden=false;$('sName').textContent=n.name;$('sSub').textContent=trad('Détruit');
    const can=canRebuild(player,n),near=EDADJ[n.i].some(j=>nodes[j].alive&&nodes[j].owner===player);
    $('rbText').textContent=n.rebuild?trad('Chantier en cours ({camp}) : {n} s.',{camp:trad(sideName(n.rebuild.s,1)),n:Math.ceil(n.rebuild.t)}):near?trad('Reconstruction : {c} de ravitaillement, {t} s de chantier. Le pont vous appartiendra.',{c:rbCost(player),t:rbTime(player)}):trad('Il faut tenir un point sur une des deux rives pour reconstruire ce pont.');
    $('rbLbl').textContent=trad('Reconstruire · {c}',{c:rbCost(player)});$('rebuildBtn').disabled=!can;note.textContent='';return;}
  const n=list.length===1?list[0]:null;
  $('cedeBtn').hidden=!(TEAM&&n&&secOf(n)&&secOf(n)===mySec);
  const anyRally=list.some(m=>m.rally>=0);$('stopBtn').disabled=!anyRally;$('rallyBtn').disabled=!list.length;$('rallyBtn').classList.toggle('armed',abMode===-2);
  if(!list.length){$('sName').textContent=trad('Aucune sélection');$('sSub').textContent='';note.textContent=trad('Cliquez un de vos points pour construire, ou un pont détruit pour le reconstruire.');}
  else if(!n){const t=list.reduce((a,m)=>a+m.troops,0);$('sName').textContent=trad('{n} points',{n:list.length});$('sSub').textContent=trad('{n} soldats',{n:Math.floor(t)});note.textContent=trad('Sélectionnez un seul point pour construire.');}
  else{$('sName').textContent=n.name;$('sSub').textContent=n.st?trad('{nom} niv. {lv}',{nom:trad(ST[n.st].n),lv:n.lvl})+(n.build>0?' · '+Math.ceil(n.build)+' s':''):trad('{n} soldats',{n:Math.floor(n.troops)});
    if(!n.sup){note.textContent=trad('Point encerclé : reliez-le à votre QG ou à un objectif pour construire.');note.className='mini warn';}
    else if(n.rally>=0)note.textContent=trad('Route permanente vers {nom}.',{nom:nodes[n.rally].name});
    else note.textContent=trad("Si le point tombe, l'ennemi récupère le bâtiment au niveau 1.");}
  for(const k of BKEYS){const b=$('bo_'+k);
    if(!n){b.querySelector('.iw').innerHTML=iconSVG(k,1);b.querySelector('b').textContent=trad(ST[k].n);b.querySelector('.c').textContent=ST[k].c[0];
      b.querySelector('small').textContent=curPhase<ST[k].ph[0]?trad('Phase {num}',{num:ROM[ST[k].ph[0]]}):trad(ST[k].d[0]);b.disabled=true;continue;}
    const c=buildCost(n,k),lv=nextLvl(n,k),noB=ST[k].noBridge&&n.type==='bridge',other=k!=='bar'&&n.st&&n.st!==k,ph=buildPhase(n,k);
    b.querySelector('.iw').innerHTML=iconSVG(k,Math.min(2,lv+1));
    b.querySelector('b').textContent=lv===1?trad('Améliorer {nom}',{nom:trad(ST[k].n)}):trad(ST[k].n)+(lv>=2?' '+trad('(max)'):'');
    b.querySelector('.c').textContent=c==null||noB?'—':`${c} · ${ST[k].t[Math.min(lv,1)]} s`;
    b.querySelector('small').textContent=noB?trad('Impossible sur un pont'):other?trad('Un seul bâtiment par point'):lv>=2?trad('Niveau maximal'):(ph&&curPhase<ph)?trad('Débloqué en phase {num}',{num:ROM[ph]}):buildEffect(n,k);
    b.disabled=!canBuild(player,n,k);}
}
$('rebuildBtn').onclick=()=>{if(spectate)return;if(selDead>=0&&canRebuild(player,nodes[selDead])){act('rebuild',{n:selDead});hud();}};
/* décisions */
function updateDec(){const card=$('decCard'),dp=decP[player];if(!dp||spectate){card.hidden=true;return;}card.hidden=false;$('decT').textContent=`${Math.ceil(dp.t)} s`;
  const box=$('decOpts');if(box.dataset.k!==dp.ids.join()){box.dataset.k=dp.ids.join();box.innerHTML='';
    for(const id of dp.ids){const d=DECS[player].find(x=>x.id===id);if(!d)continue;const b=document.createElement('button');b.className='decopt';b.innerHTML=`<b>${trad(d.title)}</b><span>${trad(d.text)}</span>`;
      b.onclick=()=>{if(!decP[player])return;act('dec',{id});if(NET.role==='guest'){decP[player]=null;}hud();};box.appendChild(b);}}}
$('decSkip').onclick=()=>{act('decskip',{});if(NET.role==='guest')decP[player]=null;hud();};
/* conseiller */
let advNode=-1;
function advice(){
  const p=P[player],me=player,q=qgOf(me),eq=qgOf(enemyOf(me));
  if(time<BAL.prep){
    if(!p.built&&p.cr>=60)return{t:trad('Préparation : investissez. Une caserne {k} sur votre QG produit nettement plus de soldats.',{k:K('C')}),n:q};
    if(!p.res&&p.cr>=70)return{t:trad("Lancez une recherche dans l'Arsenal (à droite) : elle avancera pendant la préparation.")};
    const pl=planned.filter(x=>x.s===me).length;if(!pl)return{t:trad('Planifiez votre première attaque : sélectionnez le QG ({k}) puis faites un clic droit sur un point voisin.',{k:K('G')}),n:q};
    return{t:trad(pl>1?'Plan prêt ({n} attaques). Ajoutez-en ou attendez la fin du compte à rebours.':'Plan prêt ({n} attaque). Ajoutez-en ou attendez la fin du compte à rebours.',{n:pl})};}
  const[incE]=incoming(me);let worst=null,wv=0;
  for(const n of nodes){if(n.owner!==me||!n.alive)continue;const r=incE[n.i]-n.troops*defMult(n);const imp=n.type==='base'?3:isObj(n)?2:1;if(r>0&&r*imp>wv){wv=r*imp;worst=n;}}
  if(worst)return{t:trad('{nom} va tomber : {n} assaillants en route. Envoyez des renforts ou utilisez une capacité défensive.',{nom:esc(worst.name),n:Math.round(incE[worst.i])}),n:worst};
  if(p.cr<=0)return{t:trad('Solde impayée : votre armée coûte plus que vos revenus. Prenez des points, construisez un dépôt ou attaquez avec vos troupes.')};
  const u=ABL[me].findIndex((a,i)=>canUnlock(me,i));if(u>=0)return{t:trad('Vous avez {n} PC : débloquez « {nom} » dans le panneau Capacités.',{n:p.pc,nom:trad(ABL[me][u].name)})};
  for(let i=0;i<ARR.length;i++){const a=ARR[i];if(arrOwn[i]===me)continue;const mine=a.ix.filter(k=>nodes[k].owner===me).length;if(mine===a.ix.length-1){const miss=nodes[a.ix.find(k=>nodes[k].owner!==me)];return{t:trad("Prenez {nom} pour tenir tout l'arrondissement {arr} : {bonus}.",{nom:esc(miss.name),arr:esc(trad(a.n)),bonus:trad(a.d)}),n:miss};}}
  for(let i=0;i<ARR.length;i++){if(arrOwn[i]===enemyOf(me)&&ARR[i].side!==enemyOf(me)){const a=ARR[i];return{t:trad("L'ennemi tient tout l'arrondissement {arr}. Prenez-lui un seul point pour lui retirer son bonus.",{arr:esc(trad(a.n))}),n:nodes[a.ix[0]]};}}
  if(!p.res&&!autoB[me]){const k=Object.keys(TECH).find(k=>techAvail(k,p.tech[k])&&p.cr>=TECH[k].lv[p.tech[k]].c);if(k)return{t:trad('Recherche possible : {nom} ({effet}).',{nom:trad(TECH[k].lv[p.tech[k]].n),effet:trad(TECH[k].lv[p.tech[k]].d)})};}
  if(p.cr>=180&&!autoB[me])return{t:trad('{n} de ravitaillement dort : construisez, ou laissez faire les améliorations automatiques ({k}).',{n:Math.floor(p.cr),k:K('U')})};
  if(objHeld(me)<2)return{t:trad('Visez les objectifs dorés du centre : ils ravitaillent vos lignes et rapportent des points de contrôle.')};
  return{t:trad("Préparez l'assaut final : massez vos troupes près de {nom}, le QG adverse, et frappez avec plusieurs points à la fois.",{nom:esc(eq.name)}),n:eq};
}
function updateAdv(){if(spectate)return;const a=advice();$('advText').innerHTML=a.t;advNode=a.n?a.n.i:-1;$('advGo').hidden=advNode<0;}
$('advGo').onclick=()=>{if(advNode>=0)centerOn(nodes[advNode]);};
/* arrondissements */
function updateArrList(){const box=$('arrList');if(!ARR.length){if(!box.children.length)box.innerHTML=`<span class="arr-b">${trad("Pas d'arrondissement sur cette carte.")}</span>`;return;}if(!box.children.length)box.innerHTML=ARR.map((a,i)=>`<div class="arr" id="arr_${i}"><div class="arr-top"><b>${esc(trad(a.n))}</b><span></span></div><span class="arr-b">${trad(a.d)}</span><div class="arr-pips">${a.ix.map(()=>'<i></i>').join('')}</div></div>`).join('');
  ARR.forEach((a,i)=>{const el=$('arr_'+i),o=arrOwn[i];el.className='arr'+(o?' '+o:'');const cA=a.ix.filter(k=>nodes[k].owner==='A').length,cB=a.ix.filter(k=>nodes[k].owner==='B').length;
    el.querySelector('.arr-top span').textContent=o?trad('{camp} · bonus actif',{camp:trad(sideName(o))}):`${cA?trad('{n} att.',{n:cA})+' · ':''}${cB?trad('{n} déf.',{n:cB})+' · ':''}${trad('{n} points',{n:a.ix.length})}`;
    el.querySelectorAll('.arr-pips i').forEach((p,k)=>{p.className=nodes[a.ix[k]].owner==='A'?'A':nodes[a.ix[k]].owner==='B'?'B':'';});});}
/* capacités */
function buildAbList(){const box=$('abList');box.innerHTML='';
  const dd=document.createElement('div');dd.className='abc';dd.id='abc_dyn';
  dd.innerHTML=`<div class="abc-top"><b>${trad('Dynamiter un pont')}</b><span class="key">P</span></div><span class="abc-d">${trad("Détruit le pont de votre choix, sur n'importe quelle rive. 2 charges par partie.")}</span><div class="abc-act"><button class="btn sm"></button><span class="abc-s"></span></div>`;
  dd.querySelector('button').onclick=()=>{if(!spectate)setAbMode(-3);};box.appendChild(dd);
  ABL[player].forEach((a,i)=>{const d=document.createElement('div');d.className='abc';d.id='abc_'+i;
    d.innerHTML=`<div class="abc-top"><b>${trad(a.name)}</b><span class="key">${i+5}</span></div><span class="abc-d">${trad(a.desc)}</span><div class="abc-act"><button class="btn sm"></button><span class="abc-s"></span></div><i class="cd"></i>`;
    d.querySelector('button').onclick=()=>{if(spectate)return;const st=P[player].ab[a.key];if(!st.u){if(canUnlock(player,i)){act('unlock',{i});hud();}}else setAbMode(i);};box.appendChild(d);});}
function updateAb(){const p=P[player];$('pcv').textContent=trad('{n} PC',{n:p.pc});
  {const d=$('abc_dyn');if(d){const blk=dynBlock(player);d.classList.toggle('armed',abMode===-3);const b=d.querySelector('button');b.textContent=trad(abMode===-3?'Annuler':'Viser un pont');b.disabled=!!blk&&abMode!==-3;
    d.querySelector('.abc-s').textContent=(blk&&p.charges>0&&time>=BAL.prep?blk+' · ':'')+trad(p.charges>1?'{n} charges':'{n} charge',{n:p.charges});}}
  ABL[player].forEach((a,i)=>{const d=$('abc_'+i);if(!d)return;const st=p.ab[a.key],b=d.querySelector('button'),s=d.querySelector('.abc-s');
    d.classList.toggle('locked',!st.u);d.classList.toggle('armed',abMode===i);
    if(!st.u){b.textContent=trad('Débloquer · {n} PC',{n:a.cost});b.disabled=!canUnlock(player,i);s.textContent=curPhase<a.ph?trad('Phase {num}',{num:ROM[a.ph]}):p.pc<a.cost?trad(a.cost-p.pc>1?'{n} PC manquants':'{n} PC manquant',{n:a.cost-p.pc}):'';d.querySelector('.cd').style.width='0';}
    else{const blk=abBlock(player,i);b.textContent=trad(abMode===i?'Annuler':'Utiliser');b.disabled=!abReady(player,i)&&abMode!==i;s.textContent=st.cd>0?trad('Prête dans {n} s',{n:Math.ceil(st.cd)}):(blk||trad('Prête'));
      d.querySelector('.cd').style.width=st.cd>0?(100*(1-st.cd/a.cd))+'%':'0';}});}
/* arsenal */
function buildArsenal(){const t=$('tracks');t.innerHTML='';
  for(const k in TECH){const d=document.createElement('div');d.className='track';d.id='tr_'+k;
    d.innerHTML=`<div class="track-top"><span class="lbl">${trad(TECH[k].n)}</span><span class="pips"><i></i><i></i></span></div><p></p><div class="prog" hidden><i></i></div><button class="btn sm gold"></button>`;
    d.querySelector('button').onclick=()=>{if(spectate)return;act('res',{k});hud();};t.appendChild(d);}}
function techEffect(k,lv){const p=P[player];
  switch(k){
    case 'rec':{let tot=0;for(const n of nodes)if(n.owner===player)tot+=prodOf(n);return trad("+{n} soldat/s sur l'ensemble de vos points",{n:fr(tot*(TV.rec[lv+1]/TV.rec[lv]-1),1)});}
    case 'arm':return trad("100 de vos soldats en valent {a} à l'attaque (au lieu de {b})",{a:Math.round(100*TV.arm[lv+1]),b:Math.round(100*TV.arm[lv])});
    case 'pro':return trad('une garnison de 50 en vaut {a} en défense (au lieu de {b})',{a:Math.round(50*TV.pro[lv+1]),b:Math.round(50*TV.pro[lv])});
    case 'log':{const ref=idx[MAP.ref]!=null?nodes[idx[MAP.ref]]:qgOf(enemyOf(player));const pa=path(qgOf(player).i,ref.i);let L=0;if(pa)for(let i=0;i<pa.length-1;i++)L+=elen(pa[i],pa[i+1]);const v0=BAL.speed*TV.log[lv]*p.perk.speed,v1=BAL.speed*TV.log[lv+1]*p.perk.speed;return trad('trajet QG → {nom} : {a} s → {b} s',{nom:esc(ref.name),a:Math.round(L/v0),b:Math.round(L/v1)})+(lv===1?', '+trad('ravitaillement +10 %'):'');}
    case 'art':return trad('chaque mortier tue {a} → {b} soldat/s',{a:fr(STV.mortier.dmg[0]/STV.mortier.per[0]*TV.art[lv],1),b:fr(STV.mortier.dmg[0]/STV.mortier.per[0]*TV.art[lv+1],1)})+(lv===1?', '+trad('portée +25 %, bombardement 50 %'):'');
  }return trad(TECH[k].lv[lv].d);}
function updateArsenal(){const p=P[player];
  $('resHead').textContent=p.res?`${trad(TECH[p.res.k].lv[p.tech[p.res.k]].n)} · ${Math.ceil(p.res.t)} s`:trad('Aucune recherche');
  for(const k in TECH){const d=$('tr_'+k),lv=p.tech[k];d.querySelectorAll('.pips i').forEach((e,i)=>e.classList.toggle('on',i<lv));
    const nx=TECH[k].lv[lv];const run=p.res&&p.res.k===k;
    d.querySelector('p').innerHTML=lv>=2?trad('<b>{nom}</b> acquis · {effet}',{nom:trad(TECH[k].lv[1].n),effet:trad(TECH[k].lv[1].d)}):`<b>${trad(nx.n)}</b> · ${techEffect(k,lv)}`;
    const pr=d.querySelector('.prog');pr.hidden=!run;if(run)pr.firstChild.style.width=(100*(1-p.res.t/p.res.T))+'%';
    const b=d.querySelector('button');b.hidden=lv>=2||run;
    if(lv<2&&!run){const lock=curPhase<nx.ph;b.textContent=lock?trad('Phase {num}',{num:ROM[nx.ph]}):trad('Rechercher · {c} · {t} s',{c:nx.c,t:nx.t});b.disabled=lock||!!p.res||p.cr<nx.c;}}}

/* ---------- Tutoriel ---------- */
const tutFlag={};
const TUT=[
  {t:()=>trad('Préparation : 75 s et 150 de ravitaillement. Votre QG (le grand carré) est sélectionné : construisez une caserne {c} ou des barricades {b} dans le panneau de gauche.',{c:K('C'),b:K('B')}),ok:()=>tutFlag.built},
  {t:()=>trad("Lancez une recherche dans l'Arsenal, à droite : Conscription ou Camions par exemple."),ok:()=>tutFlag.research},
  {t:()=>trad('Planifiez votre première attaque : QG sélectionné ({k}), faites un clic droit sur un point voisin. Elle partira seule à la fin de la préparation.',{k:K('G')}),ok:()=>tutFlag.sent||P[player].caps>=1},
  {t:()=>trad('Prenez un point : le chiffre affiché au survol dit combien de soldats il faut. Visez ensuite les objectifs dorés du centre.'),ok:()=>P[player].caps>=1},
  {t:()=>trad('Tenez un objectif doré : il ravitaille vos lignes. Tenir tout un arrondissement (panneau de droite) donne un bonus.'),ok:()=>objHeld(player)>=1},
  {t:()=>trad('Route permanente : sélectionnez votre QG, appuyez sur {k} et cliquez un point du front. Il recevra des renforts en continu.',{k:K('T')}),ok:()=>tutFlag.rally},
  {t:()=>trad("Dès que vous avez 1 PC (toutes les 100 s, à chaque prise d'objectif ou phase), débloquez une capacité dans le panneau de droite."),ok:()=>tutFlag.unlock},
  {t:()=>trad('Utilisez {k} pour mettre en pause : vous pouvez toujours donner vos ordres. Bonne bataille !',{k:K(trad('Espace'))}),ok:()=>false,last:1}
];
function updateTut(){const el=$('tut');if(tut<0){el.hidden=true;return;}el.hidden=false;
  while(tut>=0&&tut<TUT.length&&TUT[tut].ok())tut++;if(tut>=TUT.length){tut=-1;el.hidden=true;return;}
  $('tutStep').textContent=trad('Tutoriel · {n}/{t}',{n:tut+1,t:TUT.length});$('tutText').innerHTML=TUT[tut].t();$('tutSkip').textContent=trad(TUT[tut].last?'Fermer':'Passer');}
$('tutSkip').onclick=()=>{tut=-1;$('tut').hidden=true;};

/* ---------- Infobulle ---------- */
const tip=$('tip');
function updateTip(){
  if(!hover||state!=='play'||(compact&&sheet)){tip.hidden=true;return;}
  const n=hover;const own=trad({A:'Attaquants',B:'Défenseurs',N:'Neutre (milice)',X:'Détruit'}[n.owner]);
  let kind=n.type==='bridge'?trad(/^(Tunnel|Ferry)/.test(n.name)?'Passage {de}':'Pont {de}',{de:deOf(n.river),riviere:n.river}):trad(TYPES[n.type].label);if(isObj(n))kind=trad(n.gare?'Objectif central · gare':'Objectif central');if(n.hill)kind+=' · '+trad('colline');
  const mine=mineN(n);
  const rows=n.alive?[[trad('Camp'),own],[trad('Garnison'),`${Math.floor(n.troops)} / ${capOf(n)}`],[trad('Pour le prendre'),mine?trad('{n} soldats ennemis',{n:needToTake(n)}):trad('{n} soldats',{n:Math.ceil(n.troops*defMult(n)*(n.owner==='N'?modOf(player,'neutralDef'):1)/atkMult(player)+0.01)})],
    [trad('Soldats produits'),mine?fr(prodOf(n),2)+' /s':'—'],[trad('Ravitaillement'),mine?fr(incOf(n),2)+' /s':'—']]:[[trad('État'),n.rebuild?trad('En reconstruction · {n} s',{n:Math.ceil(n.rebuild.t)}):trad('Pont détruit')]];
  if(n.st)rows.push([trad('Bâtiment'),trad('{nom} niv. {lv}',{nom:trad(ST[n.st].n),lv:n.lvl})+(n.build>0?' '+trad('(chantier)'):'')]);
  if(n.bar)rows.push([trad('Barricades'),trad('niveau {n}',{n:n.bar})+(n.bbuild>0?' '+trad('(chantier)'):'')]);
  if(n.arr>=0)rows.push([trad('Arrondissement'),esc(trad(ARR[n.arr].n))]);
  if(TEAM&&mine){const k=secOf(n);rows.push([trad('Secteur'),!k?trad('commun (QG)'):trad(SECN[n.owner][k])+(n.owner===player?' · '+trad(k===mySec?'le vôtre':'allié'):'')]);}
  const ex=[];if(mine&&!n.sup)ex.push(`<div class="warn">${trad('Encerclé : ne produit plus, défense −20 %')}</div>`);if(n.sab>0)ex.push(`<div class="warn">${trad('Saboté : {n} s',{n:Math.ceil(n.sab)})}</div>`);
  if(n.dis>0)ex.push(`<div class="warn">${trad('Désorganisé')}</div>`);if(occupied(n))ex.push(`<div class="k">${trad('Occupé : production −40 %')}</div>`);if(n.hold>0)ex.push(`<div class="k">${trad('Tient la position (défense ×1,6)')}</div>`);
  if(n.collapse>0)ex.push(`<div class="warn">${trad("S'effondre dans {n} s",{n:Math.ceil(n.collapse)})}</div>`);if(!n.alive&&!n.rebuild)ex.push(`<div class="k">${trad('Cliquez-le pour le reconstruire')}</div>`);
  tip.innerHTML=`<h4>${esc(n.name)}</h4><div class="k">${esc(kind)}</div>`+rows.map(([k,v])=>`<div class="row"><span class="k">${k}</span><span>${v}</span></div>`).join('')+ex.join('');
  tip.hidden=false;const r=tip.getBoundingClientRect();if(compact){tip.style.left='8px';tip.style.top=(view.t+8)+'px';return;}let x=mouse.x+18,y=mouse.y+18;if(x+r.width>VW-view.r-8)x=mouse.x-r.width-14;if(y+r.height>VH-view.b-8)y=mouse.y-r.height-14;tip.style.left=x+'px';tip.style.top=y+'px';
}

/* ================= Entrées ================= */
function pick(sx,sy){let best=null,bd=1e9;for(const n of nodes){const[x,y]=S(n.x,n.y);const d=Math.hypot(x-sx,y-sy);const lim=n.r*zs()+(lastTouch?22:10);if(d<lim&&d<bd){bd=d;best=n;}}return best;}
function setAbMode(k){
  if(state!=='play')return;
  if(abMode===k)abMode=-1;
  else if(k===-2){if(!sel.size){pushFeed("Sélectionnez d'abord les points qui enverront les renforts",'X');return;}abMode=-2;}
  else if(k===-3){if(dynBlock(player))return;abMode=-3;}
  else{if(!abReady(player,k))return;const a=ABL[player][k];if(!a.target){act('ab',{i:k,n:-1});abMode=-1;}else abMode=k;}
  cv.classList.toggle('targeting',abMode!==-1);hud();
}
function leftClick(sx,sy,add){
  const n=pick(sx,sy);
  if(abMode===-2){if(n&&n.alive)setRally(n);setAbMode(-2);return;}
  if(abMode===-3){if(n&&n.type==='bridge'&&n.alive&&!dynBlock(player)){act('dyn',{n:n.i});setAbMode(-3);}return;}
  if(abMode>=0){if(n&&validTarget(player,abMode,n)&&abReady(player,abMode)){act('ab',{i:abMode,n:n.i});setAbMode(abMode);}return;}
  if(!n){aim=-1;if(!add){sel.clear();selDead=-1;}if(lastTouch)hover=null;return;}
  if(!n.alive){aim=-1;sel.clear();selDead=n.i;if(compact)setSheet('base',true);return;}
  selDead=-1;if(n.owner===player)aim=-1;
  if(n.owner===player){if(!myCmd(n)){toast(trad('{nom} est dans le secteur de votre allié',{nom:n.name}));return;}if(add){sel.has(n.i)?sel.delete(n.i):sel.add(n.i);}else{sel.clear();sel.add(n.i);}}
  else if(sel.size){if(compact&&lastTouch){if(aim===n.i){sendSelection(n);aim=-1;}else{aim=n.i;hover=n;}}else sendSelection(n);}
}
function rightClick(sx,sy){if(abMode!==-1){setAbMode(abMode);return;}const n=pick(sx,sy);if(n&&n.alive&&sel.size)sendSelection(n);}
const ptrs=new Map();let drag=null;
const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
cv.addEventListener('pointerdown',e=>{if(state!=='play'||menuOpen)return;cv.setPointerCapture(e.pointerId);const[x,y]=pos(e);ptrs.set(e.pointerId,[x,y]);
  if(ptrs.size===2){const[a,b]=[...ptrs.values()];drag={mode:'pinch',d0:Math.hypot(a[0]-b[0],a[1]-b[1]),z0:cam.z};return;}
  lastTouch=e.pointerType!=='mouse';
  drag={mode:'pending',btn:e.button,sx:x,sy:y,lx:x,ly:y,add:e.shiftKey||e.ctrlKey||(lastTouch&&multiSel),touch:lastTouch};
  clearTimeout(lpTimer);if(lastTouch&&!spectate&&abMode===-1)lpTimer=setTimeout(()=>{if(!drag||drag.mode!=='pending')return;const n=pick(x,y);if(n&&n.alive&&sel.size&&!(sel.size===1&&sel.has(n.i))){drag.mode='held';aim=n.i;hover=n;try{navigator.vibrate&&navigator.vibrate(12);}catch(err){}hud();}},460);});
cv.addEventListener('pointermove',e=>{const[x,y]=pos(e);mouse={x,y};if(e.pointerType==='mouse')hover=pick(x,y);
  if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[x,y]);
  if(!drag)return;
  if(drag.mode==='pinch'&&ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,(drag.z0*d/drag.d0)/cam.z);return;}
  if(drag.mode==='pending'&&Math.hypot(x-drag.sx,y-drag.sy)>(drag.touch?10:6)){clearTimeout(lpTimer);}
  if(drag.mode==='pending'&&Math.hypot(x-drag.sx,y-drag.sy)>(drag.touch?10:6))drag.mode=(drag.btn===0&&!drag.touch&&abMode===-1&&!spectate)?'box':'pan';
  if(drag.mode==='pan'){cam.x-=(x-drag.lx)/cam.z;cam.y-=(y-drag.ly)/cam.z;clampCam();}
  if(drag.mode==='box')boxRect=[drag.sx,drag.sy,x,y];
  drag.lx=x;drag.ly=y;});
const endPtr=e=>{ptrs.delete(e.pointerId);clearTimeout(lpTimer);if(!drag)return;
  if(drag.mode==='pinch'){if(!ptrs.size)drag=null;return;}
  const[x,y]=pos(e);
  if(drag.mode==='box'&&boxRect){if(!drag.add)sel.clear();selDead=-1;const[x1,y1,x2,y2]=boxRect;for(const n of nodes){if(!myCmd(n))continue;const[nx,ny]=S(n.x,n.y);if(nx>=Math.min(x1,x2)&&nx<=Math.max(x1,x2)&&ny>=Math.min(y1,y2)&&ny<=Math.max(y1,y2))sel.add(n.i);}boxRect=null;}
  else if(drag.mode==='pending'&&e.type==='pointerup'&&!spectate){if(drag.btn===2)rightClick(x,y);else if(drag.btn===0){if(drag.touch)hover=pick(x,y);leftClick(x,y,drag.add);}}
  drag=null;hud();};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hover=null;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{e.preventDefault();const[x,y]=pos(e);zoomAt(x,y,Math.exp(-e.deltaY*0.0015));},{passive:false});

function setRatio(r){ratio=r;document.querySelectorAll('#ratio button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.r===r)));}
document.querySelectorAll('#ratio button').forEach(b=>b.onclick=()=>{setRatio(+b.dataset.r);hud();});
function setSpeed(s){speed=s;document.querySelectorAll('#speed button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.s===s)));}
document.querySelectorAll('#speed button').forEach(b=>b.onclick=()=>{const v=+b.dataset.s;if(NET.on){if(v!==speed)proposeVote('speed',v);return;}setSpeed(v);});
function setAuto(m){if(state!=='play'||spectate)return;act('auto',{m});if(NET.role==='guest')autoM[player]=m;}
document.querySelectorAll('#autoSeg button').forEach(b=>b.onclick=()=>{if(!spectate)setAuto(b.dataset.a);hud();});
function setAutoBuild(v){if(state!=='play'||spectate)return;act('autob',{v});if(NET.role==='guest')autoB[player]=v;hud();}
$('autoBuildBtn').onclick=()=>{if(!spectate)setAutoBuild(!autoB[player]);};
function togglePause(){if(state!=='play'||(mode==='local'&&turn.phase!=='exec'))return;if(NET.on){proposeVote(paused?'resume':'pause');return;}paused=!paused;hud();}
$('pauseBtn').onclick=togglePause;
let pausedBeforeMenu=false;
function openMenu(){if(state!=='play')return;menuOpen=true;pausedBeforeMenu=paused;if(!NET.on)paused=true;abMode=-1;$('mRestart').hidden=mode==='online';$('mQuit').textContent=trad(mode==='solo'?"Sauvegarder et revenir à l'accueil":NET.ranked&&NET.on?'Abandonner (compte comme une défaite)':"Quitter la partie");cv.classList.remove('targeting');
  $('menuInfo').textContent=trad('{camp} · IA {niveau} · {format} · {temps} écoulées',{camp:trad(sideName(player)),niveau:trad(DIFF[diff].name),format:trad(FMT.n),temps:fmt(time)});$('menuOv').hidden=false;saveGame();}
function closeMenu(){menuOpen=false;$('menuOv').hidden=true;$('helpOv').hidden=true;if(!NET.on)paused=pausedBeforeMenu;hud();}
$('menuBtn').onclick=openMenu;$('resumeBtn').onclick=closeMenu;
$('mHelp').onclick=()=>{$('helpOv').hidden=false;};
$('mRestart').onclick=()=>{closeMenu();again();};
$('mQuit').onclick=()=>{saveGame();netLeave();menuOpen=false;$('menuOv').hidden=true;state='menu';paused=false;showStart();};
let helpPaused=false;
function openHelp(){if(state==='play'&&!menuOpen&&!NET.on){helpPaused=paused;paused=true;}$('helpOv').hidden=false;}
function closeHelp(){$('helpOv').hidden=true;if(state==='play'&&!menuOpen&&!NET.on){paused=helpPaused;hud();}}
$('helpBtn').onclick=openHelp;$('helpClose').onclick=closeHelp;
$('bnBtn').onclick=()=>{const of=offerS[player];if(spectate||!of)return;if(P[player].cr<OFFERS[of.key].cost)return;act('offer',{});if(NET.role==='guest')offerS[player]=null;$('bnBtn').hidden=true;bannerT=2;hud();};
$('selAllBtn').onclick=()=>{if(state!=='play'||spectate)return;sel.clear();selDead=-1;for(const n of nodes)if(myCmd(n))sel.add(n.i);hud();};
function selHQ(){if(spectate)return;const n=qgOf(player);if(!n||n.owner!==player)return;sel.clear();selDead=-1;sel.add(n.i);centerOn(n);hud();}
$('selHqBtn').onclick=selHQ;
$('rallyBtn').onclick=()=>{if(!spectate)setAbMode(-2);};
$('cedeBtn').onclick=()=>{const n=selNode();if(!n||!TEAM)return;act('cede',{n:n.i});if(NET.role==='guest'){n.sec=3-mySec;}sel.delete(n.i);hud();};
let toastT=0;function toast(t){const e=$('toast');e.textContent=tx(t);e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{e.hidden=true;},2600);}$('stopBtn').onclick=()=>{clearRally();hud();};
$('zoomIn').onclick=()=>zoomAt(vcx,vcy,1.3);$('zoomOut').onclick=()=>zoomAt(vcx,vcy,1/1.3);$('fitBtn').onclick=()=>{cam.set=false;fit(false);};
addEventListener('keydown',e=>{
  if(state!=='play')return;
  if(!$('hoOv').hidden||!$('netOv').hidden){if(e.key==='Enter'&&!$('hoOv').hidden){e.preventDefault();beginPlan();}return;}
  const k=e.key.toLowerCase();
  if(!$('helpOv').hidden){if(k==='escape'||k==='h')closeHelp();return;}
  if(menuOpen){if(k==='escape'){e.preventDefault();closeMenu();}else if(k==='h')$('helpOv').hidden=false;return;}
  if(k==='escape'){if(abMode!==-1){setAbMode(abMode);return;}if(sel.size||selDead>=0){sel.clear();selDead=-1;hud();return;}openMenu();return;}
  if(k===' '){e.preventDefault();togglePause();return;}
  if(k==='enter'&&mode==='local'&&turn.phase==='plan'){e.preventDefault();endPlan();return;}
  if(k==='h'){openHelp();return;}
  if(spectate){if(k==='v')follow(enemyOf(player));else if(k==='+'||k==='=')zoomAt(vcx,vcy,1.25);else if(k==='-')zoomAt(vcx,vcy,0.8);
    else if(e.key.startsWith('Arrow')){const d=60/cam.z;if(e.key==='ArrowLeft')cam.x-=d;if(e.key==='ArrowRight')cam.x+=d;if(e.key==='ArrowUp')cam.y-=d;if(e.key==='ArrowDown')cam.y+=d;clampCam();e.preventDefault();}
    hud();return;}
  if(k>='1'&&k<='4')setRatio([0.25,0.5,0.75,1][+k-1]);
  else if(k>='5'&&k<='9'){const i=+k-5;const a=ABL[player][i];if(a){if(!P[player].ab[a.key].u){if(canUnlock(player,i))act('unlock',{i});}else setAbMode(i);}}
  else if(k==='o'&&!isMulti()){const m=autoM[player];setAuto(m==='off'?'def':m==='def'?'atk':'off');}
  else if(k==='p')setAbMode(-3);
  else if(k==='u'&&!isMulti())setAutoBuild(!autoB[player]);
  else if(k==='t')setAbMode(-2);else if(k==='x')clearRally();
  else if(k==='a'){sel.clear();selDead=-1;for(const n of nodes)if(myCmd(n))sel.add(n.i);}
  else if(k==='g')selHQ();
  else if(k.length===1&&'cfdmb'.includes(k)){const n=selNode();const map={c:'caserne',f:'fortin',d:'depot',m:'mortier',b:'bar'};if(n&&canBuild(player,n,map[k]))act('build',{n:n.i,k:map[k]});}
  else if(k==='+'||k==='=')zoomAt(vcx,vcy,1.25);else if(k==='-')zoomAt(vcx,vcy,0.8);
  else if(e.key.startsWith('Arrow')){const d=60/cam.z;if(e.key==='ArrowLeft')cam.x-=d;if(e.key==='ArrowRight')cam.x+=d;if(e.key==='ArrowUp')cam.y-=d;if(e.key==='ArrowDown')cam.y+=d;clampCam();e.preventDefault();}
  hud();
});

/* ================= Sauvegarde ================= */
const SAVE_KEY='bataille-de-lyon-v5';
function saveGame(){
  if(SIM.on||state!=='play'||spectate||mode!=='solo')return;
  try{
    const data={team:TEAM?1:0,map:MAP.custom?MAP:MAP.id,player,diff,fmtIdx,time,evClock,truce,sqId,series,curPhase,prepDone,drops,planned,autoM,autoB,offerS,
      nodes:nodes.map(n=>[n.owner,n.troops,n.alive?1:0,n.hold,n.st,n.lvl,n.bar,n.build,n.bbuild,n.fireT,n.dis,n.rally,n.home,n.sab,n.collapse,n.rebuild,n.sec||0]),
      squads,mods,pending,decP,P:{A:{...P.A,taken:[...P.A.taken]},B:{...P.B,taken:[...P.B.taken]}}};
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}
function readSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function loadGame(d){
  try{
    const m=typeof d.map==='string'?MAPS[d.map]:d.map;if(!m||!m.nodes)throw 0;loadMap(m);
    player=d.player;diff=d.diff;fmtIdx=d.fmtIdx;FMT=FORMATS[fmtIdx];const ai=enemyOf(player);ctrl={[player]:'human',[ai]:'ai'};lvl={A:diff,B:diff};
    resetTeam();if(d.team){TEAM=true;mySec=1;aiSec[player]=2;}mode='solo';
    reset();
    d.nodes.forEach((a,i)=>{const n=nodes[i];n.owner=a[0];n.troops=a[1];n.alive=!!a[2];n.hold=a[3];n.st=a[4];n.lvl=a[5];n.bar=a[6];n.build=a[7];n.bbuild=a[8];n.fireT=a[9];n.dis=a[10];n.rally=a[11];n.home=a[12];n.sab=a[13]||0;n.collapse=a[14]||0;n.rebuild=a[15]||null;n.sec=a[16]||0;n.secOwner=n.owner;});
    rebuildAdj();
    time=d.time;evClock=d.evClock;truce=d.truce;sqId=d.sqId;series=d.series||[];squads=d.squads;mods=d.mods;pending=d.pending;decP=d.decP||{A:null,B:null};curPhase=d.curPhase;prepDone=d.prepDone;drops=d.drops||[];planned=d.planned||[];autoM=d.autoM||autoM;autoB=d.autoB||autoB;offerS=d.offerS||offerS;tut=-1;
    for(const s of['A','B']){P[s]=Object.assign(newSide(s),d.P[s]);P[s].taken=new Set(d.P[s].taken);}
    terrDirty=true;computeSupply();updWall();
    spectate=false;beginPlay();log('Partie reprise','X',undefined,player);
  }catch(e){clearSave();showStart();}
}

/* ================= Carrière ================= */
const GRADES=[{n:'Soldat',xp:0},{n:'Caporal',xp:100},{n:'Caporal-chef',xp:250},{n:'Sergent',xp:450},{n:'Sergent-chef',xp:700},{n:'Adjudant',xp:1000},{n:'Adjudant-chef',xp:1400},
  {n:'Sous-lieutenant',xp:1900},{n:'Lieutenant',xp:2500},{n:'Capitaine',xp:3200},{n:'Commandant',xp:4000},{n:'Lieutenant-colonel',xp:5000},{n:'Colonel',xp:6200},
  {n:'Général de brigade',xp:7600},{n:'Général de division',xp:9200},{n:"Général d'armée",xp:11000}];
const PERKS=[
  {id:'tresor',n:'Trésor de guerre',cost:1,d:'+30 de ravitaillement au départ.',apply(s){P[s].cr+=30;}},
  {id:'garde',n:'Garde rapprochée',cost:1,d:'+15 soldats au QG au départ.',apply(s){qgOf(s).troops+=15;}},
  {id:'presse',n:'Bureau de presse',cost:1,d:'Soutien populaire de départ +6.',apply(s){addSup(s,6);}},
  {id:'ponton',n:'Pontonniers',cost:1,d:'Reconstruire un pont coûte et dure 30 % de moins.',apply(s){P[s].perk.rebuild=0.7;}},
  {id:'genie',n:'Génie militaire',cost:2,d:'Chantiers 12 % plus rapides.',apply(s){P[s].perk.build=1.12;}},
  {id:'instr',n:'Instructeurs',cost:2,d:'Recherches 12 % plus rapides.',apply(s){P[s].perk.research=1.12;}},
  {id:'intend',n:'Intendance',cost:2,d:'Solde des troupes −15 %.',apply(s){P[s].perk.upkeep=0.85;}},
  {id:'eclair',n:'Éclaireurs',cost:2,d:'Colonnes 5 % plus rapides.',apply(s){P[s].perk.speed=1.05;}},
  {id:'barqg',n:'QG fortifié',cost:2,d:'Barricades de niveau 1 au QG dès le départ.',apply(s){qgOf(s).bar=1;}},
  {id:'vet',n:'Vétérans',cost:3,d:'Attaque +4 %.',apply(s){P[s].perk.atk=1.04;}},
  {id:'em',n:"Officier d'état-major",cost:3,d:'+1 point de commandement au départ.',apply(s){P[s].pc+=1;}}
];
const PROF_KEY='bataille-de-lyon-profil';
const defProfile=()=>({pv:0,xp:{A:0,B:0},owned:[],equip:{A:[],B:[]},rec:{A:{w:0,l:0,d:0},B:{w:0,l:0,d:0}}});
function loadProfile(){try{const p=JSON.parse(localStorage.getItem(PROF_KEY));if(p&&p.xp){const d=defProfile();return{...d,...p,xp:{...d.xp,...p.xp},equip:{...d.equip,...p.equip},rec:{A:{...d.rec.A,...(p.rec||{}).A},B:{...d.rec.B,...(p.rec||{}).B}}};}}catch(e){}return defProfile();}
function saveProfile(){try{localStorage.setItem(PROF_KEY,JSON.stringify(profile));}catch(e){}}
let profile=loadProfile();
function gradeIdx(xp){let i=0;for(let k=0;k<GRADES.length;k++)if(xp>=GRADES[k].xp)i=k;return i;}
const slotsOf=gi=>Math.min(4,1+Math.floor(gi/4));
function award(winner,kind){
  const c=player,res=winner===null?'d':winner===c?'w':'l',before=gradeIdx(profile.xp[c]);
  let xp=(res==='w'?120:res==='d'?70:40)*[0.7,1,1.4][diff]*[0.8,1,1.2][fmtIdx]+Math.min(60,P[c].objCaps*8)+(res==='w'&&kind==='qg'?30:0);
  xp=Math.round(xp);profile.xp[c]+=xp;profile.rec[c][res]++;if(res==='w')profile.pv++;saveProfile();
  return{xp,res,before,after:gradeIdx(profile.xp[c])};
}
function classBlock(c,withSlots){
  const xp=profile.xp[c],gi=gradeIdx(xp),g=GRADES[gi],nx=GRADES[gi+1],r=profile.rec[c];
  const pct=nx?100*(xp-g.xp)/(nx.xp-g.xp):100,eq=profile.equip[c].map(id=>PERKS.find(p=>p.id===id)).filter(Boolean);
  return `<div class="cls" style="--c:${OC[c]}"><span class="lbl" style="color:${OC[c]}">${trad(sideName(c))}</span><span class="gr">${trad(g.n)}</span>
    <div class="meter"><i style="width:${pct}%"></i></div><span class="sm">${xp} XP · ${nx?trad('{n} XP avant {grade}',{n:nx.xp-xp,grade:trad(nx.n)}):trad('grade maximal')}</span>
    <span class="sm">${trad(r.w>1?'{n} victoires':'{n} victoire',{n:r.w})} · ${trad(r.l>1?'{n} défaites':'{n} défaite',{n:r.l})}${r.d?' · '+trad(r.d>1?'{n} nuls':'{n} nul',{n:r.d}):''}</span>
    <span class="sm">${trad('Avantages : {n}/{max}',{n:eq.length,max:slotsOf(gi)})}${eq.length?' · '+eq.map(p=>trad(p.n)).join(', '):''}</span></div>`;
}
function renderCareer(){$('career').innerHTML=classBlock('A')+classBlock('B');$('pvTxt').textContent=trad('{n} PV',{n:profile.pv});}
function renderShop(){
  $('shopPv').textContent=trad('{n} PV',{n:profile.pv});$('shopSlots').innerHTML=classBlock('A')+classBlock('B');
  const box=$('perks');box.innerHTML='';
  for(const pk of PERKS){const own=profile.owned.includes(pk.id);const d=document.createElement('div');d.className='perk'+(own?' own':'');
    d.innerHTML=`<div class="ph"><b>${trad(pk.n)}</b><span class="cost">${trad('{n} PV',{n:pk.cost})}</span></div><span class="d">${trad(pk.d)}</span><div class="row"></div>`;
    const row=d.querySelector('.row');
    if(!own){const b=document.createElement('button');b.className='btn sm gold';b.textContent=trad('Acheter · {n} PV',{n:pk.cost});b.disabled=profile.pv<pk.cost;
      b.onclick=()=>{if(profile.pv<pk.cost)return;profile.pv-=pk.cost;profile.owned.push(pk.id);saveProfile();renderShop();};row.appendChild(b);}
    else{const lab=document.createElement('span');lab.className='lbl';lab.textContent=trad('Équiper :');row.appendChild(lab);
      for(const c of['A','B']){const on=profile.equip[c].includes(pk.id),full=profile.equip[c].length>=slotsOf(gradeIdx(profile.xp[c]));
        const b=document.createElement('button');b.className='btn sm';b.textContent=trad(sideName(c));b.setAttribute('aria-pressed',String(on));b.disabled=!on&&full;
        b.onclick=()=>{const L=profile.equip[c];if(L.includes(pk.id))L.splice(L.indexOf(pk.id),1);else if(L.length<slotsOf(gradeIdx(profile.xp[c])))L.push(pk.id);saveProfile();renderShop();};row.appendChild(b);}}
    box.appendChild(d);}
}
$('shopBtn').onclick=()=>{renderShop();$('shopOv').hidden=false;};
$('shopClose').onclick=()=>{$('shopOv').hidden=true;renderCareer();};


/* ================= Cartes personnelles ================= */
const CUSTOM_KEY='bataille-cartes-perso',MAPSEL_KEY='bataille-carte-choisie',MAXN=70;
function loadCustomMaps(){try{const a=nettoyer(JSON.parse(localStorage.getItem(CUSTOM_KEY)));return Array.isArray(a)?a.filter(m=>m&&typeof m.id==='string'&&Array.isArray(m.nodes)):[];}catch(e){return [];}}
function saveCustomMaps(){try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(customMaps));return true;}catch(e){return false;}}
let customMaps=loadCustomMaps();
let curMapId=(()=>{try{return localStorage.getItem(MAPSEL_KEY)||'lyon';}catch(e){return 'lyon';}})();
function getMap(id){return MAPS[id]||customMaps.find(m=>m.id===id)||null;}
function segWet(wd,A,B){const L=Math.hypot(B.x-A.x,B.y-A.y),k=Math.max(4,Math.ceil(L/6));for(let i=1;i<k;i++)if(waterAt(wd,A.x+(B.x-A.x)*i/k,A.y+(B.y-A.y)*i/k))return true;return false;}
function mapProblems(m){
  const errs=[],warns=[],bad=new Set(),pos={},list=[];
  for(const[id,name,x,y,t,o]of m.nodes||[]){pos[id]={id,name,x,y,t,side:(o&&o.side)||'N'};list.push(pos[id]);}
  for(const[id,name,x,y,rv,sd]of m.bridges||[]){pos[id]={id,name,x,y,t:'bridge',side:sd||'N'};list.push(pos[id]);}
  const wd=m.water||{};
  if(!String(m.name||'').trim())errs.push('Donnez un nom à la carte.');
  const qa=list.filter(n=>n.t==='base'&&n.side==='A'),qb=list.filter(n=>n.t==='base'&&n.side==='B');
  if(qa.length!==1)errs.push(qa.length?'Un seul QG des attaquants est permis.':'Placez le QG des attaquants.');
  if(qb.length!==1)errs.push(qb.length?'Un seul QG des défenseurs est permis.':'Placez le QG des défenseurs.');
  if(list.some(n=>n.t==='base'&&n.side==='N'))errs.push('Chaque QG doit appartenir à un camp.');
  if(!(m.obj||[]).some(id=>pos[id]))errs.push('Ajoutez au moins un objectif.');
  if(list.length>MAXN)errs.push(MSG('Trop de points : {n} sur {max} au maximum.',{n:list.length,max:MAXN}));
  const wet=list.filter(n=>n.t!=='bridge'&&waterAt(wd,n.x,n.y));if(wet.length){errs.push(MSG("Dans l'eau : {noms}.",{noms:wet.slice(0,3).map(n=>n.name).join(', ')+(wet.length>3?'…':'')}));wet.forEach(n=>bad.add(n.id));}
  const dry=list.filter(n=>n.t==='bridge'&&!waterAt(wd,n.x,n.y));if(dry.length){errs.push(MSG("Pont hors de l'eau : {noms}.",{noms:dry.slice(0,3).map(n=>n.name).join(', ')+(dry.length>3?'…':'')}));dry.forEach(n=>bad.add(n.id));}
  const adj={};for(const n of list)adj[n.id]=[];
  let cross=0,bb=0;
  for(const[a,b]of parseEdges(m.edges)){const A=pos[a],B=pos[b];if(!A||!B)continue;adj[a].push(b);adj[b].push(a);
    if(A.t==='bridge'&&B.t==='bridge')bb++;else if(A.t!=='bridge'&&B.t!=='bridge'&&segWet(wd,A,B)){cross++;bad.add(a+'|'+b);}}
  if(cross)errs.push(MSG(cross>1?"{n} routes traversent l'eau sans pont.":"{n} route traverse l'eau sans pont.",{n:cross}));
  if(bb)errs.push('Deux ponts ne peuvent pas être reliés directement.');
  if(qa.length===1&&qb.length===1){const seen=new Set([qa[0].id]),q=[qa[0].id];while(q.length){const u=q.pop();for(const v of adj[u])if(!seen.has(v)){seen.add(v);q.push(v);}}
    if(!seen.has(qb[0].id))errs.push('Aucune route ne relie les deux QG.');}
  const iso=list.filter(n=>!adj[n.id].length);if(iso.length){warns.push(MSG(iso.length>1?'{n} points sans route.':'{n} point sans route.',{n:iso.length}));iso.forEach(n=>bad.add(n.id));}
  const cA=list.filter(n=>n.side==='A').length,cB=list.filter(n=>n.side==='B').length;
  if(cA<3||cB<3)warns.push('Chaque camp devrait avoir au moins 3 points de départ.');
  if(Math.abs(cA-cB)>2)warns.push(MSG('Camps déséquilibrés : {a} points attaquants, {b} défenseurs.',{a:cA,b:cB}));
  if(!(m.arr||[]).some(a=>a.ids&&a.ids.length))warns.push("Aucune zone : pas de bonus d'arrondissement.");
  return{errs,warns,bad};
}

/* ================= Vignettes ================= */
function drawThumb(c,m){
  const g=c.getContext('2d'),sc=c.width/W;g.setTransform(sc,0,0,sc,0,0);
  g.fillStyle=C.land;g.fillRect(0,0,W,H);drawWater(g,m.water||{},3);
  const pos={},ob=new Set(m.obj||[]);
  for(const[id,,x,y,t,o]of m.nodes||[])pos[id]=[x,y,t,(o&&o.side)||'N'];
  for(const[id,,x,y,,sd]of m.bridges||[])pos[id]=[x,y,'bridge',sd||'N'];
  g.lineWidth=6;g.strokeStyle='rgba(232,227,216,0.22)';g.lineCap='round';
  for(const[a,b]of parseEdges(m.edges)){const A=pos[a],B=pos[b];if(!A||!B)continue;g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();}
  for(const id in pos){const[x,y,t,sd]=pos[id];const o=ob.has(id),r=t==='base'?34:t==='bridge'?15:o?30:21;
    g.fillStyle=sd==='A'?C.atk:sd==='B'?C.def:o?C.gold:'#6c7178';
    if(t==='base')g.fillRect(x-r,y-r,2*r,2*r);else if(o){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-r*0.8,-r*0.8,r*1.6,r*1.6);g.restore();}else{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}}
}

/* ================= Éditeur ================= */
const ZCOL=['#d8b45f','#7cbf7a','#c47fd6','#5fc2c2','#e39a4c','#8f9fe6'];
const ROLES=[['qg','Soldats au QG'],['inc','Ravitaillement'],['cpc','Soldats et PC'],['cinc','Ravitaillement et solde']];
const TOOLS=[
  {k:'sel',n:'Sélection',key:'V',d:'Cliquez un élément pour le modifier, glissez un point pour le déplacer.'},
  {k:'dist',n:'Quartier',key:'1',d:'Cliquez sur la terre pour placer un quartier.'},
  {k:'obj',n:'Objectif',key:'2',d:"Les objectifs ravitaillent et rapportent des points de contrôle."},
  {k:'gare',n:'Gare',key:'3',d:'Une gare produit presque autant qu\'un objectif.'},
  {k:'qgA',n:'QG attaquants',key:'4',d:'Un seul QG par camp. Le prendre fait gagner la partie.'},
  {k:'qgB',n:'QG défenseurs',key:'5',d:'Un seul QG par camp. Le prendre fait gagner la partie.'},
  {k:'bridge',n:'Pont',key:'6',d:"Cliquez sur l'eau. Reliez-le ensuite à un point de chaque rive."},
  {k:'road',n:'Route',key:'R',d:'Cliquez deux points pour les relier, ou délier une route existante. Échap pour arrêter.'},
  {k:'river',n:'Rivière',key:'E',d:'Cliquez pour tracer, Entrée ou double-clic pour terminer, Échap pour annuler.'},
  {k:'zone',n:'Zones',key:'Z',d:'Choisissez une zone puis cliquez les points à y ranger.'},
  {k:'erase',n:'Gomme',key:'X',d:'Cliquez un point, une route ou une rivière pour l\'effacer.'}
];
let ed=null,edTool='sel',edSide='N',edZone=1,edSel=null,edLink=null,edRiver=null,edHW=14,edDirty=false,edUndo=[],edFrom=false,fromEditor=false,edCloseArm=0,edHintT=0;
let edCam={x:W/2,y:H/2,z:1},edFitZ=1,edVW=0,edVH=0,edDpr=1,edMouse=null,edDrag=null;
const edCv=$('edCv'),edG=edCv.getContext('2d'),edPtr=new Map();
const newId=p=>p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const defaultZones=()=>[['Ouest','qg'],['Sud-ouest','inc'],['Centre nord','cpc'],['Centre sud','cinc'],['Est','qg'],['Sud-est','inc']].map(([n,role])=>({n,role,sub:''}));
function deFor(n){n=String(n||'').trim();const l=n.toLowerCase();if(l.startsWith('la '))return 'de '+n;if(l.startsWith('le '))return 'du '+n.slice(3);if(l.startsWith('les '))return 'des '+n.slice(4);if(/^l['’]/.test(l))return 'de '+n;return 'de '+n;}
function blankEd(){return{id:newId('c'),name:'Ma ville',nodes:[],edges:[],rivers:[],water:{},deco:{},zones:defaultZones(),sides:null,desc:'',ev:null,ref:null,prodA:1.04};}
function fromMap(m,copy){
  const e={id:copy?newId('c'):m.id,name:copy?`${m.name} (copie)`:m.name,nodes:[],edges:parseEdges(m.edges).map(x=>[x[0],x[1]]),rivers:[],water:{},deco:JSON.parse(JSON.stringify(m.deco||{})),
    zones:defaultZones(),sides:m.sides?JSON.parse(JSON.stringify(m.sides)):null,desc:m.desc||'',ev:m.ev?JSON.parse(JSON.stringify(m.ev)):null,ref:m.ref||null,prodA:m.prodA||1.04};
  const w=m.water||{};e.rivers=(w.rivers||[]).map(r=>({n:r.n,de:r.de,hw:r.hw,auto:!!r.auto,pts:r.pts.map(p=>[p[0],p[1]])}));
  for(const k of['lakes','sea','islands','de'])if(w[k])e.water[k]=JSON.parse(JSON.stringify(w[k]));
  const zoneOf={};(m.arr||[]).slice(0,6).forEach((a,k)=>{e.zones[k]={n:a.n,role:a.role||'inc',sub:a.sub||''};for(const id of a.ids)zoneOf[id]=k+1;});
  const ob=new Set(m.obj||[]);
  for(const[id,name,x,y,t,o]of m.nodes||[])e.nodes.push({id,name,x,y,type:ob.has(id)?'obj':(TYPES[t]?t:'dist'),side:(o&&o.side)||'N',hill:!!(o&&o.hill),gare:!!(o&&o.gare),def:o&&o.def||null,zone:zoneOf[id]||0});
  for(const[id,name,x,y,rv,sd]of m.bridges||[])e.nodes.push({id,name,x,y,type:'bridge',side:sd==='A'||sd==='B'?sd:'N',river:rv,zone:0});
  return e;
}
function edWater(){return Object.assign({},ed.water,{rivers:ed.rivers.filter(r=>r.pts.length>1)});}
function riverNear(x,y,keep){const wd=edWater();if(keep&&waterAt(wd,x,y))return keep;let best=null,bd=1e9;for(const r of wd.rivers){const d=dPoly(x,y,r.pts)-r.hw;if(d<bd){bd=d;best=r.n;}}return best||keep||'Canal';}
function toMap(e){
  const m={id:e.id,name:String(e.name||'').trim().slice(0,28)||'Carte sans nom',custom:true,sub:'',desc:e.desc||'',sides:e.sides||null,
    water:JSON.parse(JSON.stringify(e.water||{})),deco:JSON.parse(JSON.stringify(e.deco||{})),nodes:[],bridges:[],edges:[],obj:[],hq:{},arr:[],ev:e.ev||null,ref:e.ref||null,prodA:e.prodA||1.04};
  m.water.rivers=e.rivers.filter(r=>r.pts.length>1).map(r=>({n:r.n,de:r.de||deFor(r.n),hw:r.hw,auto:r.auto||undefined,pts:r.pts.map(p=>[Math.round(p[0]),Math.round(p[1])])}));
  for(const n of e.nodes){const x=Math.round(n.x),y=Math.round(n.y);
    if(n.type==='bridge'){const b=[n.id,n.name,x,y,riverNear(n.x,n.y,n.river)];if(n.side==='A'||n.side==='B')b.push(n.side);m.bridges.push(b);continue;}
    const o={};if(n.side==='A'||n.side==='B')o.side=n.side;if(n.hill){o.hill=1;o.def=1.35;}else if(n.def)o.def=n.def;if(n.gare&&n.type!=='gare')o.gare=1;
    m.nodes.push([n.id,n.name,x,y,n.type,o]);if(n.type==='obj')m.obj.push(n.id);if(n.type==='base'&&(n.side==='A'||n.side==='B'))m.hq[n.side]=n.id;}
  const ids=new Set(e.nodes.map(n=>n.id)),seen=new Set();
  for(const[a,b]of e.edges){if(!ids.has(a)||!ids.has(b)||a===b)continue;const k=a<b?a+'|'+b:b+'|'+a;if(seen.has(k))continue;seen.add(k);m.edges.push([a,b]);}
  e.zones.forEach((z,k)=>{const zi=e.nodes.filter(n=>n.zone===k+1&&n.type!=='bridge').map(n=>n.id);if(zi.length)m.arr.push({n:String(z.n||`Zone ${k+1}`).slice(0,26),sub:z.sub||'',role:z.role,ids:zi});});
  m.deco.labels=(m.deco.labels||[]).filter(l=>!l[5]);
  for(const r of m.water.rivers){if(!r.auto)continue;let L=0;const segs=[];for(let i=0;i<r.pts.length-1;i++){const d=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);segs.push(d);L+=d;}
    let acc=0;for(let i=0;i<segs.length;i++){if(acc+segs[i]>=L/2){const t=(L/2-acc)/segs[i],[ax,ay]=r.pts[i],[bx,by]=r.pts[i+1];let a=Math.atan2(by-ay,bx-ax);if(a>Math.PI/2)a-=Math.PI;if(a<=-Math.PI/2)a+=Math.PI;
      m.deco.labels.push([String(r.n).replace(/^(la |le |les |l['’])/i,'').toUpperCase(),Math.round(ax+(bx-ax)*t),Math.round(ay+(by-ay)*t),+a.toFixed(2),'r',1]);break;}acc+=segs[i];}}
  const nb=m.bridges.length,no=m.obj.length;m.sub=`Carte perso · ${m.nodes.length} points · ${nb} pont${nb>1?'s':''} · ${no} objectif${no>1?'s':''}`;
  return m;
}

function edSnap(){edUndo.push(JSON.stringify(ed));if(edUndo.length>60)edUndo.shift();edDirty=true;edCloseArm=0;}
function edUndoDo(){if(!edUndo.length)return;ed=JSON.parse(edUndo.pop());edSel=null;edLink=null;edRiver=null;edDirty=true;edRefresh();}
function edHint(t,bad){const h=$('edHint');h.textContent=tx(t);h.className='edhint'+(bad?' bad':'');h.hidden=false;edHintT=3.2;}
function edOpen(m,copy){
  ed=m?fromMap(m,copy):blankEd();edUndo=[];edDirty=!!copy;edSel=null;edLink=null;edRiver=null;edCloseArm=0;edFrom=true;
  $('edOv').hidden=false;$('startOv').hidden=true;$('edName').value=ed.name;
  edResize();edCam={x:W/2,y:H/2,z:edFitZ};setEdTool('sel');edRefresh();
}
function edClose(force){
  if(edDirty&&!force){if(Date.now()-edCloseArm>4000){edCloseArm=Date.now();$('edClose').textContent=trad('Quitter sans enregistrer ?');setTimeout(()=>{$('edClose').textContent=trad('Fermer');},4000);return;}}
  $('edClose').textContent=trad('Fermer');$('edOv').hidden=true;$('edIOv').hidden=true;ed=null;edFrom=false;state='menu';showStart();
}
function edSave(silent){
  if(!ed)return null;ed.name=$('edName').value.trim()||ed.name;const m=toMap(ed);
  const i=customMaps.findIndex(x=>x.id===m.id);if(i>=0)customMaps[i]=m;else customMaps.push(m);
  const ok=saveCustomMaps();edDirty=false;curMapId=m.id;try{localStorage.setItem(MAPSEL_KEY,m.id);}catch(e){}
  if(!silent)edHint(ok?"Carte enregistrée. Elle apparaît dans la liste des cartes de l'accueil.":"Enregistrement impossible : le stockage du navigateur est indisponible.",!ok);
  return m;
}
function edTest(){
  const m=toMap(ed),pb=mapProblems(m);
  if(pb.errs.length){edHint(trad('À corriger avant de jouer : {err}',{err:tx(pb.errs[0])}),true);edRefresh();return;}
  edSave(true);$('edOv').hidden=true;fromEditor=true;curMapId=m.id;startGame(false);
}
function edResize(){const r=edCv.getBoundingClientRect();edDpr=Math.min(window.devicePixelRatio||1,2);edVW=Math.max(10,r.width);edVH=Math.max(10,r.height);edCv.width=Math.round(edVW*edDpr);edCv.height=Math.round(edVH*edDpr);edFitZ=Math.min((edVW-20)/W,(edVH-20)/H);}
const eS=(x,y)=>[(x-edCam.x)*edCam.z+edVW/2,(y-edCam.y)*edCam.z+edVH/2];
const eW=(sx,sy)=>[(sx-edVW/2)/edCam.z+edCam.x,(sy-edVH/2)/edCam.z+edCam.y];
function edClamp(){edCam.z=Math.max(edFitZ*0.6,Math.min(5,edCam.z));edCam.x=Math.max(0,Math.min(W,edCam.x));edCam.y=Math.max(0,Math.min(H,edCam.y));}
function edZoom(sx,sy,f){const[wx,wy]=eW(sx,sy);edCam.z*=f;edClamp();const[nx,ny]=eW(sx,sy);edCam.x+=wx-nx;edCam.y+=wy-ny;edClamp();edRender();}
const nodeR=n=>n.type==='base'?20:n.type==='bridge'?11:n.type==='obj'?17:n.type==='gare'?15:13;
function edHit(sx,sy){
  let best=null,bd=1e9;for(const n of ed.nodes){const[x,y]=eS(n.x,n.y);const d=Math.hypot(x-sx,y-sy);if(d<nodeR(n)*Math.max(0.7,edCam.z)+8&&d<bd){bd=d;best={k:'node',n};}}
  if(best)return best;
  if(edSel&&edSel.k==='river'){const r=edSel.r;for(let i=0;i<r.pts.length;i++){const[x,y]=eS(r.pts[i][0],r.pts[i][1]);if(Math.hypot(x-sx,y-sy)<9)return{k:'rpt',r,i};}}
  const byId={};for(const n of ed.nodes)byId[n.id]=n;
  for(const e of ed.edges){const A=byId[e[0]],B=byId[e[1]];if(!A||!B)continue;const[x1,y1]=eS(A.x,A.y),[x2,y2]=eS(B.x,B.y);if(dSeg(sx,sy,x1,y1,x2,y2)<6)return{k:'edge',e};}
  const[wx,wy]=eW(sx,sy);for(const r of ed.rivers)if(r.pts.length>1&&dPoly(wx,wy,r.pts)<r.hw+6/edCam.z)return{k:'river',r};
  return null;
}
function edCountType(t,s){return ed.nodes.filter(n=>n.type===t&&(!s||n.side===s)).length;}
function edAddNode(tool,wx,wy){
  const wd=edWater(),inW=waterAt(wd,wx,wy);
  if(tool==='bridge'){if(!inW){edHint("Un pont se place sur l'eau : tracez d'abord une rivière.",true);return;}}
  else if(inW){edHint("Ce point est dans l'eau. Placez-le sur la terre ferme ou utilisez un pont.",true);return;}
  if(ed.nodes.length>=MAXN){edHint(MSG('Maximum {n} points par carte.',{n:MAXN}),true);return;}
  for(const n of ed.nodes)if(Math.hypot(n.x-wx,n.y-wy)<(tool==='bridge'||n.type==='bridge'?26:44)){edHint("Trop près d'un autre point.",true);return;}
  edSnap();
  if(tool==='qgA'||tool==='qgB'){const s=tool==='qgA'?'A':'B',ex=ed.nodes.find(n=>n.type==='base'&&n.side===s);
    if(ex){ex.x=wx;ex.y=wy;edSel={k:'node',n:ex};edRefresh();return;}
    const n={id:newId('q'),name:trad(s==='A'?'QG attaquants':'QG défenseurs'),x:wx,y:wy,type:'base',side:s,zone:0};ed.nodes.push(n);edSel={k:'node',n};edRefresh();return;}
  const t=tool,cnt=edCountType(t)+1,names={dist:'Quartier',obj:'Objectif',gare:'Gare',bridge:'Pont'};
  const n={id:newId(t[0]),name:`${trad(names[t])} ${cnt}`,x:wx,y:wy,type:t,side:t==='obj'||t==='bridge'?'N':edSide,zone:0,hill:false};
  if(t==='bridge')n.river=riverNear(wx,wy);
  ed.nodes.push(n);edSel={k:'node',n};
  if(t==='bridge'){const land=ed.nodes.filter(m=>m.type!=='bridge'&&!segWet(wd,m,{x:m.x,y:m.y})).map(m=>({m,d:Math.hypot(m.x-wx,m.y-wy)})).sort((a,b)=>a.d-b.d);
    const comp=(p)=>{const cs=12;return edCompAt(p.x,p.y);};const first=land.find(o=>o.d<320);
    if(first){const c1=comp(first.m);const second=land.find(o=>o.d<320&&comp(o.m)!==c1);ed.edges.push([n.id,first.m.id]);if(second)ed.edges.push([n.id,second.m.id]);}}
  edRefresh();
}
let edCompCache=null;
function edComps(){if(edCompCache)return edCompCache;const wd=edWater(),c=new Int16Array(GW*GH).fill(-1);
  for(let k=0;k<GW*GH;k++){const x=(k%GW)*CS+CS/2,y=((k/GW)|0)*CS+CS/2;if(waterAt(wd,x,y))c[k]=-2;}
  let id=0;const st=[];for(let k=0;k<GW*GH;k++){if(c[k]!==-1)continue;c[k]=id;st.push(k);while(st.length){const p=st.pop(),px=p%GW,py=(p/GW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=px+dx,ny=py+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const q=ny*GW+nx;if(c[q]===-1){c[q]=id;st.push(q);}}}id++;}
  return edCompCache=c;}
function edCompAt(x,y){const c=edComps();if(x<0||y<0||x>=W||y>=H)return -2;return c[((y/CS)|0)*GW+((x/CS)|0)];}
function edToggleEdge(a,b){
  if(a.id===b.id)return;const i=ed.edges.findIndex(e=>(e[0]===a.id&&e[1]===b.id)||(e[0]===b.id&&e[1]===a.id));
  if(i>=0){edSnap();ed.edges.splice(i,1);edHint('Route supprimée.');edRefresh();return;}
  if(a.type==='bridge'&&b.type==='bridge'){edHint('Deux ponts ne peuvent pas être reliés directement.',true);return;}
  if(a.type!=='bridge'&&b.type!=='bridge'&&segWet(edWater(),a,b)){edHint("Cette route traverserait l'eau : passez par un pont.",true);return;}
  edSnap();ed.edges.push([a.id,b.id]);edRefresh();
}
function edErase(h){
  if(!h)return;edSnap();
  if(h.k==='node'){ed.nodes=ed.nodes.filter(n=>n!==h.n);ed.edges=ed.edges.filter(e=>e[0]!==h.n.id&&e[1]!==h.n.id);if(edSel&&edSel.n===h.n)edSel=null;}
  else if(h.k==='edge')ed.edges=ed.edges.filter(e=>e!==h.e);
  else if(h.k==='river'){ed.rivers=ed.rivers.filter(r=>r!==h.r);edCompCache=null;if(edSel&&edSel.r===h.r)edSel=null;}
  edRefresh();
}
function edAutoLink(){
  const wd=edWater(),land=ed.nodes.filter(n=>n.type!=='bridge'),br=ed.nodes.filter(n=>n.type==='bridge');
  const has=(a,b)=>ed.edges.some(e=>(e[0]===a.id&&e[1]===b.id)||(e[0]===b.id&&e[1]===a.id));let add=0;edSnap();
  for(let i=0;i<land.length;i++)for(let j=i+1;j<land.length;j++){const a=land[i],b=land[j],L=Math.hypot(a.x-b.x,a.y-b.y);if(L>300||has(a,b))continue;
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;if(land.some(c=>c!==a&&c!==b&&Math.hypot(c.x-mx,c.y-my)<L/2*0.98))continue;
    if(br.some(c=>Math.hypot(c.x-mx,c.y-my)<L/2*0.9))continue;
    if(segWet(wd,a,b))continue;ed.edges.push([a.id,b.id]);add++;}
  const deg=n=>ed.edges.filter(e=>e[0]===n.id||e[1]===n.id).length;
  for(const a of land){if(deg(a)>=2)continue;const cand=land.filter(c=>c!==a&&!has(a,c)).map(c=>({c,L:Math.hypot(a.x-c.x,a.y-c.y)})).filter(o=>o.L<=560&&!segWet(wd,a,o.c)).sort((x,y)=>x.L-y.L);
    for(const o of cand){if(deg(a)>=2)break;ed.edges.push([a.id,o.c.id]);add++;}}
  for(const b of br){const links=ed.edges.filter(e=>e[0]===b.id||e[1]===b.id).length;if(links>=2)continue;
    const cand=land.map(m=>({m,d:Math.hypot(m.x-b.x,m.y-b.y)})).filter(o=>o.d<320).sort((x,y)=>x.d-y.d);
    const done=new Set(ed.edges.filter(e=>e[0]===b.id||e[1]===b.id).map(e=>edCompAt(...(()=>{const o=ed.nodes.find(n=>n.id===(e[0]===b.id?e[1]:e[0]));return[o.x,o.y];})())));
    for(const o of cand){const c=edCompAt(o.m.x,o.m.y);if(done.has(c)||has(b,o.m))continue;ed.edges.push([b.id,o.m.id]);done.add(c);add++;if(done.size>=2)break;}}
  edHint(add?MSG(add>1?'{n} routes ajoutées. Vérifiez et retirez celles qui ne vous plaisent pas.':'{n} route ajoutée. Vérifiez et retirez celles qui ne vous plaisent pas.',{n:add}):'Aucune route à ajouter.');edRefresh();
}
function edFinishRiver(){if(!edRiver)return;if(edRiver.pts.length<2){ed.rivers=ed.rivers.filter(r=>r!==edRiver);edHint('Rivière annulée : il faut au moins deux points.',true);}
  else{edSel={k:'river',r:edRiver};for(const n of ed.nodes)if(n.type==='bridge')n.river=riverNear(n.x,n.y,n.river);}edRiver=null;edCompCache=null;edRefresh();}
function setEdTool(k){if(edRiver)edFinishRiver();edTool=k;edLink=null;document.querySelectorAll('#edTools .tool').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===k)));edToolOpts();edRender();
  const t=TOOLS.find(x=>x.k===k);$('edTip').textContent=t?trad(t.d):'';}
function edToolOpts(){
  const o=$('edOpts');let h='';
  if(edTool==='dist'||edTool==='gare')h=`<span class="lbl">${trad('Camp de départ')}</span><div class="seg" id="edSideSeg">${[['A','Attaquants'],['N','Neutre'],['B','Défenseurs']].map(([s,l])=>`<button data-s="${s}" aria-pressed="${edSide===s}">${trad(l)}</button>`).join('')}</div>`;
  else if(edTool==='river')h=`<span class="lbl">${trad('Largeur : {m}',{m:`<b id="edHWv">${edHW*8} m</b>`})}</span><input type="range" id="edHW" min="7" max="30" value="${edHW}"><button class="btn sm gold" id="edRivEnd">${trad('Terminer la rivière')}</button>`;
  else if(edTool==='zone')h=`<span class="lbl">${trad('Zone à peindre')}</span><div class="zpick">${[trad('Aucune'),...ed.zones.map(z=>trad(z.n))].map((n,k)=>`<button class="btn sm" data-z="${k}" aria-pressed="${edZone===k}">${k?`<i class="zdot" style="background:${ZCOL[k-1]}"></i>`:''}${esc(n)}</button>`).join('')}</div>`;
  o.innerHTML=h;o.hidden=!h;
  o.querySelectorAll('#edSideSeg button').forEach(b=>b.onclick=()=>{edSide=b.dataset.s;edToolOpts();});
  const hw=o.querySelector('#edHW');if(hw)hw.oninput=()=>{edHW=+hw.value;$('edHWv').textContent=`${edHW*8} m`;if(edRiver){edRiver.hw=edHW;edCompCache=null;edRender();}};
  const re=o.querySelector('#edRivEnd');if(re)re.onclick=edFinishRiver;
  o.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{edZone=+b.dataset.z;edToolOpts();});
}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Données venues d'ailleurs (autres joueurs, carte importée) : les caractères qui permettraient d'injecter du HTML
   sont remplacés par leurs équivalents typographiques, le texte reste lisible. */
const nettoyer=v=>typeof v==='string'?v.replace(/[<>"'`]/g,c=>({'<':'‹','>':'›','"':'”',"'":'’','`':'’'}[c])):Array.isArray(v)?v.map(nettoyer):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[nettoyer(k),nettoyer(x)])):v;
function edRefresh(){edCompCache=null;edPanel();edRender();}
function edPanel(){
  const box=$('edSelBox');const s=edSel;let h='';
  if(s&&s.k==='node'&&ed.nodes.includes(s.n)){const n=s.n;
    h=`<div class="cardhead"><span class="lbl">${trad('Point sélectionné')}</span><button class="btn sm" id="edDel">${trad('Supprimer')}</button></div>
      <label class="field"><span class="lbl">${trad('Nom')}</span><input class="edin" id="edNName" maxlength="26" value="${esc(n.name)}"></label>`;
    if(n.type!=='bridge'){h+=`<label class="field"><span class="lbl">${trad('Type')}</span><select class="edin" id="edNType">${[['dist','Quartier'],['obj','Objectif'],['gare','Gare'],['base','QG']].map(([k,l])=>`<option value="${k}"${n.type===k?' selected':''}>${trad(l)}</option>`).join('')}</select></label>
      <div class="field"><span class="lbl">${trad('Camp au départ')}</span><div class="seg" id="edNSide">${[['A','Attaquants'],['N','Neutre'],['B','Défenseurs']].map(([k,l])=>`<button data-s="${k}" aria-pressed="${n.side===k}"${n.type==='base'&&k==='N'?' disabled':''}>${trad(l)}</button>`).join('')}</div></div>
      <label class="chk"><input type="checkbox" id="edNHill"${n.hill?' checked':''}> ${trad('Colline : 35 % de soldats en plus pour le prendre')}</label>
      <label class="field"><span class="lbl">${trad('Zone')}</span><select class="edin" id="edNZone"><option value="0">${trad('Aucune')}</option>${ed.zones.map((z,k)=>`<option value="${k+1}"${n.zone===k+1?' selected':''}>${esc(trad(z.n))}</option>`).join('')}</select></label>`;}
    else h+=`<p class="mini">${esc(trad('Pont {de}. Il doit relier un point de chaque rive.',{de:deOf2(n),riviere:n.river||''}))}</p>
      <div class="field"><span class="lbl">${trad('Tenu au départ par')}</span><div class="seg" id="edNSide">${[['A','Attaquants'],['N','Personne'],['B','Défenseurs']].map(([k,l])=>`<button data-s="${k}" aria-pressed="${n.side===k}">${trad(l)}</button>`).join('')}</div></div>`;
  }else if(s&&s.k==='river'&&ed.rivers.includes(s.r)){const r=s.r;
    h=`<div class="cardhead"><span class="lbl">${trad('Rivière sélectionnée')}</span><button class="btn sm" id="edDel">${trad('Supprimer')}</button></div>
      <label class="field"><span class="lbl">${trad("Nom, avec l'article")}</span><input class="edin" id="edRName" maxlength="24" value="${esc(r.n)}" placeholder="${trad("la Loire, le Rhin, l'Ill")}"></label>
      <label class="field"><span class="lbl">${trad('Largeur : {m}',{m:`<b id="edRWv">${r.hw*8} m</b>`})}</span><input type="range" id="edRW" min="7" max="30" value="${r.hw}"></label>
      <p class="mini">${trad('Glissez les points blancs pour modifier le tracé.')}</p>`;
  }else if(s&&s.k==='edge'&&ed.edges.includes(s.e)){const a=ed.nodes.find(n=>n.id===s.e[0]),b=ed.nodes.find(n=>n.id===s.e[1]);
    h=`<div class="cardhead"><span class="lbl">${trad('Route')}</span><button class="btn sm" id="edDel">${trad('Supprimer')}</button></div><p class="mini">${esc(a?a.name:'?')} ↔ ${esc(b?b.name:'?')}</p>`;
  }else{edSel=null;h=`<span class="lbl">${trad('Sélection')}</span><p class="mini">${trad('Choisissez un outil à gauche. Avec la sélection, cliquez un point, une route ou une rivière pour le modifier.')}</p>
      <p class="mini">${trad('Clic droit ou glisser sur le vide : déplacer la vue · molette : zoom · {annuler} annuler · {suppr} effacer.',{annuler:K('Ctrl')+K('Z'),suppr:K(trad('Suppr'))})}</p>`;}
  box.innerHTML=h;
  const on=(id,ev,f)=>{const el=box.querySelector('#'+id);if(el)el[ev]=f;};
  on('edDel','onclick',()=>{if(s.k==='node')edErase({k:'node',n:s.n});else if(s.k==='river')edErase({k:'river',r:s.r});else if(s.k==='edge')edErase({k:'edge',e:s.e});edSel=null;edRefresh();});
  on('edNName','onchange',e=>{edSnap();s.n.name=e.target.value.trim().slice(0,26)||s.n.name;edRefresh();});
  on('edNType','onchange',e=>{edSnap();const t=e.target.value;if(t==='base'){if(s.n.side==='N')s.n.side=edCountType('base','A')?'B':'A';const other=ed.nodes.find(n=>n!==s.n&&n.type==='base'&&n.side===s.n.side);if(other)other.type='dist';}s.n.type=t;if(t==='obj'&&s.n.side!=='N')s.n.side='N';edRefresh();});
  box.querySelectorAll('#edNSide button').forEach(b=>b.onclick=()=>{edSnap();s.n.side=b.dataset.s;if(s.n.type==='base'){const other=ed.nodes.find(n=>n!==s.n&&n.type==='base'&&n.side===s.n.side);if(other)other.side=s.n.side==='A'?'B':'A';}edRefresh();});
  on('edNHill','onchange',e=>{edSnap();s.n.hill=e.target.checked;edRefresh();});
  on('edNZone','onchange',e=>{edSnap();s.n.zone=+e.target.value;edRefresh();});
  on('edRName','onchange',e=>{edSnap();const old=s.r.n;s.r.n=e.target.value.trim().slice(0,24)||old;s.r.de=deFor(s.r.n);s.r.auto=true;for(const n of ed.nodes)if(n.type==='bridge'&&n.river===old)n.river=s.r.n;edRefresh();});
  const rw=box.querySelector('#edRW');if(rw){rw.onpointerdown=()=>edSnap();rw.oninput=()=>{s.r.hw=+rw.value;box.querySelector('#edRWv').textContent=`${s.r.hw*8} m`;edCompCache=null;edRender();edChecks();};}
  // zones
  const zb=$('edZones');zb.innerHTML=ed.zones.map((z,k)=>{const c=ed.nodes.filter(n=>n.zone===k+1).length;return `<div class="zrow"><i class="zdot" style="background:${ZCOL[k]}"></i><input class="edin" data-zn="${k}" maxlength="26" value="${esc(trad(z.n))}"><select class="edin" data-zr="${k}">${ROLES.map(([r,l])=>`<option value="${r}"${z.role===r?' selected':''}>${trad(l)}</option>`).join('')}</select><span class="zc">${c}</span></div>`;}).join('');
  zb.querySelectorAll('[data-zn]').forEach(i=>i.onchange=()=>{edSnap();ed.zones[+i.dataset.zn].n=i.value.trim().slice(0,26)||`Zone ${+i.dataset.zn+1}`;edPanel();edToolOpts();});
  zb.querySelectorAll('[data-zr]').forEach(i=>i.onchange=()=>{edSnap();ed.zones[+i.dataset.zr].role=i.value;edPanel();});
  edChecks();
}
function deOf2(n){const r=ed.rivers.find(x=>x.n===n.river);return r?(r.de||deFor(r.n)):(ed.water.de&&ed.water.de[n.river])||deFor(n.river||'la rivière');}
function edChecks(){
  if(!ed)return;const m=toMap(ed),pb=mapProblems(m);edBad=pb.bad;
  const cA=ed.nodes.filter(n=>n.side==='A').length,cB=ed.nodes.filter(n=>n.side==='B').length;
  $('edStats').textContent=trad(m.obj.length>1?'{n}/{max} points · {r} routes · {a} attaquants · {b} défenseurs · {o} objectifs':'{n}/{max} points · {r} routes · {a} attaquants · {b} défenseurs · {o} objectif',{n:ed.nodes.length,max:MAXN,r:ed.edges.length,a:cA,b:cB,o:m.obj.length});
  $('edCheck').innerHTML=pb.errs.map(t=>`<div class="e">✕ ${esc(tx(t))}</div>`).join('')+pb.warns.map(t=>`<div class="w">• ${esc(tx(t))}</div>`).join('')+(pb.errs.length?'':`<div class="ok">✓ ${trad('La carte est jouable.')}</div>`);
  $('edTest').disabled=!!pb.errs.length;
}
let edBad=new Set();
function edRender(){
  if(!ed||$('edOv').hidden)return;const g=edG,z=edCam.z;
  g.setTransform(edDpr,0,0,edDpr,0,0);g.fillStyle=C.ink;g.fillRect(0,0,edVW,edVH);
  const[ox,oy]=eS(0,0);g.save();g.translate(ox,oy);g.scale(z,z);g.fillStyle=C.land;g.fillRect(0,0,W,H);
  drawWater(g,edWater());
  g.strokeStyle='rgba(232,227,216,0.05)';g.lineWidth=1/z;for(let x=100;x<W;x+=100){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=100;y<H;y+=100){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  g.strokeStyle='rgba(232,227,216,0.25)';g.lineWidth=2/z;g.strokeRect(0,0,W,H);
  if(edRiver&&edMouse){const[wx,wy]=eW(edMouse.x,edMouse.y);const p=edRiver.pts;if(p.length){g.strokeStyle='rgba(120,190,210,0.55)';g.lineWidth=edRiver.hw*2;g.lineCap='round';g.beginPath();g.moveTo(p[p.length-1][0],p[p.length-1][1]);g.lineTo(wx,wy);g.stroke();}}
  g.restore();
  const byId={};for(const n of ed.nodes)byId[n.id]=n;
  g.lineCap='round';
  for(const e of ed.edges){const A=byId[e[0]],B=byId[e[1]];if(!A||!B)continue;const[x1,y1]=eS(A.x,A.y),[x2,y2]=eS(B.x,B.y);const sel=edSel&&edSel.e===e,bad=edBad.has(e[0]+'|'+e[1]);
    g.strokeStyle=bad?C.atk:sel?C.gold:A.side===B.side&&A.side!=='N'?(A.side==='A'?'rgba(226,104,63,0.7)':'rgba(78,149,220,0.7)'):'rgba(232,227,216,0.45)';g.lineWidth=sel?3.5:2.2;g.setLineDash(bad?[5,4]:[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
  g.setLineDash([]);
  if(edSel&&edSel.k==='river'&&ed.rivers.includes(edSel.r)){const r=edSel.r;g.strokeStyle=C.gold;g.lineWidth=2;g.setLineDash([6,5]);g.beginPath();r.pts.forEach((p,i)=>{const[x,y]=eS(p[0],p[1]);i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();g.setLineDash([]);
    for(const p of r.pts){const[x,y]=eS(p[0],p[1]);g.fillStyle=C.text;g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.arc(x,y,5,0,Math.PI*2);g.fill();g.stroke();}}
  if(edRiver)for(const p of edRiver.pts){const[x,y]=eS(p[0],p[1]);g.fillStyle=C.gold;g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();}
  if(edLink&&edMouse){const[x,y]=eS(edLink.x,edLink.y);g.strokeStyle=C.gold;g.lineWidth=2;g.setLineDash([6,5]);g.beginPath();g.moveTo(x,y);g.lineTo(edMouse.x,edMouse.y);g.stroke();g.setLineDash([]);}
  const zz=Math.max(0.7,Math.min(1.4,z));
  for(const n of ed.nodes){const[x,y]=eS(n.x,n.y),r=nodeR(n)*zz,col=n.side==='A'?C.atk:n.side==='B'?C.def:n.type==='obj'?C.gold:C.neu;
    if(n.zone){g.strokeStyle=ZCOL[n.zone-1];g.globalAlpha=0.85;g.lineWidth=3;g.beginPath();g.arc(x,y,r+6,0,Math.PI*2);g.stroke();g.globalAlpha=1;}
    if(n.type==='obj'){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.strokeStyle=C.gold;g.lineWidth=2;g.strokeRect(-r-3,-r-3,2*r+6,2*r+6);g.restore();}
    g.beginPath();if(n.type==='base')g.rect(x-r,y-r,2*r,2*r);else if(n.type==='bridge'){g.rect(x-r*1.4,y-r*0.9,r*2.8,r*1.8);}else g.arc(x,y,r,0,Math.PI*2);
    g.fillStyle=C.ink;g.fill();g.lineWidth=n.type==='bridge'?2:3;g.strokeStyle=col;g.stroke();
    if(n.hill){g.fillStyle=C.gold;g.font=`800 ${Math.round(11*zz)}px ${FD}`;g.textAlign='center';g.textBaseline='middle';g.fillText('▲',x,y+1);}
    else if(n.type==='base'){g.fillStyle=col;g.font=`800 ${Math.round(11*zz)}px ${FD}`;g.textAlign='center';g.textBaseline='middle';g.fillText(trad('QG'),x,y+1);}
    else if(n.type==='gare'){g.fillStyle=col;g.font=`800 ${Math.round(10*zz)}px ${FD}`;g.textAlign='center';g.textBaseline='middle';g.fillText('G',x,y+1);}
    if(edBad.has(n.id)){g.strokeStyle=C.atk;g.lineWidth=2;g.setLineDash([4,3]);g.beginPath();g.arc(x,y,r+10,0,Math.PI*2);g.stroke();g.setLineDash([]);}
    if((edSel&&edSel.n===n)||edLink===n){g.strokeStyle=C.text;g.lineWidth=2;g.setLineDash([5,4]);g.beginPath();g.arc(x,y,r+12,0,Math.PI*2);g.stroke();g.setLineDash([]);}
    if(n.type!=='bridge'||z>1.1||(edSel&&edSel.n===n)){const fs=Math.round((n.type==='bridge'?10:11.5)*zz);g.font=`600 ${fs}px ${FB}`;g.textAlign='center';g.textBaseline='top';g.lineJoin='round';g.lineWidth=3.5;g.strokeStyle=C.ink;g.strokeText(n.name,x,y+r+4);g.fillStyle=n.type==='obj'?C.gold:C.text;g.fillText(n.name,x,y+r+4);}}
  if(edMouse&&['dist','obj','gare','qgA','qgB','bridge'].includes(edTool)){const[wx,wy]=eW(edMouse.x,edMouse.y);const ok=edTool==='bridge'?waterAt(edWater(),wx,wy):!waterAt(edWater(),wx,wy);
    g.globalAlpha=0.6;g.strokeStyle=ok?C.gold:C.atk;g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(edMouse.x,edMouse.y,14,0,Math.PI*2);g.stroke();g.setLineDash([]);g.globalAlpha=1;}
}
const edPos=e=>{const r=edCv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
edCv.addEventListener('pointerdown',e=>{if(!ed)return;edCv.setPointerCapture(e.pointerId);const[x,y]=edPos(e);edPtr.set(e.pointerId,[x,y]);
  if(edPtr.size===2){const[a,b]=[...edPtr.values()];edDrag={mode:'pinch',d0:Math.hypot(a[0]-b[0],a[1]-b[1]),z0:edCam.z};return;}
  const h=e.button===0?edHit(x,y):null;
  edDrag={btn:e.button,sx:x,sy:y,lx:x,ly:y,mode:'pending',h};
  if(e.button===0&&edTool==='sel'&&h&&(h.k==='node'||h.k==='rpt')){edDrag.mode='pendmove';}
});
edCv.addEventListener('pointermove',e=>{if(!ed)return;const[x,y]=edPos(e);edMouse={x,y};if(edPtr.has(e.pointerId))edPtr.set(e.pointerId,[x,y]);
  const d=edDrag;if(!d){edRender();return;}
  if(d.mode==='pinch'&&edPtr.size===2){const[a,b]=[...edPtr.values()];edZoom((a[0]+b[0])/2,(a[1]+b[1])/2,(d.z0*Math.hypot(a[0]-b[0],a[1]-b[1])/d.d0)/edCam.z);return;}
  if((d.mode==='pending'||d.mode==='pendmove')&&Math.hypot(x-d.sx,y-d.sy)>5){if(d.mode==='pendmove'){edSnap();d.mode='move';}else d.mode='pan';}
  if(d.mode==='pan'){edCam.x-=(x-d.lx)/edCam.z;edCam.y-=(y-d.ly)/edCam.z;edClamp();}
  if(d.mode==='move'){const[wx,wy]=eW(x,y);const cx=Math.max(10,Math.min(W-10,wx)),cy=Math.max(10,Math.min(H-10,wy));if(d.h.k==='node'){d.h.n.x=cx;d.h.n.y=cy;}else{d.h.r.pts[d.h.i]=[cx,cy];edCompCache=null;}}
  d.lx=x;d.ly=y;edRender();});
const edEnd=e=>{edPtr.delete(e.pointerId);const d=edDrag;if(!d)return;if(d.mode==='pinch'){if(!edPtr.size)edDrag=null;return;}edDrag=null;
  if(d.mode==='move'){if(d.h.k==='node'&&d.h.n.type==='bridge')d.h.n.river=riverNear(d.h.n.x,d.h.n.y,d.h.n.river);edSel=d.h.k==='node'?{k:'node',n:d.h.n}:{k:'river',r:d.h.r};edRefresh();return;}
  if(d.mode!=='pending'&&d.mode!=='pendmove')return;if(e.type!=='pointerup')return;
  const[x,y]=edPos(e),[wx,wy]=eW(x,y);
  if(d.btn===2){if(edRiver)edFinishRiver();else if(edLink){edLink=null;edRender();}return;}
  if(d.btn!==0)return;const h=d.h;
  switch(edTool){
    case 'sel':edSel=h&&h.k==='rpt'?{k:'river',r:h.r}:h;edRefresh();break;
    case 'dist':case 'obj':case 'gare':case 'qgA':case 'qgB':case 'bridge':if(h&&h.k==='node'){edSel=h;edRefresh();}else edAddNode(edTool,Math.round(wx),Math.round(wy));break;
    case 'road':if(h&&h.k==='node'){if(!edLink){edLink=h.n;edRender();}else if(edLink===h.n){edLink=null;edRender();}else{edToggleEdge(edLink,h.n);edLink=h.n;}}else if(h&&h.k==='edge'){edSnap();ed.edges=ed.edges.filter(x=>x!==h.e);edRefresh();}else{edLink=null;edRender();}break;
    case 'river':{if(!edRiver){edSnap();edRiver={n:`la rivière ${ed.rivers.length+1}`,de:'',hw:edHW,auto:true,pts:[]};edRiver.de=deFor(edRiver.n);ed.rivers.push(edRiver);}
      const p=edRiver.pts,last=p[p.length-1];if(last&&Math.hypot(last[0]-wx,last[1]-wy)<6/edCam.z){edFinishRiver();break;}
      p.push([Math.round(wx),Math.round(wy)]);if(p.length===1){const ex=v=>v<40?-30:v>(v===wx?W:H)-40?(v===wx?W:H)+30:v;if(wx<40||wy<40||wx>W-40||wy>H-40)p[0]=[wx<40?-30:wx>W-40?W+30:p[0][0],wy<40?-30:wy>H-40?H+30:p[0][1]];}
      edCompCache=null;edRender();break;}
    case 'zone':if(h&&h.k==='node'&&h.n.type!=='bridge'){edSnap();h.n.zone=h.n.zone===edZone?0:edZone;edRefresh();}break;
    case 'erase':edErase(h);break;
  }};
edCv.addEventListener('pointerup',edEnd);edCv.addEventListener('pointercancel',edEnd);
edCv.addEventListener('pointerleave',()=>{edMouse=null;edRender();});
edCv.addEventListener('dblclick',()=>{if(edRiver){const p=edRiver.pts;if(p.length>2&&Math.hypot(p[p.length-1][0]-p[p.length-2][0],p[p.length-1][1]-p[p.length-2][1])<8)p.pop();edFinishRiver();}});
edCv.addEventListener('contextmenu',e=>e.preventDefault());
edCv.addEventListener('wheel',e=>{e.preventDefault();const[x,y]=edPos(e);edZoom(x,y,Math.exp(-e.deltaY*0.0015));},{passive:false});
function edKey(e){
  if($('edOv').hidden)return false;const tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA'){if(e.key==='Escape')e.target.blur();return true;}
  const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();edUndoDo();return true;}
  if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();edSave();return true;}
  if(k==='escape'){if(!$('edIOv').hidden){$('edIOv').hidden=true;return true;}if(edRiver)edFinishRiver();else if(edLink){edLink=null;edRender();}else{edSel=null;edRefresh();}return true;}
  if(k==='enter'&&edRiver){edFinishRiver();return true;}
  if((k==='delete'||k==='backspace')&&edSel){edErase(edSel);edSel=null;edRefresh();return true;}
  const t=TOOLS.find(x=>x.key.toLowerCase()===k);if(t){setEdTool(t.k);return true;}
  if(k==='+'||k==='='){edZoom(edVW/2,edVH/2,1.25);return true;}if(k==='-'){edZoom(edVW/2,edVH/2,0.8);return true;}
  return true;
}
// barre d'outils
$('edTools').insertAdjacentHTML('afterbegin',TOOLS.map(t=>`<button class="tool" data-t="${t.k}" aria-pressed="false"><i class="ti ti-${t.k}"></i><span>${trad(t.n)}</span><span class="key">${t.key}</span></button>`).join(''));
document.querySelectorAll('#edTools .tool').forEach(b=>b.onclick=()=>setEdTool(b.dataset.t));
$('edName').onchange=()=>{edSnap();ed.name=$('edName').value.trim().slice(0,28)||ed.name;edChecks();};
$('edSave').onclick=()=>edSave();$('edTest').onclick=edTest;$('edClose').onclick=()=>edClose(false);
$('edUndo').onclick=edUndoDo;$('edAuto').onclick=edAutoLink;$('edFit').onclick=()=>{edCam={x:W/2,y:H/2,z:edFitZ};edRender();};
$('edBase').innerHTML=`<option value="">${trad('Nouvelle carte…')}</option><option value="blank">${trad('Carte vierge')}</option>`+MAP_ORDER.map(id=>`<option value="${id}">${trad('Copie de {nom}',{nom:MAPS[id].name})}</option>`).join('');
$('edBase').onchange=()=>{const v=$('edBase').value;$('edBase').value='';if(!v)return;const keepDirty=edDirty;if(v==='blank')edOpen(null);else edOpen(MAPS[v],true);if(keepDirty)edHint("Nouvelle carte créée. La précédente n'était pas enregistrée.");};
$('edIO').onclick=()=>{$('edIOText').value=JSON.stringify(toMap(ed));$('edIOMsg').textContent=trad("Copiez ce texte pour partager votre carte, ou collez celui d'une autre carte puis importez-le.");$('edIOMsg').className='mini';$('edIOv').hidden=false;};
$('edIOClose').onclick=()=>{$('edIOv').hidden=true;};
$('edIOCopy').onclick=()=>{const t=$('edIOText');t.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(t.value).then(()=>{$('edIOMsg').textContent=trad('Copié dans le presse-papiers.');},()=>{});if(ok)$('edIOMsg').textContent=trad('Copié dans le presse-papiers.');};
$('edIOImport').onclick=()=>{let m;try{m=nettoyer(JSON.parse($('edIOText').value));}catch(e){m=null;}
  if(!m||!Array.isArray(m.nodes)||!m.hq||typeof m.name!=='string'){$('edIOMsg').textContent=trad("Ce texte n'est pas une carte valide.");$('edIOMsg').className='mini warn';return;}
  try{const clean=sanitizeMap(m);edSnap();ed=fromMap(clean,true);ed.name=clean.name;$('edName').value=ed.name;edSel=null;edRefresh();$('edIOv').hidden=true;edHint('Carte importée. Enregistrez-la pour la garder.');}
  catch(e){$('edIOMsg').textContent=trad("Impossible d'importer cette carte.");$('edIOMsg').className='mini warn';}};
addEventListener('resize',()=>{if(ed&&!$('edOv').hidden){edResize();edClamp();edRender();}});
setInterval(()=>{if(edHintT>0){edHintT-=0.25;if(edHintT<=0)$('edHint').hidden=true;}},250);
/* nettoyage d'une carte venue de l'extérieur (import, partie en ligne) */
function sanitizeMap(m){
  const str=(v,n)=>String(v==null?'':v).replace(/[\u0000-\u001f<>]/g,'').slice(0,n);
  const num=(v,a,b)=>{v=+v;return Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;};
  const okId=v=>typeof v==='string'&&/^[A-Za-z0-9_\-]{1,40}$/.test(v);
  const out={id:okId(m.id)?m.id:newId('c'),name:str(m.name,28)||'Carte importée',custom:true,sub:'',desc:str(m.desc,400),sides:null,water:{},deco:{},nodes:[],bridges:[],edges:[],obj:[],hq:{},arr:[],ev:null,ref:null,prodA:num(m.prodA||1.04,0.8,1.3)};
  const pts=a=>Array.isArray(a)?a.slice(0,80).map(p=>[num(p&&p[0],-60,W+60),num(p&&p[1],-60,H+60)]):[];
  const ell=a=>Array.isArray(a)?a.slice(0,20).map(e=>[num(e[0],-200,W+200),num(e[1],-200,H+200),num(e[2],1,900),num(e[3],1,900),num(e[4]||0,-7,7)]):[];
  const w=m.water||{};out.water.rivers=(Array.isArray(w.rivers)?w.rivers:[]).slice(0,12).map(r=>({n:str(r.n,24)||'la rivière',de:str(r.de,30)||deFor(str(r.n,24)),hw:num(r.hw,5,40),auto:!!r.auto,pts:pts(r.pts)})).filter(r=>r.pts.length>1);
  if(w.lakes)out.water.lakes=ell(w.lakes);if(w.islands)out.water.islands=ell(w.islands);
  if(Array.isArray(w.sea))out.water.sea=w.sea.slice(0,6).map(pts).filter(p=>p.length>2);
  if(w.de&&typeof w.de==='object'){out.water.de={};for(const k of Object.keys(w.de).slice(0,12))out.water.de[str(k,24)]=str(w.de[k],30);}
  const ids=new Set();
  for(const n of(m.nodes||[]).slice(0,MAXN)){if(!Array.isArray(n)||!okId(n[0])||ids.has(n[0]))continue;const t=TYPES[n[4]]&&n[4]!=='bridge'?n[4]:'dist',o=n[5]||{},oo={};
    if(o.side==='A'||o.side==='B')oo.side=o.side;if(o.hill){oo.hill=1;oo.def=1.35;}else if(o.def)oo.def=num(o.def,0.8,2);if(o.gare)oo.gare=1;
    ids.add(n[0]);out.nodes.push([n[0],str(n[1],26)||'Quartier',num(n[2],0,W),num(n[3],0,H),t,oo]);}
  for(const b of(m.bridges||[]).slice(0,MAXN)){if(!Array.isArray(b)||!okId(b[0])||ids.has(b[0]))continue;ids.add(b[0]);const r=[b[0],str(b[1],26)||'Pont',num(b[2],0,W),num(b[3],0,H),str(b[4],24)||'la rivière'];if(b[5]==='A'||b[5]==='B')r.push(b[5]);out.bridges.push(r);}
  for(const e of parseEdges(Array.isArray(m.edges)||typeof m.edges==='string'?m.edges:[]).slice(0,400))if(ids.has(e[0])&&ids.has(e[1])&&e[0]!==e[1])out.edges.push([e[0],e[1]]);
  out.obj=(Array.isArray(m.obj)?m.obj:[]).filter(id=>ids.has(id)&&out.nodes.some(n=>n[0]===id)).slice(0,12);
  for(const s of['A','B'])if(m.hq&&ids.has(m.hq[s]))out.hq[s]=m.hq[s];
  out.arr=(Array.isArray(m.arr)?m.arr:[]).slice(0,6).map(a=>({n:str(a.n,26)||'Zone',sub:str(a.sub,40),role:BONUS[a.role]?a.role:'inc',ids:(Array.isArray(a.ids)?a.ids:[]).filter(id=>ids.has(id))})).filter(a=>a.ids.length);
  const D=m.deco||{};out.deco.labels=(Array.isArray(D.labels)?D.labels:[]).slice(0,20).map(l=>[str(l[0],30),num(l[1],0,W),num(l[2],0,H),num(l[3]||0,-7,7),['r','A','B','C'].includes(l[4])?l[4]:'r',l[5]?1:0]);
  for(const k of['hills','parks','ponds'])if(Array.isArray(D[k]))out.deco[k]=ell(D[k].map(e=>[e[0],e[1],e[2],e[3],e[4]||0]));
  if(Array.isArray(D.rails))out.deco.rails=D.rails.slice(0,10).map(pts).filter(p=>p.length>1);
  if(Array.isArray(D.center))out.deco.center=[num(D.center[0],0,W),num(D.center[1],0,H)];
  if(m.sides&&typeof m.sides==='object')out.sides={A:{t:str(m.sides.A&&m.sides.A.t,200)},B:{t:str(m.sides.B&&m.sides.B.t,200)}};
  if(m.ev&&typeof m.ev==='object'){const v=m.ev,ev={};if(v.greve)ev.greve=str(v.greve,40);if(v.paper)ev.paper=str(v.paper,30);
    if(v.fete&&ids.has(v.fete.node))ev.fete={node:v.fete.node,title:str(v.fete.title,40),text:str(v.fete.text,120)};if(v.riot&&ids.has(v.riot.node))ev.riot={node:v.riot.node,title:str(v.riot.title,40)};
    if(v.match&&Array.isArray(v.match.ids))ev.match={title:str(v.match.title,50),ids:v.match.ids.filter(id=>ids.has(id)).slice(0,6),text:str(v.match.text,120)};
    if(v.party)ev.party={title:str(v.party.title,40),text:str(v.party.text,120)};if(v.help)ev.help={t:str(v.help.t,50),c:str(v.help.c,40)};out.ev=ev;}
  if(ids.has(m.ref))out.ref=m.ref;
  const nb=out.bridges.length,no=out.obj.length;out.sub=`Carte perso · ${out.nodes.length} points · ${nb} pont${nb>1?'s':''} · ${no} objectif${no>1?'s':''}`;
  return out;
}


function refreshEdBase(){const sel=$('edBase');sel.innerHTML=`<option value="">${trad('Nouvelle carte…')}</option><option value="blank">${trad('Carte vierge')}</option>`+MAP_ORDER.map(id=>`<option value="b:${id}">${esc(trad('Copie de {nom}',{nom:MAPS[id].name}))}</option>`).join('')+customMaps.map(m=>`<option value="c:${esc(m.id)}">${esc(trad('Copie de {nom}',{nom:m.name}))}</option>`).join('');}
$('edBase').onchange=()=>{const v=$('edBase').value;$('edBase').value='';if(!v)return;const keep=edDirty;
  if(v==='blank')edOpen(null);else{const m=v.startsWith('b:')?MAPS[v.slice(2)]:customMaps.find(x=>x.id===v.slice(2));if(m)edOpen(m,true);}
  if(keep)edHint("Nouvelle carte créée. La précédente n'était pas enregistrée.");};
{const _edOpen=edOpen;edOpen=function(m,copy){refreshEdBase();_edOpen(m,copy);};}
addEventListener('keydown',e=>{if(!$('edOv').hidden&&ed)edKey(e);});

/* ================= Écrans ================= */
let chosen='A';
const pickCamp=s=>{chosen=s;$('campA').setAttribute('aria-pressed',String(s==='A'));$('campB').setAttribute('aria-pressed',String(s==='B'));};
$('campA').onclick=()=>pickCamp('A');$('campB').onclick=()=>pickCamp('B');
document.querySelectorAll('#diff button').forEach(b=>b.onclick=()=>{diff=+b.dataset.d;document.querySelectorAll('#diff button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
document.querySelectorAll('#fmtSeg button').forEach(b=>b.onclick=()=>{fmtIdx=+b.dataset.f;document.querySelectorAll('#fmtSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
function showStart(){
  renderCareer();renderLobby();
  $('startOv').hidden=false;$('endOv').hidden=true;$('ctx').hidden=true;banner.hidden=true;$('hoOv').hidden=true;$('netOv').hidden=true;$('turnBtn').hidden=true;$('tip').hidden=true;
  if(!NET.role)netStatus('');
  if(NET.lastRanked&&!NET.role){mode='ranked';NET.lastRanked=false;setModeUI();}rkRender();
  const s=readSave();const b=$('contBtn');
  if(s){const mn=typeof s.map==='string'?(MAPS[s.map]&&MAPS[s.map].name):(s.map&&s.map.name);b.hidden=false;b.textContent=`${trad('Continuer')} · ${mn?mn+' · ':''}${trad(sideName(s.player))} · ${fmt(s.time)}`;}else b.hidden=true;
}
function beginPlay(){
  state='play';paused=false;menuOpen=false;setSpeed(1);setRatio(0.5);abMode=-1;
  $('startOv').hidden=true;$('endOv').hidden=true;$('menuOv').hidden=true;banner.hidden=true;
  $('app').classList.toggle('spectate',spectate);$('simCard').hidden=!spectate;$('hoOv').hidden=true;$('netOv').hidden=true;setSideTag();
  document.documentElement.style.setProperty('--side',OC[player]);
  buildAbList();buildArsenal();layout();cam.set=false;fit(false);aim=-1;setSheet('',true);mobileCam();hud();
}
function setSideTag(){
  const tag=$('sideTag');
  const camp=(pl)=>`<b style="color:${OC[player]}">${trad(sideName(player,pl))}</b>`,ville=esc(MAP.name),ia=trad('IA {niveau}',{niveau:trad(DIFF[diff].name)}),sect=()=>trad('secteur {nom}',{nom:trad(SECN[player][mySec])});
  if(spectate)tag.innerHTML=`${trad('Simulation')} · ${ville} · ${ia} · ${trad('vous suivez les {camp}',{camp:camp(1)})}`;
  else if(mode==='local')tag.innerHTML=`${trad('Deux joueurs')} · ${ville} · ${trad('manche {n}',{n:turn.round})} · `+(turn.phase==='exec'?trad('exécution'):trad('au tour des {camp}',{camp:camp(1)}));
  else if(mode==='online')tag.innerHTML=`${trad(NET.ranked?'Classée':TEAM?'2 contre 2':'En ligne')} · ${ville} · ${trad('vous : {camp}',{camp:camp(0)})}${TEAM?' · '+sect():''}`;
  else tag.innerHTML=`${trad('Vous : {camp}',{camp:camp(0)})}${TEAM?` · ${sect()} · ${trad('2 contre 2')}`:` · ${trad(GRADES[gradeIdx(profile.xp[player])].n)}`} · ${ville} · ${ia}`;
}
function follow(s){if(!spectate)return;player=s;sel.clear();selDead=-1;document.documentElement.style.setProperty('--side',OC[player]);buildAbList();buildArsenal();setSideTag();
  $('folA').setAttribute('aria-pressed',String(s==='A'));$('folB').setAttribute('aria-pressed',String(s==='B'));hud();}
$('folA').onclick=()=>follow('A');$('folB').onclick=()=>follow('B');
function startSim(){
  spectate=true;mode='sim';resetTeam();ensureMap();player='A';ctrl={A:'ai',B:'ai'};lvl={A:diff,B:diff};FMT=FORMATS[fmtIdx];
  reset();tut=-1;beginPlay();follow('A');log('Simulation : deux IA s\'affrontent','X');
}
function applyPerks(s){for(const id of profile.equip[s]){const pk=PERKS.find(p=>p.id===id);if(pk&&profile.owned.includes(id)){pk.apply(s);P[s].perks.push(pk.n);}}}
function startGame(withTut){
  spectate=false;mode='solo';ensureMap();
  player=chosen;const ai=enemyOf(player);ctrl={[player]:'human',[ai]:'ai'};
  resetTeam();if(teamSize===2&&!withTut){TEAM=true;mySec=1;aiSec[player]=2;}
  if(withTut){diff=0;document.querySelectorAll('#diff button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.d==='0')));}
  lvl={A:diff,B:diff};FMT=FORMATS[fmtIdx];
  reset();tut=withTut?0:-1;for(const k in tutFlag)delete tutFlag[k];
  applyPerks(player);
  beginPlay();clearSave();
  if(P[player].perks.length)log(trad('Avantages équipés : {liste}',{liste:P[player].perks.map(x=>trad(x)).join(', ')}),player,undefined,player);
  log('Préparation : 75 s pour construire, rechercher et planifier vos attaques','X',undefined,player);
  if(TEAM)log(MSG('2 contre 2 : vous commandez le secteur {a} et le QG, une IA alliée tient le secteur {b}. Trésor et capacités sont communs.',{a:SECN[player][mySec],b:SECN[player][3-mySec]}),'X',undefined,player);
  const hq=qgOf(player);sel.clear();sel.add(hq.i);hud();
}
$('goBtn').onclick=()=>{fromEditor=false;if(mode==='local')startLocal();else if(mode==='sim')startSim();else{mode='solo';startGame(false);}};
$('tutBtn').onclick=()=>{fromEditor=false;startGame(true);};
$('contBtn').onclick=()=>{const s=readSave();if(s)loadGame(s);};
$('againBtn').onclick=again;
$('backEdBtn').onclick=()=>{netLeave();state='menu';const m=getMap(curMapId);fromEditor=false;$('endOv').hidden=true;edOpen(m&&m.custom?m:null,false);};
$('homeBtn').onclick=()=>{netLeave();fromEditor=false;state='menu';showStart();};
let simResult=null;
function endGame(winner,why,kind,remote){
  if(state!=='play')return;state='over';
  if(SIM.on){simResult={winner,why,time};return;}
  if(NET.role==='host'&&NET.on&&!remote)netEnd(winner,why,kind);
  if(mode==='solo')clearSave();
  abMode=-1;cv.classList.remove('targeting');$('ctx').hidden=true;tut=-1;banner.hidden=true;$('hoOv').hidden=true;$('turnBtn').hidden=true;$('tip').hidden=true;$('app').classList.remove('locked');
  if(!remote)series.push([Math.round(time),Math.round(army.A),Math.round(army.B),Math.round(P.A.score),Math.round(P.B.score)]);
  const res=winner===null?'draw':winner===player?'win':'lose';
  if(spectate||mode==='local'){
    const ia=trad('IA {niveau}',{niveau:trad(DIFF[diff].name)}),dur=trad('{temps} de combat',{temps:fmt(time)});
    $('endEyebrow').textContent=`${spectate?trad('Simulation')+' · '+ia:trad('Deux joueurs')} · ${MAP.name} · ${trad(FMT.n)} · ${dur}`;
    $('endTitle').textContent=winner?trad('Victoire des {camp}',{camp:trad(sideName(winner,1))}):trad('Match nul');$('endTitle').className='result '+(winner?'win':'draw');$('endXp').hidden=true;}
  else{const ia=trad('IA {niveau}',{niveau:trad(DIFF[diff].name)});$('endEyebrow').textContent=`${trad(sideName(player))} · ${mode==='online'?trad(NET.ranked?'partie classée':TEAM?'en ligne · 2 contre 2':'en ligne'):(TEAM?trad('2 contre 2')+' · ':'')+ia} · ${MAP.name} · ${trad(FMT.n)} · ${trad('{temps} de combat',{temps:fmt(time)})}`;
    $('endTitle').textContent=trad({win:'Victoire',lose:'Défaite',draw:'Match nul'}[res]);$('endTitle').className='result '+res;
    const keepDiff=diff;if(mode==='online')diff=1;const a=award(winner,kind);diff=keepDiff;const g=GRADES[a.after],nx=GRADES[a.after+1];
    $('endXp').innerHTML=`<span class="lbl" style="color:var(--gold)">${trad('Carrière · {camp}',{camp:trad(sideName(player))})}</span><b>+${a.xp} XP${res==='win'?' · '+trad('+1 point de victoire'):''}</b>`+
      (a.after>a.before?`<span>${trad(slotsOf(a.after)>slotsOf(a.before)?"Promotion : vous passez {grade} et gagnez un emplacement d'avantage.":'Promotion : vous passez {grade}.',{grade:`<b style="font-size:inherit">${trad(g.n)}</b>`})}</span>`:`<span>${trad('Grade : {grade}',{grade:trad(g.n)})}${nx?' · '+trad('{a} / {b} XP vers {grade}',{a:profile.xp[player],b:nx.xp,grade:trad(nx.n)}):' · '+trad('grade maximal')}</span>`)+
      `<span class="mini">${trad('{n} PV à dépenser dans la boutique.',{n:profile.pv})}</span>`;$('endXp').hidden=false;
    if(mode==='online'&&NET.ranked)$('endXp').insertAdjacentHTML('beforeend',rkEndHTML(rankedFinish(res==='win'?'w':res==='draw'?'d':'l')));}
  $('endText').textContent=tx(why);
  const cnt=s=>nodes.filter(n=>n.alive&&n.owner===s).length,abu=s=>ABL[s].filter(a=>P[s].ab[a.key]&&P[s].ab[a.key].u).length,tsum=s=>Object.values(P[s].tech||{}).reduce((a,b)=>a+(+b||0),0);
  const liste=a=>a.map(x=>trad(x)).join(', ')||'—';
  const rows=[['Points de contrôle',Math.floor(P.A.score),Math.floor(P.B.score)],['Points tenus',cnt('A'),cnt('B')],['Prises',P.A.caps,P.B.caps],['Soldats perdus',Math.round(P.A.lost),Math.round(P.B.lost)],['Constructions',P.A.built,P.B.built],
    ['Améliorations',tsum('A'),tsum('B')],['Capacités débloquées',abu('A'),abu('B')],['Soutien final',Math.round(P.A.sup)+' %',Math.round(P.B.sup)+' %'],
    ['Décisions',liste(P.A.decisions),liste(P.B.decisions)],['Avantages',liste(P.A.perks),liste(P.B.perks)]];
  $('endStats').innerHTML=`<span></span><span class="h" style="color:${C.atk}">${trad('Attaquants')}</span><span class="h" style="color:${C.def}">${trad('Défenseurs')}</span>`+rows.map(r=>`<span class="k">${esc(trad(r[0]))}</span><span>${esc(r[1])}</span><span>${esc(r[2])}</span>`).join('');
  $('againBtn').hidden=mode==='online';$('backEdBtn').hidden=!fromEditor;
  setTimeout(()=>{$('endOv').hidden=false;drawEndChart();},700);
}
function drawEndChart(){
  const c=$('endChart'),w=c.clientWidth,h=c.clientHeight,r=Math.min(window.devicePixelRatio||1,2);c.width=w*r;c.height=h*r;const g=c.getContext('2d');g.setTransform(r,0,0,r,0,0);g.clearRect(0,0,w,h);
  if(series.length<2){g.fillStyle=C.muted;g.font=`500 13px ${FB}`;g.fillText(trad('Partie trop courte pour un graphique.'),8,20);return;}
  const half=(w-24)/2,panels=[{x:0,t:trad('Soldats sur la carte'),ia:1,ib:2},{x:half+24,t:trad('Points de contrôle'),ia:3,ib:4}];
  const tMax=series[series.length-1][0]||1;
  for(const p of panels){const top=22,bot=h-22,left=p.x+38,right=p.x+half;let vMax=1;for(const s of series)vMax=Math.max(vMax,s[p.ia],s[p.ib]);vMax=Math.ceil(vMax/50)*50||50;
    g.fillStyle=C.muted;g.font=`700 11px ${FD}`;g.textAlign='left';g.fillText(p.t.toUpperCase(),p.x,12);
    g.strokeStyle='rgba(232,227,216,0.08)';g.lineWidth=1;g.font=`500 10px ${FB}`;g.textAlign='right';
    for(let k=0;k<=2;k++){const v=vMax*k/2,y=bot-(bot-top)*k/2;g.beginPath();g.moveTo(left,y);g.lineTo(right,y);g.stroke();g.fillStyle=C.muted;g.fillText(String(v),left-5,y+3);}
    g.textAlign='center';g.fillText('0:00',left,h-6);g.fillText(fmt(tMax),right-12,h-6);
    for(const[ix,col]of[[p.ia,C.atk],[p.ib,C.def]]){g.strokeStyle=col;g.lineWidth=2;g.beginPath();series.forEach((s,k)=>{const x=left+(right-left)*s[0]/tMax,y=bot-(bot-top)*s[ix]/vMax;k?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();
      const L=series[series.length-1];g.fillStyle=col;g.beginPath();g.arc(left+(right-left)*L[0]/tMax,bot-(bot-top)*L[ix]/vMax,3.5,0,Math.PI*2);g.fill();}}
}



/* ================= Lobby ================= */
let mode='solo',roundLen=20,teamSize=1;
let turn={phase:'none',who:'A',round:0,end:0,R:20};
const ABTXT={A:'Capacités : Renforts, Marche forcée, Bombardement, Sabotage, Assaut général.',B:'Capacités : Tenir la position, Mobilisation civile, Bombardement, Barrages routiers, Ligne de résistance.'};
const MODETXT={
  solo:"Vous contre l'IA, seul ou en 2 contre 2 avec une IA alliée. Votre carrière progresse à chaque partie.",
  local:"Deux joueurs sur le même ordinateur. Chacun donne ses ordres en secret à son tour, puis les deux plans se jouent ensemble pendant une manche.",
  online:"Chacun sur son écran, en temps réel. L'un crée la partie et donne le code, les autres le rejoignent. En 2 contre 2, chaque camp a deux commandants : chacun dirige son secteur, le QG, le trésor et les capacités sont communs. Les places libres sont tenues par l'IA.",
  ranked:"Parties classées en 1 contre 1 : gagnez des points pour monter de rang, de Recrue à Maréchal. Le classement se met à jour en direct.",
  sim:"Deux IA s'affrontent. Vous regardez, en pause ou en accéléré."};
function isLocked(){return spectate||(mode==='local'&&turn.phase!=='plan')||(NET.role==='guest'&&!NET.on);}
// Sous-titre d'une carte personnelle, recalculé dans la langue du joueur
function subPerso(m){const n=(m.nodes||[]).length,b=(m.bridges||[]).length,o=(m.obj||[]).length;
  return [trad('Carte perso'),trad('{n} points',{n}),trad(b>1?'{n} ponts':'{n} pont',{n:b}),trad(o>1?'{n} objectifs':'{n} objectif',{n:o})].join(' · ');}
function sidesTxt(m,s){const t=m.sides&&m.sides[s]&&m.sides[s].t;return trad(t||(s==='A'?'Camp orange. Jeu offensif.':'Camp bleu. Jeu de position.'));}
function ensureMap(){const m=getMap(curMapId)||MAPS.lyon;curMapId=m.id;if(MAP!==m){loadMap(m);cam.set=false;fit(false);}}
function selectMap(id){const m=getMap(id);if(!m)return;curMapId=id;try{localStorage.setItem(MAPSEL_KEY,id);}catch(e){}
  if(MAP!==m){loadMap(m);reset();cam.set=false;fit(false);}renderLobby();}
function renderLobby(){
  if(!getMap(curMapId))curMapId='lyon';
  const box=$('mapList');box.innerHTML='';
  const all=[...MAP_ORDER.map(id=>MAPS[id]),...customMaps];
  for(const m of all){
    const b=document.createElement('div');b.className='mapc';b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-pressed',String(m.id===curMapId));
    const c=document.createElement('canvas');c.width=192;c.height=132;try{drawThumb(c,m);}catch(e){}
    const t=document.createElement('b');t.textContent=m.name;const s=document.createElement('span');s.textContent=m.custom?subPerso(m):trad(m.sub||'');
    b.append(c,t,s);
    if(m.custom){const r=document.createElement('div');r.className='mapc-acts';
      const e=document.createElement('button');e.className='btn sm';e.textContent=trad('Modifier');e.onclick=ev=>{ev.stopPropagation();edOpen(m,false);};
      const d=document.createElement('button');d.className='btn sm';d.textContent=trad('Supprimer');
      d.onclick=ev=>{ev.stopPropagation();if(d.dataset.arm){customMaps=customMaps.filter(x=>x.id!==m.id);saveCustomMaps();if(curMapId===m.id)selectMap('lyon');else renderLobby();}
        else{d.dataset.arm='1';d.textContent=trad('Confirmer ?');setTimeout(()=>{if(d.isConnected){delete d.dataset.arm;d.textContent=trad('Supprimer');}},3000);}};
      r.append(e,d);b.appendChild(r);}
    b.onclick=()=>selectMap(m.id);b.onkeydown=ev=>{if(ev.target===b&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selectMap(m.id);}};
    box.appendChild(b);}
  const nb=document.createElement('button');nb.className='mapc new';nb.innerHTML=`<b>${trad('+ Créer une carte')}</b><span>${trad('Éditeur de cartes')}</span>`;nb.onclick=()=>edOpen(null);box.appendChild(nb);
  const m=getMap(curMapId);
  $('mapDesc').textContent=m.desc?trad(m.desc):m.custom?subPerso(m):trad(m.sub||'');
  $('campAt').textContent=sidesTxt(m,'A');$('campBt').textContent=sidesTxt(m,'B');
  $('campAa').textContent=trad(ABTXT.A);$('campBa').textContent=trad(ABTXT.B);
  setModeUI();
}
function setModeUI(){
  document.querySelectorAll('#modeSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===mode)));
  const solo=mode==='solo',loc=mode==='local',onl=mode==='online',sim=mode==='sim',rkd=mode==='ranked';
  $('campSec').hidden=!(solo||onl);$('campH').textContent=trad(onl?'Votre camp, si vous créez la partie':'Votre camp');
  $('diffOpt').hidden=!(solo||sim);$('roundOpt').hidden=!loc;$('netSec').hidden=!onl;$('playActs').hidden=onl||rkd;
  $('teamOpt').hidden=!(solo||onl);$('rkSec').hidden=!rkd;$('fmtSeg').closest('.opt').hidden=rkd;document.querySelector('#startOv .lsec').classList.toggle('dim',rkd);
  document.querySelectorAll('#teamSeg button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.t===teamSize)));
  $('tutBtn').hidden=!solo;$('goBtn').textContent=trad(loc?'Lancer la partie à deux':sim?'Lancer la simulation':'Lancer la partie');
  $('modeNote').textContent=trad(MODETXT[mode]||'');
}
document.querySelectorAll('#modeSeg button').forEach(b=>b.onclick=()=>{if(NET.role)return;mode=b.dataset.m;setModeUI();});
document.querySelectorAll('#teamSeg button').forEach(b=>b.onclick=()=>{if(NET.role)return;teamSize=+b.dataset.t;setModeUI();});
document.querySelectorAll('#roundSeg button').forEach(b=>b.onclick=()=>{roundLen=+b.dataset.r;document.querySelectorAll('#roundSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
$('edBtn').onclick=()=>edOpen(getMap(curMapId)&&getMap(curMapId).custom?getMap(curMapId):null);
function again(){if(mode==='sim')startSim();else if(mode==='local')startLocal();else if(mode==='solo')startGame(false);}

/* ================= Deux joueurs sur le même ordinateur ================= */
function startLocal(){
  spectate=false;mode='local';resetTeam();ensureMap();player='A';ctrl={A:'human',B:'human'};lvl={A:1,B:1};FMT=FORMATS[fmtIdx];
  reset();tut=-1;turn={phase:'hand',who:'A',round:1,end:0,R:roundLen};beginPlay();paused=true;showHandoff();hud();
}
function showHandoff(){
  const w=turn.who;$('hoEy').textContent=`${trad('Deux joueurs')} · ${MAP.name} · ${trad('manche {n}',{n:turn.round})}`;
  $('hoT').innerHTML=trad('Au tour des {camp}',{camp:`<span style="color:${OC[w]}">${trad(sideName(w,1))}</span>`});
  $('hoX').textContent=turn.round===1&&w==='A'
    ?trad(time<BAL.prep?"Chacun donne ses ordres en secret, à son tour, pendant que l'autre ne regarde pas. Puis les deux plans se jouent ensemble pendant {n} secondes de jeu, juste après la préparation (jouée en accéléré). Les attaques ordonnées partent au début de la manche.":"Chacun donne ses ordres en secret, à son tour, pendant que l'autre ne regarde pas. Puis les deux plans se jouent ensemble pendant {n} secondes de jeu. Les attaques ordonnées partent au début de la manche.",{n:turn.R})
    :trad("Passez la souris aux {camp}. L'autre joueur détourne les yeux : vos attaques prévues restent secrètes jusqu'à l'exécution.",{camp:trad(sideName(w,1))});
  $('hoOv').hidden=false;banner.hidden=true;$('tip').hidden=true;
}
function beginPlan(){
  if(mode!=='local'||turn.phase!=='hand')return;
  turn.phase='plan';player=turn.who;$('hoOv').hidden=true;sel.clear();selDead=-1;abMode=-1;cv.classList.remove('targeting');
  document.documentElement.style.setProperty('--side',OC[player]);buildAbList();buildArsenal();setSideTag();renderFeed();
  const q=qgOf(player);if(q&&q.owner===player)sel.add(q.i);paused=true;hud();
}
function endPlan(){
  if(mode!=='local'||turn.phase!=='plan')return;sel.clear();selDead=-1;abMode=-1;cv.classList.remove('targeting');
  if(turn.who==='A'){turn.who='B';turn.phase='hand';showHandoff();}else startExec();hud();
}
function startExec(){
  turn.phase='exec';setSideTag();
  if(time>=BAL.prep)launchPlanned('Début de la manche');
  turn.end=Math.max(time,BAL.prep)+turn.R;paused=false;hud();
}
function endExec(){turn.phase='hand';turn.who='A';turn.round++;paused=true;showHandoff();setSideTag();hud();}
$('hoGo').onclick=beginPlan;$('turnBtn').onclick=endPlan;
function launchPlanned(prefix){
  if(truce>0)return;const launched={A:0,B:0};
  for(const p of planned){const n=nodes[p.from],t=nodes[p.to];if(!n||!t||!n.alive||!t.alive||n.owner!==p.s)continue;const pa=path(n.i,t.i);if(pa&&dispatch(n,pa,Math.floor(n.troops*p.ratio),p.sec))launched[p.s]++;}
  planned=[];
  for(const s of['A','B'])if(ctrl[s]==='human'){const l=launched[s];
    if(l)log(MSG(l>1?'{debut} : {n} attaques planifiées lancées':'{debut} : {n} attaque planifiée lancée',{debut:prefix,n:l}),'X',undefined,s);
    else if(prefix==='Fin de la préparation')log('Fin de la préparation : en avant !','X',undefined,s);}
}

/* ================= Offres ================= */
OFFERS.marchand.n="Marchand d'armes";OFFERS.marchand.desc="Vos soldats attaquent 20 % plus fort pendant 60 s.";
OFFERS.ingenieurs.n='Ingénieurs suisses';OFFERS.ingenieurs.desc='Vos chantiers vont deux fois plus vite pendant 60 s.';
function updateOffer(){const card=$('offerCard'),of=offerS[player];
  if(!of||spectate||!OFFERS[of.key]){card.hidden=true;return;}
  const o=OFFERS[of.key];card.hidden=false;$('offerH').textContent=trad(o.n);$('offerT').textContent=`${Math.ceil(of.t)} s`;$('offerX').textContent=trad(o.desc);
  const b=$('offerBtn');b.textContent=trad(o.label);b.disabled=P[player].cr<o.cost||isLocked();}
$('offerBtn').onclick=()=>{const of=offerS[player];if(!of||isLocked()||!OFFERS[of.key])return;if(P[player].cr<OFFERS[of.key].cost)return;act('offer',{});if(NET.role==='guest')offerS[player]=null;hud();};

/* ================= Interface selon le mode ================= */
function hudMode(){
  const plan=mode==='local'&&turn.phase==='plan';
  $('turnBtn').hidden=!plan;$('pauseBtn').hidden=plan;
  $('app').classList.toggle('locked',state==='play'&&!spectate&&isLocked());
  const sub=$('clockSub');
  if(mode==='local'){
    if(turn.phase==='plan'){sub.textContent=`${trad('Manche {n}',{n:turn.round})} · ${trad(sideName(player,1))}`;sub.className='clock-sub hot';}
    else if(turn.phase==='exec'){sub.textContent=`${trad('Manche {n}',{n:turn.round})} · ${trad('exécution {n} s',{n:Math.ceil(Math.max(0,turn.end-time))})}`+(paused?' · '+trad('en pause'):'');sub.className='clock-sub';}}
  if(NET.on&&paused){sub.textContent=trad('En pause');sub.className='clock-sub hot';}
  const mp=isMulti()&&state==='play';$('autoGrp').hidden=mp;
  document.querySelectorAll('#speed button').forEach(b=>{b.classList.toggle('voting',!!(NET.on&&curVote()&&curVote().k==='speed'&&curVote().v===+b.dataset.s));});
  updateVoteCard();
}

/* ================= En ligne ================= */
const NET_NA="Serveur de jeu injoignable. Vérifiez votre connexion internet puis rechargez la page.";
Object.assign(NET,{api:undefined,room:null,code:'',seq:0,buf:{},sbuf:{},ebuf:{},evq:[],t:0,started:false,launched:false,mapId:'lyon',fmt:1,
  team:false,ranked:false,seats:{},mySeat:'',rs:new Set(),hostPeer:null,expect:null,ready:{},vote:null,vview:null,vid:0,voteCd:{},pauseT:0,lastStart:0,lastRanked:false});
const PAUSE_MAX=90,VOTE_T=20;
const seatKeys=()=>NET.team?['A1','A2','B1','B2']:['A1','B1'];
const seatSec=k=>NET.team?+k[1]:0;
function humanSeats(){return seatKeys().filter(k=>NET.seats[k]&&NET.seats[k].k!=='ai');}
function seatOfPeer(p){return seatKeys().find(k=>NET.seats[k]&&NET.seats[k].k==='peer'&&NET.seats[k].peer===p)||null;}
function mySeat(){return NET.mySeat||(player+(mySec||1));}
function seatLabel(k){const s=k[0];return trad(sideName(s))+(NET.team?' · '+trad('secteur {nom}',{nom:trad(SECN[s][+k[1]])}):'')+(k===NET.mySeat?' '+trad('(vous)'):'');}
// Même étiquette, en modèle à traduire chez chaque joueur (journal partagé)
function seatMsg(k){const s=k[0];return NET.team?MSG('{camp} · secteur {nom}',{camp:sideName(s),nom:SECN[s][+k[1]]}):sideName(s);}
function applySeats(){
  TEAM=NET.team;ctrl={A:'ai',B:'ai'};aiSec={A:0,B:0};lvl={A:1,B:1};NET.rs=new Set();
  for(const s of['A','B']){const ks=seatKeys().filter(k=>k[0]===s),hum=ks.filter(k=>NET.seats[k]&&NET.seats[k].k!=='ai');
    if(hum.length){ctrl[s]='human';if(NET.team&&hum.length===1)aiSec[s]=seatSec(ks.find(k=>!hum.includes(k)));}
    for(const k of hum)if(NET.seats[k].k==='peer')NET.rs.add(s);}
}
async function netApi(){
  if(NET.api!==undefined)return NET.api;NET.api=null;
  try{if(window.claude&&typeof window.claude.use==='function')NET.api=await window.claude.use('room');}catch(e){NET.api=null;}
  return NET.api;
}
function netStatus(t,cancel,extra){$('netStat').hidden=!t;$('netStatTxt').innerHTML=t||'';$('netCancel').hidden=!cancel;$('netLaunch').hidden=!extra;
  $('netHostBtn').disabled=!!NET.role;$('netJoinBtn').disabled=!!NET.role;}
function netReset(){clearTimeout(NET.rto);NET.on=false;NET.role=null;NET.room=null;NET.hostPeer=null;NET.expect=null;NET.buf={};NET.sbuf={};NET.ebuf={};NET.evq=[];NET.started=false;NET.launched=false;NET.code='';NET.expectBy=null;
  NET.seats={};NET.mySeat='';NET.rs=new Set();NET.ready={};NET.vote=null;NET.vview=null;NET.voteCd={};}
function netLeave(){const r=NET.room;if(r){try{r.emit('bye',{}).catch(()=>{});}catch(e){}try{r.leave().catch(()=>{});}catch(e){}}if(NET.ranked&&RK.match&&state==='play')rankedFinish('l');netReset();}
function netCmd(k,a){if(NET.room&&NET.on)NET.room.emit('cmd',{k,a}).catch(()=>{});}
function netEv(e){if(NET.role==='host'&&NET.on){NET.evq.push(e);if(NET.evq.length>60)NET.evq.shift();}}
const utf8=new TextEncoder();
function chunkEmit(topic,obj,extra){
  const r=NET.room;if(!r)return;const s=JSON.stringify(obj),k=++NET.seq,parts=[];let p=0;
  while(p<s.length){let len=Math.min(3000,s.length-p);while(len>40&&utf8.encode(JSON.stringify(s.slice(p,p+len))).length>3300)len=Math.floor(len*0.8);parts.push(s.slice(p,p+len));p+=len;}
  if(!parts.length)parts.push('');
  parts.forEach((x,i)=>{r.emit(topic,Object.assign({k,i,of:parts.length,s:x},extra||{})).catch(()=>{});});
}
function chunkRecv(store,d){
  if(!d||typeof d.s!=='string'||!Number.isInteger(d.k)||!Number.isInteger(d.i)||!Number.isInteger(d.of)||d.of<1||d.of>400||d.i<0||d.i>=d.of)return null;
  let e=store[d.k];if(!e)e=store[d.k]={n:0,parts:new Array(d.of)};
  if(e.parts.length!==d.of)return null;if(e.parts[d.i]==null){e.parts[d.i]=d.s;e.n++;}
  if(e.n<e.parts.length)return null;delete store[d.k];for(const kk of Object.keys(store))if(+kk<d.k)delete store[kk];
  try{return nettoyer(JSON.parse(e.parts.join('')));}catch(err){return null;}
}
function myPeer(){const r=NET.room;if(!r)return null;const me=r.peers().find(p=>p.sameTab);return me?me.peer:null;}
function randCode(){const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<5;i++)s+=a[(Math.random()*a.length)|0];return s;}

/* ---------- Salle d'attente ---------- */
function seatListHTML(view){
  const rows=['A','B'].map(s=>{const ks=seatKeys().filter(k=>k[0]===s);
    return `<div class="seatcol"><b style="color:${OC[s]}">${trad(sideName(s))}</b>${ks.map(k=>{const v=view[k];const who=v==='me'?trad('Vous'):v==='host'?trad('Hôte'):v==='peer'?trad('Joueur'):`<span class="mini">${trad('IA (place libre)')}</span>`;
      return `<span>${NET.team?`<i class="mini">${trad(k[1]==='1'?'Secteur 1':'Secteur 2')}</i> `:''}${who}</span>`;}).join('')}</div>`;}).join('');
  return `<div class="seats">${rows}</div>`;
}
function netLobbyView(forPeer){const v={};for(const k of seatKeys()){const s=NET.seats[k];v[k]=!s||s.k==='ai'?'ai':s.k==='host'?(forPeer?'host':'me'):(forPeer&&s.peer===forPeer?'me':'peer');}return v;}
function netLobbyUI(){
  if(NET.role!=='host'||NET.started)return;const n=humanSeats().length,tot=seatKeys().length;
  const head=NET.ranked?trad('Partie classée : connexion avec votre adversaire…'):trad(NET.team?'Code de la partie : {code} · donnez-le aux autres joueurs.':'Code de la partie : {code} · donnez-le à votre adversaire.',{code:`<b class="code">${NET.code.toUpperCase()}</b>`});
  netStatus(`${head}<br>${NET.team?trad('{n}/{t} joueurs.',{n,t:tot})+(n<tot?' '+trad("Les places libres seront tenues par l'IA."):''):trad(n<2?'En attente de votre adversaire…':'Adversaire trouvé.')}${NET.team?seatListHTML(netLobbyView(null)):''}`,true,NET.team&&n>=2&&!NET.launched);
}
function netLobbyBroadcast(){if(NET.role!=='host'||!NET.room||NET.started)return;const seats={};for(const k of seatKeys()){const s=NET.seats[k];seats[k]=!s||s.k==='ai'?null:s.k==='host'?'host':s.peer;}
  NET.room.emit('lobby',{team:NET.team?1:0,seats}).catch(()=>{});}
function freeSeat(){const me=NET.mySeat[0],en=enemyOf(me);const order=NET.team?[en+'1',me+'2',en+'2']:[en+'1'];return order.find(k=>NET.seats[k]&&NET.seats[k].k==='ai')||null;}

/* ---------- Hôte ---------- */
async function netHost(){
  if(NET.role)return;netStatus(trad('Ouverture de la partie…'));const api=await netApi();
  if(!api){netStatus(trad(NET_NA));return;}
  const code=randCode();let r;
  try{r=await api.join('bdl-'+code);}catch(e){netStatus(trad("Impossible d'ouvrir la partie ({erreur}).",{erreur:esc(trad(e&&e.code||'erreur'))}));return;}
  netSetupHost(r,code,{team:teamSize===2,ranked:false,side:chosen,mapId:curMapId,fmt:fmtIdx});
}
function netSetupHost(r,code,o){
  NET.room=r;NET.role='host';NET.code=code;NET.team=!!o.team;NET.ranked=!!o.ranked;NET.mapId=o.mapId;NET.fmt=o.fmt;NET.expect=o.expect||null;NET.expectBy=o.expectBy||null;NET.launched=false;NET.ready={};
  NET.seats={};for(const k of seatKeys())NET.seats[k]={k:'ai'};NET.mySeat=o.side+'1';NET.seats[NET.mySeat]={k:'host'};
  netLobbyUI();
  r.on('hello',m=>{if(m.sameTab||NET.role!=='host')return;
    let k=seatOfPeer(m.peer);
    if(NET.started){if(!k)r.emit('full',{to:m.peer}).catch(()=>{});return;}
    if(!k){if(NET.launched||(NET.expect&&m.peer!==NET.expect)||(NET.expectBy&&m.by&&m.by!==NET.expectBy)){r.emit('full',{to:m.peer}).catch(()=>{});return;}
      k=freeSeat();if(!k){r.emit('full',{to:m.peer}).catch(()=>{});return;}NET.seats[k]={k:'peer',peer:m.peer,by:m.by||null};}
    if(NET.launched){const now=performance.now();if(now-NET.lastStart>1200){NET.lastStart=now;netSendStart();}return;}
    netLobbyUI();netLobbyBroadcast();
    if(!NET.team)netLaunch();
  });
  r.on('ready',m=>{if(m.sameTab)return;const k=seatOfPeer(m.peer);if(!k||NET.started)return;NET.ready[k]=1;if(NET.launched&&netAllReady())netBeginHost();});
  r.on('cmd',m=>{if(m.sameTab||!NET.on||state!=='play')return;const k=seatOfPeer(m.peer);if(!k)return;const d=nettoyer(m.data||{});
    if(typeof d.k==='string')applyAct(k[0],d.k,d.a&&typeof d.a==='object'?d.a:{},seatSec(k),k);});
  r.on('bye',m=>{if(!m.sameTab)netPeerLeft(m.peer);});
  r.onPeers(ch=>{for(const p of ch.left)netPeerLeft(p.peer);});
}
function netAllReady(){return seatKeys().every(k=>NET.seats[k].k!=='peer'||NET.ready[k]);}
function netSendStart(){const m=getMap(NET.mapId)||MAPS.lyon,seats={};
  for(const k of seatKeys()){const s=NET.seats[k];seats[k]=s.k==='host'?'host':s.k==='peer'?s.peer:null;}
  chunkEmit('start',{map:m.custom?m:m.id,fmt:NET.fmt,team:NET.team?1:0,ranked:NET.ranked?1:0,seats});}
function netLaunch(){
  if(NET.launched||NET.role!=='host')return;if(humanSeats().length<2)return;NET.launched=true;NET.lastStart=performance.now();netSendStart();
  const m=getMap(NET.mapId)||MAPS.lyon;netStatus(trad('Chargement de {nom}…',{nom:esc(m.name)}),true);
  clearTimeout(NET.rto);NET.rto=setTimeout(()=>{if(NET.started||NET.role!=='host')return;
    for(const k of seatKeys())if(NET.seats[k].k==='peer'&&!NET.ready[k])NET.seats[k]={k:'ai'};
    if(humanSeats().length<2){NET.launched=false;if(NET.ranked){rkMatchFailed();return;}netLobbyUI();netLobbyBroadcast();return;}
    netBeginHost();},9000);
}
function netBeginHost(){
  if(NET.started)return;clearTimeout(NET.rto);
  NET.started=true;NET.on=true;mode='online';spectate=false;fromEditor=false;curMapId=NET.mapId;ensureMap();fmtIdx=NET.fmt;FMT=FORMATS[fmtIdx];
  player=NET.mySeat[0];mySec=seatSec(NET.mySeat);applySeats();reset();tut=-1;beginPlay();netStatus('');NET.vote=null;NET.voteCd={};NET.pauseT=0;NET.lastRanked=NET.ranked;
  log(MSG(NET.team?'Partie en ligne sur {ville} · 2 contre 2{classee}. 75 s de préparation.':'Partie en ligne sur {ville}{classee}. 75 s de préparation.',{ville:MAP.name,classee:NET.ranked?MSG(' · classée'):''}),'X');
  if(TEAM)for(const s of['A','B'])if(ctrl[s]==='human')log(MSG('Secteurs : {a} et {b}. Le QG, le trésor et les capacités sont communs.',{a:SECN[s][1],b:SECN[s][2]}),'X',undefined,s);
  const q=qgOf(player);sel.clear();if(q)sel.add(q.i);NET.t=1;if(NET.ranked)rankedBegin();hud();
}
function netPeerLeft(p){
  if(NET.role!=='host')return;const k=seatOfPeer(p);if(!k)return;
  NET.seats[k]={k:'ai'};delete NET.ready[k];
  if(!NET.started){
    if(NET.ranked){netLeave();rkMatchFailed();return;}
    if(NET.launched&&humanSeats().length<2){NET.launched=false;clearTimeout(NET.rto);}
    netLobbyUI();netLobbyBroadcast();if(NET.launched&&netAllReady())netBeginHost();return;}
  if(state!=='play')return;
  applySeats();log(MSG("{joueur} a quitté la partie : l'IA prend le relais.",{joueur:seatMsg(k)}),'X');voteCheck();
  if(NET.ranked){endGame(player,'Votre adversaire a quitté la partie : victoire par abandon.');return;}
  if(!seatKeys().some(x=>NET.seats[x].k==='peer')){paused=true;
    showNetOv(trad('Les autres joueurs ont quitté la partie'),trad("Vous pouvez la finir contre l'IA, ou revenir à l'accueil."),[
      [trad("Finir contre l'IA"),()=>{const r=NET.room;const keep={T:TEAM,s:mySec,a:{...aiSec},c:{...ctrl}};netReset();try{r&&r.leave().catch(()=>{});}catch(e){}
        mode='solo';TEAM=keep.T;mySec=keep.s;aiSec=keep.a;ctrl=keep.c;$('netOv').hidden=true;paused=false;setSideTag();hud();}],
      [trad("Revenir à l'accueil"),()=>{$('netOv').hidden=true;netLeave();state='menu';showStart();}]]);}
}

/* ---------- Invité ---------- */
async function netJoin(){
  if(NET.role)return;const code=($('netCode').value||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  if(code.length!==5){netStatus(trad("Entrez le code à 5 caractères donné par l'hôte."));return;}
  netStatus(trad('Connexion…'));const api=await netApi();if(!api){netStatus(trad(NET_NA));return;}
  let r;try{r=await api.join('bdl-'+code);}catch(e){netStatus(trad('Impossible de rejoindre ({erreur}).',{erreur:esc(trad(e&&e.code||'erreur'))}));return;}
  netSetupGuest(r,code,{});netStatus(trad('Recherche de la partie…'),true);
}
function netSetupGuest(r,code,o){
  NET.room=r;NET.role='guest';NET.code=code;NET.expect=o.expect||null;NET.expectBy=o.expectBy||null;NET.ranked=!!o.ranked;
  const fromHost=m=>!m.sameTab&&(!NET.expect||m.peer===NET.expect)&&(!NET.expectBy||!m.by||m.by===NET.expectBy);
  r.on('lobby',m=>{if(!fromHost(m)||NET.started)return;const d=m.data||{};if(!d.seats||typeof d.seats!=='object')return;NET.team=!!d.team;
    const me=myPeer(),v={};for(const k of seatKeys()){const x=d.seats[k];v[k]=x==null?'ai':x==='host'?'host':x===me?'me':'peer';}
    netStatus(trad("Vous êtes dans la salle d'attente. L'hôte lancera la partie.")+seatListHTML(v),true);});
  r.on('start',m=>{if(!fromHost(m)||NET.started)return;const o2=chunkRecv(NET.buf,m.data);if(!o2)return;NET.hostPeer=m.peer;netGuestStart(o2);});
  r.on('full',m=>{if(!fromHost(m)||NET.started)return;const d=m.data||{};if(d.to&&d.to!==myPeer())return;netLeave();netStatus(trad('Cette partie est complète ou déjà commencée.'));if(o.ranked)rkMatchFailed();});
  r.on('snap',m=>{if(m.sameTab||m.peer!==NET.hostPeer||!NET.on)return;const o2=chunkRecv(NET.sbuf,m.data);if(o2)netApply(o2);});
  r.on('end',m=>{if(m.sameTab||m.peer!==NET.hostPeer)return;const o2=chunkRecv(NET.ebuf,m.data);if(o2)netGuestEnd(o2);});
  r.on('bye',m=>{if(!m.sameTab&&m.peer===NET.hostPeer)netHostGone();});
  r.onPeers(ch=>{const h=NET.hostPeer;if(h&&ch.left.some(p=>p.peer===h))netHostGone();});
  netHello();
}
function netHello(){if(NET.role!=='guest'||NET.started||!NET.room)return;NET.room.emit('hello',{}).catch(()=>{});setTimeout(netHello,1500);}
function netGuestStart(o){
  const me=myPeer();if(!o.seats||typeof o.seats!=='object')return;NET.team=!!o.team;NET.ranked=!!o.ranked;
  const mine=seatKeys().find(k=>o.seats[k]===me);
  if(!mine){netLeave();netStatus(trad('La partie a commencé sans vous.'));return;}
  let m=null;
  if(typeof o.map==='string')m=MAPS[o.map]||null;
  else if(o.map&&typeof o.map==='object'){try{m=sanitizeMap(o.map);m.id='net-'+m.id;}catch(e){m=null;}}
  if(!m||!m.hq||!m.hq.A||!m.hq.B){netLeave();netStatus(trad("La carte de l'hôte est illisible."));return;}
  NET.seats={};for(const k of seatKeys()){const x=o.seats[k];NET.seats[k]=x==null?{k:'ai'}:x==='host'?{k:'host'}:{k:'peer',peer:x};}
  NET.mySeat=mine;NET.started=true;NET.on=true;mode='online';spectate=false;fromEditor=false;NET.lastRanked=NET.ranked;
  loadMap(m);cam.set=false;fit(false);fmtIdx=FORMATS[o.fmt]?o.fmt:1;FMT=FORMATS[fmtIdx];
  player=mine[0];mySec=seatSec(mine);applySeats();reset();tut=-1;beginPlay();netStatus('');
  const q=qgOf(player);sel.clear();if(q)sel.add(q.i);NET.room.emit('ready',{}).catch(()=>{});if(NET.ranked)rankedBegin();hud();
}
function netHostGone(){
  if(NET.role!=='guest')return;
  if(NET.started&&NET.on&&state==='play'){
    if(NET.ranked){endGame(player,"Votre adversaire a quitté la partie : victoire par abandon.",undefined,true);netLeave();return;}
    paused=true;showNetOv(trad("L'hôte a quitté la partie"),trad("La partie s'arrête ici."),[[trad("Revenir à l'accueil"),()=>{$('netOv').hidden=true;netLeave();state='menu';showStart();}]]);}
  else if(!NET.started){const rk=NET.ranked;netLeave();netStatus(trad("L'hôte a fermé la partie."));if(rk)rkMatchFailed();}
}

/* ---------- Votes (hôte) ---------- */
const SPEEDS=[0.25,0.5,1,2,3],spdTxt=v=>({0.25:'×¼',0.5:'×½',1:'×1',2:'×2',3:'×3'})[v]||'×1';
function voteNeed(){return Math.floor(humanSeats().length/2)+1;}
function voteTxt(v){return v.k==='speed'?MSG('de passer la vitesse à {v}',{v:spdTxt(v.v)}):v.k==='pause'?'de mettre la partie en pause':'de reprendre la partie';}
function voteStart(seat,a){
  if(NET.role!=='host'||!NET.on||!seat||!humanSeats().includes(seat)||NET.vote)return false;
  if((NET.voteCd[seat]||0)>performance.now())return false;
  const k=a.k;let v=null;
  if(k==='speed'){v=+a.v;if(!SPEEDS.includes(v)||v===speed)return false;}
  else if(k==='pause'){if(paused)return false;}else if(k==='resume'){if(!paused)return false;}else return false;
  NET.vote={id:++NET.vid,k,v,by:seat,yes:new Set([seat]),no:new Set(),t:VOTE_T};
  log(MSG('Vote : {joueur} propose {quoi}',{joueur:seatMsg(seat),quoi:voteTxt(NET.vote)}),'X');voteCheck();return true;
}
function voteCast(seat,a){const v=NET.vote;if(NET.role!=='host'||!v||!seat||a.id!==v.id||!humanSeats().includes(seat))return false;v.yes.delete(seat);v.no.delete(seat);(a.y?v.yes:v.no).add(seat);voteCheck();return true;}
function voteCheck(){const v=NET.vote;if(!v)return;const hs=humanSeats();for(const s of[...v.yes])if(!hs.includes(s))v.yes.delete(s);for(const s of[...v.no])if(!hs.includes(s))v.no.delete(s);
  const need=voteNeed();
  if(v.yes.size>=need){NET.vote=null;voteApply(v);}
  else if(hs.length-v.no.size<need){NET.vote=null;NET.voteCd[v.by]=performance.now()+15000;log(MSG('Vote rejeté : proposition {quoi}',{quoi:voteTxt(v)}),'X');}}
function voteApply(v){
  if(v.k==='speed'){setSpeed(v.v);log(MSG('Vote adopté : vitesse {v}',{v:spdTxt(v.v)}),'X');}
  else if(v.k==='pause'){paused=true;NET.pauseT=PAUSE_MAX;log(MSG('Vote adopté : pause ({n} s au plus)',{n:PAUSE_MAX}),'X');}
  else{paused=false;NET.pauseT=0;log('Vote adopté : reprise de la partie','X');}hud();}
function voteTick(dt){
  if(NET.vote){NET.vote.t-=dt;if(NET.vote.t<=0){const v=NET.vote;NET.vote=null;NET.voteCd[v.by]=performance.now()+15000;log(MSG('Vote sans majorité : proposition {quoi} abandonnée',{quoi:voteTxt(v)}),'X');}}
  if(paused&&NET.pauseT>0){NET.pauseT-=dt;if(NET.pauseT<=0){NET.pauseT=0;paused=false;log('Fin de la pause : reprise automatique','X');}}
}
function voteView(){const v=NET.vote;if(!v)return null;return{id:v.id,k:v.k,v:v.v,by:v.by,y:[...v.yes],n:[...v.no],t:Math.ceil(v.t),need:voteNeed()};}
function curVote(){return NET.role==='host'?voteView():NET.vview;}
function proposeVote(k,v){if(!NET.on||state!=='play')return;const cv0=curVote();if(cv0){toast(trad('Un vote est déjà en cours'));return;}
  if(NET.role==='guest'){netCmd('vote',{k,v});toast(trad('Proposition envoyée aux autres joueurs'));return;}
  if((NET.voteCd[NET.mySeat]||0)>performance.now()){toast(trad('Attendez un peu avant de proposer un nouveau vote'));return;}
  applyAct(player,'vote',{k,v},mySec,NET.mySeat);hud();}
function castVote(y){const v=curVote();if(!v)return;if(NET.role==='guest'){netCmd('ballot',{id:v.id,y:!!y});(y?v.y:v.n).push(NET.mySeat);}else applyAct(player,'ballot',{id:v.id,y:!!y},mySec,NET.mySeat);updateVoteCard();}
function updateVoteCard(){
  const c=$('voteCard');const v=NET.on&&state==='play'?curVote():null;
  if(!v){c.hidden=true;if(NET.on&&paused&&state==='play'){c.hidden=false;c.className='votecard paused';
      $('vcT').textContent=trad('Partie en pause');$('vcX').textContent=trad('Reprise automatique dans {n} s, ou plus tôt par vote.',{n:Math.ceil(NET.role==='host'?NET.pauseT:(NET.pt||0))});
      $('vcY').hidden=false;$('vcY').textContent=trad('Proposer la reprise');$('vcN').hidden=true;$('vcY').onclick=()=>proposeVote('resume');}
    return;}
  c.hidden=false;c.className='votecard';const mine=v.y.includes(NET.mySeat)||v.n.includes(NET.mySeat);
  $('vcT').textContent=`${trad('Vote')} · ${v.k==='speed'?trad('vitesse {v}',{v:spdTxt(v.v)}):trad(v.k==='pause'?'pause':'reprise')}`;
  $('vcX').textContent=trad('{joueur} propose {quoi}. {p} pour, {c} contre · {n} voix requises · {t} s',{joueur:seatLabel(v.by),quoi:tx(voteTxt(v)),p:v.y.length,c:v.n.length,n:v.need,t:v.t});
  $('vcY').hidden=mine;$('vcN').hidden=mine;$('vcY').textContent=trad('Pour');$('vcN').textContent=trad('Contre');$('vcY').onclick=()=>castVote(true);$('vcN').onclick=()=>castVote(false);
}

/* ---------- Instantanés ---------- */
function pubP(s){const p=P[s],ab={};for(const k in p.ab)ab[k]={u:p.ab[k].u,cd:Math.ceil(p.ab[k].cd)};
  return{cr:Math.round(p.cr*10)/10,sup:Math.round(p.sup*10)/10,score:Math.round(p.score*10)/10,pc:p.pc,tech:p.tech,res:p.res?{k:p.res.k,t:+p.res.t.toFixed(1),T:p.res.T}:null,
    ab,charges:p.charges,dynCd:Math.ceil(p.dynCd),perm:p.perm,perk:p.perk,nextDec:Math.ceil(p.nextDec),lost:Math.round(p.lost),caps:p.caps,built:p.built,objCaps:p.objCaps};}
function netSnap(){
  if(!NET.room||!NET.on)return;const fx=[];
  for(const e of effects){if(e.sn)continue;e.sn=1;if(fx.length<24)fx.push([e.type,Math.round(e.x),Math.round(e.y),e.c,e.x2!=null?Math.round(e.x2):null,e.y2!=null?Math.round(e.y2):null,+e.t.toFixed(2)]);}
  const pv={};for(const s of NET.rs)pv[s]={dp:decP[s],of:offerS[s],pl:planned.filter(p=>p.s===s)};
  chunkEmit('snap',{t:+time.toFixed(2),tr:+truce.toFixed(1),ph:curPhase,pd:prepDone?1:0,pa:paused?1:0,pt:Math.ceil(NET.pauseT),sp:speed,
    n:nodes.map(n=>[n.owner,Math.round(n.troops*10)/10,n.alive?1:0,n.st||0,n.lvl,n.bar,Math.ceil(n.build),Math.ceil(n.bbuild),Math.ceil(n.dis),Math.ceil(n.hold),Math.ceil(n.sab),+(n.collapse||0).toFixed(1),n.rally,n.sup?1:0,n.rebuild?[n.rebuild.s,Math.ceil(n.rebuild.t),n.rebuild.T||BAL.rebuildT]:0,n.home,secOf(n)]),
    q:squads.map(s=>[s.id,s.owner,Math.round(s.n),s.path,s.seg,Math.round(s.d),+(s.v||0).toFixed(1)]),
    P:{A:pubP('A'),B:pubP('B')},m:mods.map(x=>[x.s,x.stat,x.mult,+x.t.toFixed(1),x.label,x.good?1:0,x.river||0,x.nodes||0]),
    pv,st:seatKeys().map(k=>NET.seats[k].k[0]).join(''),vt:voteView(),dr:drops.map(d=>[d.n,Math.ceil(d.t)]),fx,ev:NET.evq.splice(0)});
}
const SIDES=['A','B','N','X'],okSide=v=>SIDES.includes(v)?v:'N',okIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
function netApply(o){
  if(!o||!Array.isArray(o.n)||o.n.length!==N)return;
  time=+o.t||0;truce=+o.tr||0;curPhase=[1,2,3].includes(o.ph)?o.ph:1;prepDone=!!o.pd;paused=!!o.pa;NET.pt=+o.pt||0;if(SPEEDS.includes(o.sp)&&o.sp!==speed)setSpeed(o.sp);
  if(typeof o.st==='string'&&o.st.length===seatKeys().length){const ks=seatKeys();let ch=false;ks.forEach((k,i)=>{const c=o.st[i];if(c==='a'&&NET.seats[k].k!=='ai'){NET.seats[k]={k:'ai'};ch=true;}});if(ch)applySeats();}
  let alive=false,own=false;
  o.n.forEach((a,i)=>{if(!Array.isArray(a))return;const n=nodes[i],ow=okSide(a[0]);if(n.owner!==ow){own=true;n.flash=1;}n.owner=ow;n.troops=+a[1]||0;
    const al=!!a[2];if(al!==n.alive)alive=true;n.alive=al;n.st=ST[a[3]]?a[3]:null;n.lvl=a[4]|0;n.bar=a[5]|0;n.build=+a[6]||0;n.bbuild=+a[7]||0;n.dis=+a[8]||0;n.hold=+a[9]||0;n.sab=+a[10]||0;n.collapse=+a[11]||0;
    n.rally=okIdx(a[12])?a[12]:-1;n.sup=!!a[13];n.rebuild=Array.isArray(a[14])?{s:okSide(a[14][0]),t:+a[14][1]||0,T:+a[14][2]||BAL.rebuildT}:null;n.home=okSide(a[15]);
    n.sec=a[16]===1||a[16]===2?a[16]:0;n.secOwner=n.owner;});
  if(alive)rebuildAdj();if(own){terrDirty=true;}for(const i of[...sel])if(!myCmd(nodes[i]))sel.delete(i);
  squads=(Array.isArray(o.q)?o.q:[]).filter(a=>Array.isArray(a)&&Array.isArray(a[3])&&a[3].length>1&&a[3].every(okIdx)&&(a[1]==='A'||a[1]==='B'))
    .map(a=>({id:a[0],owner:a[1],n:+a[2]||0,path:a[3],seg:Math.max(0,Math.min(a[4]|0,a[3].length-2)),d:+a[5]||0,v:+a[6]||0}));
  for(const s of['A','B'])if(o.P&&o.P[s]&&typeof o.P[s]==='object')Object.assign(P[s],o.P[s]);
  mods=(Array.isArray(o.m)?o.m:[]).map(a=>({s:a[0],stat:String(a[1]),mult:+a[2]||1,t:+a[3]||0,T:+a[3]||0,label:okMsg(a[4]||''),good:!!a[5],river:a[6]||undefined,nodes:Array.isArray(a[7])?a[7]:undefined}));
  const g=player,pv=o.pv&&typeof o.pv==='object'&&o.pv[g]&&typeof o.pv[g]==='object'?o.pv[g]:{};
  decP[g]=pv.dp&&Array.isArray(pv.dp.ids)?pv.dp:null;offerS[g]=pv.of&&OFFERS[pv.of.key]?pv.of:null;
  planned=Array.isArray(pv.pl)?pv.pl.filter(p=>p&&okIdx(p.from)&&okIdx(p.to)):[];
  const vt=o.vt;NET.vview=vt&&typeof vt==='object'&&Number.isInteger(vt.id)&&['speed','pause','resume'].includes(vt.k)?{id:vt.id,k:vt.k,v:+vt.v||1,by:String(vt.by||'').slice(0,2),y:Array.isArray(vt.y)?vt.y.map(String):[],n:Array.isArray(vt.n)?vt.n.map(String):[],t:+vt.t||0,need:+vt.need||1}:null;
  drops=(Array.isArray(o.dr)?o.dr:[]).filter(a=>okIdx(a[0])).map(a=>({n:a[0],t:+a[1]||0}));
  for(const f of Array.isArray(o.fx)?o.fx:[])if(Array.isArray(f))effects.push({type:String(f[0]),x:+f[1]||0,y:+f[2]||0,c:String(f[3]||C.text),x2:f[4],y2:f[5],t:+f[6]||0});
  for(const e of Array.isArray(o.ev)?o.ev:[]){if(!Array.isArray(e))continue;
    if(e[0]==='l'){if(!e[4]||e[4]===player)pushFeed(okMsg(e[1]),String(e[2]||''),okIdx(e[3])?e[3]:undefined,player);}
    else if(e[0]==='f'&&okIdx(e[1])){if(!e[4]||e[4]===player)pushFloat(e[1],okMsg(e[2]),String(e[3]||C.gold));}
    else if(e[0]==='b'){const ok=e[4]&&OFFERS[e[4]]&&offerS[player]&&offerS[player].key===e[4];showBanner(okMsg(e[1]),okMsg(e[2]),okMsg(e[3]),ok?OFFERS[e[4]].label:null);}}
  updWall();army={A:0,B:0};for(const n of nodes)if(mineN(n))army[n.owner]+=n.troops;for(const q of squads)army[q.owner]+=q.n;
}
function netGuestTick(dt){
  if(paused)return;
  if(truce<=0)for(const s of squads){const L=elen(s.path[s.seg],s.path[s.seg+1]);s.d=Math.min(L,s.d+(s.v||0)*dt*speed);}
  for(const e of effects)e.t+=dt;effects=effects.filter(e=>e.t<1.2);
}
function netEnd(w,why,kind){
  const pick=s=>({decisions:P[s].decisions,perks:P[s].perks,lost:Math.round(P[s].lost),caps:P[s].caps,built:P[s].built,score:P[s].score,sup:P[s].sup,tech:P[s].tech});
  netSnap();chunkEmit('end',{w,why,kind,series,P:{A:pick('A'),B:pick('B')}});
}
function netGuestEnd(o){
  if(state!=='play')return;
  for(const s of['A','B'])if(o.P&&o.P[s]&&typeof o.P[s]==='object'){const v=o.P[s];if(Array.isArray(v.decisions))P[s].decisions=v.decisions.map(String);if(Array.isArray(v.perks))P[s].perks=v.perks.map(String);
    for(const k of['lost','caps','built','score','sup'])if(Number.isFinite(+v[k]))P[s][k]=+v[k];if(v.tech&&typeof v.tech==='object')P[s].tech=v.tech;}
  if(Array.isArray(o.series))series=o.series.filter(Array.isArray);
  endGame(o.w==='A'||o.w==='B'?o.w:null,okMsg(o.why||''),o.kind==='qg'?'qg':undefined,true);
}
function showNetOv(t,x,acts){$('netOvT').textContent=t;$('netOvX').textContent=x;const box=$('netOvActs');box.innerHTML='';
  acts.forEach(([l,f],i)=>{const b=document.createElement('button');b.textContent=l;if(!i)b.className='primary';b.onclick=f;box.appendChild(b);});$('netOv').hidden=false;}
$('netHostBtn').onclick=netHost;$('netJoinBtn').onclick=netJoin;
$('netCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();netJoin();}});
$('netCancel').onclick=()=>{const rk=NET.ranked&&!NET.started;netLeave();netStatus('');if(rk)rkCancel();};
$('netLaunch').onclick=()=>{if(NET.role==='host'&&NET.team)netLaunch();netLobbyUI();};

/* ================= Mode classé ================= */
const RANKS=[{n:'Recrue',min:0,c:'#8a8f96'},{n:'Bronze',min:880,c:'#c08a55'},{n:'Argent',min:1060,c:'#c3ccd6'},{n:'Or',min:1240,c:'#d8b45f'},
  {n:'Platine',min:1420,c:'#62c9bd'},{n:'Diamant',min:1600,c:'#86b2ff'},{n:'Maréchal',min:1800,c:'#ef7a52'}];
const DIVS=['III','II','I'],RK_START=1000;
function rankOf(rp){let i=0;for(let k=0;k<RANKS.length;k++)if(rp>=RANKS[k].min)i=k;const r=RANKS[i];
  const hasDiv=i>0&&i<RANKS.length-1,d=hasDiv?Math.min(2,Math.floor((rp-r.min)/60)):-1;
  const next=hasDiv?(d<2?r.min+(d+1)*60:RANKS[i+1].min):i===0?RANKS[1].min:null,floor=hasDiv?r.min+d*60:r.min;
  return{i,n:r.n,c:r.c,d,full:r.n+(hasDiv?' '+DIVS[d]:''),next,floor};}
function rkEmblem(rp,sz){const r=rankOf(rp),s=sz||30,pips=r.d>=0?r.d+1:r.i===RANKS.length-1?3:0;
  let ch='';for(let k=0;k<pips;k++){const y=22-k*5;ch+=`<path d="M9 ${y}L16 ${y-4}L23 ${y}" fill="none" stroke="#101318" stroke-width="2.2" stroke-linejoin="round"/>`;}
  const star=r.i===RANKS.length-1?'<path d="M16 6l1.6 3.4 3.7.4-2.8 2.5.8 3.6L16 14.1l-3.3 1.8.8-3.6-2.8-2.5 3.7-.4z" fill="#101318"/>':'';
  return `<svg class="rkemb" width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2L28 6V15C28 22 22.5 27.5 16 30C9.5 27.5 4 22 4 15V6Z" fill="${r.c}"/>${star}${ch}</svg>`;}
const RK={db:null,user:null,me:null,doc:null,lb:[],lobby:null,q:false,qt:0,pk:'',pkT:0,names:{},match:null,last:null,busy:Promise.resolve(),st:'',on:0,searching:0,tick:null,err:''};
const rkNum=(v,d,lo,hi)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,Math.round(v))):d;};
function rkClean(id,d){d=d&&typeof d==='object'?d:{};const pend=d.pend&&typeof d.pend==='object'?{t:rkNum(d.pend.t,0,0,9e15),w:rkNum(d.pend.w,RK_START,0,5000),d:rkNum(d.pend.d,RK_START,0,5000)}:null;
  return{id:String(id),rp:rkNum(d.rp,RK_START,0,5000),w:rkNum(d.w,0,0,1e6),l:rkNum(d.l,0,0,1e6),dr:rkNum(d.dr,0,0,1e6),g:rkNum(d.g,0,0,1e6),peak:rkNum(d.peak,RK_START,0,5000),
    cs:typeof d.cs==='string'?d.cs.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g,'').trim().slice(0,20):'',pend};}
const rkMe=()=>RK.doc||{id:RK.me,rp:RK_START,w:0,l:0,dr:0,g:0,peak:RK_START,cs:'',pend:null};
function rkName(d){if(!d)return trad('Joueur');if(d.cs)return d.cs;const p=RK.names[d.id];return p||trad('Joueur {id}',{id:String(d.id).slice(-4).toUpperCase()});}
async function rkResolveNames(){if(!RK.user||typeof RK.user.profiles!=='function')return;const ids=RK.lb.map(d=>d.id).filter(id=>!(id in RK.names)).slice(0,60);if(RK.me&&!(RK.me in RK.names))ids.push(RK.me);if(!ids.length)return;
  try{const ps=await RK.user.profiles(ids);for(const id of ids){RK.names[id]=ps&&ps[id]&&ps[id].name||'';}rkRender();}catch(e){}}
function rkWrite(body){if(!RK.db||!RK.me)return Promise.resolve(false);const doc={rp:body.rp,w:body.w,l:body.l,dr:body.dr,g:body.g,peak:body.peak,cs:body.cs||'',t:Date.now()};if(body.pend)doc.pend=body.pend;
  RK.busy=RK.busy.then(()=>RK.db.doc('ranked/'+RK.me).set(doc)).then(()=>true,e=>{RK.err=e&&e.code||'erreur';rkRender();return false;});return RK.busy;}
async function rkInit(){
  const c=window.claude;if(!(c&&typeof c.use==='function')){rkRender();return;}
  try{const r=await Promise.all([c.use('db'),c.use('user')]);RK.db=r[0];RK.user=r[1];}catch(e){}
  if(RK.user){try{RK.me=await RK.user.id();}catch(e){RK.me=null;}}
  if(RK.db){
    try{RK.db.collection('ranked').orderBy('rp','desc').limit(50).onSnapshot(s=>{RK.lb=s.docs.filter(d=>d.exists).map(d=>rkClean(d.id,d.data()));rkResolveNames();rkRender();},e=>{RK.err=e&&e.code||'';rkRender();});}catch(e){}
    if(RK.me){try{RK.db.doc('ranked/'+RK.me).onSnapshot(s=>{RK.doc=s.exists?rkClean(s.id,s.data()):null;rkStalePend();rkRender();},()=>{});}catch(e){}}}
  try{RK.lobby=await c.use('room');}catch(e){RK.lobby=null;}
  if(RK.lobby){try{RK.lobby.onPeers(ch=>{const ps=ch.peers.filter(p=>p.kind==='viewer');RK.on=ps.length;RK.searching=ps.filter(p=>p.presence&&p.presence.rq===1).length;rkPair();rkRender();});}catch(e){}}
  rkRender();
}
let rkStaleDone=false;
function rkStalePend(){const d=RK.doc;if(rkStaleDone||!d||!d.pend||RK.match)return;if(Date.now()-d.pend.t<45*60*1000)return;rkStaleDone=true;rkWrite({...d,pend:null});}
function rkReady(){return !!(RK.db&&RK.me&&RK.lobby);}
function rkStatus(t){RK.st=t;rkRender();}

function rkQueue(){
  if(NET.role)return;if(!rkReady()){rkStatus(NET_NA);return;}
  RK.q=true;RK.qt=Date.now();RK.pk='';rkStatus("Recherche d'un adversaire…");
  RK.lobby.presence({rq:1,qt:RK.qt,rp:rkMe().rp}).catch(()=>{});
  clearInterval(RK.tick);RK.tick=setInterval(()=>{if(!RK.q){clearInterval(RK.tick);return;}rkPair();rkRender();},1000);
}
function rkCancel(){RK.q=false;clearInterval(RK.tick);if(RK.lobby)RK.lobby.presence({rq:null,qt:null,rp:null}).catch(()=>{});rkStatus('');}
function rkMatchFailed(){if(state==='play')return;RK.match=null;if(RK.lobby)RK.lobby.presence({rq:null,qt:null,rp:null}).catch(()=>{});rkStatus('Adversaire injoignable. Nouvelle recherche…');setTimeout(()=>{if(!NET.role&&state!=='play')rkQueue();},1500);}
function hash36(s){let h1=0x811c9dc5,h2=0x1234567;for(const ch of s){const c=ch.charCodeAt(0);h1=Math.imul(h1^c,16777619)>>>0;h2=Math.imul(h2^c,2246822519)>>>0;}return h1.toString(36)+h2.toString(36);}
function rkPair(){
  if(!RK.q||NET.role||!RK.lobby)return;
  const ps=RK.lobby.peers().filter(p=>p.kind==='viewer'&&p.presence&&p.presence.rq===1&&Number.isFinite(+p.presence.qt)).slice().sort((a,b)=>(+a.presence.qt-+b.presence.qt)||(a.peer<b.peer?-1:1));
  const used=new Set();let mine=null;
  for(let i=0;i<ps.length&&!mine;i++){if(used.has(i))continue;for(let j=i+1;j<ps.length;j++){if(used.has(j))continue;if(ps[i].by&&ps[i].by===ps[j].by)continue;used.add(i);used.add(j);if(ps[i].sameTab||ps[j].sameTab)mine=[ps[i],ps[j]];break;}}
  if(!mine){RK.pk='';return;}
  const pair=mine.map(p=>p.peer).sort(),key=pair.join('|'),now=performance.now();
  if(RK.pk!==key){RK.pk=key;RK.pkT=now;return;}if(now-RK.pkT<1200)return;
  const me=mine.find(p=>p.sameTab),op=mine.find(p=>!p.sameTab);
  RK.q=false;clearInterval(RK.tick);
  rkStartMatch(me.peer===pair[0],'r'+hash36(key).slice(0,10),op);
}
async function rkStartMatch(host,code,op){
  rkStatus('Adversaire trouvé. Connexion…');const api=await netApi();if(!api){rkStatus(NET_NA);return;}
  let opRp=+(op.presence&&op.presence.rp)||RK_START;
  if(op.by&&RK.db){try{const s=await RK.db.doc('ranked/'+op.by).get();if(s.exists)opRp=rkClean(s.id,s.data()).rp;}catch(e){}}
  RK.last={oppBy:op.by||null,oppRp:opRp,oppName:''};
  let r;try{r=await api.join('bdl-'+code);}catch(e){rkStatus('Connexion impossible.');rkMatchFailed();return;}
  if(host)netSetupHost(r,code,{team:false,ranked:true,side:Math.random()<0.5?'A':'B',mapId:MAP_ORDER[(Math.random()*MAP_ORDER.length)|0],fmt:1,expectBy:op.by||null});
  else netSetupGuest(r,code,{expectBy:op.by||null,ranked:true});
  clearTimeout(RK.to);RK.to=setTimeout(()=>{if(NET.role&&!NET.started&&NET.ranked){netLeave();rkMatchFailed();}},20000);
}
function rkDelta(cur,opp,g){const E=1/(1+Math.pow(10,(opp-cur)/400)),K=g<10?40:24;
  return{w:Math.max(1,Math.round(K*(1-E))),l:Math.min(-1,Math.round(K*(0-E))),d:Math.round(K*(0.5-E))};}
function rankedBegin(){
  clearTimeout(RK.to);RK.st='';if(RK.lobby)RK.lobby.presence({rq:null,qt:null,rp:null}).catch(()=>{});if(!RK.db||!RK.me){RK.match=null;return;}const d=rkMe(),opp=RK.last?RK.last.oppRp:RK_START,dl=rkDelta(d.rp,opp,d.g);
  RK.match={cur:d.rp,opp,dl,base:{...d}};
  rkWrite({...d,rp:Math.max(0,d.rp+dl.l),l:d.l+1,g:d.g+1,pend:{t:Date.now(),w:d.rp+dl.w,d:Math.max(0,d.rp+dl.d)}});
  log(MSG('Partie classée : victoire +{w} pts, défaite {l} pts. Quitter la partie compte comme une défaite.',{w:dl.w,l:dl.l}),'X',undefined,player);
}
function rankedFinish(res){
  const m=RK.match;if(!m)return null;RK.match=null;const b=m.base;
  const rp=Math.max(0,m.cur+(res==='w'?m.dl.w:res==='d'?m.dl.d:m.dl.l));
  const body={...b,rp,g:b.g+1,w:b.w+(res==='w'?1:0),l:b.l+(res==='l'?1:0),dr:b.dr+(res==='d'?1:0),peak:Math.max(b.peak,rp),pend:null};
  rkWrite(body);return{before:m.cur,after:rp,delta:rp-m.cur};
}
function rkEndHTML(r){if(!r)return '';const a=rankOf(r.before),b=rankOf(r.after);const up=b.i>a.i||(b.i===a.i&&b.d>a.d),down=b.i<a.i||(b.i===a.i&&b.d<a.d);
  return `<div class="rkend">${rkEmblem(r.after,44)}<div><span class="lbl" style="color:var(--gold)">${trad('Partie classée')}</span><b>${trad('{d} points · {n} pts',{d:(r.delta>=0?'+':'−')+Math.abs(r.delta),n:r.after})}</b><span>${up?trad('Promotion : {rang}',{rang:`<b style="font-size:inherit;color:${b.c}">${rkFull(b)}</b>`}):down?trad('Rétrogradation : {rang}',{rang:rkFull(b)}):rkFull(b)}${b.next?' · '+trad('{n} pts avant le rang suivant',{n:b.next-r.after}):''}</span></div></div>`;}
function rkFull(r){return trad(r.n)+(r.d>=0?' '+DIVS[r.d]:'');}
function rkRender(){
  const box=$('lbList');if(!box)return;
  if(!RK.db){box.innerHTML=`<p class="mini">${trad('Classement indisponible : serveur injoignable.')}</p>`;}
  else{const rows=RK.lb.slice(0,lbAll?50:10);
    let h=rows.length?'':`<p class="mini">${trad("Aucune partie classée pour l'instant. Soyez le premier !")}</p>`;
    const vd=d=>trad('{v}V {d}D',{v:d.w,d:d.l});
    rows.forEach((d,i)=>{h+=`<div class="lbrow${d.id===RK.me?' me':''}"><span class="pos">${i+1}</span>${rkEmblem(d.rp,22)}<span class="nm">${esc(rkName(d))}${d.id===RK.me?` <i>${trad('(vous)')}</i>`:''}</span><span class="rk" style="color:${rankOf(d.rp).c}">${rkFull(rankOf(d.rp))}</span><span class="pts">${d.rp}</span><span class="wl">${vd(d)}</span></div>`;});
    if(RK.me&&RK.doc&&!rows.some(d=>d.id===RK.me)){const pos=RK.lb.findIndex(d=>d.id===RK.me);const d=RK.doc;
      h+=`<div class="lbrow me"><span class="pos">${pos>=0?pos+1:'—'}</span>${rkEmblem(d.rp,22)}<span class="nm">${esc(rkName(d))} <i>${trad('(vous)')}</i></span><span class="rk" style="color:${rankOf(d.rp).c}">${rkFull(rankOf(d.rp))}</span><span class="pts">${d.rp}</span><span class="wl">${vd(d)}</span></div>`;}
    box.innerHTML=h;}
  $('lbMore').hidden=!RK.db||RK.lb.length<=10;$('lbMore').textContent=trad(lbAll?'Top 10':'Voir le top 50');
  $('lbLive').textContent=RK.lobby?trad('{a} sur la page · {b} en recherche',{a:RK.on,b:RK.searching}):'';
  // carte du joueur
  const me=rkMe(),r=rankOf(me.rp),pct=r.next?Math.max(0,Math.min(100,100*(me.rp-r.floor)/(r.next-r.floor))):100;
  $('rkCard').innerHTML=`${rkEmblem(me.rp,56)}<div class="rkinfo"><span class="lbl">${trad('Votre rang')}</span><b style="color:${r.c}">${rkFull(r)}</b><span>${trad('{n} points',{n:me.rp})}${RK.doc?` · ${trad(me.w>1?'{n} victoires':'{n} victoire',{n:me.w})}, ${trad(me.l>1?'{n} défaites':'{n} défaite',{n:me.l})}${me.dr?', '+trad(me.dr>1?'{n} nuls':'{n} nul',{n:me.dr}):''}`:' · '+trad('non classé')}</span>
    <div class="meter"><i style="width:${pct}%;background:${r.c}"></i></div><span class="mini">${r.next?trad('{n} pts avant {rang}',{n:r.next-me.rp,rang:rkFull(rankOf(r.next))}):trad('Rang maximal')}</span></div>`;
  const cs=$('rkCs');if(document.activeElement!==cs)cs.value=me.cs||'';cs.disabled=!RK.db||!RK.me;
  const q=$('rkGo');q.textContent=trad(RK.q?'Annuler la recherche':'Rechercher un adversaire');q.disabled=!!NET.role&&!RK.q;
  $('rkSt').hidden=!RK.st&&!RK.q;$('rkSt').textContent=RK.q?`${trad("Recherche d'un adversaire…")} ${fmt((Date.now()-RK.qt)/1000)}`:trad(RK.st);
  if(RK.err)$('rkSt').hidden=false,$('rkSt').textContent+=RK.err?' · '+trad('Enregistrement refusé par le serveur, réessayez plus tard.'):'';
}
let lbAll=false;
$('lbMore').onclick=()=>{lbAll=!lbAll;rkRender();};
$('rkGo').onclick=()=>{if(RK.q)rkCancel();else rkQueue();};
function rkSaveCs(){const v=$('rkCs').value.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g,'').trim().slice(0,20),d=rkMe();if(!RK.db||!RK.me||v===(d.cs||''))return;rkWrite({...d,cs:v});}
$('rkCs').addEventListener('change',rkSaveCs);
$('rkLadder').innerHTML=RANKS.map(r=>`<span>${rkEmblem(r.min+(r.min&&r.min<1800?120:0),18)}${trad(r.n)}</span>`).join('');$('rkCs').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('rkCs').blur();rkSaveCs();}});


/* ================= Mobile et tactile ================= */
let compact=false,sheet='',multiSel=false,aim=-1,lpTimer=0,lastTouch=false;
const TABN={base:'Base',cap:'Capacités',ars:'Arsenal',zones:'Arrondissements',log:'Journal',more:'Réglages'};
(function tagSections(){
  for(const id of['tut','simCard','advCard','decCard','offerCard','selCard'])$(id).classList.add('tb');
  document.querySelector('#lp .card.hq').classList.add('tb');$('feed').closest('section').classList.add('tl');
  $('arrList').closest('section').classList.add('tz');$('abList').closest('section').classList.add('tc');$('tracks').closest('section').classList.add('ta');
  for(const el of[$('lp'),$('rp'),$('moreSheet')]){const h=document.createElement('div');h.className='sheet-h';h.innerHTML=`<b></b><button class="btn sm">${trad('Fermer')}</button>`;h.querySelector('button').onclick=()=>setSheet('',true);el.prepend(h);}
})();
function applyCompact(){
  const c=innerWidth<=860||(innerHeight<=540&&matchMedia('(pointer:coarse)').matches),land=c&&innerWidth>innerHeight;
  const root=document.documentElement;root.classList.toggle('m',c);root.classList.toggle('ml',land);
  if(c!==compact){compact=c;const more=$('moreBody'),bar=$('cmdbar'),gs=['autoGrp','speedGrp','viewGrp'].map(id=>$(id));
    if(c)gs.forEach(g=>more.appendChild(g));else gs.forEach(g=>bar.insertBefore(g,$('tabs')));if(!c)setSheet('',true);}
}
function setSheet(t,force){sheet=force?t:(sheet===t?'':t);$('app').dataset.sheet=sheet;
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===sheet)));
  document.querySelectorAll('.sheet-h b').forEach(b=>b.textContent=TABN[sheet]?trad(TABN[sheet]):'');if(sheet)$('tip').hidden=true;}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{setSheet(b.dataset.tab);hud();});
$('multiBtn').onclick=()=>{multiSel=!multiSel;$('multiBtn').setAttribute('aria-pressed',String(multiSel));toast(trad(multiSel?'Sélection multiple : touchez vos points pour les ajouter':'Sélection simple'));};
function mobileCam(){if(!compact||spectate)return;if(innerWidth<innerHeight){const q=qgOf(player);if(!q)return;cam.z=Math.max(fitZ*1.4,(VH-view.t-view.b)/(H+40)*0.82);cam.x=q.x*0.4+W/2*0.6;cam.y=H/2;clampCam();}}
function updateMobile(){
  if(!compact)return;
  const base=document.querySelector('#tabs [data-tab="base"]');base.classList.toggle('dot',!spectate&&(!!decP[player]||!!offerS[player]));
  const cap=document.querySelector('#tabs [data-tab="cap"]');cap.classList.toggle('dot',!spectate&&ABL[player].some((a,i)=>canUnlock(player,i)));
  updatePill();
}
function updatePill(){
  const p=$('selPill');
  if(!compact||state!=='play'||spectate||isLocked()||sheet){p.hidden=true;return;}
  let h='',cls='pill';
  if(abMode!==-1){const lab=abMode===-2?trad('Route permanente : touchez la destination'):abMode===-3?trad(P[player].charges>1?'Dynamiter : touchez un pont ({n} charges)':'Dynamiter : touchez un pont ({n} charge)',{n:P[player].charges}):trad('{nom} : touchez une cible',{nom:trad(ABL[player][abMode].name)});
    h=`<div class="t"><b>${lab}</b></div><button class="btn sm" data-a="x">${trad('Annuler')}</button>`;cls+=' aim';}
  else if(aim>=0&&sel.size){const t=nodes[aim];if(!t||!t.alive){aim=-1;p.hidden=true;return;}
    let tot=0;for(const i of sel)if(i!==t.i)tot+=Math.floor(nodes[i].troops*ratio);
    let st='';if(t.owner!==player){const need=Math.ceil(t.troops*defMult(t)*(t.owner==='N'?modOf(player,'neutralDef'):1)/atkMult(player)+0.01);st=(tot>need?`<span class="ok">${trad('prise probable')}</span>`:`<span class="ko">${trad('insuffisant')}</span>`)+' · '+trad('{n} requis',{n:need});}else st=trad('renfort');
    h=`<div class="t"><b>${trad(time<BAL.prep?'Planifier {n}':'Envoyer {n}',{n:tot})} → ${esc(t.name)}</b><span>${st} · ${trad('{n} % des troupes',{n:Math.round(ratio*100)})}</span></div><button class="btn sm gold" data-a="go">${trad(time<BAL.prep?'Planifier':'Envoyer')}</button><button class="btn sm" data-a="x">✕</button>`;cls+=' aim';}
  else if(sel.size){const list=[...sel].map(i=>nodes[i]).filter(myCmd);if(!list.length){p.hidden=true;return;}const n=list.length===1?list[0]:null,tr=Math.floor(list.reduce((a,m)=>a+m.troops,0));
    h=`<div class="t"><b>${n?esc(n.name):trad('{n} points',{n:list.length})} · ${trad('{n} soldats',{n:tr})}</b><span>${trad('Touchez une cible pour viser, ou appui long sur un de vos points')}</span></div>${n?`<button class="btn sm gold" data-a="b">${trad('Bâtir')}</button>`:''}<button class="btn sm" data-a="c">✕</button>`;}
  else if(selDead>=0){h=`<div class="t"><b>${esc(nodes[selDead].name)} · ${trad('détruit')}</b><span>${trad("Reconstruction dans l'onglet Base")}</span></div><button class="btn sm gold" data-a="b">${trad('Voir')}</button>`;}
  else{p.hidden=true;return;}
  if(p.dataset.h!==h){p.dataset.h=h;p.innerHTML=h;p.querySelectorAll('button').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
    if(a==='go'){const t=nodes[aim];aim=-1;if(t)sendSelection(t);}else if(a==='x'){if(abMode!==-1)setAbMode(abMode);aim=-1;}else if(a==='b')setSheet('base',true);else if(a==='c'){sel.clear();aim=-1;hover=null;}
    hud();});}
  p.className=cls;p.hidden=false;
}

/* ================= Démarrage ================= */
loadMap(getMap(curMapId)||MAPS.lyon);curMapId=MAP.id;reset();rkInit();
addEventListener('resize',()=>{resize();});resize();showStart();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{buildBg();layout();});
setInterval(()=>{if(state==='play'&&!paused)saveGame();},10000);
let last=performance.now(),hudT=0;
function frame(now){const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(state==='play'&&!paused&&NET.role!=='guest'&&!(mode==='local'&&turn.phase!=='exec')){let acc=dt*speed*(mode==='local'&&time<BAL.prep?8:1);while(acc>1e-6&&state==='play'){const st=Math.min(0.05,acc);update(st);acc-=st;}
    if(mode==='local'&&turn.phase==='exec'&&state==='play'&&time>=turn.end)endExec();}
  if(NET.role==='guest'&&NET.on&&state==='play')netGuestTick(dt);
  if(NET.role==='host'&&NET.on&&state==='play'){voteTick(dt);NET.t+=dt;if(NET.t>=0.25){NET.t=0;netSnap();}}
  if(bannerT>0&&!paused){bannerT-=dt;if(bannerT<=0)banner.hidden=true;}
  if(!paused){for(const f of floaters)f.t+=dt;floaters=floaters.filter(f=>f.t<f.dur);}
  render();hudT+=dt;if(hudT>0.15&&state==='play'){hudT=0;hud();updateTip();}
  requestAnimationFrame(frame);}
requestAnimationFrame(frame);
})();
