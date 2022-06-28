using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Contexts;

var builder = WebApplication.CreateBuilder(args);

// CORS�̐ݒ�
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

// ************************
// DB�e�[�u���̒ǉ�
// ************************
// ���O�C�����[�U�[
builder.Services.AddDbContext<LoginUserContext>((opt) =>
    opt.UseSqlite("Data Source=Database/overbelief.db"));
// �c�C�[�g
builder.Services.AddDbContext<TwitterTweetContext>((opt) =>
    opt.UseSqlite("Data Source=Database/overbelief.db"));
// Twitter���[�U�[
builder.Services.AddDbContext<TwitterUserContext>((opt) =>
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

// CORS�̐ݒ�
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseSession();

app.MapControllers();

app.Run();
