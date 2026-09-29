/* MARIE CREATION · termékkatalógus (MINTA árakkal, Mariann véglegesíti)
   file:// kompatibilitás miatt JS-fájl, nem fetch-elt JSON. */
window.MC_PRODUCTS = [
  {
    id: 'makrame-mandala',
    name: 'Makramé mandala fali dísz',
    cat: 'makrame',
    price: 32900,
    img: 'media/makrame-mandala.jpg', w: 960, h: 1280,
    desc: 'Kézzel csomózott, nagy méretű makramé mandala pamut zsinórból. Falra és padlóra egyaránt komponálható, minden darab egyedi rajzolatú.',
    note: 'Kézműves termék, elkészítési idő 2-3 hét. Méret egyeztethető.'
  },
  {
    id: 'makrame-fuggony',
    name: 'Makramé függöny méretre',
    cat: 'makrame',
    price: 59900,
    img: 'media/makrame-fuggony-kozel.jpg', w: 646, h: 917,
    desc: 'Egyedi méretre csomózott makramé függöny teraszra, pergolára vagy belső térbe. Sűrűbb és lazább rajzolattal is kérhető, természetes pamut zsinórból.',
    note: 'Az ár tájékoztató, a végleges ár felmérés után alakul ki.'
  },
  {
    id: 'makrame-terelvalaszto',
    name: 'Makramé térelválasztó',
    cat: 'makrame',
    price: 74900,
    img: 'media/makrame-fuggony-pergola.jpg', w: 656, h: 945,
    desc: 'Kültéri és beltéri térelválasztó makramé technikával. Pergolák, teraszok, nappali terek légies tagolására, UV-álló zsinórból is kérhető.',
    note: 'Az ár tájékoztató, a végleges ár felmérés után alakul ki.'
  },
  {
    id: 'juta-parna-palma',
    name: 'Juta díszpárna pálma hímzéssel',
    cat: 'parna',
    price: 12900,
    img: 'media/parnak-juta-palma.jpg', w: 720, h: 960,
    desc: 'Natúr juta díszpárna kézi pálma hímzéssel, rojtozott szegéllyel. Több méretben, huzat cipzárral, mosható belső párnával.',
    note: 'Színben és méretben egyedi kérés szerint is varrjuk.'
  },
  {
    id: 'himzett-dekoranyag',
    name: 'Hímzett prémium dekoranyag',
    cat: 'meteraru',
    price: 18900,
    img: 'media/himzett-anyagok.jpg', w: 1125, h: 1500,
    desc: 'Prémium, hímzett dekoranyagok méterre: barokkos indák, mélykék és korall tónusok. Függönynek, terítőnek, párnának egyaránt.',
    note: 'Ár folyóméterenként. Mintadarabot kérésre postázunk.'
  },
  {
    id: 'len-kek-viragos',
    name: 'Kék virágmintás lenvászon',
    cat: 'meteraru',
    price: 14900,
    img: 'media/anyag-kek-viragos.jpg', w: 1440, h: 1800,
    desc: 'Természetes lenvászon kézi nyomott kék virágmintával. Könnyű esésű, függönynek és asztali textilnek is ideális.',
    note: 'Ár folyóméterenként.'
  },
  {
    id: 'futo-szegett',
    name: 'Szegett asztali futó',
    cat: 'terito',
    price: 9900,
    img: 'media/anyag-szegett-rozsa.jpg', w: 640, h: 800,
    desc: 'Kontrasztszegéllyel varrt asztali futó prémium dekoranyagból. A szegés színe az abroszhoz vagy a tér textiljeihez hangolható.',
    note: 'Egyedi méretre is varrjuk.'
  },
  {
    id: 'terito-hoya',
    name: 'Virágmintás terítő kollekció',
    cat: 'terito',
    price: 16900,
    img: 'media/viragos-textil-minta.jpg', w: 1200, h: 1600,
    desc: 'Kézzel válogatott virágmintás terítők és futók, összehangolt szalagszegéllyel. Ünnepi és hétköznapi asztalra egyaránt.',
    note: 'Méret és szegésszín egyeztethető.'
  },
  {
    id: 'fuggony-viragos',
    name: 'Virágmintás függöny méretre varrva',
    cat: 'fuggony',
    price: 24900,
    img: 'media/fuggony-viragos.jpg', w: 1639, h: 2048,
    desc: 'Méretre varrt sötétítő függöny virágmintás prémium anyagból, kézzel behúzott ráncolással. Az ár varrási díj, az anyag külön választható.',
    note: 'Felméréssel és felszereléssel együtt is kérhető.'
  },
  {
    id: 'fuggony-paszpol',
    name: 'Paszpólos függöny egyedi szegéllyel',
    cat: 'fuggony',
    price: 27900,
    img: 'media/fuggony-zold-korall.jpg', w: 1639, h: 2048,
    desc: 'Kontraszt paszpóllal és mintás szegéllyel varrt függöny, hullámkarnisra vagy hagyományos karnisra. Az ár varrási díj.',
    note: 'Felméréssel és felszereléssel együtt is kérhető.'
  }
];

window.MC_CATS = [
  { id: 'mind', name: 'Minden' },
  { id: 'fuggony', name: 'Függöny' },
  { id: 'makrame', name: 'Makramé' },
  { id: 'parna', name: 'Párnák' },
  { id: 'terito', name: 'Terítők' },
  { id: 'meteraru', name: 'Méteráru' }
];
