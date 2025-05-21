[← Grįžti į dokumentacijos pradžią](../README.md)

# Studentų Informacinės Sistemos Pristatymas

## Turinys
1. [Sistemos aprašymas](#sistemos-aprašymas)
2. [Sistemos architektūra](#sistemos-architektūra)
3. [Naudotos technologijos](#naudotos-technologijos)
4. [Sistemos funkcionalumas](#sistemos-funkcionalumas)
5. [Duomenų modelis](#duomenų-modelis)
6. [API sąsaja](#api-sąsaja)
7. [Vartotojo sąsaja](#vartotojo-sąsaja)
8. [Autentifikacija ir autorizacija](#autentifikacija-ir-autorizacija)
9. [Sistemos diegimas](#sistemos-diegimas)
10. [Sistemos testavimas](#sistemos-testavimas)
11. [Išvados ir pasiūlymai](#išvados-ir-pasiūlymai)

## Sistemos aprašymas

Studentų informacinė sistema (StudentPortal) – tai išsami švietimo valdymo sistema, sukurta palengvinti studentų, dėstytojų ir administratorių bendravimą. Sistema leidžia efektyviai valdyti vartotojų profilius, peržiūrėti ir atnaujinti akademinius įrašus, planuoti užsiėmimus ir atlikti administracines operacijas.

Pagrindinės sistemos funkcijos:
- Vartotojų autentifikacija su rolėmis pagrįsta prieigos kontrole
- Studentų valdymo panelė su pažymiais, tvarkaraščiais ir asmenine informacija
- Dėstytojų sąsaja studentams ir pažymiams valdyti
- Administratoriaus skydelis vartotojų valdymui ir sistemos nustatymams
- Profilių valdymas visiems vartotojams
- Tvarkaraščių valdymas studentams ir dėstytojams
- Pažymių sekimas ir ataskaitos

Šis projektas sukurtas naudojant modernias technologijas, apimančias tiek kliento, tiek serverio pusės programavimą, ir įgyvendina geriausias praktikas saugiam ir efektyviam duomenų valdymui.

## Sistemos architektūra

Studentų informacinė sistema naudoja kliento-serverio architektūrą, susidedančią iš trijų pagrindinių komponentų:

1. **Front-End dalis**: React pagrindu sukurta vieno puslapio aplikacija (SPA), kuri pateikia vartotojo sąsają
2. **Back-End dalis**: .NET Core API, kuri tvarko duomenų apdorojimą, verslo logiką ir duomenų bazės operacijas
3. **Duomenų bazė**: SQL Server duomenų bazė, kurioje saugomi vartotojų, akademiniai ir sistemos duomenys

### Architektūros diagrama

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React          │     │  .NET Core API  │     │   SQL Server    │
│  Front-End      │◄────►  Back-End       │◄────►   Duomenų bazė  │
│  (SPA)          │     │  Servisai       │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Naudotos technologijos

### Front-End technologijos
- **React 19**: JavaScript biblioteka vartotojo sąsajos kūrimui
- **React Router 7**: Navigacijai ir maršrutizavimui
- **Axios**: HTTP užklausoms į back-end API
- **Tailwind CSS**: Komponentų stilizavimui
- **Context API**: Būsenos valdymui

### Back-End technologijos
- **.NET 8**: Web API karkasas
- **Entity Framework Core 9**: ORM duomenų bazės operacijoms
- **SQL Server**: Reliacinė duomenų bazė
- **JWT Authentication**: Saugioms vartotojų sesijoms
- **BCrypt**: Slaptažodžių šifravimui
- **Swagger**: API dokumentacijai

## Sistemos funkcionalumas

### Vartotojų rolės ir galimybės

#### Studentas
- Peržiūrėti savo pažymius pagal dalykus
- Peržiūrėti savo tvarkaraštį
- Valdyti asmeninę informaciją
- Keisti prisijungimo duomenis

#### Dėstytojas
- Peržiūrėti ir redaguoti studentų pažymius
- Valdyti savo tvarkaraštį
- Peržiūrėti studentų informaciją
- Generuoti pažymių ataskaitas

#### Administratorius
- Valdyti visus sistemos vartotojus (sukurti, redaguoti, šalinti)
- Peržiūrėti sistemos statistiką
- Keisti sistemos nustatymus
- Atkurti vartotojų slaptažodžius

### Pagrindinės funkcijos

1. **Autentifikacija ir autorizacija**
   - Saugus prisijungimas naudojant JWT tokenus
   - Rolėmis pagrįsta prieigos kontrolė
   - Slaptažodžių šifravimas ir saugojimas

2. **Studentų valdymas**
   - Studentų informacijos saugojimas ir atnaujinimas
   - Akademinių duomenų sekimas
   - Asmeninės informacijos valdymas

3. **Pažymių sistema**
   - Pažymių įvedimas ir koregavimas
   - Pažymių vidurkių skaičiavimas
   - Pažymių istorijos sekimas

4. **Tvarkaraščiai**
   - Savaitinių tvarkaraščių peržiūra
   - Užsiėmimų planavimas
   - Užsiėmimų vietos ir laiko valdymas

5. **Profilių valdymas**
   - Asmeninės informacijos atnaujinimas
   - Slaptažodžių keitimas
   - Kontaktinės informacijos valdymas

## Duomenų modelis

Sistema naudoja reliacinį duomenų modelį, kuris apima tokias pagrindines esybes:

### User (Vartotojas)
- Id (int)
- Email (string)
- PasswordHash (string)
- Role (string)
- CreatedAt (DateTime)
- LastLogin (DateTime)

### Student (Studentas)
- Id (int)
- UserId (int) - ryšys su User lentele
- FirstName (string)
- LastName (string)
- StudentNumber (string)
- EnrollmentDate (DateTime)
- Faculty (string)
- Program (string)

### Teacher (Dėstytojas)
- Id (int)
- UserId (int) - ryšys su User lentele
- FirstName (string)
- LastName (string)
- Department (string)
- Position (string)

### Grade (Pažymys)
- Id (int)
- StudentId (int) - ryšys su Student lentele
- Subject (string)
- Score (decimal)
- MaxScore (decimal)
- GradeType (string)
- Semester (string)
- Date (DateTime)
- Comments (string)

### Schedule (Tvarkaraštis)
- Id (int)
- StudentId (int) - ryšys su Student lentele (arba TeacherId)
- Subject (string)
- StartTime (DateTime)
- EndTime (DateTime)
- DayOfWeek (int)
- Room (string)
- Semester (string)
- IsActive (bool)

## API sąsaja

### Autentifikacija

- **POST /api/auth/login**
  - Autentifikuoja vartotojus ir grąžina JWT tokeną
  - Parametrai: `email`, `password`

- **POST /api/auth/register**
  - Registruoja naujus vartotojus
  - Parametrai: `name`, `email`, `password`, `role`

### Vartotojai

- **GET /api/users**
  - Grąžina visus vartotojus (tik administratoriui)

- **GET /api/users/{id}**
  - Grąžina konkretaus vartotojo informaciją

- **PUT /api/users/{id}**
  - Atnaujina vartotojo informaciją
  - Parametrai: `email`, `currentPassword`, `newPassword`

- **DELETE /api/users/{id}**
  - Ištrina vartotoją (tik administratoriui)

### Studentai

- **GET /api/students**
  - Grąžina visus studentus

- **GET /api/students/{id}**
  - Grąžina konkretaus studento informaciją

- **POST /api/students**
  - Sukuria naują studento įrašą

- **PUT /api/students/{id}**
  - Atnaujina studento informaciją

### Pažymiai

- **GET /api/grades/{studentId}**
  - Grąžina konkretaus studento pažymius

- **POST /api/grades**
  - Sukuria naują pažymį
  - Parametrai: `studentId`, `subject`, `score`, `maxScore`, `gradeType`, `semester`, `date`, `comments`

- **PUT /api/grades/{id}**
  - Atnaujina esamą pažymį

- **DELETE /api/grades/{id}**
  - Pašalina pažymį

### Tvarkaraščiai

- **GET /api/schedules/{studentId}**
  - Grąžina konkretaus studento tvarkaraštį

- **POST /api/schedules**
  - Sukuria naują tvarkaraščio įrašą
  - Parametrai: `studentId`, `subject`, `startTime`, `endTime`, `dayOfWeek`, `room`, `semester`, `isActive`

- **PUT /api/schedules/{id}**
  - Atnaujina esamą tvarkaraščio įrašą

- **DELETE /api/schedules/{id}**
  - Pašalina tvarkaraščio įrašą

## Vartotojo sąsaja

Front-end dalis sukurta naudojant React ir pateikia intuityvią vartotojo sąsają su šiais pagrindiniais puslapiais:

### Pagrindiniai puslapiai

1. **Prisijungimo puslapis**
   - Formos validacija
   - Klaidų apdorojimas
   - Nukreipimas į prisijungusio vartotojo atitinkamą puslapį

2. **Valdymo skydelis (Dashboard)**
   - Personalizuota statistika ir greitos prieigos nuorodos
   - Konkrečios rolės turinys studentams, dėstytojams ir administratoriams
   - Pranešimai ir naujausia veikla

3. **Studento puslapis**
   - Pažymiai, suskirstyti pagal dalykus
   - Studento informacija
   - Klasių tvarkaraščiai

4. **Dėstytojo puslapis**
   - Sąsaja studentams ir pažymiams valdyti
   - Pažymių įvedimo ir valdymo funkcionalumas
   - Studentų rezultatų apžvalga

5. **Administratoriaus puslapis**
   - Vartotojų valdymas (pridėti, redaguoti, šalinti vartotojus)
   - Sistemos statistika ir nustatymai
   - Veiklos registravimas
   - Slaptažodžių atstatymo funkcionalumas

6. **Profilio puslapis**
   - Asmeninės informacijos rodymas
   - El. pašto atnaujinimo funkcionalumas
   - Slaptažodžio valdymas
   - Vartotojo nustatymai

### Pagrindiniai komponentai

1. **ScheduleManager**
   - Savaitinio tvarkaraščio rodymas
   - Tvarkaraščio įrašų pridėjimas/redagavimas/trynimas
   - Dienos ir laiko organizavimas

2. **Navbar**
   - Navigacija tarp puslapių
   - Vartotojo autentifikacijos būsena
   - Rolėms pritaikytos navigacijos parinktys

3. **GradeTable**
   - Pažymių rodymas lentelės formatu
   - Filtravimas ir rūšiavimas
   - Pažymių įvedimo forma (dėstytojams)

## Autentifikacija ir autorizacija

Sistema naudoja JWT (JSON Web Tokens) saugiam vartotojų sesijų valdymui:

### Prisijungimo srautas:
1. Vartotojas pateikia prisijungimo duomenis per Login.js
2. Back-end autentifikuoja ir grąžina JWT tokeną
3. Tokenas saugomas localStorage kartu su vartotojo informacija
4. AuthContext atnaujinamas su vartotojo būsena

### Autentifikacijos būsena:
1. AuthContext.js palaiko globalią autentifikacijos būseną
2. Komponentai gali pasiekti vartotojo informaciją ir autentifikacijos būseną
3. Apsaugoti maršrutai nukreipia neautentifikuotus vartotojus į prisijungimo puslapį

### Tokenų valdymas:
1. Automatinis tokeno įtraukimas į API užklausas
2. Rolėmis pagrįsta prieigos kontrolė naudojant tokeno teiginius
3. Tokeno galiojimo laiko valdymas

## Sistemos diegimas

### Reikalavimai
- [Node.js](https://nodejs.org/) (v18 ar naujesnė)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (arba SQL Server Express)
- Pasirinkta IDE (Visual Studio, VS Code, kt.)

### Back-end diegimas
1. Naviguokite į API projekto direktoriją:
   ```
   cd StudentPortal.API
   ```

2. Sukurkite konfigūracijos failus:
   - Nukopijuokite appsettings.template.json į appsettings.json
   - Nukopijuokite secrets.json.example į secrets.json (arba naudokite dotnet user-secrets)
   - Atnaujinkite duomenų bazės prisijungimo eilutę ir JWT nustatymus abiejuose failuose

3. Pritaikykite duomenų bazės migracijas:
   ```
   dotnet ef database update
   ```

4. Paleiskite API:
   ```
   dotnet run
   ```
   API bus pasiekiama adresu https://localhost:7001 (HTTPS) arba http://localhost:5155 (HTTP)

### Front-end diegimas
1. Naviguokite į front-end projekto direktoriją:
   ```
   cd student-portal
   ```

2. Sukurkite aplinkos konfigūraciją:
   ```
   cp .env.example .env
   ```
   Tada atnaujinkite reikšmes `.env` faile pagal poreikį.

3. Įdiekite priklausomybes:
   ```
   npm install
   ```

4. Paleiskite kūrimo serverį:
   ```
   npm start
   ```
   Programa bus pasiekiama adresu http://localhost:3000

### Paruošimas gamybai
1. Back-end:
   ```
   cd StudentPortal.API
   dotnet publish -c Release
   ```

2. Front-end:
   ```
   cd student-portal
   npm run build
   ```

## Sistemos testavimas

Projekto testavimas buvo atliekamas šiais lygmenimis:

### Vienetų testavimas
- Back-end API endpointų testavimas naudojant xUnit
- Front-end komponentų testavimas naudojant Jest

### Integracinis testavimas
- API sluoksnio testavimas su duomenų baze
- Front-end ir back-end integracijos testavimas

### Vartotojo sąsajos testavimas
- Rankinis vartotojo sąsajos testavimas
- Responsvyumo testavimas skirtinguose įrenginiuose
- Prieinamumo testavimas

### Saugumo testavimas
- JWT autentifikacijos testavimas
- Rolėmis pagrįstos prieigos kontrolės testavimas
- Slaptažodžių šifravimo testavimas

## Išvados ir pasiūlymai

Šiame projekte buvo sėkmingai sukurta studentų informacinė sistema, kuri leidžia efektyviai valdyti studentų duomenis, pažymius ir tvarkaraščius. Projektas įgyvendina modernias technologijas tiek front-end, tiek back-end dalyse, užtikrinant saugų ir efektyvų darbą su sistema.

### Projekto pasiekimai
- Sukurta intuityvi vartotojo sąsaja su React
- Įgyvendinta saugi autentifikacija su JWT
- Realizuota rolėmis pagrįsta prieigos kontrolė
- Sukurta išsami API sąsaja duomenų valdymui
- Įgyvendintas efektyvus duomenų bazės modelis

### Ateities pasiūlymai
- Implementuoti realaus laiko pranešimų sistemą naudojant SignalR
- Pridėti mobilią aplikaciją, naudojant React Native
- Išplėsti ataskaitų generavimo galimybes
- Pridėti failų įkėlimo ir dalinimsosi funkcionalumą
- Įgyvendinti lokalizacijos palaikymą kelioms kalboms

### Iššūkiai ir sprendimai
- **Iššūkis**: Saugus autentifikacijos ir autorizacijos užtikrinimas
  **Sprendimas**: JWT tokenų implementavimas su rolėmis pagrįsta prieigos kontrole

- **Iššūkis**: Efektyvus duomenų valdymas didelėje sistemoje
  **Sprendimas**: ORM naudojimas su gerai suprojektuotu duomenų modeliu

- **Iššūkis**: Vartotojo sąsajos našumas ir responsvyumas
  **Sprendimas**: Efektyvios React komponentų struktūros naudojimas, būsenos valdymas su Context API

Šis projektas demonstruoja modernios studentų informacinės sistemos kūrimo metodiką, naudojant šiuolaikines technologijas ir geriausias praktikas. Sistema suteikia tvirtą pagrindą tolesniam vystymui ir plėtrai, siekiant patenkinti augančius švietimo įstaigų poreikius. 