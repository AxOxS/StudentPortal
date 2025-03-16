using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;
using System.Text; //For encodingg JWT
using Microsoft.AspNetCore.Authentication.JwtBearer; //Supports JWT auth
using Microsoft.IdentityModel.Tokens; //Token validation for JWT


//Initialize new ASP.NET Core Wep API app
var builder = WebApplication.CreateBuilder(args);

//Configure Cross-Origin resource sharing (CORS allows the frontend to communicate with the backend)
//Without cors the API requests would be blocked, coming from differentt domains
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", // Cors policy, named allowall
        builder =>
        {
            builder.AllowAnyOrigin() //Allow requests from any frontend
                   .AllowAnyMethod() //Allow any HTTP method (GET, POST, etc)
                   .AllowAnyHeader(); //Allow any custom header (Authorization for JWT)
        });
});

//Configure the DB connection
//Add DbContext for dependency injection and read the DB connection string "DefaultConnection" from appsettings.json
//Allows the app to interact with SQL server by EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//Register API controllers so that we can handle HTTP requests: GET /api/students, POST /api/students, etc..
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

//Configure Jwt (JSON Web Token) auth
//By using this instead of cookies - react sends a jwt token in the Auth header, which the server then validates and grants access.
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]); //Reads the jwt key from appsettings.json
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, //Ensures the token was issued by the server
            ValidateAudience = true, //Ensures the token is for the app
            ValidateLifetime = true, //Ensures the token isn't expired
            ValidateIssuerSigningKey = true, //Ensures the token signature is valid
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key) //Uses a symetric key for signing
        };
    });

//Enables role-based auth
builder.Services.AddAuthorization();

//Add UI for API endpoint testing via /swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

//Applies the AllowAll policy for front and backend communication
app.UseCors("AllowAll");

//Secure the website by using HTTPS instead of HTTP
app.UseHttpsRedirection();
app.UseAuthorization();
//maps api endpoints, such as api/students
app.MapControllers();
app.Run();

//After loading up the server - we migrate the database with:
//dotnet ef migrations add InitialCreate - generates migration files
//dotnet ef database update - applies migration to DB