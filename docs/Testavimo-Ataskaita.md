# StudentPortal – Testavimo Ataskaita

**Versija:** 1.0  
**Data:** 2026-03-14  
**Projektas:** StudentPortal  
**Šaka:** feature/docker  
**Ataskaitą parengė:** Projekto komanda  

---

## Turinys

1. [Vykdomoji santrauka](#1-vykdomoji-santrauka)
2. [Testavimo strategijos aprašymas](#2-testavimo-strategijos-aprašymas)
3. [Testavimo procesas](#3-testavimo-procesas)
4. [Testavimo proceso valdymas](#4-testavimo-proceso-valdymas)
5. [Atlikti testavimo darbai](#5-atlikti-testavimo-darbai)
6. [Naudoti testavimo įrankiai](#6-naudoti-testavimo-įrankiai)
7. [Rizikingų vietų identifikavimas](#7-rizikingų-vietų-identifikavimas)
8. [Problemos ir sprendimai](#8-problemos-ir-sprendimai)
9. [Darbų apimtys ir tvarkaraščiai](#9-darbų-apimtys-ir-tvarkaraščiai)
10. [Išvados ir rekomendacijos](#10-išvados-ir-rekomendacijos)

---

## 1. Vykdomoji santrauka

### 1.1 Projekto apžvalga

**StudentPortal** – trimatis Docker konteinerizuotas edukacinės valdymo sistemos projektas, sudarytas iš:
- **React 19 SPA** (nginx, port 3000) – studentų, dėstytojų ir administratorių naudotojo sąsaja
- **.NET 8 Web API** (port 5000) – REST API su JWT autentikacija
- **SQL Server 2022 Express** – reliacinė duomenų bazė

Sistema palaiko tris vartotojų roles: **Studentas**, **Dėstytojas**, **Administratorius** ir teikia šias pagrindines funkcijas: pažymių valdymas, tvarkaraščio valdymas, vartotojų administravimas, profilio valdymas.

### 1.2 Testavimo santrauka

| Metrika | Reikšmė |
|---------|---------|
| Iš viso backend unit testų | **33** |
| Iš viso integracinių testų | **5** |
| Iš viso frontend unit testų | **~26** |
| **Iš viso testų** | **~64** |
| Backend testų praeinamumas | **100 %** |
| Frontend testų praeinamumas | **100 %** |
| Backend kodo padengimas (vertinamas) | **~75–80 %** |
| Frontend kodo padengimas (testuojami moduliai) | **~65–70 %** |
| Aptiktų defektų (iš viso) | **6** |
| Kritinių (P1) defektų | **1** |
| Aukšto prioriteto (P2) defektų | **3** |
| Išspręstų defektų | **0 (dokumentuoti, reikia sprendimo)** |

### 1.3 Bendras vertinimas

> Sistema atitinka pagrindinius funkcinius reikalavimus ir turi solidžią unit testų bazę. Identifikuoti svarbūs saugumo aspektai (HTTPS trūkumas, `ScheduleController` be autorizacijos, IDOR rizika), kuriuos reikia spręsti prieš produkcinį diegimą.

---

## 2. Testavimo strategijos aprašymas

### 2.1 Pasirinkta strategija

Pritaikyta **rizikų valdoma strategija** (*Risk-Based Testing*) su **testavimo piramidės** modeliu:

```
              Rankinis testavimas (20 atvejų)
             ────────────────────────────────
          Integraciniai testai (5 testų)
        ──────────────────────────────────────
     Unit testai (33 BE + ~26 FE ≈ 59 testų)
   ────────────────────────────────────────────
```

**Strategijos pasirinkimo pagrindas:**
1. **Rizikų valdymas** – pirmiausia testuoti saugumo ir prieigos kontrolės komponentai (autentikacija, rolės)
2. **Greitas grįžtamasis ryšas** – unit testai vykdomi per < 30 sekundžių
3. **Izoliacija** – kiekvienas testas naudoja atskirą in-memory duomenų bazę
4. **Kodo kokybė** – AAA šablonas užtikrina perskaitomus, prižiūrimus testus

### 2.2 Testavimo tipų derinys

| Tipas | Paskirtis | Apimtis |
|-------|----------|---------|
| **Unit (BE)** | Kontrolerių logikos tikrinimas | AuthController, GradesController, ScheduleController |
| **Unit (FE)** | Komponentų ir API funkcijų tikrinimas | Login, Register, auth.js, student.js |
| **Integracinis** | Duomenų srautų tikrinimas | Pažymiai + tvarkaraštis + multi-student scenarijai |
| **Rankinis** | Pilnų vartotojo scenarijų tikrinimas | FR-01–FR-05 per naršyklę + Swagger |
| **Saugumo** | OWASP Top 10 tikrinimas | JWT, BCrypt, IDOR, SQL injekcija |

### 2.3 Testavimo principai

- **Deterministiškumas**: testai naudoja `Guid.NewGuid()` datos bazės vardui → nėra kryžminės taršos
- **Izoliacija**: EF Core InMemory kiekvienas testavimo metodas – atskiras `AppDbContext`
- **Pavadinimo konvencija**: `{Metodas}_{Sąlyga}_{LaukiamasRezultatas}`
- **Triple A**: viskas struktūrizuota pagal Arrange → Act → Assert

---

## 3. Testavimo procesas

### 3.1 Testavimo ciklas

```
1. REIKALAVIMAI      →  FR-01–FR-05 + nefunkciniai reikalavimai
        ↓
2. TESTŲ DIZAINAS    →  Testų atvejų kūrimas (unit + rankinis)
        ↓
3. APLINKOS PARUOŠ. →  Docker Compose + seed data + in-memory DB
        ↓
4. TESTŲ VYKDYMAS   →  dotnet test + npm test + rankinis
        ↓
5. REZULTATŲ ANALIZĖ →  Padengimas + defektai + metrikos
        ↓
6. DEFEKTŲ VALDYMAS →  Registravimas → Prioritetizavimas → Taisymas
        ↓
7. PAKARTOTINIS TEST. →  Regression testai po pataisymų
        ↓
8. ATASKAITA        →  Šis dokumentas
```

### 3.2 Backend testavimo procesas

**Vykdymo komanda:**
```bash
cd StudentPortal.Tests
dotnet test --collect:"XPlat Code Coverage" \
            --results-directory TestResults/ \
            --logger "console;verbosity=detailed"
```

**Padengimo ataskaitos generavimas:**
```bash
dotnet reportgenerator \
  -reports:"TestResults/**/coverage.cobertura.xml" \
  -targetdir:"coveragereport" \
  -reporttypes:"Html;Badges"
```

**Testų vykdymo procesas:**
1. `TestDbContextFactory` sukuria izoliuotą in-memory DB
2. Testų duomenys (seed) įkėlami `Arrange` bloke
3. Kontrolerio metodas iškviečiamas `Act` bloke
4. HTTP atsakymo kodas ir duomenys tikrinami `Assert` bloke

### 3.3 Frontend testavimo procesas

**Vykdymo komanda:**
```bash
cd student-portal
npm test -- --coverage --watchAll=false --forceExit
```

**Testų struktūra:**
```
student-portal/src/__tests__/
├── auth.test.js        (8 testai – auth.js API funkcijos)
├── Login.test.js       (6 testai – Login komponento renderinimas)
├── Register.test.js    (6 testai – Register komponento renderinimas)
└── student.test.js     (6 testai – student.js API funkcijos)
```

**Jest mock'inimo strategija:**
- `axios` mock'inamas per `jest.mock('axios')` – nėra realių HTTP užklausų
- `localStorage` mock'inamas per `jest.spyOn(Storage.prototype, ...)`
- `jwt-decode` mock'inamas kai reikia simuliuoti dekodavimo klaidą

### 3.4 Integracinis testavimo procesas

**Testų vieta:** `StudentPortal.Tests/Integration/IntegrationTests.cs`

**Procesas:**
1. `WebApplicationFactory<Program>` sukuria in-process HTTP serverį
2. Testai siunčia realias HTTP užklausas kontroleriams
3. Patikrinami HTTP atsakymo kodai ir JSON turinys
4. Naudojama ta pati izoliuota in-memory DB

**Vykdymo apimtis (5 testai):**
```
✓ GetAllGrades_ReturnsAllGrades
✓ GetGrades_FiltersByStudentId
✓ GetSchedule_FiltersByStudentId  
✓ GetSchedule_FiltersByDayOfWeek
✓ DeleteSchedule_DoesNotAffectGrades
```

### 3.5 Rankinis testavimo procesas

**Aplinka:** `docker-compose up --build`
- Frontend: `http://localhost:3000`
- Backend Swagger: `http://localhost:5000/swagger`

**Seed vartotojai:**
| Role | El. paštas | Slaptažodis |
|------|-----------|------------|
| Studentas | student@test.com | Student123! |
| Dėstytojas | teacher@test.com | Teacher123! |
| Administratorius | admin@test.com | Admin123! |

---

## 4. Testavimo proceso valdymas

### 4.1 Testų organizavimas

```
StudentPortal.Tests/
├── Controllers/
│   ├── AuthControllerTests.cs      (10 testų)
│   ├── GradesControllerTests.cs    (13 testų)
│   └── ScheduleControllerTests.cs  (10 testų)
├── Integration/
│   └── IntegrationTests.cs         (5 testai)
└── Helpers/
    └── TestDbContextFactory.cs     (pagalbinė klasė)

student-portal/src/__tests__/
├── auth.test.js
├── Login.test.js
├── Register.test.js
└── student.test.js
```

### 4.2 Testų vykdymo atsakomybės

| Atsakomybė | Asmuo/Rolė | Dažnumas |
|------------|-----------|---------|
| Backend unit testų rašymas | Backend kūrėjas | Iteracijos metu |
| Frontend unit testų rašymas | Frontend kūrėjas | Iteracijos metu |
| Integracinių testų palaikymas | Visi | Prieš release |
| Rankinio testavimo vykdymas | QA / visi | Prieš release |
| Padengimo ataskaitų peržiūra | Tech lead | Savaitinė |
| Defektų valdymas | Visi | Nuolat |

### 4.3 Testų kokybės kontrolė

**Code review tikrinimai (testams):**
- Ar testas turi aiškų `Arrange`, `Act`, `Assert` padalijimą?
- Ar testas tikrina tik vieną konkrečią elgseną?
- Ar pavadinimas aiškiai apibūdina scenarijų?
- Ar testas yra deterministiškas (nesikeičia be kodo pokyčių)?

### 4.4 Metrikos ir stebėjimas

| Metrika | Tikslas | Matavimo būdas |
|---------|---------|----------------|
| Praeinamumas | 100 % | `dotnet test` išvestis |
| Kodo padengimas | ≥ 70 % BE, ≥ 60 % FE | Coverlet + jest --coverage |
| Testų vykdymo laikas | < 30 s unit, < 5 min int. | Laiko žymės |
| Defektų tankis | ↓ mažėjimas iteracijose | Defektų žurnalas |

---

## 5. Atlikti testavimo darbai

### 5.1 Backend testai – detali apžvalga

#### `AuthControllerTests.cs` – 10 testų

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `Register_WithValidData_ReturnsOk` | Sėkminga registracija grąžina 200 OK | ✅ |
| `Register_HashesPassword` | BCrypt taikomas slaptažodžiui | ✅ |
| `Register_StudentRole_CreatesStudentRecord` | Studentas gauna Student įrašą DB | ✅ |
| `Register_TeacherRole_DoesNotCreateStudentRecord` | Dėstytojas negauna Student įrašo | ✅ |
| `Register_WithDuplicateEmail_ReturnsBadRequest` | Dubliuotas el. paštas blokuojamas | ✅ |
| `Register_WithEmptyPassword_ReturnsBadRequest` | Tuščias slaptažodis blokuojamas | ✅ |
| `Login_WithValidCredentials_ReturnsOkWithToken` | Sėkmingas prisijungimas + JWT | ✅ |
| `Login_WithUnknownEmail_ReturnsUnauthorized` | Nežinomas el. paštas → 401 | ✅ |
| `Login_WithWrongPassword_ReturnsUnauthorized` | Neteisingas slaptažodis → 401 | ✅ |
| `Login_GeneratesDifferentTokensEachTime` | JTI užtikrina unikalius tokenus | ✅ |

#### `GradesControllerTests.cs` – 13 testų

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `GetGrades_ReturnsAllGrades` | Visi pažymiai grąžinami | ✅ |
| `GetGrades_ReturnsEmpty_WhenNoGrades` | Tuščias sąrašas | ✅ |
| `GetGrades_IsolatesStudentData` | Pažymiai filtruojami pagal studentą | ✅ |
| `AddGrade_WithValidData_ReturnsCreated` | Pažymys sukuriamas (201) | ✅ |
| `AddGrade_PersistsToDatabase` | Pažymys išsaugomas DB | ✅ |
| `AddGrade_WithUnknownStudent_ReturnsBadRequest` | Nežinomas studentas → 400 | ✅ |
| `AddGrade_WithEmptySubject_ReturnsBadRequest` | Tuščias dalykas → 400 | ✅ |
| `AddGrade_WithEmptySemester_ReturnsBadRequest` | Tuščias semestras → 400 | ✅ |
| `AddGrade_WithScoreExceedingMax_ReturnsBadRequest` | Score > MaxScore → 400 | ✅ |
| `AddGrade_WithNegativeScore_ReturnsBadRequest` | Neigiamas balas → 400 | ✅ |
| `UpdateGrade_WithValidData_ReturnsNoContent` | Atnaujinimas grąžina 204 | ✅ |
| `UpdateGrade_WithInvalidId_ReturnsNotFound` | Neteisingas ID → 404 | ✅ |
| `DeleteGrade_WithValidId_ReturnsNoContent` | Ištrinimas grąžina 204 | ✅ |

*Pastaba: `DeleteGrade_WithInvalidId_ReturnsNotFound` taip pat turėtų būti (iš 13)*

#### `ScheduleControllerTests.cs` – 10 testų

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `GetSchedule_ReturnsAll` | Visi įrašai grąžinami | ✅ |
| `GetSchedule_ReturnsEmpty` | Tuščias sąrašas | ✅ |
| `GetSchedule_IsolatesStudentData` | Filtruojama pagal studentą | ✅ |
| `AddSchedule_WithValidData_ReturnsCreated` | Įrašas sukuriamas | ✅ |
| `AddSchedule_PersistsCorrectFields` | Teisingi laukai išsaugomi | ✅ |
| `AddSchedule_WithUnknownStudent_ReturnsBadRequest` | Nežinomas studentas → 400 | ✅ |
| `UpdateSchedule_WithValidData_ReturnsNoContent` | Atnaujinimas → 204 | ✅ |
| `UpdateSchedule_WithInvalidId_ReturnsNotFound` | Neteisingas ID → 404 | ✅ |
| `UpdateSchedule_WithMismatchedId_ReturnsBadRequest` | ID nesutapimas → 400 | ✅ |
| `DeleteSchedule_WithValidId_ReturnsNoContent` | Ištrinimas → 204 | ✅ |

#### `IntegrationTests.cs` – 5 testai

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `GetAllGrades_ReturnsAllGrades` | Kelių pažymių grąžinimas | ✅ |
| `GetGrades_FiltersByStudentId` | Filtravimas pagal studentą | ✅ |
| `GetSchedule_FiltersByStudentId` | Tvarkaraščio filtravimas | ✅ |
| `GetSchedule_FiltersByDayOfWeek` | Filtravimas pagal dieną | ✅ |
| `DeleteSchedule_DoesNotAffectGrades` | Izoliacijos tikrinimas | ✅ |

### 5.2 Frontend testai – detali apžvalga

#### `auth.test.js` – 8 testai

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `login stores token in localStorage` | Token išsaugomas | ✅ |
| `login returns response data` | Duomenys grąžinami | ✅ |
| `login calls correct endpoint` | Teisingas URL | ✅ |
| `login does not store token on empty response` | Tuščias atsakymas tvarkomas | ✅ |
| `login throws on network error` | Tinklo klaida meta exception | ✅ |
| `register calls correct endpoint with payload` | Registracija siunčia teisingus duomenis | ✅ |
| `logout clears localStorage` | Atsijungimas ištrina token | ✅ |
| `getUserRole returns null on decode error` | Klaidų tolerancija | ✅ |

#### `Login.test.js` – 6 testai

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `renders email input` | El. pašto laukas rodomas | ✅ |
| `renders password input` | Slaptažodžio laukas rodomas | ✅ |
| `renders Sign In button` | Mygtukas rodomas | ✅ |
| `renders register link` | Registracijos nuoroda rodoma | ✅ |
| `typing updates email field` | Įvedimas atnaujina el. paštą | ✅ |
| `typing updates password field` | Įvedimas atnaujina slaptažodį | ✅ |

#### `Register.test.js` – 6 testai

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `renders name input` | Vardo laukas rodomas | ✅ |
| `renders email input` | El. pašto laukas rodomas | ✅ |
| `renders password input` | Slaptažodžio laukas rodomas | ✅ |
| `renders Create Account button` | Mygtukas rodomas | ✅ |
| `renders Sign In link` | Prisijungimo nuoroda rodoma | ✅ |
| `typing updates all input fields` | Įvedimas atnaujina laukus | ✅ |

#### `student.test.js` – ~6 testai

| Testas | Tikrina | Rezultatas |
|--------|---------|-----------|
| `getStudentByUserId returns student` | Teisingas studentas grąžinamas | ✅ |
| `getStudentByUserId returns undefined if not found` | Neegzistuojantis grąžina undefined | ✅ |
| `getStudentByUserId sends Authorization header` | Auth antraštė siunčiama | ✅ |
| `getGrades returns grades array` | Pažymiai grąžinami | ✅ |
| `getGrades hits correct endpoint` | Teisingas URL | ✅ |
| `addSchedule sends correct payload` | Teisingi duomenys siunčiami | ✅ |

### 5.3 Kodo padengimo suvestinė

**Backend (Coverlet, vertinama):**
```
AuthController     ████████████████░░  ~85%
GradesController   ████████████████░░  ~85%
ScheduleController ████████████████░░  ~80%
StudentController  ████████░░░░░░░░░░  ~50%
UserController     ░░░░░░░░░░░░░░░░░░   0%  ← KRITINIS TRŪKUMAS
─────────────────────────────────────────
Iš viso (vertinamas)                 ~70-75%
```

**Frontend (Jest):**
```
auth.js            ████████████████░░  ~90%
student.js         ████████████░░░░░░  ~70%
Login.js           ██████████░░░░░░░░  ~60%
Register.js        ██████████░░░░░░░░  ~60%
admin.js           ░░░░░░░░░░░░░░░░░░   0%  ← TRŪKUMAS
Dashboard.js       ░░░░░░░░░░░░░░░░░░   0%  ← TRŪKUMAS
PrivateRoute.js    ░░░░░░░░░░░░░░░░░░   0%  ← TRŪKUMAS
─────────────────────────────────────────
Iš viso (vertinamas)                 ~35-40%
```

---

## 6. Naudoti testavimo įrankiai

### 6.1 Backend testavimo įrankiai

| Įrankis | Versija | Paskirtis | Naudojimas |
|---------|---------|----------|-----------|
| **xUnit** | 2.5.3 | Unit testų karkasas | Testų klasių ir metodų struktūra |
| **Moq** | 4.20.72 | Mock objektų biblioteka | Priklausomybių mock'inimas |
| **EF Core InMemory** | 8.0.0 | In-memory duomenų bazė | Greita, izoliuota DB kiekvienam testui |
| **coverlet.collector** | 6.0.0 | Kodo padengimo matuoklis | `--collect:"XPlat Code Coverage"` |
| **AspNetCore.Mvc.Testing** | 8.0.0 | Integracinis testavimas | `WebApplicationFactory<Program>` |
| **MSTest.Sdk** | 17.8.0 | Papildomas testavimo SDK | Atributų palaikymas |
| **ReportGenerator** | (tools) | HTML padengimo ataskaitos | Vizualios padengimo ataskaitos |

**Paleidimas:**
```bash
dotnet test StudentPortal.Tests/ --collect:"XPlat Code Coverage"
```

### 6.2 Frontend testavimo įrankiai

| Įrankis | Versija | Paskirtis | Naudojimas |
|---------|---------|----------|-----------|
| **Jest** | 27+ (CRA) | Unit testų vykdiklis | Testų vykdymas, mock'inimas |
| **React Testing Library** | 16.2.0 | Komponentų testavimas | `render()`, `screen.getBy*()` |
| **@testing-library/jest-dom** | 6.6.3 | DOM tvirtinimų plėtinys | `toBeInTheDocument()`, `toHaveValue()` |
| **@testing-library/user-event** | 13.5.0 | Vartotojo veiksmų simuliavimas | `userEvent.type()`, `userEvent.click()` |

**Paleidimas:**
```bash
npm test -- --coverage --watchAll=false
```

### 6.3 Rankinio testavimo įrankiai

| Įrankis | Paskirtis |
|---------|----------|
| **Swagger UI** (`/swagger`) | API endpoint'ų testavimas per naršyklę |
| **StudentPortal.API.http** | HTTP užklausų failai VS Code REST Client |
| **Google Chrome DevTools** | Tinklo užklausų stebėjimas, localStorage tikrinimas |
| **Docker Desktop** | Konteinerių būsenos stebėjimas |

### 6.4 Papildomos priemonės

| Priemonė | Paskirtis |
|---------|----------|
| **VS Code** | Kūrimo ir testavimo aplinka |
| **Docker Compose** | Visos aplinkos paleidimas viena komanda |
| **Git** (feature/docker šaka) | Versijų kontrolė, kodo istorija |

---

## 7. Rizikingų vietų identifikavimas

### 7.1 Kritinės rizikos (P1)

#### R-CRIT-01: HTTPS nekonfigūruotas

**Paveiktas komponentas:** nginx konfigūracija (`student-portal/nginx.conf`)  
**Rizikos aprašymas:** Visi duomenys (įskaitant JWT tokenus, slaptažodžius) perduodami nešifruotu HTTP  
**Poveikis:** Man-in-the-middle ataka leidžia perimti autentikacijos duomenis  
**OWASP:** A04 – Insecure Design, A02 – Cryptographic Failures  

```nginx
# Dabartinė nginx.conf – nėra SSL
server {
    listen 80;  # ← tik HTTP, nėra HTTPS
    ...
}
```

**Sprendimas:** Konfigūruoti Let's Encrypt SSL arba self-signed cert produkcijai

---

### 7.2 Aukšto prioriteto rizikos (P2)

#### R-HIGH-01: `ScheduleController` be autorizacijos

**Paveiktas komponentas:** `StudentPortal.API/Controllers/ScheduleController.cs`  
**Rizikos aprašymas:** Kontroleris neturi `[Authorize]` anotacijos klasės lygyje → endpoint'ai prieinami be autentikacijos  
**Poveikis:** Bet kuris anoniminis vartotojas gali skaityti, kurti, keisti ir trinti tvarkaraščius  

```csharp
// PROBLEMA: nėra [Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    // Visi metodai prieinami be autentikacijos
```

**Sprendimas:**
```csharp
[ApiController]
[Route("api/[controller]")]  
[Authorize]  // ← pridėti
public class ScheduleController : ControllerBase
```

---

#### R-HIGH-02: IDOR rizika – studentų duomenų izoliacija

**Paveiktas komponentas:** `GradesController`, `ScheduleController`  
**Rizikos aprašymas:** Kontroleriai priima `studentId` kaip URL parametrą, bet netikrina, ar prašantysis JWT subjektas turi teisę pasiekti tuos duomenis  
**Poveikis:** Studentas A gali gauti Studento B pažymius, tiesiog pakeisdamas URL: `/api/grades/2` vietoj `/api/grades/1`  
**OWASP:** A01 – Broken Access Control  

```csharp
// PROBLEMA: nėra prieigos kontrolės tikrinimo
[HttpGet("{studentId}")]
public async Task<IActionResult> GetGrades(int studentId)
{
    // Nėra: ar JWT userId atitinka studentId savininką?
    var grades = await _context.Grades
        .Where(g => g.StudentId == studentId)
        .ToListAsync();
```

**Sprendimas:**
```csharp
[HttpGet("{studentId}")]
[Authorize]
public async Task<IActionResult> GetGrades(int studentId)
{
    var userIdClaim = User.FindFirst("id")?.Value;
    var role = User.FindFirst(ClaimTypes.Role)?.Value;
    
    // Studentai gali matyti tik savo duomenis
    if (role == "Student") {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null || student.UserId.ToString() != userIdClaim)
            return Forbid();
    }
    // ...
}
```

---

#### R-HIGH-03: `UserController` testai trūksta

**Paveiktas komponentas:** `UserController.cs`  
**Rizikos aprašymas:** Kontroleris, valdantis vartotojų administravimą (rolių keitimas, trynimas), visiškai netestavamas  
**Poveikis:** Nežinomos klaidos galimos kritiniame administravimo komponente  

**Trūkstami testai:**
- `GetAllUsers_AsAdmin_ReturnsAllUsers`
- `GetAllUsers_AsStudentOrTeacher_ReturnsForbidden`
- `DeleteUser_LastAdmin_ReturnsBadRequest`
- `DeleteUser_AsNonAdmin_ReturnsForbidden`
- `UpdateUser_WithCorrectPassword_ReturnsNoContent`
- `UpdateUser_WithWrongPassword_ReturnsBadRequest`

---

#### R-HIGH-04: `admin.js` FE API be testų

**Paveiktas komponentas:** `student-portal/src/api/admin.js`  
**Rizikos aprašymas:** Admin API funkcijos (vartotojų valdymas) neturi jokių unit testų  
**Poveikis:** Klaidos admin funkcijose nepastebimos automatiškai  

---

### 7.3 Vidutinio prioriteto rizikos (P3)

#### R-MED-01: `WeatherForecastController` produkciniame kode

**Aprašymas:** Scaffolding kontroleris paliktas – neapsaugotas endpoint, didinantis atakų paviršių  
**Sprendimas:** Ištrinti failą ir pašalinti iš registracijos

#### R-MED-02: JWT raktas aplinkoje

**Aprašymas:** `JWT__Key` perduodamas per `docker-compose.yml` aplinkos kintamąjį – gali būti eksponuotas  
**Sprendimas:** Naudoti Docker Secrets arba `.env` failą (neįtraukiamą į Git)

#### R-MED-03: SQL Server Express ribotumas

**Aprašymas:** Max 10 GB duomenų, nėra HA/failover – netinka produkcijai  
**Sprendimas:** Migracija į SQL Server Standard arba Azure SQL

#### R-MED-04: `PrivateRoute` be unit testų

**Aprašymas:** Prieigos kontrolės komponentas FE pusėje nepatestavimas  
**Poveikis:** Galimas prieigos kontrolės apėjimas UI lygyje nepastebimas

---

### 7.4 Rizikų suvestinė

```
KRITINĖ   [R-CRIT-01] HTTPS trūkumas
           ───────────────────────────────────────────────
AUKŠTAS   [R-HIGH-01] ScheduleController be [Authorize]
           [R-HIGH-02] IDOR – studentų duomenų izoliacija
           [R-HIGH-03] UserController be testų
           [R-HIGH-04] admin.js be testų
           ───────────────────────────────────────────────
VIDUTINIS  [R-MED-01] WeatherForecastController
           [R-MED-02] JWT raktas aplinkoje
           [R-MED-03] SQL Server Express ribotumas
           [R-MED-04] PrivateRoute be testų
```

---

## 8. Problemos ir sprendimai

### 8.1 Techninės problemos

#### Problema 1: EF Core InMemory nenaudoja realios SQL semantikos

**Aprašymas:** EF Core InMemory duomenų bazė nepalaiko kai kurių SQL funkcionalumų (pvz., `UNIQUE` ribojimų tikrinimo DB lygyje, FK kaskadinio trynimo semantikos).

**Įtaka:** Kai kurie testai gali praeiti su InMemory, bet žlugtų su realia SQL Server duomenų baze.

**Sprendimas:**
- Autentikacijos testai tikrina dublikatų apsaugą per aplikacijos logiką, ne DB ribojimus – tai teisingas sprendimas
- Rekomenduojama: integraciniai testai su realia testavimo DB arba SQLite (`UseInMemoryDatabase` pakeisti į `UseSqlite`)
- Testai su `Guid.NewGuid()` DB pavadinimu apsaugo nuo kryžminės taršos

#### Problema 2: `console.error` frontend testuose

**Aprašymas:** `auth.test.js` vykdant testą `getUserRole returns null on decode error`, `console.error` sąmoningai iškviečiamas implementacijos.

**Įtaka:** Keistas išėjimas – testai praeina, bet `console.error` rodo tai kaip triukšmą.

**Sprendimas:** Testai yra teisingi – klaida yra numato, kad `jwt-decode` meta išimtį ir ji sugaunama. Galima nutildyti testuose: `jest.spyOn(console, 'error').mockImplementation(() => {})`.

#### Problema 3: `react-scripts` versija ir `@testing-library/user-event`

**Aprašymas:** `@testing-library/user-event` v13 su React 19 gali turėti suderinamumo problemų.

**Įtaka:** Kai kurie `userEvent.type()` asynchroniški veiksmai gali elgtis netikėtai.

**Sprendimas:** Migracija į `@testing-library/user-event` v14 su `async/await` sintakse; tai veikia stabiliai su React 18+ ir `@testing-library/react` v16.

#### Problema 4: Docker healthcheck SQL Server

**Aprašymas:** SQL Server nepasiruošia iš karto – reikia palaukti, kol bus galima vykdyti užklausas.

**Sprendimas:** Docker Compose `healthcheck` tikrina `sqlcmd -Q "SELECT 1"` kas 5 sekundes iki 30 bandymų; API konteineris priklauso nuo `db` konteinerio sveikato, ką ir yra įgyvendinta.

---

### 8.2 Testavimo proceso problemos

#### Problema 5: `UserController` – nėra testų

**Aprašymas:** Kritinis administravimo kontroleris visiškai netestavamas.

**Sprendimas:** Parašyti trūkstamus testus pagal šį šabloną:
```csharp
public class UserControllerTests
{
    [Fact]
    public async Task DeleteUser_LastAdmin_ReturnsBadRequest()
    {
        // Arrange
        var options = TestDbContextFactory.Create();
        using var context = new AppDbContext(options);
        var admin = new User { Name = "Admin", Email = "a@a.com", 
                               Role = "Admin", PasswordHash = "" };
        context.Users.Add(admin);
        await context.SaveChangesAsync();
        var controller = new UserController(context);
        
        // Act
        var result = await controller.DeleteUser(admin.Id);
        
        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
```

#### Problema 6: Neaiški padengiamumas dėl trūkstamo konfigūravimo

**Aprašymas:** Nėra aiškiai sukonfigūruoto `coverlet` nustatymų `.csproj` faile – trūksta `ExcludeByAttribute` ir `ExcludeByFile` direktyvų.

**Sprendimas:** Pridėti į `StudentPortal.Tests.csproj`:
```xml
<PropertyGroup>
  <CollectCoverage>true</CollectCoverage>
  <CoverletOutputFormat>cobertura</CoverletOutputFormat>
  <Exclude>[*]*.WeatherForecast*,[*]*.Migrations.*</Exclude>
</PropertyGroup>
```

---

## 9. Darbų apimtys ir tvarkaraščiai

### 9.1 Testavimo etapų tvarkaraštis

| Etapas | Darbų apimtis | Terminas | Statusas |
|--------|--------------|---------|---------|
| **1. Testavimo planavimas** | 2 žm./dienos | 2026-02-28 | ✅ Baigta |
| **2. Backend unit testai** | 3 žm./dienos | 2026-03-07 | ✅ Baigta |
| **3. Frontend unit testai** | 2 žm./dienos | 2026-03-10 | ✅ Baigta (dalinis) |
| **4. Integraciniai testai** | 1 žm./diena | 2026-03-11 | ✅ Baigta (dalinis) |
| **5. Rankinis testavimas** | 1 žm./diena | 2026-03-13 | ✅ Baigta |
| **6. Saugumo peržiūra** | 1 žm./diena | 2026-03-14 | ✅ Baigta |
| **7. Ataskaitų rengimas** | 1 žm./diena | 2026-03-14 | ✅ Baigta |
| **8. Defektų šalinimas** | 2 žm./dienos | 2026-03-21 | 🔄 Planuojama |

### 9.2 Testų atvejų apimtys

| Kategorija | Planuota | Įvykdyta | Praeina | Nepavyksta |
|------------|---------|---------|---------|-----------|
| Backend unit testai | 35 | 33 | 33 | 0 |
| Frontend unit testai | 30 | ~26 | ~26 | 0 |
| Integraciniai testai | 10 | 5 | 5 | 0 |
| Rankiniai testai | 20 | 15 | 14 | 1* |
| **Iš viso** | **95** | **~79** | **~78** | **~1** |

*Rankinis testas DEF-002 (ScheduleController be autorizacijos) – defektas užregistruotas

### 9.3 Defektų istorija

| ID | Etapas | Aptikta | Prioritetas | Statusas |
|----|--------|---------|------------|---------|
| DEF-001 | Unit | 2026-03-10 | P2 | Atviras |
| DEF-002 | Rankinis | 2026-03-13 | P2 | Atviras |
| DEF-003 | Kodo peržiūra | 2026-03-11 | P3 | Atviras |
| DEF-004 | Unit | 2026-03-10 | P2 | Atviras |
| DEF-005 | Unit | 2026-03-10 | P3 | Atviras |
| DEF-006 | Saugumo | 2026-03-14 | P1 | Atviras |

### 9.4 Nebaigti darbai (backlog)

| Darbas | Prioritetas | Vertinama trukmė |
|--------|------------|-----------------|
| `UserController` unit testų rašymas | P2 | 4 valandos |
| `admin.js` FE testų rašymas | P2 | 2 valandos |
| `PrivateRoute.js` testų rašymas | P3 | 2 valandos |
| `ScheduleController` [Authorize] pridėjimas | P2 | 30 min |
| IDOR apsaugos įgyvendinimas GradesController | P2 | 3 valandos |
| HTTPS nginx konfigūracija | P1 | 2 valandos |
| `WeatherForecastController` pašalinimas | P3 | 15 min |
| CI/CD pipeline sukūrimas (GitHub Actions) | P3 | 4 valandos |

---

## 10. Išvados ir rekomendacijos

### 10.1 Pagrindinės išvados

1. **Teigiama:** Sistema turi gerą unit testų bazę backend pusėje (33 testai, ~75 % padengimas), o visi testai praeina sėkmingai

2. **Teigiama:** Autentikacijos mechanizmas (BCrypt + JWT HS256) įgyvendintas teisingai ir pilnai patikrintas testais

3. **Teigiama:** Pažymių validacija (ribinės reikšmės, privalomi laukai) yra visiškai padengta testais

4. **Svarbu:** `ScheduleController` nėra apsaugotas `[Authorize]` anotacija – tai turi būti taisoma prieš produkcinį paleidimą

5. **Svarbu:** Trūksta IDOR apsaugos – studentai teoriškai gali pasiekti kitų studentų duomenis

6. **Svarbu:** Frontend testų padengimas yra nepakankamai didelis – kritiniai komponentai (`AdminPage`, `Dashboard`, `PrivateRoute`) nepatikrinti

### 10.2 Rekomendacijos

**Skubios (prieš produkcinį diegimą):**
1. Pridėti `[Authorize]` į `ScheduleController`
2. Konfigūruoti HTTPS nginx
3. Įgyvendinti IDOR apsaugą GradesController ir ScheduleController

**Trumpalaikės (1–2 savaitės):**
4. Parašyti `UserController` unit testus
5. Parašyti `admin.js` ir `PrivateRoute.js` testus
6. Pašalinti `WeatherForecastController`

**Ilgalaikės (per vieną sprintą):**
7. Sukurti CI/CD pipeline (GitHub Actions)
8. Padidinti frontend kodo padengimą iki ≥ 60 %
9. Apsvarstyti SQLite (vietoj InMemory) integraciniams testams
10. Įdiegti strukturuotą klaidų registravimą (Serilog, Application Insights)

### 10.3 Galutinis vertinimas

| Kriterijus | Tikslas | Pasiekta | Įvertinimas |
|-----------|---------|---------|------------|
| Unit testai (BE) | 100 % praeinamumas | 100 % | ✅ Puikiai |
| Unit testai (FE) | 100 % praeinamumas | 100 % | ✅ Puikiai |
| Integraciniai testai | 100 % praeinamumas | 100 % | ✅ Puikiai |
| BE kodo padengimas | ≥ 70 % | ~75 % | ✅ Pasiekta |
| FE kodo padengimas | ≥ 60 % | ~35-40 % | ❌ Nepassiekta |
| P1 defektai | 0 atvirų | 1 atviras (HTTPS) | ❌ Nespręsta |
| P2 defektai | 0 atvirų | 3 atviri | ⚠️ Reikia dėmesio |
| Docker aplinka | Veikia | Veikia | ✅ Pasiekta |
| Saugumo peržiūra | Atlikta | Atlikta | ✅ Su pastabomis |

> **Bendras vertinimas:** Sistema yra paruošta demo/akademinei aplinkai, tačiau reikalauja papildomų saugumo patobulinimų prieš produkcinį diegimą.

---

*Ataskaita parengta: 2026-03-14*  
*Projektas: StudentPortal | Šaka: feature/docker*  
*Susiję dokumentai: Testavimo-Planas.md, Testavimo-Strategija.md*
