# Zenith Detailing – weboldal

Statikus, egyoldalas weboldal a Zenith Detailing autóesztétikának (Jesse O'Connor, 1116 Budapest, Kondorosi út 2/A).
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható (Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete és minden szövege
  - `styles.css` – megjelenés (színek a `:root` változókban)
  - `script.js` – adatok (telefon, nyitvatartás), a nyitókép WebGL-lakkja, a swirl-bemutató, a rétegek, az ajánlatkérő és minden mozgás
  - `404.html` – „Hologram” oldal a nem létező címekhez
  - `_headers` – biztonsági és gyorsítótár-beállítások a Cloudflare-nek (nem jelenik meg az oldalon)
  - `assets/` – ikonok, megosztási kép (`og.jpg`) és betűtípusok
  - `robots.txt` – a keresőknek
- `wrangler.jsonc` – Cloudflare-beállítás (a `public/` mappát teszi ki, a 404-oldallal együtt)
- `tools/images.js` – újragyártja a megosztási képet és az iPhone-ikont (`node tools/images.js`, Playwright kell hozzá)

## Megjelenés

- Luxus-autós hangulat: zongorafekete háttér, meleg fehér szöveg, egyetlen kiemelőszín (pezsgő-arany), hajszálvékony vonalak,
  finom filmszemcse – `public/styles.css`, `:root`
- Három betűtípus saját tárhelyről (SIL Open Font License, `public/assets/fonts/`): Instrument Serif (címek, dőlt kiemelések),
  Manrope (szöveg) és IBM Plex Mono (címkék, számok)
- Logó: négyágú „csillanás” jel pezsgő színátmenettel (`#glint` az `index.html` alján, és `assets/favicon.svg`)
- Megszólítás: végig magázó, udvarias hangnem

## Szekciók

- **Nyitókép**: „A fény nem hazudik.” – mögötte valós időben számolt (WebGL) fekete lakkfelület: karosszéria-ív, éles
  vállvonal, kerékív, fémes szemcse és halvány kerámia-irizálás, rajta stúdiófények tükröződése. Betöltéskor a fénycsík
  végigsöpör, utána lassan jár, számítógépen az egeret követi. Ha a böngésző nem tud WebGL-t, színátmenetes tartalék látszik.
  Alatta a tények: évek a szakmában (1990-től számolva, magától frissül), McLaren · Ferrari, SB3 telepítő, 5,0 ★ Google
- **Szalag**: a szolgáltatások lassan úszó felsorolása
- **01 A fény próbája**: interaktív 50/50 teszt – fekete fényezés egy lámpa fényében, bal oldalt swirl-karcokkal, jobb oldalt
  korrigálva, köztük maszkolószalag. A lámpát az egérrel (telefonon ujjal) lehet mozgatni, a szalagot húzni (billentyűzettel is),
  és négy fényezésszín közül választani. A karcok fizikailag hitelesen viselkednek: mindig a fényforrás körül, körökben villannak fel
- **02 Szolgáltatások**: hat lenyíló sor – fényezés-korrekció, kerámia és SB3 bevonat, új autó védelme, prémium mosás és
  vasmentesítés, belső tér (árakkal), tréning szakembereknek
- **03 Mikronokban mérjük**: a fényezés rétegei 3D-ben, görgetésre szétnyílnak (lemez, KTL, töltőalapozó, szín, lakk, kerámia),
  mellettük a jellemző vastagságok
- **04 A mester**: Jesse O'Connor pályája idővonalon, nagy „X év a szakmában” számmal
- **Így dolgozunk**: öt lépés az állapotfelméréstől az átadásig
- **Gyakori kérdések**: ár, karcok, bevonat tartóssága, új autó, mosás utána
- **05 Kapcsolat**: nagy telefonszám, e-mail, élő nyitva/zárva jelzés (budapesti idő szerint), nyitvatartás a mai nap kiemelésével,
  útvonal Google Térképpel, Apple Térképpel és Waze-zel, térkép kattintásra (addig semmit nem tölt be a Google-tól).
  **Ajánlatkérő**: autóméret + szolgáltatások + (nem kötelező) autótípus → „E-mail megírása” gomb, ami a látogató saját
  levelezőjében nyit meg egy előre megírt levelet. Nincs űrlap, az oldal semmilyen adatot nem gyűjt és nem küld
- **Lábléc**: óriási „Zenith” felirat, amin végigsiklik a fény (számítógépen az egeret követi), közösségi linkek
- Telefonon alul mindig ott az **Útvonal** és a **Hívás** gomb; a menü teljes képernyős
- Telefonra optimalizálva (320 px-től, fekvő nézetben is):
  - minden gomb és link legalább 44 px-es érintési felület; a nyitókép címe mindig pontosan két sor
  - a nyitókép fénye az ujjat követi, Androidon a telefon döntésére is mozdul (mint egy valódi lakkon); a swirl-bemutatón
    koppintással vagy húzással mozog a lámpa
  - telefonon kisebb felbontással számol a WebGL és a swirl-vászon, a címsor-eltűnés miatti átméretezés nem számol újra
  - nincs „beragadt” hover-effekt érintőképernyőn, helyette érintési visszajelzés
  - az Útvonal/Hívás sáv csak a nyitókép után jelenik meg
  - telefonon és tableten a szövegek nem úsznak be görgetéskor (azonnal látszanak), a fejléc nem bújik el, és görgetés
    közben nincs drága újrarajzolás (filmszemcse, elmosott háttér, mozgó arany színátmenet) – így nem ugrál és nem akad
  - a lenyíló szolgáltatás-sorokban telefonon egy rövid leírás is látszik nyitás nélkül
  - a fejléc telefonon mindig ugyanúgy néz ki és egy helyben áll (nincs háttérváltás, átmenet vagy elbújás görgetéskor)
  - a „Mikronokban mérjük” rész telefonon a 3D-s kép helyett lapos keresztmetszetet mutat: színes sáv = réteg,
    mellette a vastagság és a név teljes fényerővel (iPhone-on a 3D-s kép rárajzolódhatott a szövegre)
- A `styles.css` és a `script.js` hivatkozásában verziószám van (`?v=4`): tartalmi módosítás után érdemes növelni, hogy a
  telefonok biztosan az új változatot töltsék le
- Aki kikapcsolta az animációkat (`prefers-reduced-motion`), annak minden mozdulatlan; a WebGL és a vásznak csak akkor
  dolgoznak, amikor látszanak
- Keresőknek: leírás, megosztási kép, strukturált adat (`AutomotiveBusiness`) a nyitvatartással

## Tartalom szerkesztése

- `public/script.js` eleje (`SHOP`): telefonszám, e-mail, nyitvatartás, a kezdés éve (`since`) és a térkép címe
- `public/script.js`, `PAINTS`: a swirl-bemutató fényezésszínei
- Szolgáltatások: `public/index.html`, `<section id="szolgaltatasok">` – egy sor egy `<li class="svc__item">`
- Ha a nyitvatartás, a telefonszám vagy a cím változik, a `public/index.html`-ben is írja át (kapcsolat-táblázat, lábléc,
  `application/ld+json`) – ez a JavaScript nélküli változat és a keresők miatt kell
- Új adatok után a megosztási kép frissítése: `node tools/images.js`

## Honnan jöttek az adatok (élesítés előtt egyeztesse a Zenith Detailinggel!)

Nyilvános forrásokból (zendet.com keresőtalálatai, Facebook-oldal, polomap, cylex, Arany Vállalkozás adatlap):

- Cím: 1116 Budapest, Kondorosi út 2/A · Telefon: +36 30 727 9545 · Nyitvatartás: hétfőtől péntekig 9:00–18:00
- E-mail: **két cím is szerepel a forrásokban** (`info@zendet.com` és `zendet.hu@gmail.com`) – az oldal az `info@zendet.com`-ot használja
- Jesse O'Connor: 1990-ben kezdett egy amerikai autómosóban; GM, Toyota, Ford, Saturn, Honda; McLaren (fényezés-korrekció,
  bevonat, javítás) és Ferrari; szemináriumok Görögországban, Angliában, Svájcban, Szlovákiában, Romániában és Kínában;
  közös fejlesztés a Wolf's Chemicalsszel (a zendet.com „Rólunk” oldala alapján)
- **„SB3 hivatalos telepítő”** – a zendet.com szerint Magyarország egyetlen SB3 telepítője; kérem, erősítse meg
- **„5,0 ★ Google”** – egy keresőtalálat szerint 5 csillagos; az értékelések számát nem sikerült ellenőrizni
- Árak: belső szolgáltatások 3 590 Ft-tól, bőrülések tisztítása 7 990 Ft-tól, teljes kárpittisztítás 18 990 Ft-tól;
  a bevonatok ára állapotfelmérés után (a zendet.com alapján)
- **Feltételezések, amiket érdemes jóváhagyatni**: a kerámia bevonat „SiO₂ alapú, 9H keménység, 2–5 év tartósság” adatai,
  a „kétvödrös kézi mosás” és „gyurmázás”, az „ózonos fertőtlenítés” ára (az oldalon: „Kérje ajánlatunkat”), a tréning
  szolgáltatás megfogalmazása, a munkafolyamat öt lépése és az, hogy minden munka előtt rétegvastagságot mérnek
- A rétegvastagságok (KTL ≈ 20 µm, töltő 30–40 µm, szín 12–20 µm, lakk 35–50 µm, kerámia 1–2 µm) általános, tájékoztató értékek
- A swirl-bemutató szimuláció, nem fotó – ezt az oldal ki is írja

## Saját fotók

Ha vannak fotók a munkákról (előtte–utána), tegye őket a `public/assets/` mappába – beépíthetők egy galéria-szekcióba
vagy a szolgáltatás-sorokba.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
