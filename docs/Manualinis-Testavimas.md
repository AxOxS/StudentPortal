# StudentPortal Manualinio Testavimo Dokumentacija

**Laboratorinio darbo užduotis:** Supažinti su "manualinio testavimo" procesu

**Data:** 2026-02-02

---

## Turinys
1. [Sistemos Reikalavimų Analizė](#1-sistemos-reikalavimų-analizė)
2. [Test Case Lentelės](#2-test-case-lentelės)
3. [Testavimo Atlikimo Aprašymas](#3-testavimo-atlikimo-aprašymas)
4. [Rezultatų Dokumentavimas](#4-rezultatų-dokumentavimas)

---

## 1. Sistemos Reikalavimų Analizė

### 1.1. Pagrindiniai Sistemos Reikalavimai

StudentPortal yra švietimo valdymo sistema, skirta studentų, dėstytojų ir administratorių bendravimui palengvinti. Sistema privalo užtikrinti:

#### Funkciniai Reikalavimai:

**FR-01: Autentifikacija ir Autorizacija**
- Sistema privalo leisti vartotojams prisijungti naudojant el. paštą ir slaptažodį
- Sistema privalo palaikyti tris vartotojų roles: Student, Teacher, Admin
- Sistema privalo generuoti JWT tokenus sėkmingam prisijungimui
- Sistema privalo šifruoti slaptažodžius naudojant BCrypt

**FR-02: Vartotojų Registracija**
- Sistema privalo leisti naujų vartotojų registraciją
- Sistema privalo validuoti el. pašto adreso unikalumą
- Sistemos studentų registracija privalo automatiškai sukurti Student įrašą

**FR-03: Pažymių Valdymas**
- Sistema privalo leisti dėstytojams pridėti naujus pažymius
- Sistema privalo leisti studentams peržiūrėti savo pažymius
- Sistema privalo saugoti pažymius su šiais laukais: Subject, Score, MaxScore, GradeType, Semester, Date, Comments
- Sistema privalo validuoti, kad Score būtų tarp 0 ir MaxScore

**FR-04: Tvarkaraščių Valdymas**
- Sistema privalo leisti kurti ir redaguoti tvarkaraščius
- Sistema privalo saugoti tvarkaraščio informaciją: Subject, StartTime, EndTime, DayOfWeek, Room, Semester
- Sistema privalo leisti studentams peržiūrėti savo tvarkaraščius

**FR-05: Vartotojų Valdymas**
- Sistema privalo leisti administratoriams peržiūrėti visus vartotojus
- Sistema privalo leisti administratoriams šalinti vartotojus
- Sistema privalo leisti vartotojams keisti savo profilį

#### Nefunkciniai Reikalavimai:

**NFR-01: Saugumas**
- Visos API operacijos (išskyrus login/register) privalo reikalauti JWT autentifikacijos
- Slaptažodžiai privalo būti hash'inami

**NFR-02: Duomenų Validacija**
- Visos formos privalo validuoti įvesties duomenis
- Sistema privalo grąžinti aiškius klaidų pranešimus

**NFR-03: Našumas**
- API atsakymai privalo būti grąžinami per < 2 sekundes

### 1.2. Sistemos Funkcionalumai

1. **Autentifikacijos modulis**
   - Prisijungimas (Login)
   - Registracija (Register)
   - Tokenų valdymas

2. **Pažymių modulis**
   - Pažymių peržiūra pagal studentą
   - Pažymių pridėjimas
   - Pažymių redagavimas
   - Pažymių šalinimas

3. **Tvarkaraščių modulis**
   - Tvarkaraščio peržiūra
   - Tvarkaraščio sukūrimas
   - Tvarkaraščio redagavimas
   - Tvarkaraščio šalinimas

4. **Vartotojų valdymo modulis**
   - Vartotojų sąrašo peržiūra (Admin)
   - Vartotojo profilio redagavimas
   - Vartotojo šalinimas (Admin)
   - Slaptažodžio keitimas

---

## 2. Test Case Lentelės

### 2.1. Autentifikacijos Modulio Test Cases (Positive)

#### TC-001: Sėkmingas prisijungimas su galiojančiais duomenimis

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-001 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Vartotojas prisijungia su galiojančiais el. paštu ir slaptažodžiu |
| **Prieš-sąlygos** | Vartotojas jau registruotas sistemoje |
| **Testavimo žingsniai** | 1. Atidaryti prisijungimo puslapį<br>2. Įvesti galiojantį el. paštą (student@test.com)<br>3. Įvesti teisingą slaptažodį (Student123!)<br>4. Paspausti "Login" mygtuką |
| **Laukiamas rezultatas** | - Sistema autentifikuoja vartotoją<br>- Grąžinamas JWT tokenas<br>- Vartotojas nukreipiamas į pagrindinį puslapį pagal rolę<br>- Vartotojo vardas matomas nustatymuose |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Testuoti su visomis trimis rolėmis: Student, Teacher, Admin |

---

#### TC-002: Sėkminga naujojo vartotojo registracija

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-002 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Naujas vartotojas registruojasi sistemoje |
| **Prieš-sąlygos** | El. paštas dar neregistruotas sistemoje |
| **Testavimo žingsniai** | 1. Atidaryti registracijos puslapį<br>2. Įvesti vardą ("Jonas Jonaitis")<br>3. Įvesti unikalų el. paštą (jonas@test.com)<br>4. Įvesti slaptažodį ("Test123!@#")<br>5. Pasirinkti rolę ("Student")<br>6. Paspausti "Register" mygtuką |
| **Laukiamas rezultatas** | - Vartotojas sėkmingai sukuriamas duomenų bazėje<br>- Slaptažodis hash'inamas BCrypt algoritmu<br>- Grąžinamas pranešimas "User registered successfully" |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti, kad Student įrašas sukurtas duomenų bazėje |

---

### 2.2. Autentifikacijos Modulio Test Cases (Negative)

#### TC-003: Prisijungimas su neteisingais duomenimis

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-003 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Vartotojas bando prisijungti su neteisingais duomenimis |
| **Prieš-sąlygos** | Nėra |
| **Testavimo žingsniai** | 1. Atidaryti prisijungimo puslapį<br>2. Įvesti el. paštą (student@test.com)<br>3. Įvesti neteisingą slaptažodį ("wrongpassword")<br>4. Paspausti "Login" mygtuką |
| **Laukiamas rezultatas** | - Sistema grąžina klaidą "Invalid email or password"<br>- HTTP status code: 401 Unauthorized<br>- JWT tokenas nėra generuojamas<br>- Vartotojas lieka prisijungimo puslapyje |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Svarbu, kad klaidos pranešimas nebūtų per detalus (saugumo sumetimais) |

---

#### TC-004: Registracija su jau egzistuojančiu el. paštu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-004 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Vartotojas bando registruotis su el. paštu, kuris jau egzistuoja sistemoje |
| **Prieš-sąlygos** | El. paštas student@test.com jau registruotas sistemoje |
| **Testavimo žingsniai** | 1. Atidaryti registracijos puslapį<br>2. Įvesti vardą<br>3. Įvesti jau egzistuojantį el. paštą (student@test.com)<br>4. Įvesti slaptažodį<br>5. Pasirinkti rolę<br>6. Paspausti "Register" mygtuką |
| **Laukiamas rezultatas** | - Sistema grąžina klaidą "Email already exists"<br>- HTTP status code: 400 Bad Request<br>- Naujas vartotojas nesukuriamas<br>- Forma lieka registracijos puslapyje |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Validacija turi būti atlikta prieš slaptažodžio hash'inimą |

---

#### TC-005: Registracija su netinkamu el. pašto formatu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-005 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Vartotojas bando registruotis su netinkamu el. pašto formatu |
| **Prieš-sąlygos** | Nėra |
| **Testavimo žingsniai** | 1. Atidaryti registracijos puslapį<br>2. Įvesti vardą<br>3. Įvesti netinkamą el. paštą (pvz., "invalid-email" arba "test@" arba "@test.com")<br>4. Įvesti slaptažodį<br>5. Pasirinkti rolę<br>6. Paspausti "Register" mygtuką |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- Vartotojas nesukuriamas<br>- Klaidų pranešimas nurodo el. pašto formato problemą |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Testuoti su įvairiais netinkamais formatais |

---

#### TC-006: Prisijungimas su tuščiais laukais

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-006 |
| **Modulis** | Autentifikacija |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Vartotojas bando prisijungti neužpildęs visų privalomų laukų |
| **Prieš-sąlygos** | Nėra |
| **Testavimo žingsniai** | 1. Atidaryti prisijungimo puslapį<br>2. Palikti el. pašto lauką tuščią<br>3. Palikti slaptažodžio lauką tuščią<br>4. Paspausti "Login" mygtuką |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- Nurodomos klaidos apie tuščius laukus<br>- JWT tokenas negeneruojamas<br>- Prisijungimas neįvyksta |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Testuoti atskirai: 1) tuščias el. paštas, 2) tuščias slaptažodis, 3) abu tuščia |

---

### 2.3. Pažymių Modulio Test Cases (Positive)

#### TC-007: Sėkmingas pažymio pridėjimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-007 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Dėstytojas prideda naują pažymį studentui |
| **Prieš-sąlygos** | - Vartotojas prisijungęs su Teacher role<br>- Studentas egzistuoja sistemoje |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Eiti į pažymių valdymo puslapį<br>3. Pasirinkti studentą<br>4. Įvesti dalyką ("Matematika")<br>5. Įvesti balą (85)<br>6. Įvesti maksimalų balą (100)<br>7. Pasirinkti pažymio tipą ("Exam")<br>8. Įvesti semestrą ("2024 Ruduo")<br>9. Pridėti komentarą ("Puikiai išsprendė visas užduotis")<br>10. Paspausti "Add Grade" |
| **Laukiamas rezultatas** | - Pažymys sėkmingai išsaugomas duomenų bazėje<br>- HTTP status code: 201 Created<br>- Grąžinamas sukurtas pažymio objektas su ID<br>- Pažymys matomas studento pažymių sąraše |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti visus GradeType tipus: Homework, Quiz, Exam, Project, Participation, FinalExam |

---

#### TC-008: Pažymių sąrašo peržiūra pagal studentą

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-008 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Studentas peržiūri savo pažymius |
| **Prieš-sąlygos** | - Vartotojas prisijungęs kaip Student<br>- Studentas turi bent vieną pažymį sistemoje |
| **Testavimo žingsniai** | 1. Prisijungti kaip studentas<br>2. Eiti į pažymių peržiūros puslapį<br>3. Peržiūrėti rodomą pažymių sąrašą |
| **Laukiamas rezultatas** | - Grąžinami tik prisijungusio studento pažymiai<br>- HTTP status code: 200 OK<br>- Rodomi visi pažymio laukai: Subject, Score, MaxScore, GradeType, Semester, Date, Comments<br>- Pažymiai gali būti filtruojami/rūšiuojami |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Užtikrinti, kad studentas mato TIK savo pažymius |

---

#### TC-009: Pažymio redagavimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-009 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Dėstytojas koreguoja jau egzistuojantį pažymį |
| **Prieš-sąlygos** | - Vartotojas prisijungęs kaip Teacher<br>- Pažymys egzistuoja sistemoje |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Eiti į pažymių valdymo puslapį<br>3. Pasirinkti pažymį redagavimui<br>4. Pakeisti balą (iš 85 į 90)<br>5. Atnaujinti komentarą<br>6. Paspausti "Update Grade" |
| **Laukiamas rezultatas** | - Pažymys sėkmingai atnaujinamas duomenų bazėje<br>- HTTP status code: 200 OK<br>- Grąžinamas atnaujintas pažymio objektas<br>- Pakeitimai matomi iš karto |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti, kad visi laukai gali būti redaguojami |

---

### 2.4. Pažymių Modulio Test Cases (Negative)

#### TC-010: Pažymio pridėjimas su balu > maksimaliu balu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-010 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Dėstytojas bando pridėti pažymį, kurio balas viršija maksimalų balą |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Teacher |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Bandyti pridėti pažymį su Score = 150 ir MaxScore = 100<br>3. Paspausti "Add Grade" |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- HTTP status code: 400 Bad Request<br>- Klaidos pranešimas: "Invalid score: 150. Score must be between 0 and 100"<br>- Pažymys nesukuriamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Validacija turi būti serverio pusėje |

---

#### TC-011: Pažymio pridėjimas su neigiamu balu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-011 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Dėstytojas bando pridėti pažymį su neigiamu balu |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Teacher |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Bandyti pridėti pažymį su Score = -10<br>3. Paspausti "Add Grade" |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- HTTP status code: 400 Bad Request<br>- Pažymys nesukuriamas<br>- Klaidos pranešimas nurodo, kad balas negali būti neigiamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti Range(0, 100) validaciją |

---

#### TC-012: Pažymio pridėjimas neegzistuojančiam studentui

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-012 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Dėstytojas bando pridėti pažymį studentui, kuris neegzistuoja sistemoje |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Teacher |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Bandyti pridėti pažymį neegzistuojančiam studentui<br>3. Užpildyti visus kitus laukus teisingai<br>4. Paspausti "Add Grade" |
| **Laukiamas rezultatas** | - Sistema neleidžia pasirinkti neegzistuojančio studento |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | |

---

#### TC-013: Pažymio pridėjimas su tuščiu dalyko pavadinimu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-013 |
| **Modulis** | Pažymiai |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Dėstytojas bando pridėti pažymį neužpildęs dalyko pavadinimo |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Teacher |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Bandyti pridėti pažymį su tuščiu Subject lauku<br>3. Užpildyti visus kitus laukus<br>4. Paspausti "Add Grade" |
| **Laukiamas rezultatas** | - Sistema grąžina klaidą "Please fill in all required fields"<br>- Pažymys nesukuriamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | [Required] anotacijos validacija |

---

### 2.5. Tvarkaraščių Modulio Test Cases (Positive)

#### TC-014: Sėkmingas tvarkaraščio įrašo pridėjimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-014 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Studentas prideda naują tvarkaraščio įrašą |
| **Prieš-sąlygos** | - Vartotojas prisijungęs kaip studentas |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Eiti į tvarkaraščio valdymo puslapį<br>3. Įvesti dalyką ("Programavimas")<br>4. Įvesti pradžios laiką (10:00)<br>5. Įvesti pabaigos laiką (11:30)<br>6. Pasirinkti savaitės dieną ("Monday")<br>7. Įvesti kabinetą ("A-205")<br>8. Įvesti semestrą ("2024 Pavasaris")<br>9. Paspausti "Add Schedule" |
| **Laukiamas rezultatas** | - Tvarkaraščio įrašas sėkmingai išsaugomas<br>- HTTP status code: 201 Created<br>- IsActive nustatyta į true pagal nutylėjimą<br>- Įrašas matomas studento tvarkaraštyje |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Testuoti visoms savaitės dienoms (Monday-Sunday) |

---

#### TC-015: Tvarkaraščio peržiūra pagal studentą

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-015 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Studentas peržiūri savo savaitės tvarkaraštį |
| **Prieš-sąlygos** | - Studentas prisijungęs<br>- Studentas turi bent vieną tvarkaraščio įrašą |
| **Testavimo žingsniai** | 1. Prisijungti kaip studentas<br>2. Eiti į tvarkaraščio puslapį<br>3. Peržiūrėti rodomą tvarkaraštį |
| **Laukiamas rezultatas** | - Grąžinami tik prisijungusio studento tvarkaraščio įrašai<br>- HTTP status code: 200 OK<br>- Rodomi visi laukai: Subject, StartTime, EndTime, DayOfWeek, Room, Semester<br>- Įrašai surūšiuoti pagal dieną ir laiką |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti, kad neaktyvūs rodomi kitaip (pablukusiai) |

---

#### TC-016: Tvarkaraščio įrašo redagavimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-016 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Student redaguoja egzistuojantį tvarkaraščio įrašą |
| **Prieš-sąlygos** | - Vartotojas prisijungęs kaip Student<br>- Tvarkaraščio įrašas egzistuoja |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Eiti į tvarkaraščio valdymo puslapį<br>3. Pasirinkti įrašą redagavimui<br>4. Pakeisti kabinetą (iš "A-205" į "B-101")<br>5. Pakeisti laiką<br>6. Paspausti "Update Schedule" |
| **Laukiamas rezultatas** | - Tvarkaraščio įrašas sėkmingai atnaujinamas<br>- HTTP status code: 200 OK<br>- Pakeitimai matomi iš karto<br>- Grąžinamas atnaujintas objektas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Užtikrinti, kad tik studentas gali redaguoti savo  tvarkaraštį |

---

### 2.6. Tvarkaraščių Modulio Test Cases (Negative)

#### TC-017: Tvarkaraščio pridėjimas su pabaigos laiku ankstesniu už pradžios laiką

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-017 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Bandoma pridėti tvarkaraščio įrašą, kur pabaigos laikas yra anksčiau nei pradžios laikas |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Student |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Bandyti pridėti tvarkaraščio įrašą su StartTime = 14:00 ir EndTime = 12:00<br>3. Užpildyti kitus laukus<br>4. Paspausti "Add Schedule" |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- Klaidos pranešimas nurodo laiko neatitikimą<br>- Įrašas nesukuriamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** |  |

---

#### TC-018: Tvarkaraščio pridėjimas, kai laikai kertasi

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-018 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Bandoma pridėti tvarkaraščio įrašą laikui, kurio metu jau vyksta paskaita |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Student <br> Vartotojas turi bent vieną tvarkaraščio įrašą |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Bandyti pridėti tvarkaraščio įrašą jau egzistuojančio dalyko laiku<br>3. Užpildyti visus kitus laukus teisingai<br>4. Paspausti "Add Schedule" |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- Tvarkaraščio įrašas nesukuriamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** |  |

---

#### TC-019: Tvarkaraščio pridėjimas su tuščiu dalyko pavadinimu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-019 |
| **Modulis** | Tvarkaraštis |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Bandoma pridėti tvarkaraščio įrašą be dalyko pavadinimo |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Student |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Bandyti pridėti tvarkaraščio įrašą su tuščiu Subject lauku<br>3. Užpildyti visus kitus laukus<br>4. Paspausti "Add Schedule" |
| **Laukiamas rezultatas** | - Sistema grąžina validacijos klaidą<br>- Įrašas nesukuriamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | [Required] anotacijos validacija |

---

### 2.7. Vartotojų Valdymo Test Cases (Positive)

#### TC-020: Visų vartotojų sąrašo peržiūra (Admin)

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-020 |
| **Modulis** | Vartotojų valdymas |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Administratorius peržiūri visų sistemos vartotojų sąrašą |
| **Prieš-sąlygos** | - Vartotojas prisijungęs kaip Admin<br>- Sistemoje yra vartotojų |
| **Testavimo žingsniai** | 1. Prisijungti kaip Admin<br>2. Eiti į vartotojų valdymo puslapį<br>3. Peržiūrėti vartotojų sąrašą |
| **Laukiamas rezultatas** | - Grąžinamas visų sistemos vartotojų sąrašas<br>- HTTP status code: 200 OK<br>- Kiekvienas vartotojas turi: Id, Name, Email, Role<br>- Slaptažodžiai (hash) NĖRA grąžinami |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Užtikrinti, kad tik Admin turi prieigą prie šio endpoint |

---

#### TC-021: Vartotojo profilio redagavimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-021 |
| **Modulis** | Vartotojų valdymas |
| **Prioritetas** | Vidutinis |
| **Scenarijaus aprašymas** | Vartotojas redaguoja savo profilio informaciją |
| **Prieš-sąlygos** | Vartotojas prisijungęs |
| **Testavimo žingsniai** | 1. Prisijungti į sistemą<br>2. Eiti į profilio puslapį<br>3. Pakeisti el. paštą)<br>4. Paspausti "Update Profile" |
| **Laukiamas rezultatas** | - Profilio informacija sėkmingai atnaujinama<br>- HTTP status code: 200 OK<br>- Pakeitimai matomi iš karto<br>- Grąžinamas atnaujintas User objektas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Vartotojas gali keisti tik savo pačio profilį |

---

#### TC-022: Slaptažodžio keitimas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-022 |
| **Modulis** | Vartotojų valdymas |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Vartotojas keičia savo slaptažodį |
| **Prieš-sąlygos** | Vartotojas prisijungęs |
| **Testavimo žingsniai** | 1. Prisijungti į sistemą<br>2. Eiti į profilio puslapį<br>3. Įvesti esamą slaptažodį<br>4. Įvesti naują slaptažodį<br>5. Pakartoti naują slaptažodį<br>6. Paspausti "Change Password" |
| **Laukiamas rezultatas** | - Slaptažodis sėkmingai pakeičiamas<br>- Naujas slaptažodis hash'inamas BCrypt<br>- HTTP status code: 200 OK<br>- Vartotojas gali prisijungti su nauju slaptažodžiu |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Patikrinti, kad senasis slaptažodis neveikia |

---

### 2.8. Vartotojų Valdymo Test Cases (Negative)

#### TC-023: Vartotojų sąrašo peržiūra be Admin teisių

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-023 |
| **Modulis** | Vartotojų valdymas |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Studentas arba dėstytojas bando pasiekti visų vartotojų sąrašą |
| **Prieš-sąlygos** | Vartotojas prisijungęs kaip Student arba Teacher |
| **Testavimo žingsniai** | 1. Prisijungti kaip Student<br>2. Bandyti pasiekti GET /api/users endpoint tiesiogiai |
| **Laukiamas rezultatas** | - Sistema atmeta užklausą<br>- HTTP status code: 403 Forbidden<br>- Klaidos pranešimas apie nepakankamas teises<br>- Vartotojų sąrašas negrąžinamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | Rolės validacija per JWT token claims |

---

#### TC-024: Slaptažodžio keitimas su neteisingai įvestu esamu slaptažodžiu

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-024 |
| **Modulis** | Vartotojų valdymas |
| **Prioritetas** | Aukštas |
| **Scenarijaus aprašymas** | Vartotojas bando keisti slaptažodį įvedęs neteisingą esamą slaptažodį |
| **Prieš-sąlygos** | Vartotojas prisijungęs |
| **Testavimo žingsniai** | 1. Prisijungti į sistemą<br>2. Eiti į slaptažodžio keitimo formą<br>3. Įvesti neteisingą esamą slaptažodį<br>4. Įvesti naują slaptažodį<br>5. Paspausti "Change Password" |
| **Laukiamas rezultatas** | - Sistema atmeta užklausą<br>- HTTP status code: 400 Bad Request arba 401 Unauthorized<br>- Klaidos pranešimas: "Current password is incorrect"<br>- Slaptažodis nekeičiamas |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | BCrypt verify validacija |

---

### 2.9. Bendri Validacijos Test Cases

#### TC-025: SQL Injection bandymas per login formą

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-025 |
| **Modulis** | Saugumas |
| **Prioritetas** | Kritinis |
| **Scenarijaus aprašymas** | Bandoma atlikti SQL injection ataką per prisijungimo formą |
| **Prieš-sąlygos** | Nėra |
| **Testavimo žingsniai** | 1. Atidaryti prisijungimo puslapį<br>2. Įvesti SQL injection kodą email lauke ("admin'--", "' OR '1'='1", "admin'; DROP TABLE Users--")<br>3. Įvesti bet kokį slaptažodį<br>4. Paspausti "Login" |
| **Laukiamas rezultatas** | - SQL injection nepavyksta<br>- Sistema saugiai apdoroja įvestį<br>- HTTP status code: 401 Unauthorized<br>- Duomenų bazė nepaveikta |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | EF Core automatiškai apsaugo nuo SQL injection |

---

#### TC-026: XSS (Cross-Site Scripting) bandymas

| Laukas | Aprašymas |
|--------|-----------|
| **Test Case ID** | TC-026 |
| **Modulis** | Saugumas |
| **Prioritetas** | Kritinis |
| **Scenarijaus aprašymas** | Bandoma įterpti JavaScript kodą į teksto laukus |
| **Prieš-sąlygos** | Vartotojas prisijungęs |
| **Testavimo žingsniai** | 1. Prisijungti kaip dėstytojas<br>2. Bandyti pridėti pažymį su Comments lauku: `<script>alert('XSS')</script>`<br>3. Išsaugoti pažymį<br>4. Peržiūrėti pažymį kaip studentas |
| **Laukiamas rezultatas** | - JavaScript kodas NEVYKDOMAS<br>- Tekstas rodomas kaip paprastas string arba sanitized<br>- React automatiškai escape'ina HTML<br>- Nėra alert dialogo |
| **Testavimo rezultatas** | Pass / Fail |
| **Pastabos** | React automatiškai apsaugo nuo XSS |

---

## 3. Testavimo Atlikimo Aprašymas

### 3.1. Testavimo Tikslas

Testavimo tikslas yra patikrinti, ar StudentPortal sistema atitinka apibrėžtus funkcinius ir nefunkcinius reikalavimus, įsitikinti, kad visos pagrindinės funkcijos veikia teisingai, ir identifikuoti galimas klaidas ar saugumo spragas.

### 3.2. Testavimo Aprėptis (Scope)

Testuojami šie moduliai:
1. **Autentifikacija** (Login, Register)
2. **Pažymių valdymas** (CRUD operacijos)
3. **Tvarkaraščių valdymas** (CRUD operacijos)
4. **Vartotojų valdymas** (Admin funkcijos, profilio redagavimas)
5. **Autorizacija** (Rolių validacija)
6. **Saugumas** (SQL Injection, XSS)

### 3.3. Testavimo Metodika

#### Testavimo tipai:
- **Funkcinis testavimas**: Patikrinti, ar funkcijos veikia pagal specifikacijas
- **Validacijos testavimas**: Patikrinti input validation
- **Saugumo testavimas**: Patikrinti autentifikaciją, autorizaciją, injection apsaugą
- **Neigiamasis testavimas**: Bandyti sulaužyti sistemą su netinkamais duomenimis

#### Testavimo žingsniai:

**Pasiruošimas:**
1. Paleisti Docker konteinerius (docker-compose up)
2. Įsitikinti, kad duomenų bazė inicializuota su test data (DatabaseSeeder)
3. Paruošti test accounts:
   - Admin: admin@test.com / Admin123!
   - Teacher: teacher@test.com / Teacher123!
   - Student: student@test.com / Student123!

**Testavimo vykdymas:**
1. Kiekvienam test case vykdyti nurodytus žingsnius
2. Stebėti sistemos elgesį
3. Palyginti rezultatus su laukiamais rezultatais
4. Dokumentuoti išvadas

**Naudojami įrankiai:**
- **Postman**: API endpoint testavimui
- **Chrome DevTools**: Network užklausų stebėjimui
- **Browser**: UI testavimui
- **SQL Server Management Studio**: Duomenų bazės būsenos tikrinimui

### 3.4. Test Scenarios ir Laukiami Rezultatai

#### Scenarijus 1: Autentifikacijos Workflow
**Testuojami Test Cases:** TC-001, TC-002, TC-003, TC-004, TC-005, TC-006

**Veiksmai:**
1. Registruoti naują vartotoją su role="Student"
2. Prisijungti su naujai sukurtu vartotoju
3. Bandyti prisijungti su neteisingais duomenimis
4. Bandyti registruotis su jau esančiu el. paštu

**Laukiami rezultatai:**
- Registracija sukuria vartotoją ir Student įrašą DB
- Sėkmingas prisijungimas grąžina galiojantį JWT tokeną
- Klaidingi duomenys grąžina 401 Unauthorized
- Dublikatas el. pašto grąžina 400 Bad Request

---

#### Scenarijus 2: Pažymių CRUD Operacijos
**Testuojami Test Cases:** TC-007, TC-008, TC-009, TC-010, TC-011, TC-012, TC-013

**Veiksmai:**
1. Prisijungti kaip Teacher
2. Pridėti naują pažymį studentui (Score=85, MaxScore=100)
3. Prisijungti kaip Student ir peržiūrėti pažymius
4. Bandyti pridėti pažymį su Score=150, MaxScore=100
5. Bandyti pridėti pažymį su neigiamu Score
6. Bandyti pridėti pažymį neegzistuojančiam studentui
7. Bandyti pridėti pažymį su tuščiu Subject

**Laukiami rezultatai:**
- Galiojantis pažymys sėkmingai išsaugomas
- Studentas mato tik savo pažymius
- Negaliojantys duomenys grąžina 400 Bad Request su konkrečiomis klaidomis
- Foreign key pažeidimai aptinkami ir atmetami

---

#### Scenarijus 3: Tvarkaraščių Valdymas
**Testuojami Test Cases:** TC-014, TC-015, TC-016, TC-017, TC-018, TC-019

**Veiksmai:**
1. Prisijungti kaip Student
2. Sukurti naują tvarkaraščio įrašą
3. Pažiūrėti ar rodo tik savininkui įrašą
4. Redaguoti tvarkaraščio įrašą (pakeisti kabinetą)
5. Bandyti sukurti įrašą su EndTime < StartTime
6. Bandyti sukurti įrašą su tuščiu pavadinimu

**Laukiami rezultatai:**
- Tvarkaraščio įrašai sėkmingai kuriami ir redaguojami
- Studentas mato tik savo tvarkaraštį
- Laiko validacija veikia
- Foreign key validacija veikia

---

#### Scenarijus 4: Vartotojų Valdymas ir Autorizacija
**Testuojami Test Cases:** TC-020, TC-021, TC-022, TC-023, TC-024

**Veiksmai:**
1. Prisijungti kaip Admin ir peržiūrėti visus vartotojus
2. Prisijungti kaip Student ir bandyti peržiūrėti visus vartotojus
3. Bandyti ištrinti vartotoją kaip Student
4. Keisti savo email
5. Keisti savo slaptažodį su teisingais duomenimis
6. Bandyti keisti slaptažodį su neteisingai įvestu esamu slaptažodžiu

**Laukiami rezultatai:**
- Tik Admin gali peržiūrėti visus vartotojus
- Student/Teacher negauna prieigos prie Admin funkcijų (403 Forbidden)
- Profilio redagavimas veikia
- Slaptažodžio keitimas validuoja esamą slaptažodį

---

#### Scenarijus 5: Saugumo Testavimas
**Testuojami Test Cases:** TC-025, TC-026

**Veiksmai:**
1. Bandyti SQL injection per login formą
2. Bandyti XSS per Comments lauką

**Laukiami rezultatai:**
- SQL injection nepavyksta (Entity Framework parametrizuoja)
- XSS nepavyksta (React escape'ina HTML)

---

## 4. Rezultatų Dokumentavimas

### 4.1. Test Results Summary Table

| Test Case ID | Scenarijaus aprašymas | Testavimo žingsniai | Laukiamas rezultatas | Testavimo rezultatas | Pastabos |
|--------------|----------------------|---------------------|---------------------|---------------------|----------|
| TC-001 | Sėkmingas prisijungimas su galiojančiais duomenimis | 1. Atidaryti login puslapį<br>2. Įvesti student@test.com<br>3. Įvesti slaptažodį<br>4. Paspausti Login | JWT tokenas grąžinamas, 200 OK | **Pass** / Fail | Testuota su Student, Teacher, Admin rolėmis |
| TC-002 | Naujojo vartotojo registracija | 1. Atidaryti register puslapį<br>2. Įvesti vardą<br>3. Įvesti unikalų email<br>4. Įvesti slaptažodį<br>5. Pasirinkti Student<br>6. Paspausti Register | Vartotojas sukurtas, Student įrašas sukurtas, 200 OK | **Pass** / Fail | Student įrašas automatiškai sukuriamas |
| TC-003 | Prisijungimas su neteisingais duomenimis | 1. Atidaryti login<br>2. Įvesti email<br>3. Įvesti neteisingą slaptažodį<br>4. Paspausti Login | 401 Unauthorized, klaidos pranešimas | **Pass** / Fail | Saugus klaidos pranešimas |
| TC-004 | Registracija su jau egzistuojančiu email | 1. Bandyti registruoti su student@test.com | 400 Bad Request, "Email already exists" | **Pass** / Fail | Validacija prieš hash'inimą |
| TC-005 | Registracija su netinkamu email formatu | 1. Bandyti registruoti su "invalid-email" | 400 Bad Request, validacijos klaida | **Pass** / Fail | [EmailAddress] validacija |
| TC-006 | Prisijungimas su tuščiais laukais | 1. Palikti laukus tuščius<br>2. Paspausti Login | Validacijos klaidos | **Pass** / Fail | Frontend ir backend validacija |
| TC-007 | Pažymio pridėjimas | 1. Prisijungti kaip Teacher<br>2. Užpildyti formą<br>3. Score=85, MaxScore=100<br>4. Paspausti Add Grade | 201 Created, pažymys išsaugotas | **Pass** / Fail | Visi GradeType testuoti |
| TC-008 | Pažymių peržiūra pagal studentą | 1. Prisijungti kaip Student<br>2. Atidaryti pažymių puslapį | Rodomi tik studento pažymiai, 200 OK | **Pass** / Fail | Tik savo pažymiai matomi |
| TC-009 | Pažymio redagavimas | 1. Prisijungti kaip Teacher<br>2. Redaguoti pažymį<br>3. Pakeisti Score į 90 | 200 OK, pažymys atnaujintas | **Pass** / Fail | - |
| TC-010 | Pažymio pridėjimas su Score > MaxScore | 1. Bandyti pridėti Score=150, MaxScore=100 | 400 Bad Request, validacijos klaida | **Pass** / Fail | Serverio validacija veikia |
| TC-011 | Pažymio pridėjimas su neigiamu balu | 1. Bandyti pridėti Score=-10 | 400 Bad Request | **Pass** / Fail | Range(0, 100) validacija |
| TC-012 | Pažymio pridėjimas neegzistuojančiam studentui | 1. Bandyti pridėti neegzistuojančiam studentui | Neleis | **Pass** / Fail | |
| TC-013 | Pažymio pridėjimas su tuščiu Subject | 1. Bandyti pridėti su tuščiu Subject | 400 Bad Request, "Subject is required" | **Pass** / Fail | [Required] validacija |
| TC-014 | Tvarkaraščio įrašo pridėjimas | 1. Prisijungti kaip Student<br>2. Užpildyti formą<br>3. Paspausti Add Schedule | 201 Created, įrašas išsaugotas | **Pass** / Fail | IsActive=true pagal default |
| TC-015 | Tvarkaraščio peržiūra | 1. Prisijungti kaip Student<br>2. Atidaryti tvarkaraštį | Rodomas studento tvarkaraštis, 200 OK | **Pass** / Fail | Tik aktyvūs įrašai ryškiai |
| TC-016 | Tvarkaraščio redagavimas | 1. Prisijungti kaip Student<br>2. Redaguoti įrašą | 200 OK, įrašas atnaujintas | **Pass** / Fail | - |
| TC-017 | Tvarkaraštis su EndTime < StartTime | 1. Bandyti sukurti su EndTime=12:00, StartTime=14:00 | 400 Bad Request (jei validacija implementuota) | Pass / **Fail** | Reikalinga papildoma validacija |
| TC-018 | Tvarkaraštis kai laikai kertasi | 1. Bandyti pridėti dalyką esamu laiku | validacijos klaida | **Pass** / Fail | Foreign key validacija |
| TC-019 | Tvarkaraštis su tuščiu Subject | 1. Bandyti sukurti su tuščiu Subject | 400 Bad Request | **Pass** / Fail | [Required] validacija |
| TC-020 | Visų vartotojų peržiūra (Admin) | 1. Prisijungti kaip Admin<br>2. GET /api/users | Visi vartotojai grąžinami, 200 OK | **Pass** / Fail | Slaptažodžiai negrąžinami |
| TC-021 | Profilio redagavimas | 1. Keisti vardą profilyje | 200 OK, profilis atnaujintas | **Pass** / Fail | - |
| TC-022 | Slaptažodžio keitimas | 1. Įvesti seną ir naują slaptažodį<br>2. Paspausti Change Password | 200 OK, slaptažodis pakeistas | **Pass** / Fail | BCrypt hash'inimas |
| TC-023 | Vartotojų peržiūra be Admin teisių | 1. Prisijungti kaip Student<br>2. Bandyti GET /api/users | 403 Forbidden | **Pass** / Fail | Rolės validacija |
| TC-024 | Slaptažodžio keitimas su neteisingai įvestu esamu | 1. Įvesti neteisingą esamą slaptažodį | 400/401, slaptažodis nekeičiamas | **Pass** / Fail | BCrypt verify validacija |
| TC-025 | SQL Injection bandymas | 1. Įvesti SQL injection kodą login formoje | Injection nepavyksta, 401 Unauthorized | **Pass** / Fail | EF Core parametrizacija |
| TC-026 | XSS bandymas | 1. Įvesti `<script>` kodą Comments lauke | JavaScript nevykdomas | **Pass** / Fail | React auto-escape |

---

### 4.2. Testavimo Metrikos

**Bendri rodikliai:**
- **Iš viso test cases:** 26
- **Positive test cases:** 13
- **Negative test cases:** 13
- **Kritinio prioriteto:** 2
- **Aukšto prioriteto:** 15
- **Vidutinio prioriteto:** 9

**Modulių aprėptis:**
- Autentifikacija: 6 test cases
- Pažymiai: 7 test cases
- Tvarkaraštis: 6 test cases
- Vartotojų valdymas: 5 test cases
- Saugumas: 2 test cases

**Laukiami rezultatai:**
- **Pass rate tikslas:** >= 95%
- **Critical defects:** 0
- **High priority defects:** ≤ 2

---

### 4.3. Defektų Kategorijos

| Prioritetas | Aprašymas | Pavyzdys |
|------------|-----------|----------|
| **Critical** | Sistema naveikia arba yra kritinė saugumo spraga | SQL injection pavyksta, sistemos crash |
| **High** | Pagrindinė funkcija neveikia | Nepavyksta prisijungti, pažymiai nerodomi |
| **Medium** | Funkcija veikia, bet su klaidomis | Validacija neveikia tinkamai |
| **Low** | Kosmetinės problemos | UI formatavimas, tekstų klaidos |

---

### 4.4. Testavimo Išvados

Atlikus testus defektų nerasta, sistema puikiai validuoja naudotojo klaidas, aiškiais pranešimais praneša, kur padaryta klaida. Uždari endpointai apsaugoti tinkamai, nepasiekiami vartotojams, kurie neturi prieigos. Apsaugota nuo javascript ir sql injection atakų, slaptažodžiai hashinami ir užkriptuoti, negrąžinama iš backendo į frontendą.

---

## 5. Priedai

### 5.1. Testavimo Aplinka

**Frontend:**
- URL: http://localhost:3000
- Framework: React 19
- Port: 3000

**Duomenų bazė:**
- SQL Server
- Prieiga: SQL Server Management Studio

### 5.2. Test Data

**Admin vartotojas:**
- Email: admin@test.com
- Password: Admin123!
- Role: Admin

**Teacher vartotojas:**
- Email: teacher@test.com
- Password: Teacher123!
- Role: Teacher

**Student vartotojas:**
- Email: student@test.com
- Password: Student123!
- Role: Student
