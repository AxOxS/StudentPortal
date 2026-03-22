# Testavimo Planas – StudentPortal

## Turinys

1. [Komandos įgūdžiai ir patirtis](#1-komandos-įgūdžiai-ir-patirtis)
2. [Testavimo tikslai ir komandos misija](#2-testavimo-tikslai-ir-komandos-misija)
3. [Apribojimai](#3-apribojimai)
4. [Projekto ir verslo pobūdis](#4-projekto-ir-verslo-pobūdis)
5. [Rizikų vertinimas](#5-rizikų-vertinimas)

---

## 1. Komandos įgūdžiai ir patirtis

### 1.1. Komandos sudėtis

Projektą vykdo vidutinio dydžio programinės įrangos kūrimo komanda, sudaryta iš kelių patirties lygių specialistų. Kiekvienas narys prisideda prie testavimo proceso pagal savo kompetencijų sritį.

| Pozicija | Skaičius | Atsakomybė testavime |
|---|---|---|
| Senior Full-Stack Developer | 1 | Testavimo architektūros projektavimas, kodo peržiūra, integracinių testų strategija |
| Mid Full-Stack Developer | 1 | Vienetų ir integracinių testų rašymas, CI/CD konfigūracija |
| Junior Frontend Developer | 1 | Frontend komponentų testai, manualinis testavimas |
| Junior Backend Developer | 1 | Backend vienetų testai, defektų dokumentavimas |

> **Pastaba:** Projekte nėra dedikuoto QA inžinieriaus. Testavimo atsakomybė padalinta tarp kūrėjų pagal ISTQB „whole-team" principą.

### 1.2. Techninių įgūdžių vertinimas

#### Backend testavimas

| Technologija / Įrankis | Junior | Mid | Senior | Naudojama projekte |
|---|---|---|---|---|
| C# / .NET 8 | Pradedantysis | Vidutinis | Ekspertas | ✓ |
| xUnit | Pradedantysis | Vidutinis | Ekspertas | ✓ |
| Moq (mocking) | Nėra | Vidutinis | Ekspertas | ✓ |
| EF Core InMemory | Nėra | Vidutinis | Ekspertas | ✓ |
| Coverlet / ReportGenerator | Nėra | Pradedantysis | Vidutinis | ✓ |
| Integration Testing | Nėra | Pradedantysis | Vidutinis | ✓ |

#### Frontend testavimas

| Technologija / Įrankis | Junior | Mid | Senior | Naudojama projekte |
|---|---|---|---|---|
| JavaScript / React 19 | Pradedantysis | Vidutinis | Ekspertas | ✓ |
| Jest | Pradedantysis | Vidutinis | Ekspertas | ✓ |
| React Testing Library | Pradedantysis | Vidutinis | Ekspertas | ✓ |
| HTTP mocking (axios) | Nėra | Vidutinis | Ekspertas | ✓ |
| E2E (Playwright/Cypress) | Nėra | Nėra | Vidutinis | ✗ (ateityje) |

#### Manualinis testavimas

| Įgūdis | Junior | Mid | Senior |
|---|---|---|---|
| Test case rašymas (ISTQB) | Pradedantysis | Vidutinis | Ekspertas |
| Rizikos analizė | Nėra | Vidutinis | Ekspertas |
| Defektų klasifikavimas | Pradedantysis | Vidutinis | Ekspertas |
| Regresinis testavimas | Pradedantysis | Vidutinis | Ekspertas |

### 1.3. Taikytos testavimo technikos pagal komandos galimybes

Atsižvelgiant į komandos patirties lygius ir projekto terminus, pasirinktos šios technikos:

| Technika | Kas taiko | Pagrindimas |
|---|---|---|
| **AAA (Arrange, Act, Assert) šablonas** | Visa komanda | Industrijoje priimtas standartas; aiškus Junior'ams |
| **Ekvivalenčių klasių dalijimas** | Mid, Senior | Efektyvus testų kiekio optimizavimui |
| **Ribinių reikšmių analizė** | Mid, Senior | Taikyta Score (0..MaxScore) laukams |
| **Klaidų spėjimas** | Senior | Paremta patirtimi ir OWASP Top 10 |
| **Kontrolinis sąrašas** | Junior, Mid | Manualiniam testavimui pagal reikalavimus |
| **Rizika pagrįstas prioritizavimas** | Senior | Laiko optimizavimui: pirma testuoti kritiška |

---

## 2. Testavimo tikslai ir komandos misija

### 2.1. Misija

> Užtikrinti StudentPortal sistemos kokybę komerciniu lygiu – aptikti defektus kuo anksčiau kūrimo cikle, kad produktas būtų patikimas, saugus ir atitiktų kliento keliamus reikalavimus iki kiekvieno release'o.

### 2.2. Testavimo tikslai

| Nr. | Tikslas | Prioritetas | Sėkmės kriterijus |
|---|---|---|---|
| T-01 | Patvirtinti autentifikacijos ir autorizacijos teisingumą | Kritinis | Visi AuthController testai praeina; JWT validacija veikia |
| T-02 | Patvirtinti pažymių CRUD operacijas ir validaciją | Kritinis | 14 GradesController testų praeina; Score ribos tikrinamos |
| T-03 | Patvirtinti tvarkaraščių valdymo funkcionalumą | Aukštas | 13 ScheduleController testų praeina |
| T-04 | Patvirtinti rolių pagrindu prieigos kontrolę | Kritinis | Studentas negali atlikti Teacher/Admin veiksmų |
| T-05 | Aptikti ir pašalinti kritinius defektus prieš kiekvieną release'ą | Kritinis | 0 P1 defektų release metu |
| T-06 | Pasiekti ≥ 80% kodo padengimą aktyvių modulių lygyje | Vidutinis | Coverlet/Jest ataskaita patvirtina |
| T-07 | Patvirtinti sistemos elgesį manualinio testavimo metu | Aukštas | 26/26 TC įvykdyti, 0 P1 defektų |

### 2.3. Testavimo apimtis

#### Įtraukta į testavimą (in scope):
- Autentifikacijos modulis (prisijungimas, registracija, JWT generavimas, BCrypt)
- Pažymių modulis (CRUD, validacija, filtravimas)
- Tvarkaraščių modulis (CRUD, filtravimas pagal studentą/semestrą/dieną)
- Vartotojų valdymo modulis (admin funkcijos)
- Frontend API sluoksnis (`auth.js`, `student.js`)
- Frontend komponentai: `Login.js`, `Register.js`
- Integraciniai scenarijai (kelių kontrolerių sąveika)

#### Neįtraukta į testavimą (out of scope):
- E2E naršyklės testavimas (Playwright/Cypress) – planuojamas kitame sprintе
- Apkrovos ir našumo testavimas – atskira iniciatyva
- `StudentPage`, `TeacherPage`, `AdminPage` automatinis testavimas – reikalauja refaktorizavimo
- Duomenų bazės migracijų kodo testavimas

---

## 3. Apribojimai

### 3.1. Teisiniai ir atitikties apribojimai

| Apribojimas | Aprašymas | Poveikis testavimui |
|---|---|---|
| **BDAR / GDPR** | Sistema tvarko asmens duomenis: vardas, pavardė, el. paštas, akademiniai rezultatai | Testavimo duomenys turi būti sintetiniai; realių kliento duomenų naudojimas draudžiamas |
| **Duomenų saugojimas** | Slaptažodžiai privalo būti hash'inami BCrypt algoritmu | Testas tikrina, kad aiškūs slaptažodžiai niekada nesaugomi duomenų bazėje |
| **Duomenų prieigos kontrolė** | Studentas privalo matyti tik savo duomenis | Rolebasedaccess testai privalomi kiekvienam release'ui |

### 3.2. Techniniai ir vidiniai standartai

| Standartas | Taikymas projekte |
|---|---|
| **ISO/IEC 25010** | Kokybės modelis: funkcionalumas, patikimumas, saugumas, naudojamumas, palaikomumas |
| **ISTQB Foundation Level** | Testavimo terminija, procesų struktūra, defektų klasifikacija |
| **OWASP Top 10** | Saugumo testavimo kontrolinis sąrašas (SQL injection, broken auth, CORS) |
| **HTTP RFC 9110** | HTTP atsakymų kodų teisingas naudojimas (200, 201, 400, 401, 404) |
| **Semantic Versioning** | Produkto versijų valdymas |

### 3.3. Projekto valdymo apribojimai

| Apribojimas | Detalės |
|---|---|
| **Iteracijos** | 2 savaičių sprintai; testavimas integruotas į kūrimo ciklą (shift-left) |
| **Definition of Done** | Funkcija laikoma baigta tik kai testai parašyti, praeina ir PR peržiūra atlikta |
| **Biudžetas** | Naudojami tik open-source įrankiai (xUnit, Jest, Playwright) |
| **Aplinka** | Dev: Windows 11 / Docker; CI: GitHub Actions; Prod: konteinerizuota aplinka |
| **Branching** | GitFlow: `main` (prod), `develop`, `feature/*`, `hotfix/*` |

### 3.4. Techniniai apribojimai

| Apribojimas | Poveikis |
|---|---|
| EF Core InMemory nesilaiko visų SQL taisyklių (UNIQUE, FK constraints) | Duomenų lygio validacija testuojama kodo lygiu, ne DB lygiu |
| ESM moduliai (axios, jwt-decode) reikalauja specialios Jest konfigūracijos | `transformIgnorePatterns` pridėtas į `package.json` |
| Nėra dedicated QA aplinkos | Testavimas vykdomas dev aplinkoje; staging aplinka planuojama |

---

## 4. Projekto ir verslo pobūdis

### 4.1. Produkto aprašymas

**StudentPortal** – komercinė švietimo valdymo sistema (Educational Management System / EMS), kuriama švietimo įstaigoms. Produktas teikiamas kaip SaaS sprendimas, todėl patikimumas, saugumas ir duomenų tikslumas yra verslo kritiniai reikalavimai.

### 4.2. Verslo kontekstas

| Aspektas | Detalės |
|---|---|
| **Klientas** | Švietimo įstaigos (universitetai, mokyklos) |
| **Naudotojai** | Studentai, dėstytojai, administratoriai |
| **Komercinė svarba** | SLA (Service Level Agreement) įsipareigojimai klientui; defektai produkcinėje aplinkoje = finansinė ir reputacinė žala |
| **Release ciklas** | Kiekvieną sprintą (2 savaitės) |
| **Palaikymas** | Post-release hotfix'ai per 24–48 val. kritiniams defektams |

### 4.3. Verslo kritiniai procesai

Testavimo požiūriu šie procesai tiesiogiai veikia verslo vertę:

| Procesas | Verslo poveikis klaidai | Testavimo prioritetas |
|---|---|---|
| **Autentifikacija** | Neteisėta prieiga -> BDAR pažeidimas -> baudos, reputacinė žala | Kritinis |
| **Pažymių tikslumas** | Neteisingi akademiniai įrašai -> kliento skundas, SLA pažeidimas | Kritinis |
| **Rolių atskyrimas** | Duomenų nutekėjimas -> teisinė atsakomybė | Kritinis |
| **Tvarkaraščių valdymas** | Neveikianti funkcija -> vartotojų nepasitenkinimas | Aukštas |
| **Sistemos prieinamumas** | Downtime -> SLA pažeidimas -> kompensacijos | Aukštas |

---

## 5. Rizikų vertinimas

### 5.1. Projekto žlugimo rizikos

| Rizikos ID | Rizika | Tikimybė | Poveikis | Prioritetas | Atsakingas |
|---|---|---|---|---|---|
| R-01 | Autentifikacijos klaida – neteisėta prieiga | Žema | Kritinis | **P1** | Senior Dev |
| R-02 | Neteisingi pažymiai pateikiami studentams | Žema | Kritinis | **P1** | Mid Dev |
| R-03 | SQL injekcija per API parametrus | Vidutinė | Kritinis | **P1** | Senior Dev |
| R-04 | JWT tokeno klastojimas / manipuliacija | Žema | Kritinis | **P1** | Senior Dev |
| R-05 | Negrįžtama DELETE operacija be patvirtinimo | Vidutinė | Aukštas | **P2** | Mid Dev |
| R-06 | CORS konfigūracijos klaida | Žema | Vidutinis | **P3** | Mid Dev |
| R-07 | Neteisingas slaptažodžio hash'inimas | Žema | Kritinis | **P1** | Senior Dev |
| R-08 | Sesijos neištrynimas po logout | Vidutinė | Aukštas | **P2** | Junior Dev |
| R-09 | Produkcijos aplinkos konfigūracijos klaida | Žema | Kritinis | **P1** | Senior Dev |
| R-10 | Nepakankamas kodo padengimas -> neatrastas defektas prod. | Vidutinė | Aukštas | **P2** | Visa komanda |

### 5.2. Grėsmės produktui ir pasekmės

| Grėsmė | Aprašymas | Galimos pasekmės |
|---|---|---|
| **Neteisėta prieiga** | Vartotojas be tinkamos rolės pasiekia kitų duomenis | BDAR baudos (iki 4% metinės apyvartos), kliento sutarties nutraukimas |
| **Duomenų korupcija** | Neteisingi pažymiai įrašomi dėl validacijos trūkumų | Kliento skundas, SLA kompensacija, reputacinė žala |
| **Paskyros perėmimas** | Silpna autentifikacija leidžia prisijungti su svetimais duomenimis | Teisinė atsakomybė, duomenų praradimas |
| **Sistemos neprieinamumas** | Kritinis defektas produkcinėje aplinkoje | SLA pažeidimas -> finansinės kompensacijos |
| **Duomenų nutekėjimas** | Asmens duomenys prieinami be autorizacijos | Reguliatoriaus tyrimas, BDAR pažeidimas |

### 5.3. Rizikų mažinimo priemonės

| Rizikos ID | Priemonė | Atsakingas | Terminas |
|---|---|---|---|
| R-01, R-04 | JWT autentifikacija visoms apsaugotoms operacijoms; AuthControllerTests | Senior Dev | Kiekvienas sprint |
| R-02 | Score validacija kodo lygiu (0 ≤ Score ≤ MaxScore); GradesControllerTests | Mid Dev | Sprint 1 |
| R-03 | EF Core parametrizuotos užklausos (ORM apsauga); OWASP peržiūra | Senior Dev | Sprint 1 |
| R-05 | Manualinis DELETE scenarijų testavimas; UI patvirtinimo dialogo pridėjimas | Mid Dev | Sprint 2 |
| R-07 | BCrypt + salt; testuojama AuthControllerTests | Senior Dev | Sprint 1 |
| R-08 | localStorage.clear() po logout; auth.test.js | Junior Dev | Sprint 1 |
| R-10 | Gate: PR merge blokuojamas jei padengimas < 80% | Senior Dev | CI konfigūracija |

---

## Priedai

### A. Definition of Done (DoD)

Funkcija laikoma baigta, kai:
- [ ] Kodas parašytas ir peržiūrėtas (PR approved)
- [ ] Unit testai parašyti ir praeina
- [ ] Kodo padengimas ≥ 80% naujam kodui
- [ ] Manualinis testavimas atliktas (jei reikia)
- [ ] Defektai dokumentuoti ir sutvarkyti
- [ ] CI pipeline praeina (build + testai)
- [ ] Dokumentacija atnaujinta (jei reikia)

### B. Testavimo aplinkos konfigūracija

| Aplinka | Paskirtis | Konfigūracija |
|---|---|---|
| **Local (dev)** | Kūrėjo darbas | Windows 11, .NET 8, Node 18, LocalDB |
| **CI** | Automatinis testų vykdymas | GitHub Actions, Docker |
| **Staging** | Pre-release testavimas | Identiškas produkcijai (planuojamas) |
| **Production** | Klientų aplinka | Docker Compose, SQL Server |