# StudentPortal – Testavimo Strategija

**Versija:** 1.0  
**Data:** 2026-03-14  
**Projektas:** StudentPortal  
**Susiję dokumentai:** Testavimo-Planas.md, Testavimo-Ataskaita.md  

---

## Turinys

1. [Strategijos apžvalga](#1-strategijos-apžvalga)
2. [Testavimo piramidė](#2-testavimo-piramidė)
3. [Testavimo lygiai ir metodai](#3-testavimo-lygiai-ir-metodai)
4. [Testavimo proceso valdymas](#4-testavimo-proceso-valdymas)
5. [Rizikų valdomos testavimo prioritetai](#5-rizikų-valdomos-testavimo-prioritetai)
6. [Kodo padengimo strategija](#6-kodo-padengimo-strategija)
7. [Defektų valdymas](#7-defektų-valdymas)
8. [Automatizavimo strategija](#8-automatizavimo-strategija)
9. [Saugumo testavimo strategija](#9-saugumo-testavimo-strategija)
10. [Priėmimo kriterijai](#10-priėmimo-kriterijai)

---

## 1. Strategijos apžvalga

### 1.1 Strategijos tipas

StudentPortal testavimui taikoma **rizikų valdoma testavimo strategija** (*Risk-Based Testing*), derinama su **metodų deriniu** (*Blended Strategy*):

```
Rizikų analizė → Prioritetai → Testavimo derinys → Rezultatų vertinimas
```

Pasirinkimo pagrindas:
- Nedidelė komanda → riboti ištekliai → testuoti svarbiausius komponentus pirmiau
- Duomenų privatumas → saugumo testai prioritetiniai
- Akademinė aplinka → rankinis testavimas papildo automatinį

### 1.2 Pagrindiniai principai

| Principas | Įgyvendinimas |
|-----------|--------------|
| **Ankstyvas testavimas** | Testai rašomi kartu su kodu (ne po jo) |
| **Izoliacija** | Kiekvienas unit testas turi savo DB kontekstą |
| **Deterministiškumas** | Testai visuomet grąžina tą patį rezultatą; nėra priklausomybių nuo aplinkos |
| **Greitas grįžtamasis ryšys** | Unit testai vykdomi per < 30 sekundžių |
| **Dokumentuotumas** | Visi testai pavadinami pagal schemą: `Metodas_Sąlyga_LaukiamasRezultatas` |

---

## 2. Testavimo piramidė

StudentPortal testavimo piramidė atspindi investicijų ir poveikio balansą:

```
        ┌─────────────────┐
        │   RANKINIS      │  ← Mažiausiai (brangiausia, lėčiausia)
        │  TESTAVIMAS     │
        │   (FR testai)   │
        └────────┬────────┘
       ┌─────────┴─────────┐
       │  INTEGRACINIAI    │  ← Vidutiniškai
       │     TESTAI        │
       │ (AspNetCore.Mvc)  │
       └────────┬──────────┘
    ┌───────────┴───────────┐
    │      UNIT TESTAI      │  ← Daugiausia (greičiausia, pigiausia)
    │  (xUnit + Jest/RTL)   │
    └───────────────────────┘
```

| Lygis | Kiekis | Greitumas | Patikimumas | Ryšys su tikrove |
|-------|--------|----------|-------------|-----------------|
| Unit | Daugiausiai (~40 BE + ~20 FE) | < 30s | Aukštas | Žemas (mock'ai) |
| Integracinis | Vidutiniškai (~10–15) | 1–5 min | Vidutinis | Vidutinis |
| Rankinis | Mažiausiai (~20 atvejų) | 30–60 min | Žemas (žmogaus klaidos) | Aukštas |

---

## 3. Testavimo lygiai ir metodai

### 3.1 Unit testavimas – Backend

**Tikslas:** Patikrinti kiekvieną kontrolerių metodą izoliuotoje aplinkoje

**Technologija:** xUnit 2.5.3 + EF Core InMemory 8.0.0 + Moq 4.20.72

**Izoliavimo mechanizmas:**
```csharp
// Kiekvienam testui – atskira in-memory DB
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
    .Options;
using var context = new AppDbContext(options);
```

**Testuojami kontroleriai:**

| Kontroleris | Metodų sk. | Testų sk. | Padengimas |
|-------------|-----------|----------|-----------|
| `AuthController` | 2 | 10 | Pilnas |
| `GradesController` | 4 | 13 | Pilnas |
| `ScheduleController` | 4 | 10 | Pilnas |
| `StudentController` | 2 | ~3 | Dalinis |
| `UserController` | 4 | **0** | **Nėra** |

**Trūkstami testai (rekomendacija):**
```
UserController:
  - GetAllUsers_AsAdmin_ReturnsAllUsers
  - GetAllUsers_AsStudent_ReturnsForbidden  ← IDOR rizika
  - UpdateUser_WithWrongPassword_ReturnsBadRequest
  - DeleteUser_LastAdmin_ReturnsBadRequest
  - DeleteUser_AsNonAdmin_ReturnsForbidden
```

**Pavadinimo konvencija:**
```
{Metodas}_{Sąlyga}_{LaukiamasRezultatas}
Pvz.: Register_WithDuplicateEmail_ReturnsBadRequest
```

---

### 3.2 Unit testavimas – Frontend

**Tikslas:** Patikrinti React komponentų atvaizdavimą ir vartotojo sąsają

**Technologija:** Jest + React Testing Library 16 + @testing-library/user-event 13

**Testavimo principai:**
- Testuoti elgseną, ne implementaciją
- Naudoti `screen.getByRole()` vietoj `getByTestId` kur įmanoma
- `axios` mock'inamas per `jest.mock('axios')`

**Testuojami komponentai:**

| Komponentas | Testų sk. | Tipas | Statusas |
|-------------|----------|-------|---------|
| `Login.js` | 6 | Renderinimas + interakcija | ✅ |
| `Register.js` | 6 | Renderinimas + interakcija | ✅ |
| `auth.js` (API) | 8 | API funkcijų testai | ✅ |
| `student.js` (API) | 6 | API funkcijų testai | ✅ |
| `admin.js` (API) | 0 | – | ❌ Trūksta |
| `Dashboard.js` | 0 | – | ❌ Trūksta |
| `StudentPage.js` | 0 | – | ❌ Trūksta |
| `TeacherPage.js` | 0 | – | ❌ Trūksta |
| `AdminPage.js` | 0 | – | ❌ Trūksta |
| `PrivateRoute.js` | 0 | – | ❌ Trūksta |
| `navbar.js` | 0 | – | ❌ Trūksta |

**Kritiniai trūkstami testai:**
```javascript
// PrivateRoute – prieigos kontrolė FE pusėje
test('PrivateRoute_StudentAccessingTeacherRoute_RedirectsToUnauthorized')
test('PrivateRoute_UnauthenticatedUser_RedirectsToLogin')

// Dashboard – pilnas renderinimas
test('Dashboard_AsStudent_ShowsStudentContent')
test('Dashboard_AsTeacher_ShowsTeacherContent')
```

---

### 3.3 Integracinis testavimas

**Tikslas:** Patikrinti duomenų srautus tarp kontrolerių ir duomenų bazės

**Technologija:** `Microsoft.AspNetCore.Mvc.Testing` – `WebApplicationFactory<Program>`

**Esami integraciniai testai (`IntegrationTests.cs`):**

| Testas | Paskirtis |
|--------|----------|
| `GetAllGrades_ReturnsAllGrades` | Kelių pažymių grąžinimas |
| `GetGrades_FiltersByStudentId` | Filtravimas pagal studentą |
| `GetSchedule_FiltersByStudentId` | Tvarkaraščio filtravimas |
| `GetSchedule_FiltersByDayOfWeek` | Filtravimas pagal dieną |
| `DeleteSchedule_DoesNotAffectGrades` | Izoliacijos patikrinimas |

**Rekomenduojami papildomi integraciniai testai:**
```
- Register_ThenLogin_ReturnsValidJWT
- Login_ThenGetProtectedEndpoint_Succeeds
- Register_AsStudent_CreatesStudentRecord
- AddGrade_WithInvalidScore_ReturnsBadRequest (per HTTP)
```

---

### 3.4 Rankinis testavimas

**Tikslas:** Patikrinti pilnus vartotojo scenarijus, kurie sunkiai automatizuojami

**Aplinka:** Docker Compose + naršyklė `http://localhost:3000`

**Pagrindiniai testavimo scenarijai:**

| ID | Scenarijus | Vartotojas | Laukiamas rezultatas |
|----|-----------|-----------|---------------------|
| M-01 | Registracija su galiojančiais duomenimis | Naujas | Sėkminga registracija, nukreipiama į Login |
| M-02 | Prisijungimas su teisingais duomenimis | Studentas | JWT gautas, nukreipiama į Dashboard |
| M-03 | Prisijungimas su neteisingais duomenimis | Bet kuris | Klaidos pranešimas |
| M-04 | Studento pažymių peržiūra | Studentas | Tik savo pažymiai rodomi |
| M-05 | Naujo pažymio pridėjimas | Dėstytojas | Pažymys išsaugotas |
| M-06 | Pažymio keitimas | Dėstytojas | Pažymys atnaujintas |
| M-07 | Pažymio trynimas | Dėstytojas | Pažymys ištrintas |
| M-08 | Tvarkaraščio peržiūra | Studentas | Savaitės tvarkaraštis rodomas |
| M-09 | Vartotojų sąrašo peržiūra | Admin | Visi vartotojai rodomi |
| M-10 | Vartotojo rolės keitimas | Admin | Rolė pakeista |
| M-11 | Paskutinio admin trynimas | Admin | Klaidos pranešimas, ištrynimas blokuojamas |
| M-12 | Rolės apribojimų tikrinimas | Studentas | /teacher ir /admin nepasiekiami |
| M-13 | Profilio atnaujinimas | Bet kuris | Duomenys atnaujinti |
| M-14 | Atsijungimas | Bet kuris | Token ištrintas, nukreipiama į Login |
| M-15 | Docker aplinkos paleidimas | Dev | Visi 3 konteineriai sveiki |

---

### 3.5 Nefunkcinis testavimas

**Veiklos testavimas:**

| Metrika | Tikslas | Matavimo būdas |
|---------|---------|----------------|
| API atsakymo laikas | < 500 ms | Naršyklės DevTools Network tab |
| Puslapio pakrovimas | < 3 s | Lighthouse |
| Docker paleisties laikas | < 60 s | `docker-compose up` pranešimai |

**Saugumo testavimas** (žr. skirsnį 9):
- JWT apėjimo bandymai
- IDOR tikrinimas
- XSS bandymai formų laukuose

---

## 4. Testavimo proceso valdymas

### 4.1 Testavimo ciklas

```
┌─────────────────────────────────────────────────────────┐
│                   TESTAVIMO CIKLAS                      │
│                                                         │
│  Reikalavimai → Testų kūrimas → Kodo kūrimas →         │
│  Testų vykdymas → Defektų registravimas →               │
│  Defektų taisymas → Pakartotinis testavimas →           │
│  Ataskaita                                              │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Testų vykdymo procesai

**Backend testų vykdymas:**
```bash
cd StudentPortal.Tests
dotnet test --collect:"XPlat Code Coverage" --results-directory TestResults/
dotnet reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" \
  -targetdir:"coveragereport" -reporttypes:Html
```

**Frontend testų vykdymas:**
```bash
cd student-portal
npm test -- --coverage --watchAll=false
```

**Docker integracinis testas:**
```bash
docker-compose up --build
# Patikrinti: http://localhost:3000 (FE), http://localhost:5000/swagger (API)
```

### 4.3 Testų vykdymo dažnumas

| Testų tipas | Vykdymo dažnumas | Atsakingas |
|------------|-----------------|-----------|
| Unit testai (BE) | Kiekvienam PR / commit | Dev |
| Unit testai (FE) | Kiekvienam PR / commit | Dev |
| Integraciniai | Kartą per dieną arba prieš merge | Dev/QA |
| Rankinis | Prieš kiekvieną release | QA / visi |

### 4.4 Defektų prioritetai

| Prioritetas | Apibrėžimas | Sprendimo laikas |
|------------|------------|-----------------|
| **P1 – Kritinis** | Sistema nepaleidžiama; duomenų praradimas; saugumo spragos | Nedelsiant |
| **P2 – Aukštas** | Pagrindinis funkcionalumas neveikia; neteisingi duomenys | < 1 diena |
| **P3 – Vidutinis** | Antrinis funkcionalumas neveikia; UI klaidos | < 3 dienos |
| **P4 – Žemas** | Kosmetinės klaidos; neesminiai patobulinimai | Kitas iteracija |

---

## 5. Rizikų valdomos testavimo prioritetai

### 5.1 Prioritetų matrica

```
Poveikis
  ↑
  │  Autentikacija    │  IDOR / Prieigos   │
  │  JWT saugumas     │  kontrolė          │
  │  ─────────────────┼────────────────────│
  │  Pažymių CRUD     │  Docker aplinka    │
  │  validacija       │  FE komponentai    │
  └──────────────────────────────────────→
                              Tikimybė
```

| Komponentas | Rizika | Prioritetas | Testavimo intensyvumas |
|-------------|--------|-------------|----------------------|
| Autentikacija (JWT) | Aukšta | **1** | Išsamus (10 testų) |
| Prieigos kontrolė (IDOR) | Aukšta | **1** | Rankinis + unit |
| Pažymių validacija | Vidutinė | **2** | Išsamus (13 testų) |
| Tvarkaraščio CRUD | Vidutinė | **2** | Pilnas (10 testų) |
| UserController | Vidutinė | **2** | **Trūksta testų** |
| FE komponentai | Žema | **3** | Baziniai testai |
| Docker aplinka | Žema | **3** | Rankinis |

### 5.2 Kritiniai testų scenarijai (pagal riziką)

**R-03: IDOR – Studento prieiga prie kitų duomenų**
```
Scenarijus: Studentas A bando pasiekti Studento B pažymius
Metodas: HTTP GET /api/grades/{kito_studento_id} su Studento A JWT
Laukiamas rezultatas: 403 Forbidden arba tušti duomenys
Dabartinis statusas: ⚠️ Nėra explicit patikrinimo kontroleryje
```

**R-01: JWT rakto saugumas**
```
Scenarijus: JWT raktas eksponuotas aplinkos kintamajame
Tikrinimas: docker-compose.yml nenaudoja hardcoded rakto
Laukiamas rezultatas: Raktas per env kintamąjį, ne per kodą
```

---

## 6. Kodo padengimo strategija

### 6.1 Tikslai

| Komponentas | Minimalus | Tikslas | Dabartinis |
|-------------|----------|---------|-----------|
| Backend kontroleriai | 70 % | 85 % | ~80 % (vertinamas) |
| Frontend API funkcijos | 60 % | 75 % | ~70 % (auth.js, student.js) |
| Frontend komponentai | 40 % | 60 % | ~30 % (tik Login, Register) |

### 6.2 Padengimo matavimas

**Backend (Coverlet):**
```xml
<!-- StudentPortal.Tests.csproj -->
<PackageReference Include="coverlet.collector" Version="6.0.0" />
```

Ataskaita generuojama į: `StudentPortal.Tests/coveragereport/`

**Frontend (Jest built-in):**
```json
// package.json
"jest": {
  "collectCoverageFrom": ["src/**/*.{js,jsx}", "!src/index.js", "!src/reportWebVitals.js"]
}
```

### 6.3 Padengimo išimtys

Neįtraukiama į padengimo skaičiavimą:
- `WeatherForecastController.cs` – šabloninis kodas
- `src/reportWebVitals.js` – metrikų biblioteka
- `src/setupTests.js` – testavimo konfigūracija
- `src/index.js` – įėjimo taškas

---

## 7. Defektų valdymas

### 7.1 Defekto gyvavimo ciklas

```
Aptiktas → Registruotas → Peržiūrėtas → Priskirtas → 
Taisomas → Pataisytas → Pakartotinai testuotas → Uždarytas
```

### 7.2 Defektų registravimo šablonas

```markdown
## Defekto ID: DEF-XXX

**Pavadinimas:** [Trumpas aprašymas]
**Prioritetas:** P1 / P2 / P3 / P4
**Aplinka:** Docker Compose / Lokali / Test
**Data:** YYYY-MM-DD

**Atkūrimo žingsniai:**
1. ...
2. ...

**Laukiamas rezultatas:** ...
**Faktinis rezultatas:** ...
**Testavimo tipas:** Unit / Integracija / Rankinis
**Ekrano nuotrauka:** [jei taikoma]
```

### 7.3 Aptikti defektai

| ID | Prioritetas | Aprašymas | Statusas |
|----|------------|-----------|---------|
| DEF-001 | P2 | `UserController` neturi unit testų – prieigos kontrolė netestuota | Atviras |
| DEF-002 | P2 | `ScheduleController` neturi `[Authorize]` anotacijos – endpoint nepasaugotas | Atviras |
| DEF-003 | P3 | `WeatherForecastController` paliktas produkciniame kode | Atviras |
| DEF-004 | P2 | `admin.js` FE API funkcijos neturi unit testų | Atviras |
| DEF-005 | P3 | `PrivateRoute` komponentas neturi unit testų | Atviras |
| DEF-006 | P1 | HTTPS nekonfigūruotas nginx – duomenys perduodami nešifruotai | Atviras |

---

## 8. Automatizavimo strategija

### 8.1 Dabartinis automatizavimo lygis

| Sritis | Automatizavimas | Technologija |
|--------|----------------|-------------|
| Backend unit testai | ✅ Pilnas | xUnit |
| Frontend unit testai | ✅ Dalinis | Jest/RTL |
| Integraciniai testai | ✅ Dalinis | AspNetCore.Mvc.Testing |
| E2E testai | ❌ Nėra | – |
| CI/CD pipeline | ❌ Nėra | – |

### 8.2 Rekomenduojama CI/CD strategija (ateičiai)

```yaml
# GitHub Actions (rekomendacija)
on: [push, pull_request]
jobs:
  backend-tests:
    - dotnet test StudentPortal.Tests/
    - publishes coverage report
  frontend-tests:
    - npm test -- --coverage --watchAll=false
  docker-build:
    - docker-compose build
    - docker-compose up -d
    - health check all services
```

### 8.3 E2E automatizavimas (ateities planas)

Rekomenduojama įrankis: **Playwright** (Microsoft, TypeScript)

Prioritetiniai E2E scenarijai:
1. Pilnas autentikacijos srautas (registracija → prisijungimas → atsijungimas)
2. Studento pažymių peržiūra
3. Dėstytojo pažymio pridėjimas
4. Admin vartotojo valdymas

---

## 9. Saugumo testavimo strategija

### 9.1 OWASP Top 10 tikrinimo planas

| OWASP | Kategorija | Patikrinimo metodas | Statusas |
|-------|-----------|--------------------|---------| 
| A01 | Prieigos kontrolės klaidos (IDOR) | Rankinis: JWT kryžminis testavimas | ⚠️ Dalinis |
| A02 | Kriptografiniai gedimai | Kodo peržiūra: BCrypt, JWT HS256 | ✅ Patikrinta |
| A03 | Injekcija (SQL, XSS) | Kodo peržiūra: EF Core ORM; rankinis XSS bandymas | ✅ EF apsaugo |
| A04 | Nesaugus dizainas | Architektūros peržiūra | ⚠️ HTTPS trūksta |
| A05 | Saugumo konfigūracijos klaidos | `appsettings.json` peržiūra; env kintamieji | ✅ Patikrinta |
| A06 | Pasenusios komponentės | `dotnet list package --outdated`; `npm audit` | Vykdytina |
| A07 | Autentikacijos klaidos | Unit testai: JWT validacija; BCrypt | ✅ Patikrinta |
| A08 | Programinės įrangos integriteto klaidos | Docker image tikrinimas | ⚠️ Dalinis |
| A09 | Registravimo ir stebėjimo klaidos | Kodo peržiūra: klaidų registravimas | ❌ Trūksta |
| A10 | SSRF | Kodo peržiūra: nėra išorinių URL užklausų | ✅ Neaktualu |

### 9.2 JWT saugumo tikrinimas

```
Tikrinimo žingsniai:
1. Sugeneruoti JWT su galiojančiais duomenimis
2. Modifikuoti payload (pvz., pakeisti role į "Admin")
3. Bandyti pasiekti /api/users su modifikuotu tokenu
4. Laukiamas rezultatas: 401 Unauthorized (parašo netinkamas)

5. Naudoti pasibaigusį JWT
6. Laukiamas rezultatas: 401 Unauthorized

7. Bandyti JWT be "Bearer " prefikso
8. Laukiamas rezultatas: 401 Unauthorized
```

### 9.3 IDOR tikrinimas

```
Tikrinimo žingsniai:
1. Prisijungti kaip Studentas A (gauti JWT)
2. HTTP GET /api/grades/{Studento_B_ID} su Studento A JWT
3. Laukiamas rezultatas: 403 Forbidden arba tušti duomenys
   Dabartinis rezultatas: ⚠️ Galimas pažeidžiamumas (tikrinti)
```

---

## 10. Priėmimo kriterijai

### 10.1 Minimalūs priėmimo kriterijai (release)

- [ ] **Unit testai**: 0 nesėkmių, ≥ 70 % BE padengimas
- [ ] **Integraciniai testai**: 0 nesėkmių
- [ ] **Rankinis testavimas**: visi P1/P2 scenarijai praeina
- [ ] **Saugumo patikrinimas**: nėra kritinių OWASP A01–A07 pažeidžiamumų
- [ ] **Docker paleistis**: `docker-compose up` sėkmingas, visi konteineriai sveiki
- [ ] **P1 defektai**: 0 atvirų
- [ ] **P2 defektai**: 0 atvirų arba patvirtintas atidėjimas

### 10.2 Rekomendaciniai kriterijai (aukštos kokybės)

- [ ] Frontend padengimas ≥ 60 %
- [ ] Visi UserController unit testai parašyti
- [ ] `ScheduleController` gauna `[Authorize]` anotaciją
- [ ] HTTPS konfigūruotas nginx
- [ ] `WeatherForecastController` pašalintas
- [ ] CI/CD pipeline sukonfigūruotas

---

*Šis dokumentas turi būti peržiūrimas kiekvienam projekto iteracijos ciklui ir atnaujinamas pagal naujus reikalavimus arba aptiktus defektus.*
