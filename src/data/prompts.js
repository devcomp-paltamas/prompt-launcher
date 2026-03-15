export const CATEGORIES = [
  { id: "all", label: "🗂️ Mind", color: "#374151" },
  { id: "review", label: "🔍 Kódolvasás", color: "#1d4ed8" },
  { id: "code", label: "✍️ Kódírás", color: "#065f46" },
  { id: "test", label: "🧪 Unit teszt", color: "#7c3aed" },
  { id: "debug", label: "🐛 Hibakeresés", color: "#b91c1c" },
  { id: "workflow", label: "⚡ Workflow", color: "#92400e" },
  { id: "transport", label: "🚚 Transzportok", color: "#0891b2" },
];

export const CAT_ICON_BG = {
  review: "rgba(29,78,216,0.25)",
  code: "rgba(6,95,70,0.25)",
  test: "rgba(124,58,237,0.25)",
  debug: "rgba(185,28,28,0.25)",
  workflow: "rgba(146,64,14,0.25)",
  transport: "rgba(8,145,178,0.25)",
};

export const PROMPTS = [
  {
    id: "review-full",
    cat: "review",
    icon: "📖",
    title: "Osztály teljes áttekintése",
    sub: "Kód review + javaslatok",
    desc: "Lekéri az osztály forráskódját és átfogó elemzést ad: cél, metódusok, kódszagok, SOLID elvek.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] ABAP osztály teljes forráskódját az SAP rendszerből .\n\nElemezd és foglald össze:\n1. Az osztály célja és felelőssége (Single Responsibility)\n2. Publikus metódusok listája rövid leírással\n3. Függőségek: mit hív, mit injektál\n4. Esetleges kód szagok (code smells): túl hosszú metódusok, duplikáció\n5. SOLID elvek betartása (min. SRP, DIP)\n6. Javaslatok prioritással: MAGAS / KÖZEPES / ALACSONY\n\nMagyar nyelven, strukturált formátumban válaszolj!`,
  },
  {
    id: "review-method",
    cat: "review",
    icon: "🔬",
    title: "Metódus részletes magyarázat",
    sub: "Egy metódus mélyebb elemzése",
    desc: "Adott metódus algoritmusának, paramétereinek, kivételkezelésének és edge case-jeinek magyarázata.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "METÓDUSNÉV"],
    prompt: `Olvasd be a(z) [OSZTÁLYNÉV] ABAP osztályt .\n\nMagyarázd el részletesen a [METÓDUSNÉV] metódus működését:\n- Bemeneti paraméterek és típusaik szerepe\n- Az algoritmus lépései\n- Kimeneti értékek / táblák\n- Kivételkezelés: milyen hibát dob és mikor\n- Edge case-ek: mit csinál üres inputnál?\n- Van-e mellékhatás (globális adat, DB write)?`,
  },
  {
    id: "review-security",
    cat: "review",
    icon: "🔐",
    title: "Biztonsági audit",
    sub: "SQL injection, jogosultság ellenőrzés",
    desc: "Biztonsági szempontú kód review: SQL injection, hiányzó AUTHORITY-CHECK, hardkódolt credentials.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Végezz biztonsági kód review-t a(z) [OSZTÁLYNÉV] osztályon .\n\nEllenőrzési pontok:\n☐ Dinamikus WHERE clause – SQL injection kockázat?\n☐ AUTHORITY-CHECK hiányok – jogosulatlan hozzáférés?\n☐ Érzékeny adatok (jelszó, token) naplózása?\n☐ Hardkódolt credentials vagy URL-ek?\n☐ Nem ellenőrzött bemeneti paraméterek?\n☐ RFC/HTTP hívások hitelesítése megfelelő?\n\nVisszajelzés formátuma:\n  [MAGAS]    leírás + érintett sor + javítási javaslat\n  [KÖZEPES]  leírás + érintett sor + javítási javaslat\n  [ALACSONY] leírás`,
  },
  {
    id: "code-new-class",
    cat: "code",
    icon: "🏗️",
    title: "Új ABAP osztály generálás",
    sub: "Skeleton + visszaírás + aktiválás",
    desc: "Teljes ABAP osztály létrehozása specifikáció alapján, majd visszaírás és aktiválás az SAP rendszerbe.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "CÉL_LEÍRÁS", "PUBLIKUS_METÓDUSOK"],
    prompt: `Hozz létre egy új ABAP osztályt az alábbi specifikáció szerint,\nmajd írd vissza az SAP rendszerbe  és aktiváld:\n\nOsztálynév: [OSZTÁLYNÉV]\nCél: [CÉL_LEÍRÁS]\nPublikus metódusok: [PUBLIKUS_METÓDUSOK]\n\nKövetelmények:\n- ABAP 7.54+ szintaxis (DATA(...), NEW, method chaining)\n- Kivételkezelés: egyéni ZCX_ kivétel\n- Inline dokumentáció minden publikus metódushoz\n- Névkonvenció: Z prefix, snake_case, iv_/ev_/rv_ prefix\n\nWorkflow: searchObject → (ha nincs) createObject → setObjectSource → syntaxCheckCode → activate`,
  },
  {
    id: "code-extend",
    cat: "code",
    icon: "🔄",
    title: "Meglévő osztály bővítése",
    sub: "Új metódus hozzáadása",
    desc: "Meglévő osztályhoz új metódus hozzáadása a jelenlegi kódstílus megtartásával.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "ÚJ_METÓDUSNÉV", "LOGIKA_LEÍRÁS"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] jelenlegi forráskódját .\n\nAdd hozzá az alábbi új metódust:\n  Metódusnév: [ÚJ_METÓDUSNÉV]\n  Logika: [LOGIKA_LEÍRÁS]\n\nKövetelmények:\n- Illeszkedjen a meglévő kódstílushoz\n- Bővítsd a CLASS-DEFINITION részt is\n- Végezz szintaxis ellenőrzést\n- Aktiváld az osztályt`,
  },
  {
    id: "code-oauth",
    cat: "code",
    icon: "🔑",
    title: "OAuth/JWT módosítás",
    sub: "ZCL_OAUTH_JWT_CLIENT / CIAM",
    desc: "Célzott módosítás a JWT/CIAM osztályokon, RFC 7523 kompatibilitás megtartásával.",
    tools: ["adt"],
    vars: ["MÓDOSÍTÁS_LEÍRÁSA"],
    prompt: `Kérd le a ZCL_OAUTH_JWT_CLIENT és ZCL_BSP_CIAM_OAUTH_CONNECTOR osztályokat .\n\nImplementáld az alábbi változtatást:\n[MÓDOSÍTÁS_LEÍRÁSA]\n\nKövetelmények:\n- RFC 7523 kompatibilis maradjon\n- A meglévő unit tesztek ne törjenek el\n- Adj hozzá ABAP Doc kommentet az új logikához\n- Szintaxis check + aktiválás minden módosított osztályon`,
  },
  {
    id: "code-modify",
    cat: "code",
    icon: "🛠️",
    title: "Osztály módosítása",
    sub: "Tetszőleges osztály + módosítás",
    desc: "Bármely ABAP osztály módosítása a megadott leírás alapján, aktiválással.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "MÓDOSÍTÁS_LEÍRÁSA"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] ABAP osztály teljes forráskódját .

Implementáld az alábbi változtatást:
[MÓDOSÍTÁS_LEÍRÁSA]

Követelmények:
- Illeszkedjen a meglévő kódstílushoz és konvenciókhoz
- A meglévő funkcionalitás ne sérüljön
- Adj hozzá ABAP Doc kommentet az új/módosított logikához
- Végezz szintaxis ellenőrzést
- Aktiváld az osztályt

Ha a módosítás más osztályokat is érint, jelezd előre!`,
  },
  {
    id: "test-full",
    cat: "test",
    icon: "🧪",
    title: "Teljes unit teszt suite",
    sub: "Minden publikus metódushoz",
    desc: "Happy path + edge case + hibás bemenet tesztek, test double-okkal, visszaírva az SAP rendszerbe.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] ABAP osztály forráskódját .

Generálj teljes ABAP Unit teszt suite-ot:

═══════════════════════════════════════════════════════════════
1. TESZT OSZTÁLY STRUKTÚRA
═══════════════════════════════════════════════════════════════

CLASS ltcl_[osztálynév_rövid] DEFINITION FINAL
  FOR TESTING RISK LEVEL HARMLESS DURATION SHORT.

  PRIVATE SECTION.
    DATA mo_cut TYPE REF TO [OSZTÁLYNÉV].  "Class Under Test
    DATA mo_mock_* TYPE REF TO ...         "Test double-ök

    METHODS setup.
    METHODS teardown.

    "Teszt metódusok FOR TESTING prefix nélkül

═══════════════════════════════════════════════════════════════
2. SETUP / TEARDOWN
═══════════════════════════════════════════════════════════════

setup():
  ☐ Test double-ök példányosítása (mock objektumok)
  ☐ CUT létrehozása (dependency injection mock-okkal)
  ☐ Teszt adatok inicializálása

teardown():
  ☐ Referenciák törlése (CLEAR)
  ☐ Test environment cleanup (CL_OSQL_TEST_ENVIRONMENT)

═══════════════════════════════════════════════════════════════
3. TESZT ESETEK MINDEN PUBLIKUS METÓDUSHOZ
═══════════════════════════════════════════════════════════════

Minden publikus metódushoz generálj:

✅ HAPPY PATH teszt:
   - Tipikus, helyes bemenettel
   - Elvárt kimenet ellenőrzése

⚠️ EDGE CASE tesztek:
   - Üres string / initial érték
   - Üres internal table
   - Boundary értékek (0, 1, MAX)
   - NULL referencia

❌ NEGATÍV tesztek:
   - Hibás bemenet → várt kivétel
   - TRY-CATCH az elvárt CX_ kivételre
   - cl_abap_unit_assert=>fail() ha nem dob kivételt

═══════════════════════════════════════════════════════════════
4. TEST DOUBLE KEZELÉS
═══════════════════════════════════════════════════════════════

Függőségek izolálása:
☐ Interfész alapú mock-ok (ZIF_* → LTD_*)
☐ SQL Test Double (CL_OSQL_TEST_ENVIRONMENT) ha DB hozzáférés van
☐ Mock-ok konfigurálható return értékkel

═══════════════════════════════════════════════════════════════
5. ASSERTION-ÖK
═══════════════════════════════════════════════════════════════

Használd a megfelelő assertion-t:
- cl_abap_unit_assert=>assert_equals( exp = ... act = ... msg = '...' )
- cl_abap_unit_assert=>assert_true( act = ... )
- cl_abap_unit_assert=>assert_false( act = ... )
- cl_abap_unit_assert=>assert_initial( act = ... )
- cl_abap_unit_assert=>assert_not_initial( act = ... )
- cl_abap_unit_assert=>assert_bound( act = ... )
- cl_abap_unit_assert=>assert_differs( exp = ... act = ... )
- cl_abap_unit_assert=>fail( msg = '...' ) - ha kivételt vártunk de nem jött

FONTOS: Minden assertion-höz adj beszédes msg paramétert!

═══════════════════════════════════════════════════════════════
6. VÉGREHAJTÁS
═══════════════════════════════════════════════════════════════

☐ Írd a teszt osztályt a forrás INCLUDE-ba (CCDEF/CCIMP vagy a fő include végére)
☐ Szintaxis ellenőrzés
☐ Aktiválás
☐ Futtasd le a teszteket és ellenőrizd hogy ZÖLDEK!

Magyar nyelvű kommentek a tesztekhez!`,
  },
  {
    id: "test-mock",
    cat: "test",
    icon: "🎭",
    title: "Test Double / Mock generálás",
    sub: "Konfigurálható interfész mock",
    desc: "ABAP interfészhez teljes test double: return value konfig, call count logging, reset.",
    tools: ["adt"],
    vars: ["INTERFÉSZ_NEVE"],
    prompt: `Kérd le a(z) [INTERFÉSZ_NEVE] ABAP interfész forráskódját .\n\nGenerálj egy teljes test double osztályt:\n\nKépességek:\n  - set_return_value( iv_method TYPE string  iv_value TYPE string )\n  - get_call_count( iv_method TYPE string ) RETURNING VALUE(rv_count) TYPE i\n  - assert_called_once( iv_method TYPE string )\n  - reset() – számlálók törlése\n\nMinden interfész metódus:\n  - Naplózza a hívást (metódus + paraméterek)\n  - Konfigurált return value-t ad vissza\n  - Alapértelmezetten initial értéket ad`,
  },
  {
    id: "test-missing",
    cat: "test",
    icon: "🔬",
    title: "Hiányzó tesztek pótlása",
    sub: "Coverage gap azonosítás",
    desc: "Elemzi a meglévő unit teszteket és csak a leteszteletlen ágakhoz generál újakat.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] teljes forráskódját .\n\nElemezd a meglévő unit teszteket (LTCL_* osztályok).\nAzonosítsd:\n  1. Leteszteletlen publikus metódusokat\n  2. Leteszteletlen IF/CASE ágakat\n  3. CATCH blokkokat tesztek nélkül\n\nGenerálj CSAK a hiányzó teszteket!\nA meglévőket ne módosítsd.\nÍrd hozzá a meglévő teszt osztályhoz és aktiváld.`,
  },
  {
    id: "debug-dump",
    cat: "debug",
    icon: "💥",
    title: "Dump elemzés + javítás",
    sub: "ST22 dump kivizsgálása",
    desc: "Forráskód + dump szöveg alapján azonosítja a hiba okát és konkrét javítást ad.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV", "DUMP_SZÖVEG"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .\n\nAz alábbi ABAP dump keletkezett:\n--- DUMP ---\n[DUMP_SZÖVEG]\n------------\n\nElemzés:\n1. Azonosítsd a hibát okozó sort a forráskódban\n2. Magyarázd el a hiba PONTOS okát (nem csak a típust)\n3. Adj ABAP kódrészletet a javításhoz\n4. Javasolj defensive programming megközelítést\n\nMagyar nyelven!`,
  },
  {
    id: "debug-performance",
    cat: "debug",
    icon: "⚡",
    title: "Teljesítmény elemzés",
    sub: "SELECT N+1, bottleneck keresés",
    desc: "Lassú futás esetén azonosítja a N+1 SELECT, felesleges ciklusok és memória problémákat.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .\n\nKeress teljesítmény problémákat:\n\nADATBÁZIS:\n  ☐ SELECT cikluson belül (N+1)\n  ☐ SELECT * felesleges mezőkkel\n  ☐ Hiányzó WHERE feltétel\n\nLOGIKA:\n  ☐ LOOP AT … WHERE helyett SELECT\n  ☐ SORT + BINARY SEARCH lehetőség\n  ☐ String concat cikluson belül\n\nMinden problémához: ELŐTTE / UTÁNA kódrészlet + becsült javulás!`,
  },
  {
    id: "debug-oauth",
    cat: "debug",
    icon: "🔐",
    title: "OAuth/CIAM hibakeresés",
    sub: "Token, STRUST, SM59 problémák",
    desc: "Célzott OAuth/CIAM hiba diagnosztika: JWT struktúra, token cache, STRUST, HTTP config.",
    tools: ["adt"],
    vars: ["HIBAÜZENET"],
    prompt: `Kérd le az alábbi osztályok forráskódját :\n  - ZCL_OAUTH_JWT_CLIENT\n  - ZCL_BSP_CIAM_OAUTH_CONNECTOR\n\nAz alábbi hibát tapasztaljuk:\n[HIBAÜZENET]\n\nElemzési checklist:\n  ☐ JWT assertion helyes struktúra?\n  ☐ Token endpoint URL helyes?\n  ☐ STRUST tanúsítvány érvényes?\n  ☐ Token cache lejárat logika helyes?\n  ☐ Content-Type: application/x-www-form-urlencoded?\n\nAdj konkrét debugging lépéseket (SM59, STRUST, ICF)!`,
  },
  {
    id: "workflow-full-cycle",
    cat: "workflow",
    icon: "🔁",
    title: "Teljes fejlesztési ciklus",
    sub: "Review → Módosítás → Teszt → Aktiválás",
    desc: "Komplex workflow: forráskód lekérés, review, módosítás implementálás, szintaxis check, aktiválás.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV", "MÓDOSÍTÁS_LEÍRÁSA"],
    prompt: `Teljes fejlesztési ciklust szeretnék:\n\n1. Kérd le a(z) [OSZTÁLYNÉV] jelenlegi forráskódját \n2. Végezz gyors kod review-t (főbb problémák azonosítása)\n3. Implementáld az alábbi változtatást: [MÓDOSÍTÁS_LEÍRÁSA]\n4. Végezz szintaxis ellenőrzést\n5. Aktiváld az osztályt\n6. Összefoglalóban írd le mit változtattál és miért`,
  },
  {
    id: "workflow-multi-class",
    cat: "workflow",
    icon: "🗂️",
    title: "Párhuzamos osztály módosítás",
    sub: "Több osztály egyszerre",
    desc: "Kapcsolódó osztályok koordinált módosítása: pl. új paraméter hozzáadása minden érintett osztályhoz.",
    tools: ["adt"],
    vars: ["OSZTÁLYOK_LISTÁJA", "MÓDOSÍTÁS", "TRANSZPORT_SZÁM"],
    prompt: `Koordinált módosítást kell elvégezni több osztályon:\n\nÉrintett osztályok: [OSZTÁLYOK_LISTÁJA]\nMódosítás: [MÓDOSÍTÁS]\nTranszport: [TRANSZPORT_SZÁM]\n\nMinden osztályhoz:\n  1. Kérd le a jelenlegi forráskódot\n  2. Hajtsd végre a módosítást\n  3. Szintaxis check\n  4. Aktiválás\n\nTartsd meg a visszafelé kompatibilitást (default értékek)!\nAz összes osztály módosítása után adj összefoglalót.`,
  },
  {
    id: "workflow-docs",
    cat: "workflow",
    icon: "📚",
    title: "Technikai dokumentáció generálás",
    sub: "Wiki / Confluence stílusú leírás",
    desc: "Meglévő osztályokhoz teljes technikai dokumentáció: API leírás, architektúra, használati minták.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV_1", "OSZTÁLYNÉV_2"],
    prompt: `Kérd le a következő osztályok forráskódját :\n  - [OSZTÁLYNÉV_1]\n  - [OSZTÁLYNÉV_2]\n\nGenerálj technikai dokumentációt (Confluence stílusban):\n\n  # Áttekintés\n  # Architektúra diagram (ASCII art)\n  # Konfiguráció és előfeltételek\n  # Publikus API leírás (minden metódus, paraméterekkel)\n  # Hibaesetek és hibakódok\n  # Tipikus használati szcenáriók kóddal\n  # Ismert korlátok és TODO-k\n\nMagyar és angol szakszavak vegyesen, ABAP Doc stílusban.`,
  },
  // --- ÚJ PROMPTOK ---
  {
    id: "review-dependencies",
    cat: "review",
    icon: "🔗",
    title: "Függőség térkép",
    sub: "Ki mit hív, ki mitől függ",
    desc: "Osztály függőségeinek vizualizálása: interfészek, injektált osztályok, hívási lánc.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Készíts függőségi térképet:
1. Interfészek, amiket implementál
2. Konstruktorban injektált függőségek
3. Hardkódolt függőségek (CREATE OBJECT, NEW)
4. Külső hívások (RFC, HTTP, DB)

ASCII diagram formátumban:
[OSZTÁLYNÉV]
  ├── IF_INTERFACE_1
  ├── → ZCL_DEPENDENCY (injected)
  └── → BAPI_XXX (RFC call)`,
  },
  {
    id: "code-interface",
    cat: "code",
    icon: "📐",
    title: "Interfész + implementáció",
    sub: "Clean architecture minta",
    desc: "Interfész definíció és alapértelmezett implementáció generálása.",
    tools: ["adt"],
    vars: ["INTERFÉSZ_NÉV", "METÓDUSOK_LEÍRÁSA"],
    prompt: `Hozz létre egy ABAP interfészt és implementációt:

Interfész: [INTERFÉSZ_NÉV]
Metódusok: [METÓDUSOK_LEÍRÁSA]

Generáld:
1. ZIF_* interfész definíció ABAP Doc-kal
2. ZCL_* alapértelmezett implementáció
3. Minden metódushoz raising CX_* kivétel

Írd vissza és aktiváld mindkettőt .`,
  },
  {
    id: "code-badi",
    cat: "code",
    icon: "🔌",
    title: "BAdI implementáció",
    sub: "Enhancement spot kitöltése",
    desc: "BAdI definícióból implementáció generálása a megfelelő filterekkel.",
    tools: ["adt", "docs"],
    vars: ["BADI_NÉV", "FILTER_ÉRTÉKEK", "LOGIKA"],
    prompt: `Keresd meg a [BADI_NÉV] BAdI definíciót .

Generálj implementációt:
- Filter értékek: [FILTER_ÉRTÉKEK]
- Üzleti logika: [LOGIKA]

Ellenőrizd a BAdI interfész metódusait és paramétereit!
Hozd létre az enhancement implementation-t és aktiváld.`,
  },
  {
    id: "code-alv-report",
    cat: "code",
    icon: "📊",
    title: "ALV Report generálás",
    sub: "SALV vagy CL_GUI_ALV_GRID",
    desc: "Teljes ALV report szelekciós képernyővel, SALV osztállyal.",
    tools: ["adt"],
    vars: ["REPORT_NÉV", "TÁBLA_VAGY_CDS", "SZELEKCIÓS_MEZŐK"],
    prompt: `Generálj egy SALV alapú ABAP reportot:

Report: [REPORT_NÉV]
Adatforrás: [TÁBLA_VAGY_CDS]
Szelekció: [SZELEKCIÓS_MEZŐK]

Követelmények:
- SELECT-OPTIONS / PARAMETERS
- CL_SALV_TABLE használata
- Oszlop feliratok TEXT elemekből
- Toolbar: Excel export, szűrés
- Hotspot az első oszlopon (navigáció)

Írd vissza és aktiváld!`,
  },
  {
    id: "test-sql-double",
    cat: "test",
    icon: "🗃️",
    title: "SQL Test Double",
    sub: "CDS/OSQL mock adatokkal",
    desc: "Adatbázis függőség izolálása test double-lal unit teszthez.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "TÁBLA_NEVEK"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Azonosítsd az adatbázis hozzáféréseket és generálj SQL test double-t:
Táblák: [TÁBLA_NEVEK]

Használd:
- CL_OSQL_TEST_ENVIRONMENT (ABAP Cloud)
- vagy CL_CDS_TEST_ENVIRONMENT

Példa test adatokkal töltsd fel a mock táblákat.
Integráld a meglévő LTCL_* teszt osztályba.`,
  },
  {
    id: "debug-data-flow",
    cat: "debug",
    icon: "🔀",
    title: "Adatfolyam nyomkövetés",
    sub: "Változó értékek követése",
    desc: "Adott változó értékének követése a kódon keresztül, hol módosul.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "VÁLTOZÓ_NÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Kövesd nyomon a(z) [VÁLTOZÓ_NÉV] változót:
1. Hol kap értéket először?
2. Mely metódusok módosítják?
3. Hol olvasódik ki?
4. Van-e CLEAR/REFRESH?

Készíts folyamatábrát a változó életciklusáról.`,
  },
  {
    id: "debug-idoc",
    cat: "debug",
    icon: "📨",
    title: "IDoc hibakeresés",
    sub: "WE02/WE05 státusz elemzés",
    desc: "IDoc feldolgozási hiba elemzése és javítási javaslat.",
    tools: ["adt", "docs"],
    vars: ["IDOC_TÍPUS", "HIBAÜZENET"],
    prompt: `IDoc feldolgozási hiba lépett fel:
IDoc típus: [IDOC_TÍPUS]
Hibaüzenet: [HIBAÜZENET]

Elemezd:
1. Melyik FM dolgozza fel ezt az IDoc típust?
2. Keresd meg a hibát okozó logikát
3. Adj javítási javaslatot
4. Milyen WE19 teszt adatokkal reprodukálható?`,
  },
  {
    id: "workflow-refactor",
    cat: "workflow",
    icon: "♻️",
    title: "Refaktorálási terv",
    sub: "Legacy kód modernizálás",
    desc: "Lépésről lépésre refaktorálási terv meglévő kódhoz.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Készíts refaktorálási tervet:
1. Azonosítsd a problémás részeket (God class, hosszú metódusok)
2. Javasolj SOLID elvek szerinti átstrukturálást
3. Lépésenkénti terv, ahol minden lépés után működik a kód
4. Becsüld meg a kockázatokat

Ne implementálj, csak tervezz!`,
  },
  {
    id: "workflow-migration",
    cat: "workflow",
    icon: "☁️",
    title: "ABAP Cloud migráció",
    sub: "On-premise → BTP előkészítés",
    desc: "Kód elemzése ABAP Cloud kompatibilitás szempontjából.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Elemezd ABAP Cloud / Steampunk kompatibilitás szempontjából:
☐ Tiltott statement-ek (CALL TRANSACTION, SUBMIT)
☐ Nem released API-k használata
☐ Közvetlen DB hozzáférés CDS helyett
☐ Kernel hívások

Minden problémához:
- Cloud-kompatibilis alternatíva
- Released API javaslat (docs szerver)`,
  },
  // --- TOVÁBBI MINTÁK ---
  {
    id: "review-naming",
    cat: "review",
    icon: "🏷️",
    title: "Névkonvenció ellenőrzés",
    sub: "SAP/Clean ABAP szabályok",
    desc: "Változók, metódusok, osztályok elnevezéseinek ellenőrzése a Clean ABAP irányelvek szerint.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Ellenőrizd a névkonvenciókat Clean ABAP szerint:
☐ Változók: lv_, lt_, ls_, lo_, lr_ prefixek
☐ Paraméterek: iv_, it_, is_, io_, ev_, et_, es_, rv_, rt_
☐ Attribútumok: mv_, mt_, ms_, mo_
☐ Konstansok: mc_, gc_
☐ Metódusok: igék használata (get_, set_, calculate_, validate_)
☐ Boolean változók: is_, has_, can_ prefix

Listázd a nem megfelelő elnevezéseket és adj javaslatot!`,
  },
  {
    id: "review-clean-code",
    cat: "review",
    icon: "✨",
    title: "Clean ABAP audit",
    sub: "Olvashatóság és karbantarthatóság",
    desc: "Teljes Clean ABAP ellenőrzés: metódus hossz, paraméter szám, kommentek, stb.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Végezz Clean ABAP auditot:

METÓDUSOK:
☐ Max 20 sor / metódus?
☐ Max 3-4 paraméter?
☐ Egy felelősség (SRP)?
☐ Nincs flag paraméter?

VÁLTOZÓK:
☐ Beszédes nevek?
☐ Inline deklaráció használata?
☐ FIELD-SYMBOLS vs DATA REF?

STRUKTÚRA:
☐ Early return pattern?
☐ Guard clause-ok?
☐ Kerüli a mély egymásba ágyazást?

Adj prioritizált javítási listát!`,
  },
  {
    id: "code-cds-view",
    cat: "code",
    icon: "📊",
    title: "CDS View generálás",
    sub: "Annotation-ökkel",
    desc: "CDS view létrehozása a megadott táblákból, megfelelő annotációkkal.",
    tools: ["adt", "docs"],
    vars: ["VIEW_NÉV", "ALAP_TÁBLA", "MEZŐK", "SZŰRÉS"],
    prompt: `Generálj CDS View-t az alábbi specifikáció szerint:

View neve: [VIEW_NÉV]
Alap tábla: [ALAP_TÁBLA]
Mezők: [MEZŐK]
Szűrés: [SZŰRÉS]

Követelmények:
- @AbapCatalog.sqlViewName annotation
- @AccessControl.authorizationCheck: #CHECK
- @EndUserText.label megfelelő szöveggel
- Association-ök a kapcsolódó táblákhoz
- Calculated field-ek ahol releváns
- Key mezők megjelölése

Írd vissza és aktiváld !`,
  },
  {
    id: "code-rap-bo",
    cat: "code",
    icon: "🏛️",
    title: "RAP Business Object",
    sub: "Managed / Unmanaged BO",
    desc: "Teljes RAP Business Object generálása: CDS, behavior, projection.",
    tools: ["adt", "docs"],
    vars: ["ENTITÁS_NÉV", "ALAP_TÁBLA", "MŰVELETEK"],
    prompt: `Generálj RAP Business Object-et:

Entitás: [ENTITÁS_NÉV]
Alap tábla: [ALAP_TÁBLA]
Műveletek: [MŰVELETEK]

Hozd létre:
1. Root CDS View (R_*)
2. Projection View (C_*)
3. Behavior Definition (managed)
4. Behavior Implementation osztály
5. Service Definition és Binding (OData V4)

Minden CRUD művelet + validációk + determinations.
Aktiváld az összes objektumot!`,
  },
  {
    id: "code-exception",
    cat: "code",
    icon: "⚠️",
    title: "Kivétel osztály generálás",
    sub: "CX_ osztály hierarchia",
    desc: "ABAP kivétel osztály létrehozása üzenet osztállyal és szövegekkel.",
    tools: ["adt"],
    vars: ["KIVÉTEL_NÉV", "ÜZENET_TÍPUSOK"],
    prompt: `Generálj kivétel osztályt:

Osztálynév: ZCX_[KIVÉTEL_NÉV]
Üzenet típusok: [ÜZENET_TÍPUSOK]

Követelmények:
- Öröklés: CX_STATIC_CHECK vagy CX_DYNAMIC_CHECK
- IF_T100_MESSAGE implementálás
- Üzenet osztály (message class) létrehozása
- Konstansok minden hibakódhoz
- CONSTRUCTOR megfelelő paraméterekkel
- ABAP Doc dokumentáció

Írd vissza és aktiváld!`,
  },
  {
    id: "code-factory",
    cat: "code",
    icon: "🏭",
    title: "Factory pattern implementáció",
    sub: "Dependency Injection előkészítés",
    desc: "Factory osztály és interfész generálása a loose coupling érdekében.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Refaktoráld Factory pattern-re:
1. Extrahálj interfészt (ZIF_*)
2. Hozz létre factory osztályt (ZCL_*_FACTORY)
3. A factory legyen singleton
4. Támogasson test double injektálást

Factory metódusok:
- get_instance( ) → interfész
- set_mock( io_mock TYPE REF TO zif_* ) → teszteléshez
- reset( ) → mock törlése

Aktiváld az összes új objektumot!`,
  },
  {
    id: "test-integration",
    cat: "test",
    icon: "🔗",
    title: "Integrációs teszt",
    sub: "Több osztály együttműködése",
    desc: "Integrációs teszt több osztály együttműködésének tesztelésére.",
    tools: ["adt"],
    vars: ["OSZTÁLY_1", "OSZTÁLY_2", "SZCENÁRIÓ"],
    prompt: `Kérd le a következő osztályokat :
- [OSZTÁLY_1]
- [OSZTÁLY_2]

Generálj integrációs tesztet:
Szcenárió: [SZCENÁRIÓ]

Követelmények:
- Test fixture setup (valós objektumok, nem mock)
- Test data builder pattern
- Cleanup teardown
- Assertion-ök a végállapotra
- Risk level: CRITICAL vagy DANGEROUS ha DB-t módosít

Ne mock-olj mindent - a cél az integráció tesztelése!`,
  },
  {
    id: "test-exception",
    cat: "test",
    icon: "💣",
    title: "Kivétel tesztek",
    sub: "Negatív test case-ek",
    desc: "Negatív tesztek generálása: hibás input, kivételek, boundary értékek.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Generálj negatív teszteket minden publikus metódushoz:

Tesztelendő esetek:
☐ NULL / initial értékek
☐ Üres string, üres tábla
☐ Boundary értékek (MAX_INT, túl hosszú string)
☐ Érvénytelen típus konverzió
☐ Hiányzó kötelező paraméterek
☐ Várt kivételek (TRY-CATCH)

Használj: cl_abap_unit_assert=>fail( ) ha nem dob kivételt!
Integráld a meglévő teszt osztályba.`,
  },
  {
    id: "debug-memory",
    cat: "debug",
    icon: "🧠",
    title: "Memória analízis",
    sub: "Internal table méret, referenciák",
    desc: "Memória használat elemzése: nagy táblák, memory leak gyanús helyek.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Elemezd a memória használatot:

INTERNAL TABLE-ÖK:
☐ Típus megfelelő? (STANDARD vs HASHED vs SORTED)
☐ Van-e felesleges másolás (MOVE)?
☐ FREE/CLEAR használat ciklusok után?
☐ ASSIGNING vs INTO?

REFERENCIÁK:
☐ Körkörös referencia veszély?
☐ Singleton-ok memóriában maradnak?
☐ Static attribútumok mérete?

Adj memory profiling tippeket (ST05, SAT)!`,
  },
  {
    id: "debug-lock",
    cat: "debug",
    icon: "🔒",
    title: "Lock konfliktus elemzés",
    sub: "Enqueue / Dequeue problémák",
    desc: "Zárolási problémák azonosítása és megoldási javaslatok.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV", "LOCK_OBJEKTUM"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Elemezd a zárolási logikát:
Lock objektum: [LOCK_OBJEKTUM]

Ellenőrizd:
☐ ENQUEUE hívás helye (túl korán?)
☐ DEQUEUE mindig meghívódik? (CATCH ágakban is?)
☐ _SCOPE paraméter helyes?
☐ _WAIT paraméter timeout-tal?
☐ Holtpont (deadlock) kockázat?

Javasolj:
- Optimális lock stratégiát
- Error handling-et lock failure esetén
- SM12 / SM21 debugging lépéseket`,
  },
  {
    id: "debug-auth",
    cat: "debug",
    icon: "👮",
    title: "Jogosultság hibakeresés",
    sub: "AUTHORITY-CHECK problémák",
    desc: "Jogosultsági problémák diagnosztizálása: SU53, auth trace.",
    tools: ["adt", "docs"],
    vars: ["OSZTÁLYNÉV", "AUTH_OBJEKTUM"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Elemezd a jogosultság ellenőrzést:
Auth objektum: [AUTH_OBJEKTUM]

Ellenőrizd:
☐ AUTHORITY-CHECK szintaxis helyes?
☐ Minden mező ellenőrzött?
☐ DUMMY használat indokolt?
☐ sy-subrc kezelés megfelelő?
☐ Van-e megkerülhető ág?

Adj SU53 / ST01 / STAUTHTRACE debugging lépéseket!
Ha hiányzik ellenőrzés, adj kódrészletet.`,
  },
  {
    id: "workflow-code-review-pr",
    cat: "workflow",
    icon: "👀",
    title: "Pull Request Review",
    sub: "Változások elemzése",
    desc: "Két verzió összehasonlítása és review jegyzőkönyv készítése.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "VÁLTOZTATÁS_LEÍRÁS"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Készíts Code Review jegyzőkönyvet:
Változtatás: [VÁLTOZTATÁS_LEÍRÁS]

Review checklist:
☐ Funkcionális helyesség
☐ Edge case-ek kezelése
☐ Error handling
☐ Teljesítmény hatás
☐ Visszafelé kompatibilitás
☐ Unit teszt lefedettség
☐ Dokumentáció frissítve?

Formátum:
✅ APPROVE / ⚠️ REQUEST CHANGES / ❌ REJECT
Kommentek soronként ahol szükséges.`,
  },
  {
    id: "workflow-transport",
    cat: "transport",
    icon: "📦",
    title: "Transzport előkészítés",
    sub: "Objektum lista és függőségek",
    desc: "Transzporthoz szükséges objektumok és függőségeik azonosítása.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "CÉLRENDSZER"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] és függőségeinek forráskódját .

Készíts transzport checklistet:
Célrendszer: [CÉLRENDSZER]

Azonosítsd:
1. Közvetlen függőségek (használt osztályok, interfészek)
2. Data Dictionary objektumok (táblák, struktúrák, domain-ek)
3. Message class-ok
4. Number range objektumok
5. Customizing táblák (van-e adat is?)

Sorrend javaslat (STMS):
1. DDIC objektumok
2. Interfészek
3. Osztályok
4. Konfigurációs adatok

Figyelmeztetések ha van rendszer-függő hardkódolt érték!`,
  },
  {
    id: "workflow-compare",
    cat: "workflow",
    icon: "⚖️",
    title: "Kód összehasonlítás",
    sub: "Két osztály diff elemzése",
    desc: "Két osztály vagy verzió közötti különbségek azonosítása és dokumentálása.",
    tools: ["adt"],
    vars: ["OSZTÁLY_1", "OSZTÁLY_2"],
    prompt: `Kérd le mindkét osztályt :
- [OSZTÁLY_1]
- [OSZTÁLY_2]

Készíts összehasonlító elemzést:

STRUKTÚRA:
- Metódus különbségek (új, törölt, módosított)
- Attribútum változások
- Interfész implementáció eltérések

LOGIKA:
- Algoritmus különbségek
- Error handling eltérések
- Teljesítmény különbségek

OUTPUT:
Táblázatos formátum + ajánlás melyik a jobb megoldás.`,
  },
  {
    id: "code-select",
    cat: "code",
    icon: "🔍",
    title: "Optimális SELECT írás",
    sub: "Teljesítmény-optimalizált lekérdezés",
    desc: "SELECT statement optimalizálása: index használat, JOIN vs FOR ALL ENTRIES.",
    tools: ["adt", "docs"],
    vars: ["TÁBLÁK", "FELTÉTELEK", "MEZŐK"],
    prompt: `Írj optimalizált SELECT statement-et:

Táblák: [TÁBLÁK]
Feltételek: [FELTÉTELEK]
Szükséges mezők: [MEZŐK]

Döntsd el és indokold:
- JOIN vs FOR ALL ENTRIES vs nested SELECT?
- Melyik index használható?
- UP TO n ROWS szükséges?
- PACKAGE SIZE a memóriához?

Adj ABAP kódot és magyarázd az index használatot!
Említsd meg az ST05 trace lépéseket az ellenőrzéshez.`,
  },
  {
    id: "code-json",
    cat: "code",
    icon: "📋",
    title: "JSON / XML feldolgozás",
    sub: "Szerializáció és deszerializáció",
    desc: "JSON vagy XML adatstruktúra ABAP típusra konvertálása és vissza.",
    tools: ["adt", "docs"],
    vars: ["FORMÁTUM", "STRUKTÚRA_LEÍRÁS"],
    prompt: `Generálj [FORMÁTUM] feldolgozó kódot:

Struktúra: [STRUKTÚRA_LEÍRÁS]

Hozd létre:
1. ABAP struktúra/tábla típus (TYPES)
2. Szerializáló metódus (ABAP → JSON/XML)
3. Deszerializáló metódus (JSON/XML → ABAP)

Használd:
- /UI2/CL_JSON (JSON esetén)
- CL_SXML_* osztályok (XML esetén)
- XSLT transformation alternatívaként

Error handling: mit csinálj hibás input esetén?`,
  },
  {
    id: "code-http-client",
    cat: "code",
    icon: "🌐",
    title: "HTTP kliens implementáció",
    sub: "REST API hívás",
    desc: "HTTP kliens osztály létrehozása REST API hívásokhoz, error handling-gel.",
    tools: ["adt", "docs"],
    vars: ["API_URL", "AUTH_TÍPUS", "MŰVELETEK"],
    prompt: `Generálj HTTP kliens osztályt:

API URL: [API_URL]
Autentikáció: [AUTH_TÍPUS]
Műveletek: [MŰVELETEK]

Követelmények:
- CL_HTTP_CLIENT vagy CL_REST_HTTP_CLIENT használata
- SM59 destination kezelés
- Request/Response logging
- Timeout beállítás
- Retry logika tranziáns hibákra
- HTTP státusz kód kezelés (4xx, 5xx)
- SSL/TLS certificate kezelés (STRUST)

Adj ICF service debugging tippeket is!`,
  },
  {
    id: "debug-trace",
    cat: "debug",
    icon: "📍",
    title: "Futási nyomkövetés",
    sub: "Logging és trace implementálás",
    desc: "Átmeneti trace logika hozzáadása hibakereséshez, majd eltávolítás.",
    tools: ["adt"],
    vars: ["OSZTÁLYNÉV", "METÓDUS_LISTA"],
    prompt: `Kérd le a(z) [OSZTÁLYNÉV] forráskódját .

Add hozzá ideiglenes trace-t ezekhez a metódusokhoz: [METÓDUS_LISTA]

Trace típusok:
1. Belépési pont (paraméterek)
2. Döntési pontok (IF/CASE ágak)
3. Kilépési pont (return érték)
4. Kivétel dobás helyek

Használd:
- APPLICATION_LOG (BAL_*) vagy
- SLG1 kompatibilis logging

FONTOS: Kommenteld meg a trace sorokat "TODO: Remove trace" megjegyzéssel!`,
  },
  {
    id: "test-scenario",
    cat: "test",
    icon: "🎬",
    title: "Szcenárió alapú teszt",
    sub: "End-to-end user story teszt",
    desc: "Teljes user story lefedése tesztekkel, given-when-then formátumban.",
    tools: ["adt"],
    vars: ["USER_STORY", "ÉRINTETT_OSZTÁLYOK"],
    prompt: `User story: [USER_STORY]
Érintett osztályok: [ÉRINTETT_OSZTÁLYOK]

Kérd le az osztályokat  és generálj szcenárió teszteket.

Formátum (Given-When-Then):
GIVEN: Előfeltételek (test data setup)
WHEN: Végrehajtott akció
THEN: Elvárt eredmény (assertion-ök)

Tesztelendő szcenáriók:
☐ Happy path (sikeres eset)
☐ Alternatív folyamat
☐ Hibás input kezelése
☐ Jogosultsági elutasítás
☐ Concurrent access

Minden szcenárióhoz külön teszt metódus!`,
  },
  // --- TRANSZPORT KATEGÓRIA ---
  {
    id: "transport-conflict",
    cat: "transport",
    icon: "⚔️",
    title: "Transzport ütközés elemzés",
    sub: "Konfliktusok azonosítása",
    desc: "Két vagy több transzport közötti ütközések és átfedések felderítése.",
    tools: ["adt"],
    vars: ["TRANSZPORT_1", "TRANSZPORT_2"],
    prompt: `Elemezd a következő transzportokat ütközés szempontjából:
- Transzport 1: [TRANSZPORT_1]
- Transzport 2: [TRANSZPORT_2]

Ellenőrizd:
☐ Ugyanazt az objektumot módosítják?
☐ Van-e átfedő DDIC objektum?
☐ Sorrendfüggőség van köztük?
☐ Melyik írja felül a másikat?

Ha ütközés van:
1. Azonosítsd az érintett objektumokat
2. Javasolj import sorrendet
3. Adj merge stratégiát ha szükséges
4. Figyelmeztetés ha adatvesztés lehetséges

SE09/SE10 és STMS lépések az ellenőrzéshez!`,
  },
  {
    id: "transport-dependency",
    cat: "transport",
    icon: "🔗",
    title: "Függőség analízis",
    sub: "Előfeltétel transzportok",
    desc: "Transzport függőségeinek feltérképezése - mi kell előtte.",
    tools: ["adt"],
    vars: ["TRANSZPORT_SZÁM"],
    prompt: `Elemezd a [TRANSZPORT_SZÁM] transzport függőségeit.

Keresd meg :
1. Transzportban lévő objektumok
2. Minden objektum függőségei
3. Ezek melyik transzportban vannak

Készíts függőségi fát:
[TRANSZPORT]
  └── ZCL_OSZTÁLY
      ├── ZIF_INTERFACE → TR másik
      ├── ZTABLE → TR harmadik
      └── ZCX_EXCEPTION → TR negyedik

KRITIKUS: Jelöld ha függőség NINCS IMPORTÁLVA a célrendszerben!
Adj STMS import queue sorrendet.`,
  },
  {
    id: "transport-object-lock",
    cat: "transport",
    icon: "🔐",
    title: "Objektum zárolás keresés",
    sub: "Ki módosítja / zárolj",
    desc: "Azonos objektumon dolgozó fejlesztők és transzportok azonosítása.",
    tools: ["adt"],
    vars: ["OBJEKTUM_NÉV"],
    prompt: `Ellenőrizd a(z) [OBJEKTUM_NÉV] objektum zárolási állapotát.

Keresendő információk:
☐ Melyik transzportban van jelenleg?
☐ Ki a transzport tulajdonosa?
☐ Mikor volt utoljára módosítva?
☐ Van-e más nyitott transzport ugyanerre?
☐ Történt-e változás ami nincs release-elve?

SE09/SE10 ellenőrzés:
- E070: Transzport header
- E071: Objektumok a transzportban
- TADIR: Objektum - csomag hozzárendelés

Javaslat ha ütközés van!`,
  },
  {
    id: "transport-cross-system",
    cat: "transport",
    icon: "🔄",
    title: "Rendszerek közötti összehasonlítás",
    sub: "DEV vs QAS vs PRD diff",
    desc: "Objektum verzióinak összehasonlítása különböző rendszerekben.",
    tools: ["adt"],
    vars: ["OBJEKTUM_NÉV", "RENDSZER_1", "RENDSZER_2"],
    prompt: `Hasonlítsd össze a(z) [OBJEKTUM_NÉV] objektumot:
- [RENDSZER_1] rendszerben
- [RENDSZER_2] rendszerben

Ellenőrizd:
☐ Verzió különbségek
☐ Forráskód eltérések
☐ Aktiválási dátumok
☐ Utolsó módosító user

Ha eltérés van:
1. Mi a különbség pontosan? (diff)
2. Melyik verzió az "igazi"?
3. Van-e transzport úton ami megoldja?
4. Kell-e visszaszállítás (retrofit)?

SE39 / SE95 program összehasonlítás lépések!`,
  },
  {
    id: "transport-release-check",
    cat: "transport",
    icon: "✅",
    title: "Release előtti ellenőrzés",
    sub: "Go/No-Go checklist",
    desc: "Transzport release előtti teljes ellenőrzési lista.",
    tools: ["adt"],
    vars: ["TRANSZPORT_SZÁM"],
    prompt: `Végezz release előtti ellenőrzést: [TRANSZPORT_SZÁM]

SZINTAXIS ÉS AKTIVÁLÁS:
☐ Minden objektum aktív?
☐ Nincs szintaxis hiba?
☐ DDIC objektumok aktiválva?
☐ Generált objektumok renderelve?

TESZTELÉS:
☐ Unit tesztek lefutottak?
☐ Integrációs teszt OK?
☐ Regresszió teszt elvégezve?

DOKUMENTÁCIÓ:
☐ Transzport leírás kitöltve?
☐ Change request hivatkozás?
☐ Rollback terv készült?

FÜGGŐSÉGEK:
☐ Előfeltétel TR-ek release-elve?
☐ Nincs körkörös függőség?

Release STMS lépések és SE09 útmutató!`,
  },
  {
    id: "transport-hotfix",
    cat: "transport",
    icon: "🚨",
    title: "Sürgős hotfix transzport",
    sub: "Emergency change folyamat",
    desc: "Sürgős javítás transzportálása a megfelelő eljárással.",
    tools: ["adt"],
    vars: ["HIBA_LEÍRÁS", "ÉRINTETT_OBJEKTUMOK"],
    prompt: `Sürgős hotfix szükséges!

Hiba: [HIBA_LEÍRÁS]
Érintett objektumok: [ÉRINTETT_OBJEKTUMOK]

Hotfix folyamat:
1. Új transzport létrehozása (emergency prefix)
2. Minimális változtatás azonosítása
3. Fejlesztés közvetlenül PROD-ban? (ha engedélyezett)

Ellenőrzőlista:
☐ Csak a javításhoz szükséges objektumok
☐ Nincs "ráadás" módosítás
☐ Azonnali teszt PROD-ban
☐ Retrofit terv DEV felé
☐ Dokumentáció (incident szám)

FIGYELEM:
- Downgrade kockázat ha DEV-ben más verzió!
- Retrofit KÖTELEZŐ a konzisztenciához!`,
  },
  {
    id: "transport-retrofit",
    cat: "transport",
    icon: "⬅️",
    title: "Retrofit tervezés",
    sub: "PRD → DEV visszaszállítás",
    desc: "Termelési változások visszaszállítása fejlesztői rendszerbe.",
    tools: ["adt"],
    vars: ["PROD_TRANSZPORT", "DEV_VÁLTOZÁSOK"],
    prompt: `Retrofit szükséges:
PROD transzport: [PROD_TRANSZPORT]
DEV-ben történt változások: [DEV_VÁLTOZÁSOK]

Elemzés:
1. Mi van PROD-ban ami nincs DEV-ben?
2. Mi van DEV-ben ami nincs PROD-ban?
3. Van-e konfliktus a kettő között?

Retrofit stratégia:
☐ Transport of Copies (ToC) használata
☐ Manuális merge szükséges?
☐ Melyik verzió a "master"?

Lépések:
1. SE09 → Transport of Copies létrehozása
2. Objektumok másolása PROD-ról
3. Merge DEV változásokkal
4. Teszt és aktiválás DEV-ben

KRITIKUS: Dokumentáld mi lett merge-ölve!`,
  },
  {
    id: "transport-queue",
    cat: "transport",
    icon: "📋",
    title: "Import queue rendezés",
    sub: "STMS sorrend optimalizálás",
    desc: "Import queue sorrendjének ellenőrzése és optimalizálása.",
    tools: ["adt"],
    vars: ["CÉLRENDSZER", "TRANSZPORT_LISTA"],
    prompt: `Rendezd az import queue-t:
Célrendszer: [CÉLRENDSZER]
Transzportok: [TRANSZPORT_LISTA]

Elemzés minden transzportra:
1. Tartalmazott objektumok
2. Függőségek más TR-ekre
3. DDIC változások (elsőbbség!)

Optimális sorrend meghatározása:
☐ DDIC objektumok először
☐ Interfészek az implementáció előtt
☐ Alap osztályok az örököltek előtt
☐ Nincs körkörös függőség

STMS lépések:
1. Import queue megnyitása
2. Sorrend módosítása
3. Előzetes import ellenőrzés
4. Import indítása megfelelő opciókal

Import opciók javaslat (Overwrite, Ignore)!`,
  },
  {
    id: "transport-compare-versions",
    cat: "transport",
    icon: "📊",
    title: "Verzió történet elemzés",
    sub: "Objektum változási napló",
    desc: "Objektum teljes verzió történetének és változásainak elemzése.",
    tools: ["adt"],
    vars: ["OBJEKTUM_NÉV"],
    prompt: `Elemezd a(z) [OBJEKTUM_NÉV] verzió történetét .

Gyűjtsd össze:
☐ Összes verzió az VRSD táblából
☐ Minden verzióhoz: dátum, user, transzport
☐ Változások típusa (új/módosított/törölt sorok)

Készíts idővonalat:
| Dátum | User | Transzport | Változás típusa |
|-------|------|------------|-----------------|
| ...   | ...  | ...        | ...             |

Azonosítsd:
- Leggyakrabban módosító user
- Legnagyobb változás mikor volt
- Van-e gyanús módosítás (pl. hétvégén)

SE39 verzió összehasonlítás lépések!`,
  },
  {
    id: "transport-missing-objects",
    cat: "transport",
    icon: "❓",
    title: "Hiányzó objektumok keresése",
    sub: "Aktiválási hibák diagnosztika",
    desc: "Import utáni aktiválási hibák és hiányzó függőségek felderítése.",
    tools: ["adt", "docs"],
    vars: ["HIBAÜZENET", "TRANSZPORT_SZÁM"],
    prompt: `Import után aktiválási hiba:
Hibaüzenet: [HIBAÜZENET]
Transzport: [TRANSZPORT_SZÁM]

Diagnosztika:
1. Mi az aktiválási hiba pontos oka?
2. Melyik objektum hiányzik?
3. Melyik transzportban kellene lennie?
4. Importálva van-e a célrendszerben?

Ellenőrizd:
☐ E070/E071 - Transzport tartalom
☐ TADIR - Objektum létezik-e
☐ SMODILOG - Módosítási napló
☐ Aktiválási protokoll (SM21)

Megoldási javaslatok:
1. Hiányzó TR pót-importálása
2. Objektum újragenerálása
3. Kézi aktiválás sorrendje

SE11 / SE80 hibakeresési lépések!`,
  },
  {
    id: "transport-rollback",
    cat: "transport",
    icon: "⏪",
    title: "Rollback terv készítés",
    sub: "Visszaállítási stratégia",
    desc: "Transzport visszagörgetési terv készítése problémás import esetére.",
    tools: ["adt"],
    vars: ["TRANSZPORT_SZÁM", "ÉRINTETT_OBJEKTUMOK"],
    prompt: `Készíts rollback tervet:
Transzport: [TRANSZPORT_SZÁM]
Objektumok: [ÉRINTETT_OBJEKTUMOK]

Rollback előkészítés IMPORT ELŐTT:
☐ Jelenlegi verziók mentése
☐ Érintett táblák backup (ha van adatváltozás)
☐ Customizing értékek dokumentálása

Rollback stratégiák:
1. Transport of Copies a régi verzióról
2. ABAP verziókezelésből visszaállítás (SE39)
3. Teljes rendszer visszaállítás (utolsó lehetőség)

Rollback lépések:
1. Probléma azonosítása
2. Döntés a rollback típusról
3. Végrehajtás
4. Verifikáció
5. Root cause elemzés

FIGYELEM: DDIC változások rollback-je kritikus!`,
  },
];
