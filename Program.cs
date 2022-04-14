using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Models;

var builder = WebApplication.CreateBuilder(args);

// CORSの設定
builder.Services.AddCors((options) => 
{
    options.AddPolicy("All",
        policy => {
            policy.WithOrigins("*");
        });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// todoリストアイテムの追加
builder.Services.AddDbContext<TodoContext>((opt) => 
    opt.UseInMemoryDatabase("TodoList"));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// CORSの設定
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
