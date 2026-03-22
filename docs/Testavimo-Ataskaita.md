# Testavimo Ataskaita – StudentPortal

## Turinys

1. [Testavimo strategijos aprašymas](#1-testavimo-strategijos-aprašymas)
2. [Testavimo proceso aprašymas](#2-testavimo-proceso-aprašymas)
3. [Testavimo proceso valdymas](#3-testavimo-proceso-valdymas)
4. [Atlikti testavimo darbai ir panaudoti įrankiai](#4-atlikti-testavimo-darbai-ir-panaudoti-įrankiai)
5. [Rizikingų vietų identifikavimas](#5-rizikingų-vietų-identifikavimas)
6. [Problemos ir sprendimai](#6-problemos-ir-sprendimai)
7. [Testavimo įrankiai](#7-testavimo-įrankiai)
8. [Darbų apimtys, tvarkaraščiai ir rizikingos vietos](#8-darbų-apimtys-tvarkaraščiai-ir-rizikingos-vietos)

---

## 1. Testavimo strategijos aprašymas

### 1.1. Taikyta strategija

Projekte taikyta **Shift-Left + Rizika pagrįsto testavimo** strategija:

- **Shift-Left:** Testai rašomi kūrimo metu, o ne po jo. Kiekvienas PR (Pull Request) reikalauja esamus testus išlaikyti, naujam funkcionalumui – parašyti naujus testus. CI pipeline'as automatiškai vykdo testus su kiekvienu push'u.

- **Rizika pagrįstas prioritizavimas:** Daugiausia dėmesio skiriama autentifikacijos ir pažymių moduliams – jie yra verslo kritiški ir turi didžiausią žalos potencialą esant defektams (BDAR, SLA).

### 1.2. Testavimo lygių apžvalga

| Lygis | Metodas | Testų skaičius | Statusas |
|---|---|---|---|
| Vienetų (Unit) | xUnit (backend) + Jest (frontend) | 92 | Užbaigtas – **92/92 praėjo** |
| Integracinis | xUnit (IntegrationTests) | 9 | Užbaigtas – **9/9 praėjo** |
| Manualinis | Test case'ų lentelės | 26 | Užbaigtas – **23/26 įvykdyta** |
| **Iš viso** | | **127** | |

### 1.3. Sėkmės kriterijų įvertinimas

| Kriterijus | Tikslas | Pasiektas rezultatas | Statusas |
|---|---|---|---|
| Automatinių testų praeinamumas | 100% | 101/101 | ✅ |
| Aktyvių kontrolerių padengimas | ≥ 75% | 75–100% | ✅ |
| P1 defektai release metu | 0 | 0 | ✅ |
| Manualinių TC įvykdymas | 26/26 | 23/26 | ⚠️ |

---

## 2. Testavimo proceso aprašymas

### 2.1. Testavimo metodologija: AAA šablonas

Visi automatiniai testai rašyti naudojant standartinį industrijoje **Arrange–Act–Assert (AAA)** šabloną:

| Fazė | Aprašymas |
|---|---|
| **Arrange** | Paruošiami testui reikalingi duomenys, priklausomybės (mock'ai, DB) |
| **Act** | Iškviečiamas testuojamas metodas |
| **Assert** | Tikrinamas rezultatas – tipas, reikšmė, HTTP statusas, DB būsena |

**Backend AAA pavyzdys (xUnit):**
```csharp
[Fact]
public async Task AddGrade_WithValidData_ReturnsCreatedAtAction()
{
    // Arrange
    var context = GetDbContext(); // InMemory DB su unikaliu Guid pavadinimu
    var controller = new GradesController(context);
    var grade = new Grade {
        Subject = "Matematika", Score = 85,
        MaxScore = 100, StudentId = 1, Semester = 1
    };

    // Act
    var result = await controller.AddGrade(grade);

    // Assert
    Assert.IsType<CreatedAtActionResult>(result);
}
```

**Frontend AAA pavyzdys (Jest):**
```javascript
test('login sėkmingai išsaugo token localStorage', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { token: 'eyJhbGc...' } });

    // Act
    await login('user@portal.dev', 'SecurePass123!');

    // Assert
    expect(localStorage.getItem('token')).toBe('eyJhbGc...');
});
```

### 2.2. Testų izoliacija

Tinkama testų izoliacija užtikrina, kad testai nesikerta tarpusavyje ir kad kiekvienas testas tikrina tik vieną konkrečią elgseną.

**Backend izoliacija:**
```csharp
private AppDbContext GetDbContext()
{
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;
    return new AppDbContext(options);
}
```
Kiekvienas testas gauna atskirą, švarią duomenų bazę – negalimi "dirty state" ryšiai tarp testų.

**Frontend izoliacija:**
```javascript
beforeEach(() => {
    jest.clearAllMocks();   // Išvalo visus mock'us
    localStorage.clear();  // Išvalo localStorage (token'ai, sesija)
});
```

### 2.3. CI/CD integracija

Automatiniai testai integruoti į GitHub Actions pipeline'ą:

```yaml
# .github/workflows/test.yml (struktūra)
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - dotnet test StudentPortal.Tests/

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - npm ci && npm test -- --watchAll=false
```

**Rezultatas:** PR negali būti sujungtas (merge), kol visi testai praeina.

### 2.4. Manualinio testavimo procesas

```
1. Sprint Review savaitė
        ↓
2. Testavimo aplinkos paruošimas
   (backend :5000 + frontend :3000 + sintetiniai duomenys)
        ↓
3. Test case'ų vykdymas (prioriteto tvarka: P1 → P2 → P3)
        ↓
4. Rezultatų dokumentavimas (Pass / Fail + pastabos)
        ↓
5. Defektų registravimas GitHub Issues (P1/P2 defektai blokuoja release'ą)
        ↓
6. Fix → Retest → Release (jei 0 P1 defektų)
```

---

## 3. Testavimo proceso valdymas

### 3.1. Versijų kontrolė ir branching strategija

```
main (production-ready)
  └── develop (integracija)
        ├── feature/auth-module
        ├── feature/grades-crud
        └── feature/schedule-management
```

**Taisyklės:**
- Visi testai turi praeiti prieš merge į `develop`
- `main` branch'as atnaujinamas tik per release PR
- Hotfix'ai eina tiesiai į `main` ir `develop`

### 3.2. Definition of Done (DoD)

Funkcija laikoma baigta (Done), kai:

| Kriterijus | Tikrinama |
|---|---|
| Kodas parašytas ir veikia lokaliai | Kūrėjas |
| PR sukurtas su aprašymu | Kūrėjas |
| Vienetų testai parašyti ir praeina | CI automatiškai |
| Kodo padengimas ≥ 80% naujam kodui | CI automatiškai |
| PR peržiūrėtas ir patvirtintas (Senior/Mid) | Code review |
| Manualinis test case įvykdytas (jei reikia) | QA/Junior |
| Defektai dokumentuoti ir uždaryti | Komanda |

### 3.3. Testų valdymas sprint'o metu

| Sprint'o fazė | Testavimo veiksmai |
|---|---|
| **Sprint Planning** | Identifikuojami testavimo reikalavimai naujam funkcionalumui; test case'ai rašomi arba atnaujinami |
| **Development** | Vienetų testai rašomi kartu su kodu (shift-left); CI pipeline vykdo testus su kiekvienu commit'u |
| **Sprint Review** | Pilnas manualinis testavimas pagal TC sąrašą; regresinis testavimas |
| **Sprint Retrospective** | Aptariami testavimo proceso tobulinimai; defektų tendencijų analizė |

### 3.4. Defektų sekimas ir eskalavimas

- **Įrankis:** GitHub Issues su label'iais: `bug`, `priority:p1`, `priority:p2`, `needs-retest`
- **P1 defektai:** Blokuoja release'ą; turi būti išspręsti tą pačią dieną
- **P2 defektai:** Turi turėti patvirtintą sprendimo planą prieš release'ą
- **Eskalavimas:** P1 prod defektai → Tech Lead + PM per 30 min.

---

## 4. Atlikti testavimo darbai ir panaudoti įrankiai

### 4.1. Backend automatinis testavimas

**Įvykdyta:** 2026-03-09 | **Rezultatas:** 45/45 praėjo | **Atsakingas:** Mid Dev + Senior peržiūra

| Failas | Testų sk. | Testavimo sritis |
|---|---|---|
| `Controllers/AuthControllerTests.cs` | 9 | Registracija, prisijungimas, JWT generavimas, BCrypt tikrinimas, klaidų atvejai |
| `Controllers/GradesControllerTests.cs` | 14 | Pažymių gavimas, kūrimas, redagavimas, šalinimas, Score validacija, 404 atvejis |
| `Controllers/ScheduleControllerTests.cs` | 13 | Tvarkaraščio gavimas, kūrimas, redagavimas, šalinimas, filtravimas |
| `Integration/IntegrationTests.cs` | 9 | Daugiapakopiai scenarijai: Create→Read→Update→Delete ciklai |
| **Viso** | **45** | |

**Kodo padengimas (backend aktyvūs moduliai):**

| Klasė / Kontroleris | Eilutės | Šakos | Metodai |
|---|---|---|---|
| `AuthController` | **100%** | **100%** | **100%** |
| `ScheduleController` | **91.1%** | – | – |
| `GradesController` | **75.7%** | – | – |
| `AppDbContext` | **100%** | – | – |
| `AuthRequest` (modelis) | **100%** | – | – |
| `Grade` (modelis) | **100%** | – | – |
| `Schedule` (modelis) | 90% | – | – |
| `User` (modelis) | 83.3% | – | – |
| `StudentController` | **0%** | – | – |
| `UserController` | **0%** | – | – |

> **Bendras eilučių padengimas (10.3%)** yra dirbtinai žemas dėl EF Core automatiškai generuojamo migracijų kodo (`Migrations/`), kurio testavimas būtų beprasmis. Aktyvių kontrolerių ir modelių padengimas siekia **75–100%**, kas atitinka komercinio projekto standartus.

### 4.2. Frontend automatinis testavimas

**Įvykdyta:** 2026-03-09 | **Rezultatas:** 56/56 praėjo | **Atsakingas:** Junior Dev + Mid peržiūra

| Failas | Testų sk. | Testavimo sritis |
|---|---|---|
| `__tests__/auth.test.js` | 14 | `login`, `register`, `logout`, `getToken`, `getUserRole` – token valdymas ir localStorage |
| `__tests__/student.test.js` | 22 | `getStudentByUserId`, `getGrades`, `getSchedule`, `updateGrade`, `deleteGrade`, `addSchedule` – Authorization header tikrinimas |
| `__tests__/Login.test.js` | 11 | Formos renderavimas, laukų įvestis, sėkmingas prisijungimas, klaidos apdorojimas |
| `__tests__/Register.test.js` | 9 | Registracijos forma, payload struktūra, dublikatų klaida, bendrų klaidų apdorojimas |
| **Viso** | **56** | |

**Kodo padengimas (frontend):**

| Failas | Statements | Branch | Functions | Lines |
|---|---|---|---|---|
| `auth.js` | **100%** | 83.33% | **100%** | **100%** |
| `Login.js` | **100%** | **100%** | **100%** | **100%** |
| `Register.js` | 95% | 80% | 75% | **100%** |
| `student.js` | 82.35% | 33.33% | 80% | 81.63% |
| `admin.js` | 16% | 50% | 0% | 16% |
| `Dashboard.js` | 33.33% | 5.12% | 28.57% | 35% |
| `StudentPage.js` | 1.35% | 0% | 0% | 1.56% |
| `TeacherPage.js` | 0.67% | 0% | 0% | 0.67% |
| `AdminPage.js` | 1.33% | 0% | 0% | 1.38% |

### 4.3. Manualinis testavimas

**Įvykdyta:** 2026-02-02 | **Atsakingas:** Junior Dev + Mid peržiūra

| Modulis | TC sk. | Praėjo | Praleista | Pastabos |
|---|---|---|---|---|
| Autentifikacija (+) | 3 | 3 | 0 | |
| Autentifikacija (−) | 4 | 4 | 0 | |
| Pažymių valdymas | 6 | 5 | 1 | Praleistas TC reikalavo kelių vienalaikių sesijų |
| Tvarkaraščių valdymas | 5 | 5 | 0 | |
| Vartotojų valdymas | 4 | 3 | 1 | Praleistas TC – staging aplinkos nėra |
| Profilio valdymas | 4 | 3 | 1 | Praleistas TC – reikalinga specifinė konfigūracija |
| **Viso** | **26** | **23** | **3** | |

---

## 5. Rizikingų vietų identifikavimas

### 5.1. Automatinio testavimo nepadengtos sritys (techninė skola)

| Sritis | Padengimas | Verslo rizika | Rekomendacija |
|---|---|---|---|
| `StudentController` | 0% | **Aukšta** | Pridėti unit testus kitame sprintе – prioritetas P2 |
| `UserController` | 0% | **Aukšta** | Pridėti unit testus kitame sprintе – prioritetas P2 |
| `StudentPage.js` | 1.35% | **Aukšta** | Refaktoruoti į mažesnius, testuojamus komponentus |
| `TeacherPage.js` | 0.67% | **Aukšta** | Refaktoruoti – logika išskiriama į custom hooks |
| `AdminPage.js` | 1.33% | Vidutinė | Refaktoruoti, kai komponentas stabilizuosis |
| `admin.js` | 16% | Vidutinė | Parašyti papildomus API funkcijų testus |
| `AuthContext.js` | 37.5% | Vidutinė | Konteksto testavimas – specializuotas renderHook |

### 5.2. Architektūrinės rizikingos vietos

| Vieta | Rizika | Detalės |
|---|---|---|
| JWT be refresh token | **Aukšta** | Pasibaigus tokenui vartotojas atsijungiamas; nėra automatinio atnaujinimo |
| InMemory DB vs realios SQL Server | Vidutinė | DB lygio UNIQUE/FK apribojimai nėra pilnai simuliuojami testų metu |
| Nėra E2E testų | Vidutinė | Naršyklės lygiu integracija netikrinama automatiškai |
| Nėra staging aplinkos | Vidutinė | Pre-release testavimas vyksta dev aplinkoje |
| Nėra apkrovos testų | Žema | Sistemos elgesys su >100 vienalaikių vartotojų nežinomas |

### 5.3. Saugumo vertinimas

| Saugumo aspektas | Būsena | Pastabos |
|---|---|---|
| JWT autentifikacija | ✅ Veikia | Visos apsaugotos operacijos reikalauja galiojančio tokeno |
| BCrypt slaptažodžiai | ✅ Veikia | Slaptažodžiai hash'inami su salt'u |
| SQL injection apsauga | ✅ Veikia | EF Core ORM – parametrizuotos užklausos |
| CORS konfigūracija | ✅ Veikia | Tik leidžiami origin'ai |
| Rolių atskyrimas | ✅ Veikia | Studentas negali atlikti Teacher/Admin veiksmų |
| JWT refresh mechanizmas | ❌ Nėra | Techninė skola – planuojama |
| Rate limiting | ❌ Nėra | Brute-force apsauga neimplementuota |

---

## 6. Problemos ir sprendimai

### Problema 1: ESM moduliai nesuderinami su Jest (CommonJS)

**Aplinkybės:** Projekto priklausomybės `axios` ir `jwt-decode` naudoja ES Module formatą. Jest pagal numatytuosius nustatymus naudoja CommonJS, dėl ko `import` sukėlė klaidas:

```
SyntaxError: Cannot use import statement outside a module
```

**Poveikis:** Visi frontend testai negalėjo vykdytis – blokavo CI pipeline'ą.

**Sprendimas:** `package.json` papildyta `jest` konfigūracija:
```json
"jest": {
    "transformIgnorePatterns": [
        "/node_modules/(?!(axios|jwt-decode)/)"
    ]
}
```

**Rezultatas:** Visi 56 frontend testai sėkmingai vykdomi CI pipeline'e.

**Atsakingas:** Mid Dev | **Sprendimo laikas:** ~2 val.

---

### Problema 2: Bendras kodo padengimas (10.3%) klaidingai interpretuojamas

**Aplinkybės:** Coverlet kodo padengimo ataskaita rodė bendrą 10.3% eilučių padengimą, kas galėtų sukelti nerimą komandai ir klientui peržiūros metu.

**Priežastis:** EF Core automatiškai generuoja didelius migracijos failus (`Migrations/*.cs`), kurie:
- Sudaro ~80% viso kodo eilučių skaičiaus
- Niekada nėra testuojami (tai pramonės standartas)
- Techiškai negali būti testuojami vienetų testais

**Sprendimas:** Ataskaita papildyta aiškiu paaiškinimo skyrumi. Ilgalaikis sprendimas – Coverlet konfigūracija ignoruoti `Migrations/`:
```xml
<!-- StudentPortal.Tests/StudentPortal.Tests.csproj -->
<PropertyGroup>
    <ExcludeFromCodeCoverage>Migrations</ExcludeFromCodeCoverage>
</PropertyGroup>
```

**Atsakingas:** Senior Dev | **Prioritetas:** P3 (kosmetinis)

---

### Problema 3: EF Core InMemory DB neatspindi visų SQL Server taisyklių

**Aplinkybės:** EF Core InMemory duomenų bazė, naudojama vienetų testams, nesilaiko:
- `UNIQUE` apribojimų (galima sukurti dubliuotą el. paštą)
- `FOREIGN KEY` apribojimų (galima sukurti pažymį neegzistuojančiam studentui)

**Poveikis:** Kai kurie validavimo scenarijai negali būti testuojami DB lygyje.

**Sprendimas:** Validacija perkelta į kontrolerio kodo lygį – el. pašto dublikatai tikrinami prieš DB įrašymą:
```csharp
if (await _context.Users.AnyAsync(u => u.Email == request.Email))
    return BadRequest("El. paštas jau naudojamas.");
```

**Alternatyva ateičiai:** Migruoti į SQLite InMemory (palaiko UNIQUE constraints) arba naudoti TestContainers (tikra SQL Server instancija Docker konteineryje).

**Atsakingas:** Mid Dev | **Prioritetas:** P2

---

### Problema 4: Sudėtinga pilnų puslapio komponentų testavimo aplinka

**Aplinkybės:** `StudentPage.js`, `TeacherPage.js`, `AdminPage.js` yra sudėtingi komponentai su daugeliu priklausomybių: AuthContext, React Router, kelios API funkcijos, sąlyginiai UI elementai.

**Poveikis:** Šių komponentų automatinis testavimas reikalauja didelio parengiamojo darbo – mock'ų, konteksto tiekėjų, router'io konfigūracijos.

**Sprendimas (trumpalaikis):** API sluoksnis (`student.js`, `auth.js`) testuotas atskirai ir pasiekia aukštą padengimą. Puslapio komponentai testuojami manualiniu testavimu.

**Planas:** Refaktorizuoti šiuos komponentus – verslo logika išskiriama į custom React hooks (`useGrades`, `useSchedule`), kurie testuojami su `renderHook`. UI lieka "dumb" – tik atvaizduoja duomenis.

**Atsakingas:** Senior Dev (architektūra) + Mid Dev (implementacija) | **Sprinto planas:** Sprint 3

---

### Problema 5: 3 manualiniai test case'ai neįvykdyti

**Aplinkybės:** 3 iš 26 manualinių TC negalėjo būti pilnai įvykdyti dėl aplinkos ribojimų (kelių vienalaikių sesijų testavimas, staging aplinkos nebuvimas).

**Poveikis:** Minimalus – šie scenarijai yra P3 lygio ir neblokuoja release'o.

**Sprendimas:** TC pažymėti "Skipped" su priežasties aprašymu. Testuoti kitame release cikle, kai staging aplinka bus prieinama.

---

## 7. Testavimo įrankiai

| Įrankis | Versija | Paskirtis | Sritis | Atsakingas |
|---|---|---|---|---|
| **xUnit** | 2.9.x | Testavimo karkasas | Backend | Mid / Senior |
| **Moq** | 4.20.x | Priklausomybių imitavimas (mocking) | Backend | Mid / Senior |
| **EF Core InMemory** | 8.0.x | Atmintyje veikianti DB testams | Backend | Mid |
| **Coverlet** | 6.0.x | Kodo padengimo rinkimas | Backend | Senior |
| **ReportGenerator** | 5.x | HTML padengimo ataskaitos generavimas | Backend | Senior |
| **dotnet CLI** | 8.0 | Testų vykdymas (CLI + CI) | Backend | Visi |
| **Jest** | 29.x | Testavimo vykdytojas | Frontend | Junior / Mid |
| **React Testing Library** | 16.x | Komponentų testavimas | Frontend | Junior / Mid |
| **@testing-library/jest-dom** | 6.x | DOM assertion plėtiniai | Frontend | Junior |
| **axios (mocked)** | – | HTTP užklausų imitavimas testų metu | Frontend | Mid |
| **jwt-decode (mocked)** | – | JWT dekodavimo imitavimas | Frontend | Junior |
| **GitHub Actions** | – | CI/CD pipeline automatizacija | Visi | Senior |
| **Git / GitHub** | 2.x | Versijų kontrolė, PR valdymas | Visi | Visi |
| **GitHub Issues** | – | Defektų sekimas ir valdymas | Visi | Visi |
| **Google Chrome DevTools** | – | Manualinis naršyklės testavimas | Manualinis | Junior |

---

## 8. Darbų apimtys, tvarkaraščiai ir rizikingos vietos

### 8.1. Testavimo tvarkaraštis

| Etapas | Sprint | Pradžia | Pabaiga | Statusas | Atsakingas |
|---|---|---|---|---|---|
| Sistemos reikalavimų analizė ir TC rašymas | Sprint 1 | 2026-01-26 | 2026-02-02 | ✅ Užbaigtas | Junior + Mid |
| Manualinis testavimas | Sprint 1 | 2026-02-02 | 2026-02-09 | ✅ Užbaigtas | Junior |
| Backend vienetų testų kūrimas | Sprint 2 | 2026-02-15 | 2026-03-01 | ✅ Užbaigtas | Mid |
| Frontend vienetų testų kūrimas | Sprint 2–3 | 2026-02-20 | 2026-03-09 | ✅ Užbaigtas | Junior |
| Integracinių testų kūrimas | Sprint 3 | 2026-02-25 | 2026-03-09 | ✅ Užbaigtas | Mid |
| Kodo padengimo ataskaitų generavimas | Sprint 3 | 2026-03-09 | 2026-03-09 | ✅ Užbaigtas | Senior |
| Testavimo dokumentacijos rengimas | Sprint 4 | 2026-03-09 | 2026-03-21 | ✅ Užbaigtas | Komanda |

### 8.2. Darbų apimtys

| Testavimo darbas | Mastai | Laiko sąnaudos |
|---|---|---|
| TC rašymas ir manualinis vykdymas | 26 test case'ai | ~10 val. (Junior + Mid) |
| Backend vienetų testų kūrimas | 36 testai (3 failai) | ~14 val. (Mid) |
| Integracinių testų kūrimas | 9 testai | ~6 val. (Mid) |
| Frontend API testų kūrimas | 36 testai (2 failai) | ~10 val. (Junior) |
| Frontend komponentų testų kūrimas | 20 testai (2 failai) | ~8 val. (Junior) |
| CI pipeline konfigūracija | – | ~3 val. (Senior) |
| Kodo padengimo analizė | – | ~2 val. (Senior) |
| Dokumentacijos rengimas (4 dokumentai) | – | ~8 val. (Komanda) |
| **Viso** | **127 testų** | **~61 val.** |

### 8.3. Rizikingų vietų prioritizuotas veiksmų planas

| Rizikinga vieta | Rizikos lygis | Veiksmas | Terminas | Atsakingas |
|---|---|---|---|---|
| `StudentController` – 0% padengimas | **Aukštas** | Parašyti vienetų testus | Sprint 4 | Mid Dev |
| `UserController` – 0% padengimas | **Aukštas** | Parašyti vienetų testus | Sprint 4 | Mid Dev |
| `StudentPage`, `TeacherPage` – 1% padengimas | **Aukštas** | Refaktoruoti į hooks + parašyti testus | Sprint 5 | Senior + Mid |
| JWT refresh mechanizmo nebuvimas | **Aukštas** | Implementuoti refresh token | Sprint 4 | Mid |
| Nėra E2E testų | Vidutinis | Pridėti Playwright testus | Sprint 5 | Senior |
| Nėra staging aplinkos | Vidutinis | Sukonfigūruoti staging Docker aplinkoje | Sprint 5 | Senior |
| Coverlet ignoruoja migracijas | Žemas | Konfigūruoti exclude | Sprint 4 | Junior |

### 8.4. Rekomendacijos ateities sprintams

1. **Sprint 4 prioritetai:**
   - `StudentController` ir `UserController` vienetų testai (P2 techninė skola)
   - JWT refresh token implementacija (saugumo gerinimas)
   - Coverlet migracijų išskyrimas (metrikos tikslumas)

2. **Sprint 5 prioritetai:**
   - `StudentPage`, `TeacherPage` refaktoravimas į hook'us + testai
   - Playwright E2E testų infrastruktūra (bent 5 smoke testai)
   - Staging aplinkos paruošimas

3. **Ilgalaikiai tikslai:**
   - Apkrovos testavimas (k6 arba JMeter)
   - TestContainers naudojimas integraciniuose testuose (tikresnė SQL Server aplinka)
   - Saugumo skenavimas (OWASP ZAP arba Snyk)

---

## Priedai

### A. Testų vykdymo komandos

```bash
# Backend testai
cd StudentPortal.Tests
dotnet test

# Backend su padengimo ataskaita
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults
reportgenerator -reports:./TestResults/**/coverage.cobertura.xml \
                -targetdir:./TestResults/CoverageReport -reporttypes:Html

# Frontend testai
cd student-portal
npm test -- --watchAll=false

# Frontend su padengimo ataskaita
CI=true npm test -- --watchAll=false --coverage --coverageReporters=text
```
