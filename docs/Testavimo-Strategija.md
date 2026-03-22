# Testavimo Strategija – StudentPortal

## Turinys

1. [Strategijos tipas ir pagrindimas](#1-strategijos-tipas-ir-pagrindimas)
2. [Testavimo lygiai](#2-testavimo-lygiai)
3. [Testavimo tipai](#3-testavimo-tipai)
4. [Testavimo technikos](#4-testavimo-technikos)
5. [Prioritetai pagal riziką](#5-prioritetai-pagal-riziką)
6. [Įeinimo ir išeinimo kriterijai](#6-įeinimo-ir-išeinimo-kriterijai)
7. [Testavimo aplinka](#7-testavimo-aplinka)
8. [Defektų valdymas](#8-defektų-valdymas)

---

## 1. Strategijos tipas ir pagrindimas

### Pasirinkta strategija: Rizika pagrįstas + Shift-Left testavimas

**Rizika pagrįstas testavimas (Risk-Based Testing):**
Testavimo ištekliai paskirstomi pagal modulių žlugimo tikimybę ir verslo poveikio dydį. Aukščiausias prioritetas skiriamas autentifikacijos ir duomenų tiklumo moduliams, nes jų klaidos tiesiogiai veikia kliento SLA ir BDAR atitiktį.

**Shift-Left testavimas:**
Testavimas integruojamas kuo anksčiau kūrimo proceso metu – ne tik po kūrimo, bet kiekviename sprintе:
- Vienetų testai rašomi kartu su kodu (arba iš anksto – TDD "test driven development" principas)
- PR merge'as blokuojamas, kol testai praeina
- CI pipeline vykdo testus automatiškai su kiekvienu commit'u

### Pagrindimas

| Priežastis | Detalės |
|---|---|
| **SLA įsipareigojimai** | Produkcijos defektai generuoja finansines kompensacijas – ankstyvas aptikimas mažina riziką |
| **BDAR atitiktis** | Duomenų privatumo klaidos turi teisinių pasekmių – saugumo testavimas privalomas |
| **Mišri komanda** | Junior/Mid/Senior lygiai – standarizuota metodologija (AAA "Arrange, Act, Assert") leidžia visiems efektyviai prisidėti |
| **Agile/Scrum** | 2 savaičių sprintai reikalauja greito testavimo ciklo – automatizacija yra būtinybė |
| **CI/CD pipeline** | Automatiniai testai yra vartai į produkcijos aplinkos deployment'ą |

---

## 2. Testavimo lygiai

### 2.1. Vienetų testavimas (Unit Testing)

**Tikslas:** Tikrinti atskiras klases ir metodus izoliuotoje aplinkoje, be išorinių priklausomybių.
**Atsakingas:** Junior ir Mid dev'ai (su Senior peržiūra)
**Vykdymas:** Lokaliai prieš kiekvieną commit; automatiškai CI pipeline metu

| Sritis | Įrankiai | Testų skaičius |
|---|---|---|
| Backend kontroleriai | xUnit + Moq + EF Core InMemory | 36 |
| Frontend API funkcijos | Jest + jest.mock(axios) + jest.mock(jwt-decode) | 36 |
| Frontend komponentai | Jest + React Testing Library | 20 |
| **Viso vienetų testų** | | **92** |

**Izoliacija:**
- **Backend:** kiekvienas testas naudoja atskirą InMemory duomenų bazę su `Guid.NewGuid()` pavadinimu – jokios būsenos dalijimosi tarp testų
- **Frontend:** `jest.clearAllMocks()` ir `localStorage.clear()` prieš kiekvieną testą – švari pradinė būsena

**Aprėpiami moduliai:**
- `AuthController` – registracija, prisijungimas, JWT generavimas, BCrypt
- `GradesController` – CRUD operacijos, Score validacija, klaidų scenarijai
- `ScheduleController` – CRUD operacijos, filtravimas pagal studentą/semestrą/dieną
- `auth.js` – token valdymo funkcijos (login, logout, getToken, getUserRole)
- `student.js` – student API funkcijos (getGrades, getSchedule, addSchedule, updateGrade, deleteGrade)
- `Login.js` komponentas – renderavimas, įvestis, sėkmė, klaidos
- `Register.js` komponentas – formos validacija, payload tikrinimas

### 2.2. Integracinis testavimas (Integration Testing)

**Tikslas:** Tikrinti kelių komponentų sąveiką naudojant bendrą duomenų bazę; validuoti duomenų srautus tarp kontrolerių.
**Atsakingas:** Mid Dev (su Senior konsultacija)

| Scenarijus | Tikrinamas aspektas |
|---|---|
| Sukurti kelis pažymius -> gauti sąrašą | Visi sukurti įrašai grąžinami |
| Sukurti -> redaguoti -> gauti | Pakeitimai išlieka, GET grąžina naujus duomenis |
| Sukurti du objektus -> ištrinti vieną -> patikrinti kitą | DELETE operacija neveikia kitų įrašų |
| Filtravimas pagal studentą | Grąžinami tik konkretaus studento įrašai |
| Filtravimas pagal semestrą | Grąžinami tik konkretaus semestro įrašai |
| Filtravimas pagal savaitės dieną | Tvarkaraštis filtruojamas teisingai |

**Iš viso integracinių testų: 9**

### 2.3. Manualinis testavimas (Manual Testing)

**Tikslas:** Tikrinti sistemos elgesį vartotojo perspektyvos požiūriu; aptikti UI/UX problemas, verslo logikos nukrypimus ir scenarijus, kurių automatizuoti neefektyvu.
**Atsakingas:** Junior Dev (su Mid peržiūra)
**Vykdymas:** Kiekvieno sprintо pabaigoje, prieš release'ą

| Modulis | Test Case'ų skaičius |
|---|---|
| Autentifikacija – teigiami scenarijai | 3 |
| Autentifikacija – neigiami scenarijai | 4 |
| Pažymių valdymas | 6 |
| Tvarkaraščių valdymas | 5 |
| Vartotojų valdymas | 4 |
| Profilio valdymas | 4 |
| **Viso** | **26** |

### 2.4. Regresiniai testai (Regression Testing)

**Tikslas:** Užtikrinti, kad nauj pakeitimai nesugadino veikiančio funkcionalumo.
**Vykdymas:** Automatiškai – kiekvienas CI pipeline vykdymas; rankiniu – prieš kiekvieną release'ą

```
Kūrėjas -> git push -> GitHub Actions ->
    dotnet test (45 testai) +
    npm test (56 testai) ->
    Padengimo ataskaita ->
    PR gali būti merge'intas Y / N
```

---

## 3. Testavimo tipai

### 3.1. Funkcinis testavimas

Tikrinama, ar sistema atlieka tai, ką apibrėžia funkciniai reikalavimai (FR-01 – FR-05):

| Reikalavimas | Tikrinamos funkcijos | Testų tipas |
|---|---|---|
| FR-01: Autentifikacija | Prisijungimas, JWT, 401 klaidos | Automatinis + Manualinis |
| FR-02: Registracija | Naujas vartotojas, dublikatų tikrinimas | Automatinis + Manualinis |
| FR-03: Pažymiai | CRUD, Score validacija (0..MaxScore) | Automatinis + Manualinis |
| FR-04: Tvarkaraščiai | CRUD, filtravimas | Automatinis + Manualinis |
| FR-05: Vartotojų valdymas | Admin funkcijos, profilio keitimas | Manualinis |

### 3.2. Saugumo testavimas

Vykdoma pagal **OWASP Top 10** rekomendacijas:

| Tikrinama savybė | Metodas | Atsakomybė |
|---|---|---|
| JWT autentifikacija | Tikrinama, kad API atsako 401 be tokeno | Senior Dev (automatinis) |
| BCrypt slaptažodžiai | Tikrinama, kad DB nesaugomi aiškūs slaptažodžiai | Mid Dev (automatinis) |
| SQL injection apsauga | EF Core ORM – parametrizuotos užklausos | Senior Dev (code review) |
| Rolių atskyrimas | Student negali atlikti Teacher/Admin veiksmų | Manualinis + automatinis |
| CORS politika | Tik leidžiami origin'ai | Senior Dev (konfigūracija) |
| Sesijos valdymas | Token ištrinamas po logout | Junior Dev (automatinis) |

### 3.3. Duomenų validacijos testavimas

| Validavimo taisyklė | Testavimo metodas |
|---|---|
| Score tarp [0, MaxScore] | `GradesControllerTests` – ribinių reikšmių testai: 0, MaxScore, -1, MaxScore+1 |
| El. paštas unikalus | `AuthControllerTests` – 400 Bad Request dublikato atvejui |
| Privalomi laukai (Subject, Semester) | `GradesControllerTests`, `ScheduleControllerTests` |
| Slaptažodis privalomas registracijos metu | `AuthControllerTests` |

### 3.4. Klaidų apdorojimo testavimas

| Klaidos scenarijus | Tikėtinas HTTP kodas | Testas |
|---|---|---|
| Prisijungimas su neteisingais duomenimis | 401 Unauthorized | TC-004, `AuthControllerTests` |
| Pažymys su neegzistuojančiu ID | 404 Not Found | `GradesControllerTests` |
| Registracija su esamu el. paštu | 400 Bad Request | TC-006, `AuthControllerTests` |
| Tvarkaraštis su neegzistuojančiu ID | 404 Not Found | `ScheduleControllerTests` |
| Pažymys be privalomų laukų | 400 Bad Request | `GradesControllerTests` |

---

## 4. Testavimo technikos

### 4.1. Juodos dėžės technikos (Black-Box)

| Technika | Taikymo sritis | Pavyzdys |
|---|---|---|
| **Ekvivalenčių klasių dalijimas** | Score reikšmės | Galiojanti klasė: 0–100; Negaliojanti: <0, >100 |
| **Ribinių reikšmių analizė** | Score laukas | Tikrinamos reikšmės: -1, 0, 50, 100, 101 |
| **Sprendimų lentelė** | Prisijungimo scenarijai | Teisingas/neteisingas el. paštas × slaptažodis kombinacijos |
| **Klaidų spėjimas** | Visi moduliai | Tušti laukai, SQL simboliai, labai ilgos įvestys, specialūs simboliai |
| **Scenarijų testavimas** | Manualinis | Pilnas vartotojo darbo srautas nuo prisijungimo iki logout |

### 4.2. Baltosios dėžės technikos (White-Box)

| Technika | Įrankis | Metrika |
|---|---|---|
| **Sakinių padengimas** | Coverlet (backend) | Eilučių padengimas % |
| **Šakų padengimas** | Jest `--coverage` (frontend) | Branch padengimas % |
| **Metodų padengimas** | Coverlet | Metodų padengimas % |

### 4.3. Patirties pagrįstos technikos

| Technika | Kas taiko | Kontekstas |
|---|---|---|
| **Klaidų spėjimas** | Senior Dev | OWASP Top 10; praeities incidentų patirtis |
| **Kontrolinis sąrašas** | Junior Dev | 26 manualinių TC sąrašas |
| **Tyrinėjamasis testavimas** | Mid Dev | Naujos funkcionalumo srities pirmas testavimas |

---

## 5. Prioritetai pagal riziką

### Rizikos matrica (Likelihood x Impact)

|  | **Žemas poveikis** | **Vidutinis poveikis** | **Aukštas poveikis** | **Kritinis poveikis** |
|---|---|---|---|---|
| **Aukšta tikimybė** | | | R-05 | R-03 |
| **Vidutinė tikimybė** | | R-06 | R-08, R-10 | |
| **Žema tikimybė** | | | | R-01, R-02, R-04, R-07, R-09 |

### Testavimo prioritetų eilė

| Prioritetas | Modulis / Komponentas | Testavimo tipas | Atsakingas | Pagrindimas |
|---|---|---|---|---|
| **P1 – Kritinis** | Autentifikacija (login, register, JWT) | Automatinis + Manualinis | Senior | SLA + BDAR kritinis |
| **P1 – Kritinis** | Pažymių CRUD + validacija | Automatinis + Manualinis | Mid | Verslo duomenų tikslumas |
| **P2 – Aukštas** | Tvarkaraščių CRUD + filtravimas | Automatinis + Manualinis | Mid | Svarbus vartotojų darbo srautas |
| **P2 – Aukštas** | Rolių prieigos kontrolė | Automatinis + Manualinis | Senior | Saugumo reikalavimas |
| **P3 – Vidutinis** | Vartotojų valdymas (admin) | Manualinis | Junior | Retai naudojama funkcija |
| **P3 – Vidutinis** | Profilio valdymas | Manualinis | Junior | Vizualinis, nėra kritinės logikos |

---

## 6. Įėjimo ir išėjimo kriterijai

### 6.1. Įėjimo kriterijai (Entry Criteria)

Testavimas pradedamas, kai:
- [ ] Kūrimo aplinka sukonfigūruota (Backend + Frontend veikia)
- [ ] CI/CD pipeline sukonfigūruotas (GitHub Actions)
- [ ] Duomenų bazė inicializuota seed duomenimis
- [ ] Visi testavimo įrankiai įdiegti ir sukonfigūruoti
- [ ] Sintetiniai testavimo duomenys paruošti (BDAR atitiktis)
- [ ] Testuojamas funkcionalumas pažymėtas kaip "Ready for Testing" Jira/GitHub Projects

### 6.2. Išėjimo kriterijai (Exit Criteria)

Sprint'o testavimas laikomas užbaigtu, kai:
- [ ] 100% automatinių testų praeina (45/45 backend, 56/56 frontend)
- [ ] Visi 26 manualiniai test case'ai įvykdyti ir dokumentuoti
- [ ] Aktyvių kontrolerių kodo padengimas ≥ 80%
- [ ] **0 P1 defektų** atviri
- [ ] Visi P2 defektai turį patvirtintą sprendimo planą
- [ ] Kodo padengimo ataskaita sugeneruota ir peržiūrėta

### 6.3. Sustabdymo kriterijai (Suspension Criteria)

Testavimas sustabdomas, jei:
- Kritinis P1 defektas neleidžia vykdyti kitų testų (pvz., prisijungimas neveikia)
- CI/CD pipeline sugenda ir testai negali būti vykdomi
- Kūrimo aplinka nepasiekiama

### 6.4. Pratęsimo kriterijai (Resumption Criteria)

Testavimas atnaujinamas, kai:
- Sustabdymo priežastis pašalinta ir patvirtinta
- Atliktas naujo fix deployment'as į testavimo aplinką

---

## 7. Testavimo aplinka

### 7.1. Aplinkų hierarchija

```
Local (kūrėjo kompiuteris)
    ↓ git push → PR
CI Pipeline (GitHub Actions)
    ↓ merged → develop
Staging (identiškas production) [planuojamas]
    ↓ release branch
Production (klientų aplinka)
```

### 7.2. Konfigūracijos

| Aplinka | OS | Backend | Frontend | DB | Testai |
|---|---|---|---|---|---|
| **Local** | Windows 11 | .NET 8 localhost:5000 | Node 18 localhost:3000 | SQL LocalDB | Rankinis + automatinis |
| **CI** | Ubuntu (GitHub Actions) | Docker container | Docker container | SQL Server container | Automatinis (xUnit + Jest) |
| **Staging** | Docker (planuojama) | Docker Compose | Docker Compose | SQL Server | Regresiniai + Manualinis |
| **Production** | Docker | Docker Compose | Docker Compose | SQL Server | Monitoringas |

### 7.3. Sintetiniai testavimo duomenys

| Vartotojo tipas | El. paštas | Rolė | Naudojama |
|---|---|---|---|
| Testavimo studentas | test.student@portal.dev | Student | Automatinis + Manualinis |
| Testavimo dėstytojas | test.teacher@portal.dev | Teacher | Manualinis |
| Testavimo admin | test.admin@portal.dev | Admin | Manualinis |


---

## 8. Defektų valdymas

### 8.1. Defektų klasifikacija

| Prioritetas | Aprašymas | Atsakomybė | SLA (atsakymas) |
|---|---|---|---|
| **P1 – Kritinis** | Pagrindinė funkcija neveikia; duomenų praradimas ar saugumo pažeidimas | Senior Dev | fix tą pačią dieną |
| **P2 – Aukštas** | Svarbi funkcija sutrikusi; apėjimas egzistuoja | Mid Dev | Kitas sprint'as |
| **P3 – Vidutinis** | Funkcija veikia iš dalies; vartotojas gali dirbti | Junior Dev | Artimiausi 2 sprintai |
| **P4 – Žemas** | Kosmetinė klaida; nėra funkcinės įtakos | Junior Dev | Backlog |

### 8.2. Defektų sekimas

Defektai valdomi **GitHub Issues** sistemoje su šabloniniais laukais:

```markdown
**Defekto ID:** BUG-XXX
**Prioritetas:** P1 / P2 / P3 / P4
**Aplinka:** Local / CI / Staging / Prod
**Žingsniai atkartoti:**
1. ...
**Tikėtinas rezultatas:** ...
**Faktinis rezultatas:** ...
**Priedai:** Screenshot / Logs
```

### 8.3. Defektų gyvavimo ciklas

```
New -> Triaged -> Assigned -> In Progress -> Fixed -> Verified -> Closed
                                              ↓
                                        Reopened (jei fix neveikia)
```

### 8.4. Eskalavimo tvarka

| Situacija | Veiksmas |
|---|---|
| P1 defektas prod aplinkoje | Nedelsiant informuoti Tech Lead ir PM |
| P1 defektas blokuoja release | Release atidedamas kol defektas išspręstas |
| P2 defektas nesprendžiamas >1 sprint | Eskaluoti į Tech Lead |
| Defektų tendencija konkrečiame modulyje | Senior atlieka papildomą kodo peržiūrą |
