# Automatinis testavimas – StudentPortal

## Turinys
1. [Kaip paleisti testus](#kaip-paleisti-testus)
2. [Testavimo proceso aprašymas](#testavimo-proceso-apra%C5%A1ymas)
3. [Testų struktūra](#test%C5%B3-strukt%C5%ABra)
4. [Testų vykdymo ataskaita](#test%C5%B3-vykdymo-ataskaita)

---

## Kaip paleisti testus

### Reikalavimai

| Įrankis | Versija |
|---|---|
| .NET SDK | 8.0+ |
| Node.js | 18+ |
| npm | 9+ |

---

### Backend testai (.NET / xUnit)

```bash
# Eiti į testų projektą
cd StudentPortal.Tests

# Paleisti visus testus
dotnet test

# Paleisti su kodo padengimo ataskaita
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults

# Sugeneruoti HTML ataskaitą (reikalingas reportgenerator)
dotnet tool install --global dotnet-reportgenerator-globaltool
reportgenerator -reports:./TestResults/**/coverage.cobertura.xml -targetdir:./TestResults/CoverageReport -reporttypes:Html
```

HTML ataskaita bus sukurta aplanke `StudentPortal.Tests/TestResults/CoverageReport/index.html`.

---

### Frontend testai (React / Jest)

```bash
# Eiti į frontend projektą
cd student-portal

# Paleisti visus testus
npm test -- --watchAll=false

# Paleisti su kodo padengimo ataskaita
CI=true npm test -- --watchAll=false --coverage --coverageReporters=text
```

---

## Testavimo proceso aprašymas

### Metodologija

Visi testai rašyti naudojant **Arrange–Act–Assert (AAA)** šabloną:
- **Arrange** – paruošiami duomenys ir priklausomybės
- **Act** – iškviečiamas testuojamas metodas
- **Assert** – tikrinamas rezultatas

### Testų izoliacija

**Backend:** kiekvienas testas naudoja atskirą atminties duomenų bazę (`InMemory` EF Core). Duomenų bazės pavadinimas generuojamas su `Guid.NewGuid()`, todėl testai nesikerta tarpusavyje.

**Frontend:** prieš kiekvieną testą iškviečiama `jest.clearAllMocks()` ir `localStorage.clear()`, kad būsena tarp testų nebūtų perduodama.

### Naudotos bibliotekos

| Sritis | Biblioteka | Paskirtis |
|---|---|---|
| Backend | xUnit | Testavimo karkasas |
| Backend | Moq | Priklausomybių imitavimas (mocking) |
| Backend | EF Core InMemory | Atmintyje veikianti duomenų bazė testams |
| Backend | Coverlet | Kodo padengimo rinkimas |
| Backend | ReportGenerator | HTML padengimo ataskaita |
| Frontend | Jest | Testavimo vykdytojas |
| Frontend | React Testing Library | Komponentų testavimas |
| Frontend | jest.mock('axios') | HTTP užklausų imitavimas |
| Frontend | jest.mock('jwt-decode') | JWT dekodavimo imitavimas |

### Testavimo rūšys

#### Vienetų testai (Unit Tests)
Tikrina atskiras kontrolerių funkcijas izoliuotoje aplinkoje:
- CRUD operacijos (sukūrimas, skaitymas, atnaujinimas, šalinimas)
- Duomenų validacija (privalomi laukai, leistinos reikšmių ribos)
- Klaidų apdorojimas (404, 400 atsakymai)

#### Integraciniai testai (Integration Tests)
Tikrina kelių komponentų sąveiką naudojant bendrą duomenų bazę:
- Ataskaitos grąžinančios visus duomenis po kelių įrašų sukūrimo
- Filtravimas pagal studentą, semestrą, savaitės dieną
- Duomenų vientisumas (vieno objekto trynimas neįtakoja kito)

#### Klaidų apdorojimo testai (Error Handling Tests)
- Trūkstami privalomi laukai (dalykas, semestras, slaptažodis)
- Neegzistuojantys įrašai → 404 Not Found
- Dubliuoti el. pašto adresai → 400 Bad Request
- Neteisingos autentifikacijos duomenys → 401 Unauthorized

---

## Testų struktūra

### Backend (`StudentPortal.Tests/`)

| Failas | Testų sk. | Aprašymas |
|---|---|---|
| `Controllers/GradesControllerTests.cs` | 14 | Pažymių gavimas, kūrimas, redagavimas, šalinimas, validacija |
| `Controllers/ScheduleControllerTests.cs` | 13 | Tvarkaraščio gavimas, kūrimas, redagavimas, šalinimas |
| `Controllers/AuthControllerTests.cs` | 9 | Registracija, prisijungimas, JWT generavimas, slaptažodžio šifravimas |
| `Integration/IntegrationTests.cs` | 9 | Daugiapakopiai scenarijai per kelis kontrolerius |
| **Viso** | **45** | |

### Frontend (`student-portal/src/__tests__/`)

| Failas | Testų sk. | Aprašymas |
|---|---|---|
| `auth.test.js` | 14 | `login`, `register`, `logout`, `getToken`, `getUserRole` funkcijos |
| `student.test.js` | 22 | `getStudentByUserId`, `getGrades`, `getSchedule`, `updateGrade`, `deleteGrade`, `addSchedule` |
| `Login.test.js` | 11 | Prisijungimo formos atvaizdavimas, įvesties valdymas, sėkmė ir klaidos |
| `Register.test.js` | 9 | Registracijos formos atvaizdavimas, laukų užpildymas, sėkmė ir klaidos |
| **Viso** | **56** | |

---

## Testų vykdymo ataskaita

### Backend – kodo padengimas

> Sugeneruota: 2026-03-09 | Įrankis: Coverlet + ReportGenerator | Formattas: Cobertura XML

| Klasė | Eilutės (%) |
|---|---|
| `AuthController` | **100%** |
| `ScheduleController` | **91.1%** |
| `GradesController` | **75.7%** |
| `AppDbContext` | **100%** |
| `AuthRequest` (modelis) | **100%** |
| `Grade` (modelis) | **100%** |
| `Schedule` (modelis) | 90% |
| `Student` (modelis) | 75% |
| `User` (modelis) | 83.3% |
| `StudentController` | 0% *(netestuota)* |
| `UserController` | 0% *(netestuota)* |

**Bendra padengimo suvestinė:**

| Metrika | Reikšmė |
|---|---|
| Eilučių padengimas | 10.3% (276 iš 2658 – migracijų kodas sumažina bendrą % )  |
| Šakų padengimas | 45.9% (45 iš 98) |
| Metodų padengimas | 44.5% (49 iš 110) |
| Iš viso testų | **45 / 45 praeita** |

> **Pastaba:** Bendras eilučių % yra žemas dėl automatiškai sugeneruoto migracijų kodo (`Migrations/`), kuris sudaro didžiąją dalį failų bet nėra testuojamas. Testavimui aktualių kontrolerių ir modelių padengimas siekia **75–100%**.

---

### Frontend – kodo padengimas

> Sugeneruota: 2026-03-09 | Įrankis: Jest `--coverage` | 56 / 56 testų praeita

```
---------------------|---------|----------|---------|---------|
Failas               | % Stmt  | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
All files            |   20.00 |     8.25 |   20.14 |   20.08 |
 src/api             |   58.19 |    57.14 |   59.09 |   56.77 |
  auth.js            |  100.00 |    83.33 |  100.00 |  100.00 |
  student.js         |   82.35 |    33.33 |   80.00 |   81.63 |
  admin.js           |   16.00 |    50.00 |    0.00 |   16.00 |
 src/pages           |   11.93 |     6.89 |   11.25 |   12.50 |
  Login.js           |  100.00 |   100.00 |  100.00 |  100.00 |
  Register.js        |   95.00 |    80.00 |   75.00 |  100.00 |
  Dashboard.js       |   33.33 |     5.12 |   28.57 |   35.00 |
  AdminPage.js       |    1.33 |     0.00 |    0.00 |    1.38 |
  StudentPage.js     |    1.35 |     0.00 |    0.00 |    1.56 |
  TeacherPage.js     |    0.67 |     0.00 |    0.00 |    0.67 |
  ProfilePage.js     |    1.21 |     0.00 |    0.00 |    1.28 |
 src/context         |   37.50 |    25.00 |   50.00 |   37.50 |
  AuthContext.js     |   37.50 |    25.00 |   50.00 |   37.50 |
 src/routes          |   33.33 |    12.50 |   50.00 |   33.33 |
  PrivateRoute.js    |   10.00 |     0.00 |    0.00 |   10.00 |
  PublicRoute.js     |   80.00 |    50.00 |  100.00 |   80.00 |
---------------------|---------|----------|---------|---------|
```

**Iš viso testų: 56 / 56 praeita**

> **Pastaba:** Bendras padengimas yra žemas dėl komponentų (`AdminPage`, `StudentPage`, `TeacherPage`), kurie reikalautų pilnos backend integracijų imituoti – jie nebuvo įtraukti į automatinių testų apimtį. Aktyviai testuoti failai (`auth.js`, `Login.js`) pasiekia **100% padengimą**.
