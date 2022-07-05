using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Common;
using OverBeliefApi.Database;

var builder = WebApplication.CreateBuilder(args);

// CORSÇÃê›íË
builder.Services.AddCors((options) => 
{
    options.AddPolicy("All",
        policy => {
            policy.WithOrigins("*")
            .AllowAnyHeader();
        });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<MyContext>((opt) =>
    opt.UseSqlite("Data Source=Database/overbelief.db"));

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.Cookie.Path = "/api";
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// CORSÇÃê›íË
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseSession();

app.MapControllers();

app.Run();
