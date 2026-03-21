# StudentPortal – Testavimo Planas

**Versija:** 1.0  
**Data:** 2026-03-14  
**Projektas:** StudentPortal  
**Šaka:** feature/docker  

---

## Turinys

1. [Įvadas](#1-įvadas)
2. [Komandos įgūdžiai ir patirtis](#2-komandos-įgūdžiai-ir-patirtis)
3. [Testavimo tikslai ir komandos misija](#3-testavimo-tikslai-ir-komandos-misija)
4. [Apribojimai](#4-apribojimai)
5. [Projekto ir verslo pobūdis](#5-projekto-ir-verslo-pobūdis)
6. [Rizikos vertinimas](#6-rizikos-vertinimas)
7. [Testavimo apimtis](#7-testavimo-apimtis)
8. [Testavimo metodai ir technikos](#8-testavimo-metodai-ir-technikos)
9. [Testavimo aplinka](#9-testavimo-aplinka)
10. [Tvarkaraštis ir etapai](#10-tvarkaraštis-ir-etapai)
11. [Priedai](#11-priedai)

---

## 1. Įvadas

### 1.1 Dokumento paskirtis

Šis dokumentas apibrėžia testavimo planą StudentPortal sistemai – edukaciniam valdymo portalui, kuriame veikia trys vartotojų rolės: **Studentas**, **Dėstytojas** ir **Administratorius**. Planas skirtas nuosekliam testavimo procesui organizuoti ir valdyti nuo techninių reikalavimų analizės iki produkto paleidimo.

### 1.2 Sistemos apžvalga

| Komponentas | Technologija | Paskirtis |
|-------------|-------------|-----------|
| Frontend | React 19, Tailwind CSS 4, nginx | Naudotojo sąsaja |
| Backend API | .NET 8 Web API | Verslo logika, REST API |
| Duomenų bazė | SQL Server 2022 Express | Duomenų saugykla |
| Konteinerizacija | Docker / Docker Compose | Aplinkų valdymas |

Pagrindiniai funkcionalumai:
- Autentikacija (JWT HS256, BCrypt slaptažodžiai)
- Pažymių valdymas (CRUD su validacija)
- Tvarkaraščio valdymas (CRUD)
- Vartotojų administravimas (rolių keitimas, apsauga nuo paskutinio admin ištrynimo)
- Profilio valdymas

---

## 2. Komandos įgūdžiai ir patirtis

### 2.1 Komandos profilis

Projektas – akademinio pobūdžio, vykdomas studentų komandos. Vertinamas vidutinis patirties lygis kiekvienoje srityje.

| Sritis | Technologijos | Patirtis | Pastabos |
|--------|--------------|---------|---------|
| Frontend kūryba | React, Tailwind CSS | Vidutinė | Komanda dirbo su React komponentais, kontekstais ir maršrutizavimu |
| Backend kūryba | .NET 8, EF Core, REST API | Vidutinė | CRUD kontroleriai ir JWT autentikacija jau implementuoti |
| Testavimas (FE) | Jest, React Testing Library | Pradedantysis–vidutinis | Parašyti baziniai unit testai (auth, Login, Register, student API) |
| Testavimas (BE) | xUnit, Moq, EF InMemory | Vidutinė | AAA šablonas, izoliuota duomenų bazė per `TestDbContextFactory` |
| Integraciniai testai | AspNetCore.Mvc.Testing | Pradedantysis | Yra 5 integraciniai testai, bet apimtis ribota |
| Saugumas | JWT, BCrypt, OWASP | Žema–vidutinė | Pagrindiniai mechanizmai įdiegti, bet nėra saugumo-specifinio testavimo |
| Docker / CI | Docker Compose | Žema | Konfigūracija parašyta, bet automatizuotas pipeline nėra |
| Rankinis testavimas | Funkciniai testai | Vidutinė | Dokumentuota `Manualinis-Testavimas.md` |

### 2.2 Technikų parinkimo pagrindimas

Atsižvelgiant į komandos patirtį, pasirinktos šios testavimo technikos:

| Technika | Pagrindimas |
|----------|-------------|
| **Unit testai (xUnit / Jest)** | Komanda turi patirties; greitai vykdomi; gerai dokumentuoti |
| **Integraciniai testai (AspNetCore.Mvc.Testing)** | Esami testai rodo pagrindines žinias; svarbu patikrinti duomenų srautus |
| **Rankinis funkcinis testavimas** | Tinkamas komandai be automatizuoto E2E; lentelėmis dokumentuotas testavimas per Swagger ir naršyklę |
| **Juodosios dėžės testavimas** | Paprasta taikyti API lygyje naudojant HTTP klientus (Swagger, `.http` failai) |
| **Ribinių reikšmių analizė** | Pažymių validacijai (Score 0–MaxScore); datos formatams |
| **Lygiavertiškumo skaidymas** | Rolių testams; validacijos atvejams |
| **Saugumo tikrinimas** | OWASP Top 10 punktoriai per rankines apžvalgas; JWT analizė |

**Vengtinos technikos** (per sudėtingos dabartinei patirčiai):
- Automatizuotas E2E testavimas (Selenium/Playwright) – reikia papildomų žinių
- Apkrovos / streso testavimas – nėra priemonių ir patirties
- Fuzzing – per pažengęs lygis

---

## 3. Testavimo tikslai ir komandos misija

### 3.1 Misija

> **Užtikrinti, kad StudentPortal sistema veiktų patikimai, saugiai ir atitiktų visus funkcinius bei nefunkcinius reikalavimus prieš paleidimą į produkciją.**

### 3.2 Testavimo tikslai

| # | Tikslas | Prioritetas | Sėkmės kriterijus |
|---|---------|-------------|------------------|
| T-01 | Patikrinti visų autentikacijos srautų veikimą | Kritinis | 100 % autentikacijos testų praeina |
| T-02 | Valdyti duomenų korektiškumą (pažymiai, tvarkaraštis) | Aukštas | Visos CRUD operacijos veikia teisingai; validacija blokuoja neleistinus duomenis |
| T-03 | Patikrinti rolių prieigos kontrolę | Kritinis | Studentai nemato kitų studentų duomenų; tik Admin gali keisti roles |
| T-04 | Nustatyti saugumo spragas | Aukštas | JWT tokenai validuojami; slaptažodžiai šifruojami; SQL injekcija blokuojama per EF Core |
| T-05 | Užtikrinti Docker aplinkos veikimą | Vidutinis | `docker-compose up` pasileidžia be klaidų; visi 3 konteineriai sveiki |
| T-06 | Patikrinti kodo padengimą testais | Vidutinis | Backend ≥ 70 % eilučių, Frontend ≥ 60 % eilučių |
| T-07 | Rankinis pilnos sistemos testavimas | Aukštas | Visi FR-01–FR-05 testai praeina be kritinių klaidų |
| T-08 | Nefunkciniai reikalavimai (greitis) | Žemas | API atsakymo laikas < 500 ms normaliai apkrovai |

### 3.3 Testavimo ribos (kas netestavama)

- Tiesioginė produkcijos aplinkos infrastruktūra
- Trečiųjų šalių paslaugos (SQL Server Microsoft garantuojamas)
- Apkrovos testavimas (daugiau nei 100 vienu metu vartotojų)
- Mobiliosios platformos (naudojamas standartinis naršyklės responsive layout)

---

## 4. Apribojimai

### 4.1 Teisiniai ir norminiai apribojimai

| Apribojimas | Poveikis | Valdymas |
|------------|---------|---------|
| **BDAR / GDPR** | Studentų asmens duomenys (vardas, el. paštas, pažymiai) yra asmens duomenys; reikia saugios saugyklos ir prieigos kontrolės | Slaptažodžiai šifruojami BCrypt; JWT turi galiojimo laiką; rolių prieigos kontrolė |
| **OWASP Top 10** | Privaloma tikrinti pagrindines saugumo rizikas | Įtraukta į testavimo planą (žr. T-04) |
| **Akademiniai reikalavimai** | Projektas turi atitikti kurso testavimo reikalavimus | Dokumentuojami visi testavimo etapai |

### 4.2 Techniniai apribojimai

| Apribojimas | Aprašymas |
|------------|-----------|
| **EF Core InMemory** | Nenaudoja realios SQL semantikos; kai kurios DB lygmens taisyklės netestuojamos |
| **JWT paslaptis aplinkoje** | JWT raktas perduodamas per Docker env kintamuosius – jei eksponuojamas, sistema pažeidžiama |
| **SQL Server Express** | Riboti iki 10 GB; be HA mechanizmų – netinka produkcijai |
| **nginx statinė konfigūracija** | HTTPS nekonfigūruotas – saugumo apribojimas produkcijai |
| **Nėra CI/CD pipeline** | Testai nevykdomi automatiškai kiekvienam kodo pakeitimui |

### 4.3 Projekto valdymo apribojimai

| Apribojimas | Poveikis |
|------------|---------|
| Riboti žmogiškieji ištekliai (studentų komanda) | Prioritizuoti kritiniai testai |
| Akademiniai terminai | Testavimas vykdomas paraleliai su kūryba |
| Nėra tinkamos QA aplinkos | Testavimas vykdomas lokaliose Docker aplinkose |

---

## 5. Projekto ir verslo pobūdis

### 5.1 Sistemos klasifikacija

StudentPortal yra **vidaus naudojimo edukacinis valdymo sistema** (angl. *Learning Management System – LMS*), naudojama:
- Mokymo įstaigos vidiniam studentų pažangos valdymui
- Dėstytojų ir studentų komunikacijai per sistemos duomenis

**Verslo kritiniai procesai:**
1. Tikslus pažymių įrašymas ir peržiūra
2. Saugus autentikacijos ir autorizacijos valdymas
3. Tvarkaraščio informacijos prieinamumas

### 5.2 Duomenų jautrumas

| Duomenų tipas | Jautrumas | Apsaugos reikalavimas |
|--------------|-----------|----------------------|
| Slaptažodžiai | Labai aukštas | BCrypt šifravimas (jau įdiegta) |
| Pažymiai | Aukštas | Prieiga tik autorizuotiems vartotojams |
| Tvarkaraštis | Vidutinis | Autentikuotas prieigos valdymas |
| Kontaktiniai duomenys | Vidutinis | BDAR standartų laikymasis |

### 5.3 Kokybės standartai

Projektas orientuojasi į šiuos standartus:
- **ISO/IEC 25010** kokybės modelis (funkcionalumas, patikimumas, saugumas, priežiūrumas)
- **ISTQB** testavimo geriausios praktikos (AAA šablonas, testų izoliacija)

---

## 6. Rizikos vertinimas

### 6.1 Techninės rizikos

| ID | Rizika | Tikimybė | Poveikis | Kritinumas | Valdymas |
|----|--------|----------|---------|-----------|---------|
| R-01 | JWT raktas eksponuotas aplinkoje | Vidutinė | Kritinis | **Aukštas** | Naudoti Docker secrets arba env failą be versijų kontrolės |
| R-02 | SQL injekcija per EF Core raw queries | Žema | Kritinis | Vidutinis | EF Core apsaugo parametrizuotais užklausomis; patikrinti nėra raw SQL |
| R-03 | Autorizacijos apėjimas (IDOR) | Vidutinė | Aukštas | **Aukštas** | Patikrinti, ar studentas gali pasiekti kitų studentų pažymius |
| R-04 | Paskutinio admin apsaugos klaida | Žema | Aukštas | Vidutinis | Testas jau parašytas; papildomai rankinis testas |
| R-05 | InMemory DB nesimokuoja realioms sąlygoms | Aukšta | Vidutinis | Vidutinis | Integraciniai testai su realia DB; rankinis testavimas |
| R-06 | CORS konfigūracijos klaida | Vidutinė | Vidutinis | Vidutinis | Tikrinti per naršyklę su `fetch` iš skirtingų kilmių |
| R-07 | Docker healthcheck gedimas | Žema | Aukštas | Vidutinis | Patikrinti `docker-compose up` visus tris konteinerius |

### 6.2 Verslo rizikos

| ID | Rizika | Poveikis | Valdymas |
|----|--------|---------|---------|
| R-08 | Neteisingi pažymiai įrašyti be validacijos | Akademiniai duomenys sugadinti | Griežta serverio pusės validacija (įdiegta); testai patvirtina |
| R-09 | Studentas mato kito studento pažymius | Privatumo pažeidimas | Prieigos kontrolė testuojama |
| R-10 | Sistema neveikia Docker aplinkoje | Negalima naudoti | E2E Docker testas |

### 6.3 Projekto žlugimo rizikos ir pasekmės

| Scenarijus | Pasekmės žmonėms | Pasekmės aplinkai | Pasekmės įmonei |
|-----------|-----------------|------------------|----------------|
| Duomenų nutekėjimas (studentų pažymiai) | Privatumo pažeidimas, akademinis žalas | – | Reputacijos žala, teisinė atsakomybė (BDAR) |
| Autentikacijos apėjimas | Neteisėta prieiga prie kitų duomenų | – | Teisinis atsakingumas, sistemos kompromitavimas |
| Duomenų bazės korupcija | Pažymių praradimas | – | Akademinių duomenų praradimas, darbo praradimas |
| Sistema nepaleidžiama Docker konteineryje | Vartotojai negali prisijungti | – | Akademinės veiklos sutrikdymas |

**Pastaba:** Kadangi tai edukacinė sistema (ne medicinė, pramoninė ar finansinė), pavojus žmonių gyvybei ar aplinkos žala nėra aktualūs. Pagrindiniai pavojai – privatumo ir akademinių duomenų kompromitavimas.

---

## 7. Testavimo apimtis

### 7.1 Testuojami komponentai

| Komponentas | Testavimo tipas | Statusas |
|-------------|----------------|---------|
| `AuthController` | Unit + integracinis | Testuojama |
| `GradesController` | Unit + integracinis | Testuojama |
| `ScheduleController` | Unit + integracinis | Testuojama |
| `StudentController` | Unit | Testuojama |
| `UserController` | Unit | Iš dalies (trūksta testų) |
| `auth.js` (FE API) | Unit | Testuojama |
| `student.js` (FE API) | Unit | Testuojama |
| `admin.js` (FE API) | Unit | **Nėra testų** |
| `Login.js` (komponentas) | Unit (RTL) | Testuojama |
| `Register.js` (komponentas) | Unit (RTL) | Testuojama |
| `Dashboard.js`, `StudentPage.js` ir kt. | Unit (RTL) | **Nėra testų** |
| `PrivateRoute.js` | Unit | **Nėra testų** |
| Docker Compose aplinka | Integracinis / rankinis | Rankinis |

### 7.2 Netestavimo sritys (pagrindimas)

| Sritis | Pagrindimas |
|--------|------------|
| `WeatherForecastController` | Šabloninis kodas, nenaudojamas produkcijai; pašalintinas |
| nginx konfigūracija | Statinė; tikrinama Docker paleisties metu |
| SQL Server pati | Trečioji šalis, garantuoja Microsoft |
| Mobiliosios naršyklės | Nėra responsive dizaino reikalavimų |

---

## 8. Testavimo metodai ir technikos

### 8.1 Baltosios dėžės testavimas (backend unit testai)

- **Įrankis:** xUnit 2.5.3, Moq 4.20.72, EF Core InMemory
- **Metodas:** AAA (Arrange–Act–Assert)
- **Izoliacija:** `TestDbContextFactory` kuria atskirą in-memory DB kiekvienam testui
- **Denysta:** kontroleriai su tiesioginiu `AppDbContext` – nėra abstrakcijos sluoksnio (service layer)

### 8.2 Integracinis testavimas

- **Įrankis:** `Microsoft.AspNetCore.Mvc.Testing` (WebApplicationFactory)
- **Apimtis:** duomenų srautų patikrinimas per kelis kontrolerius
- **Esami testai:** 5 integraciniai testai `IntegrationTests.cs`

### 8.3 Funkcinis (juodosios dėžės) testavimas – Frontend

- **Įrankis:** Jest 27+, React Testing Library 16, @testing-library/user-event
- **Metodas:** renderinti komponentai, simuliuoti įvykius, tikrinti DOM
- **Apimtis:** Login, Register, auth API, student API

### 8.4 Rankinis testavimas

- **Apimtis:** FR-01–FR-05 (žr. `Manualinis-Testavimas.md`)
- **Aplinka:** Docker Compose arba `dotnet run` + `npm start`
- **Įrankiai:** Swagger UI (`/swagger`), naršyklė, `.http` failai VS Code

### 8.5 Saugumo testavimas

- **Metodas:** Rankinis OWASP Top 10 peržiūra
- **Tikrinami punktai:**
  - A01 – Prieigos kontrolė: IDOR tarp studentų
  - A02 – Kriptografiniai gedimai: JWT rakto saugumas
  - A03 – Injekcija: EF Core parametrizuoti užklausai
  - A07 – Autentikacijos klaidos: JWT galiojimo tikrinimas

### 8.6 Ribinių reikšmių analizė

| Laukas | Ribos | Testai |
|--------|-------|--------|
| `Score` | 0 ≤ score ≤ MaxScore | Unit testai (score > MaxScore, score < 0) |
| `MaxScore` | > 0 (implicitinis) | Unit testai |
| `Role` | enum: Student/Teacher/Admin | Rankinis testas |
| `GradeType` | enum: 6 reikšmės | Unit testai |

---

## 9. Testavimo aplinka

### 9.1 Aplinkų aprašymas

| Aplinka | Aprašymas | Naudojimas |
|---------|-----------|-----------|
| **Lokali kūrimo** | `dotnet run` + `npm start`, SQLite/localDB | Unit testai |
| **Docker lokali** | `docker-compose up` – visi 3 konteineriai | Integraciniai + rankiniai testai |
| **CI/CD** | *Neplanuota (ateities darbas)* | – |

### 9.2 Seed duomenys

Docker aplinkoje automatiškai sukuriami:
- `student@test.com` / `Student123!`
- `teacher@test.com` / `Teacher123!`
- `admin@test.com` / `Admin123!`

### 9.3 Aplinkos konfigūracija

Jautrios reikšmės perduodamos per aplinkos kintamuosius:
- `JWT__Key` – JWT paslaptyje
- `ConnectionStrings__DefaultConnection` – DB ryšys
- Nenaudojamas `appsettings.json` su realiais duomenimis

---

## 10. Tvarkaraštis ir etapai

### 10.1 Testavimo etapai

| Etapas | Veikla | Trukmė | Atsakingas |
|--------|--------|--------|-----------|
| **1. Planavimas** | Šio dokumento rengimas; rizikų analizė | 1 savaitė | Visi |
| **2. Unit testavimas (BE)** | xUnit testai – AuthController, GradesController, ScheduleController, UserController | 1 savaitė | BE kūrėjas |
| **3. Unit testavimas (FE)** | Jest testai – visi puslapiai ir API funkcijos | 1 savaitė | FE kūrėjas |
| **4. Integracinis testavimas** | AspNetCore testai; Docker Compose aplinkos testas | 1 savaitė | Visi |
| **5. Rankinis testavimas** | FR-01–FR-05; saugumo tikrinimas | 3 dienos | QA / visi |
| **6. Ataskaitų rengimas** | Defektų registravimas, metrikos, ataskaita | 2 dienos | Visi |

### 10.2 Išėjimo kriterijai

Testavimas laikomas baigtu, kai:
- [ ] Visi unit testai praeina (0 nesėkmių)
- [ ] Integraciniai testai praeina
- [ ] Backend kodo padengimas ≥ 70 %
- [ ] Frontend kodo padengimas ≥ 60 %
- [ ] Visi kritiniai defektai išspręsti (P1, P2)
- [ ] Rankinis testavimas: FR-01–FR-05 praeina
- [ ] Docker Compose aplinka veikia `docker-compose up`
- [ ] Saugumo peržiūra atlikta (IDOR, JWT, SQL injekcija)

---

## 11. Priedai

### 11.1 Susiję dokumentai

| Dokumentas | Aprašymas |
|-----------|-----------|
| [Manualinis-Testavimas.md](Manualinis-Testavimas.md) | Rankinio testavimo atvejų lentelės |
| [Automatinis-Testavimas.md](Automatinis-Testavimas.md) | Automatinio testavimo vykdymo instrukcijos |
| [StudentPortal-Techniniai-Aspektai.md](StudentPortal-Techniniai-Aspektai.md) | DB schema, API dokumentacija |
| [Testavimo-Strategija.md](Testavimo-Strategija.md) | Testavimo strategija (šio plano papildymas) |
| [Testavimo-Ataskaita.md](Testavimo-Ataskaita.md) | Testavimo rezultatų ataskaita |

### 11.2 Terminų žodynas

| Terminas | Apibrėžimas |
|---------|------------|
| AAA | Arrange–Act–Assert: unit testų struktūros šablonas |
| CRUD | Create, Read, Update, Delete – pagrindinės duomenų operacijos |
| IDOR | Insecure Direct Object Reference – prieigos kontrolės pažeidžiamumas |
| JWT | JSON Web Token – autentikacijos mechanizmas |
| EF Core | Entity Framework Core – .NET ORM karkasas |
| RTL | React Testing Library – frontend testavimo biblioteka |
| FR | Functional Requirement – funkcinis reikalavimas |
| BDAR | Bendrasis duomenų apsaugos reglamentas (GDPR) |
