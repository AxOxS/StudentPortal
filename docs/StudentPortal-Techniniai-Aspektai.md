[← Grįžti į dokumentacijos pradžią](../README.md)

# Studentų Informacinės Sistemos Techniniai Aspektai

## Turinys
1. [Duomenų bazės schema](#duomenų-bazės-schema)
2. [API dokumentacija](#api-dokumentacija)
3. [Front-end komponentų struktūra](#front-end-komponentų-struktūra)
4. [Saugumo užtikrinimas](#saugumo-užtikrinimas)
5. [Testavimo metodika](#testavimo-metodika)
6. [Našumo optimizavimas](#našumo-optimizavimas)
7. [Kodo pavyzdžiai](#kodo-pavyzdžiai)

## Duomenų bazės schema

Šioje dalyje pateikiama detali duomenų bazės schema, naudojama StudentPortal sistemoje.

### Lentelių struktūra

#### Users lentelė
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastLogin DATETIME NULL
);
```

#### Students lentelė
```sql
CREATE TABLE Students (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    StudentNumber NVARCHAR(20) UNIQUE NOT NULL,
    EnrollmentDate DATETIME NOT NULL,
    Faculty NVARCHAR(100) NOT NULL,
    Program NVARCHAR(100) NOT NULL
);
```

#### Teachers lentelė
```sql
CREATE TABLE Teachers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    Position NVARCHAR(100) NOT NULL
);
```

#### Grades lentelė
```sql
CREATE TABLE Grades (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentId INT FOREIGN KEY REFERENCES Students(Id) ON DELETE CASCADE,
    Subject NVARCHAR(100) NOT NULL,
    Score DECIMAL(5,2) NOT NULL,
    MaxScore DECIMAL(5,2) NOT NULL,
    GradeType NVARCHAR(50) NOT NULL,
    Semester NVARCHAR(20) NOT NULL,
    Date DATETIME NOT NULL,
    Comments NVARCHAR(500) NULL
);
```

#### Schedules lentelė
```sql
CREATE TABLE Schedules (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentId INT FOREIGN KEY REFERENCES Students(Id) ON DELETE CASCADE,
    Subject NVARCHAR(100) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    DayOfWeek INT NOT NULL,
    Room NVARCHAR(50) NOT NULL,
    Semester NVARCHAR(20) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
```

### Duomenų bazės ryšių diagrama

```
Users 1───┐
          │
          │
          ▼
Students 1────────┐
          │       │
          │       │
          ▼       ▼
       Grades   Schedules

Users 1───┐
          │
          │
          ▼
Teachers 1
```

## API dokumentacija

### Autentifikacijos API

#### POST /api/auth/login

**Aprašymas**: Vartotojo autentifikavimas ir JWT tokeno išdavimas

**Užklausos duomenys**:
```json
{
  "email": "student@example.com",
  "password": "slaptazodis123"
}
```

**Sėkmingo atsako duomenys (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "Student"
  }
}
```

**Nesėkmingo atsako duomenys (401 Unauthorized)**:
```json
{
  "message": "Neteisingas el. paštas arba slaptažodis"
}
```

#### POST /api/auth/register

**Aprašymas**: Naujo vartotojo registracija

**Užklausos duomenys**:
```json
{
  "email": "newstudent@example.com",
  "password": "slaptazodis123",
  "role": "Student",
  "firstName": "Vardas",
  "lastName": "Pavardė",
  "additionalData": {
    "studentNumber": "ST12345",
    "faculty": "Informatikos fakultetas",
    "program": "Programų sistemos"
  }
}
```

**Sėkmingo atsako duomenys (201 Created)**:
```json
{
  "id": 2,
  "email": "newstudent@example.com",
  "role": "Student"
}
```

### Vartotojų API

#### GET /api/users

**Aprašymas**: Gauti visų vartotojų sąrašą (tik administratoriams)

**Reikalingi antraštės**:
- Authorization: Bearer {token}

**Sėkmingo atsako duomenys (200 OK)**:
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "role": "Admin",
    "createdAt": "2023-01-01T00:00:00Z",
    "lastLogin": "2023-05-15T14:30:45Z"
  },
  {
    "id": 2,
    "email": "student@example.com",
    "role": "Student",
    "createdAt": "2023-01-02T00:00:00Z",
    "lastLogin": "2023-05-16T09:15:30Z"
  }
]
```

### Studentų API

#### GET /api/students

**Aprašymas**: Gauti visų studentų sąrašą

**Reikalingi antraštės**:
- Authorization: Bearer {token}

**Sėkmingo atsako duomenys (200 OK)**:
```json
[
  {
    "id": 1,
    "userId": 2,
    "firstName": "Vardas",
    "lastName": "Pavardė",
    "studentNumber": "ST12345",
    "enrollmentDate": "2023-09-01T00:00:00Z",
    "faculty": "Informatikos fakultetas",
    "program": "Programų sistemos"
  }
]
```

### Pažymių API

#### GET /api/grades/{studentId}

**Aprašymas**: Gauti konkretaus studento pažymius

**Reikalingi antraštės**:
- Authorization: Bearer {token}

**Sėkmingo atsako duomenys (200 OK)**:
```json
[
  {
    "id": 1,
    "studentId": 1,
    "subject": "Programavimo pagrindai",
    "score": 9.5,
    "maxScore": 10.0,
    "gradeType": "Egzaminas",
    "semester": "Rudens semestras 2023",
    "date": "2023-12-20T00:00:00Z",
    "comments": "Puikiai atliktos užduotys"
  }
]
```

## Front-end komponentų struktūra

### Komponentų hierarchija

```
App
├── AuthProvider
│   ├── LoginPage
│   └── RegisterPage
└── ProtectedRoutes
    ├── Navbar
    ├── Dashboard
    │   ├── StudentDashboard
    │   ├── TeacherDashboard
    │   └── AdminDashboard
    ├── StudentPage
    │   ├── GradeList
    │   └── ScheduleManager
    ├── TeacherPage
    │   ├── StudentList
    │   ├── GradeEditor
    │   └── ScheduleManager
    ├── AdminPage
    │   ├── UserManager
    │   ├── SystemStats
    │   └── SettingsPanel
    └── ProfilePage
        ├── PersonalInfoPanel
        └── SecurityPanel
```

### Raktinių komponentų atsakomybės

#### AuthProvider
- Autentifikacijos būsenos valdymas
- JWT autorizavimas ir atnaujinimas
- Vartotojo sesijos išsaugojimas

#### Dashboard
- Rodo skirtingą turinį pagal vartotojo rolę
- Pateikia bendrą statistiką
- Navigacija į pagrindines sistemos funkcijas

#### StudentPage
- Rodo studento pažymius ir tvarkaraštį
- Atvaizdavimas pagal semestrus
- Duomenų filtravimas ir rūšiavimas

#### GradeList/GradeEditor
- Pažymių rodymas lentelės formatu
- Pažymių įvedimas ir redagavimas (dėstytojams)
- Pažymių vidurkių skaičiavimas ir statistika

#### ScheduleManager
- Savaitinio tvarkaraščio rodymas kalendoriaus formatu
- Užsiėmimų planavimas ir redagavimas
- Automatinis konfliktų nustatymas

## Saugumo užtikrinimas

### JWT konfigūracija

```csharp
// Program.cs
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});
```

### Slaptažodžių šifravimas

```csharp
// UserService.cs
public class UserService : IUserService
{
    // ...
    
    public async Task<User> RegisterUserAsync(UserRegistrationDto registrationDto)
    {
        // Patikriname, ar vartotojas su tokiu el. paštu jau egzistuoja
        if (await _context.Users.AnyAsync(u => u.Email == registrationDto.Email))
        {
            throw new InvalidOperationException("Vartotojas su tokiu el. paštu jau egzistuoja");
        }
        
        // Šifruojame slaptažodį
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password);
        
        // Kuriame naują vartotoją
        var user = new User
        {
            Email = registrationDto.Email,
            PasswordHash = passwordHash,
            Role = registrationDto.Role,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return user;
    }
    
    // ...
}
```

### CORS konfigūracija

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// ...

app.UseCors("AllowSpecificOrigin");
```

## Testavimo metodika

### Vienetų testavimo pavyzdys (Back-end)

```csharp
// GradeControllerTests.cs
public class GradeControllerTests
{
    private readonly Mock<IGradeService> _mockGradeService;
    private readonly GradeController _controller;
    
    public GradeControllerTests()
    {
        _mockGradeService = new Mock<IGradeService>();
        _controller = new GradeController(_mockGradeService.Object);
    }
    
    [Fact]
    public async Task GetGrades_ReturnsGrades_WhenStudentHasGrades()
    {
        // Arrange
        int studentId = 1;
        var expectedGrades = new List<GradeDto>
        {
            new GradeDto { Id = 1, StudentId = studentId, Subject = "Math", Score = 9.5m }
        };
        
        _mockGradeService.Setup(service => 
            service.GetGradesByStudentIdAsync(studentId))
            .ReturnsAsync(expectedGrades);
        
        // Act
        var result = await _controller.GetGrades(studentId);
        
        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<GradeDto>>(okResult.Value);
        Assert.Single(returnValue);
        Assert.Equal(expectedGrades[0].Subject, returnValue[0].Subject);
    }
}
```

### Integracinio testavimo pavyzdys

```csharp
// UserIntegrationTests.cs
public class UserIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public UserIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Pakeičiame duomenų bazės kontekstą į in-memory duomenų bazę
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }
                
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });
                
                // Pridedame testavimo duomenis
                var sp = services.BuildServiceProvider();
                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<ApplicationDbContext>();
                    
                    db.Database.EnsureCreated();
                    
                    // Pridedame testavimo vartotoją
                    db.Users.Add(new User
                    {
                        Id = 1,
                        Email = "test@example.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                        Role = "Admin"
                    });
                    
                    db.SaveChanges();
                }
            });
        });
        
        _client = _factory.CreateClient();
    }
    
    [Fact]
    public async Task Get_ReturnsSuccess_WhenUserExists()
    {
        // Pirmiausia gauname autentifikacijos tokeną
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "test@example.com",
            password = "password"
        });
        
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<TokenResponse>();
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", loginResult.Token);
        
        // Act
        var response = await _client.GetAsync("/api/users/1");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.Equal("test@example.com", user.Email);
    }
}
```

## Našumo optimizavimas

### SQL užklausų optimizavimas

```csharp
// StudentService.cs
public async Task<IEnumerable<StudentWithGradesDto>> GetStudentsWithGradesAsync()
{
    // Naudojame Include funkcionalumą efektyviam duomenų gavimui
    return await _context.Students
        .Include(s => s.User)
        .Include(s => s.Grades)
        .Select(s => new StudentWithGradesDto
        {
            Id = s.Id,
            FirstName = s.FirstName,
            LastName = s.LastName,
            Email = s.User.Email,
            StudentNumber = s.StudentNumber,
            Faculty = s.Faculty,
            Program = s.Program,
            Grades = s.Grades.Select(g => new GradeDto
            {
                Id = g.Id,
                Subject = g.Subject,
                Score = g.Score,
                MaxScore = g.MaxScore,
                GradeType = g.GradeType,
                Semester = g.Semester,
                Date = g.Date
            }).ToList()
        })
        .ToListAsync();
}
```

### Front-end duomenų užkrovimo optimizavimas

```javascript
// useFetch.js - Klientinių užklausų kešavimas
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const cache = {};

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Kešavimo laiko kontrolė
  const cacheTime = options.cacheTime || 5 * 60 * 1000; // 5 min.
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const { signal } = controller;
    
    const fetchData = async () => {
      setLoading(true);
      
      // Tikriname, ar duomenys jau yra kešuoti ir ar jie dar galioja
      if (cache[url] && (Date.now() - cache[url].timestamp < cacheTime)) {
        setData(cache[url].data);
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(url, { signal });
        const result = response.data;
        
        if (isMounted) {
          setData(result);
          // Išsaugome duomenis kešavimui
          cache[url] = {
            data: result,
            timestamp: Date.now()
          };
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, cacheTime]);
  
  return { data, loading, error };
}
```

### Lygiagretus duomenų užkrovimas

```javascript
// Dashboard.js
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    user: null,
    stats: null,
    recentActivity: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadDashboardData() {
      try {
        // Lygiagrečiai vykdome visas užklausas
        const [userResponse, statsResponse, activityResponse] = await Promise.all([
          apiClient.get('/api/users/current'),
          apiClient.get('/api/stats'),
          apiClient.get('/api/activity/recent')
        ]);
        
        if (isMounted) {
          setDashboardData({
            user: userResponse.data,
            stats: statsResponse.data,
            recentActivity: activityResponse.data,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setDashboardData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
        }
      }
    }
    
    loadDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Render komponentas...
}
```

## Kodo pavyzdžiai

### Autentifikacijos kontroleris (Back-end)

```csharp
// AuthController.cs
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;
    
    public AuthController(
        IUserService userService,
        ITokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        try
        {
            var user = await _userService.AuthenticateAsync(loginDto.Email, loginDto.Password);
            var token = _tokenService.GenerateToken(user);
            
            return Ok(new 
            {
                Token = token,
                User = new 
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegistrationDto registrationDto)
    {
        try
        {
            var user = await _userService.RegisterUserAsync(registrationDto);
            
            return CreatedAtAction(
                nameof(Register),
                new 
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role
                });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
```

### React autentifikacijos kontekstas (Front-end)

```jsx
// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Bandome atkurti vartotojo sesiją iš localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      
      // Nustatome Auth header visoms API užklausoms
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Išsaugome duomenis localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Nustatome state
      setToken(token);
      setUser(user);
      
      // Nustatome Auth header visoms API užklausoms
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Nepavyko prisijungti');
    }
  };
  
  const logout = () => {
    // Išvalome localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Išvalome state
    setToken(null);
    setUser(null);
    
    // Išvalome Auth header
    delete apiClient.defaults.headers.common['Authorization'];
  };
  
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Nepavyko užregistruoti');
    }
  };
  
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Pažymių komponentas (Front-end)

```jsx
// GradeList.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function GradeList() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [semesters, setSemesters] = useState([]);
  
  useEffect(() => {
    async function fetchGrades() {
      try {
        // Jei studentId nurodyta, naudojame jį (dėstytojo požiūris)
        // Kitu atveju, naudojame prisijungusio vartotojo ID
        const id = studentId || user.id;
        const response = await apiClient.get(`/api/grades/${id}`);
        const gradesData = response.data;
        
        setGrades(gradesData);
        
        // Išrenkame unikalius semestrus filtravimui
        const uniqueSemesters = [...new Set(gradesData.map(grade => grade.semester))];
        setSemesters(uniqueSemesters);
        
        setLoading(false);
      } catch (err) {
        setError('Klaida gaunant pažymius: ' + err.message);
        setLoading(false);
      }
    }
    
    fetchGrades();
  }, [studentId, user.id]);
  
  // Filtruojame pažymius pagal semestrą
  const filteredGrades = selectedSemester === 'all'
    ? grades
    : grades.filter(grade => grade.semester === selectedSemester);
  
  // Grupuojame pažymius pagal dalyką
  const gradesBySubject = filteredGrades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {});
  
  if (loading) return <div>Kraunami pažymiai...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="grade-list">
      <h2>Pažymiai</h2>
      
      <div className="filters">
        <label>
          Semestras:
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">Visi semestrai</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>
      </div>
      
      {Object.keys(gradesBySubject).length === 0 ? (
        <p>Nėra pažymių, atitinkančių filtravimo kriterijus.</p>
      ) : (
        <div className="subjects">
          {Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
            // Skaičiuojame vidurkį
            const average = subjectGrades.reduce((sum, grade) => 
              sum + (grade.score / grade.maxScore) * 10, 0) / subjectGrades.length;
            
            return (
              <div key={subject} className="subject-card">
                <h3>{subject}</h3>
                <div className="average">Vidurkis: {average.toFixed(2)}</div>
                
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Tipas</th>
                      <th>Pažymys</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectGrades.map(grade => (
                      <tr key={grade.id}>
                        <td>{grade.gradeType}</td>
                        <td>
                          {grade.score} / {grade.maxScore}
                          <span className="percentage">
                            ({((grade.score / grade.maxScore) * 100).toFixed(0)}%)
                          </span>
                        </td>
                        <td>{new Date(grade.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GradeList;
```

Šis dokumentas apžvelgia pagrindinius techninius aspektus, kurie yra svarbūs projekto supratimui ir pristatymui. Pateikti kodo pavyzdžiai iliustruoja, kaip realizuoti pagrindiniai sistemos komponentai ir funkcionalumas. 