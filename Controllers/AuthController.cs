#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Common;
using OverBeliefApi.Database;
using OverBeliefApi.Entites;
using OverBeliefApi.Models;
using OverBeliefApi.Models.LoginUser;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MyContext _context;
        private Config._web config = Config.Instance.web;

        public AuthController(MyContext context)
        {
            _context = context;
        }

        // GET: api/LoginUsers
        [HttpGet]
        public async Task<ActionResult> GetLoginUserEntities(string pscd = "")
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context, pscd).ConfigureAwait(false);
            return Ok( new { HasLogined = p.HasLogined, UserId = p.UserID, UserName = p.UserName });
        }

        // GET: api/LoginUsers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LoginUserEntity>> GetLoginUserEntity(long id)
        {
            var loginUserEntity = await _context.LoginUserEntities.FindAsync(id);

            if (loginUserEntity == null)
            {
                return NotFound();
            }

            return loginUserEntity;
        }

        // PUT: api/LoginUsers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLoginUserEntity(long id, LoginUserEntity loginUserEntity)
        {
            if (id != loginUserEntity.Id)
            {
                return BadRequest();
            }

            _context.Entry(loginUserEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LoginUserEntityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginUserEntity>> PostLoginUserEntity(LoginUserApiDto loginUser)
        {
            if (string.IsNullOrWhiteSpace(loginUser.EmailAddress)) return BadRequest();
            if (string.IsNullOrWhiteSpace(loginUser.Password)) return BadRequest();

            var dbUser = await _context.LoginUserEntities
                .Where(x => x.EmailAddress == loginUser.EmailAddress).FirstOrDefaultAsync();

            if (loginUser.Password != dbUser.LoginPassword) return BadRequest();

            var p = new LoginParameters();
            p.SetCookie(dbUser, HttpContext);

            //HttpContext.Response.Headers.Add("Location", config.HomeUrl);
            //return StatusCode(StatusCodes.Status303SeeOther);
            return Ok(new { isError = false, url = config.HomeUrl });
        }

        // GET: api/auth/logout
        [HttpGet("logout")]
        public ActionResult Logout()
        {
            var p = new LoginParameters();
            p.Logout(HttpContext);
            HttpContext.Response.Headers.Add("Location", config.HomeUrl + "/login.html");
            return StatusCode(StatusCodes.Status303SeeOther);
        }

        // POST: api/auth/signup
        [HttpPost("signup")]
        public async Task<ActionResult<LoginUserEntity>> PostSignupUserEntity(LoginUserApiDto signupUser)
        {
            if (ExistsSameEmailAddressUser(signupUser.EmailAddress)) return BadRequest();

            var user = new LoginUserEntity()
            {
                FirstName = signupUser.FirstName,
                LastName = signupUser.LastName,
                EmailAddress = signupUser.EmailAddress,
                LoginPassword = signupUser.Password,

                Id = this.GetNewId(),
                PassCode = this.GetNewPassCode(),
                CreateOn = DateTime.Now,
                ModefiedOn = DateTime.Now
            };

            _context.LoginUserEntities.Add(user);
            await _context.SaveChangesAsync();

            var p = new LoginParameters();
            p.SetCookie(user, HttpContext);

            return Ok(new { isError = false, url = config.HomeUrl });
        }

        private long GetNewId()
        {
            var newId = new System.Random().NextInt64(10000000, 99999999);
            if (!LoginUserEntityExists(newId)) return newId; 
            return GetNewId();
        }

        private bool ExistsSameEmailAddressUser(string emailAddress)
        {
            return _context.LoginUserEntities.Any(x => x.EmailAddress == emailAddress);
        }

        private static readonly string passCodeChars = "0123456789abcdefghijklmnopqrstuvwxyz";
        private string GetNewPassCode() 
        {
            var pscd = new StringBuilder();
            var r = new Random();
            for (var i=0; i< 16; i++) 
            {
                pscd.Append(passCodeChars[r.Next(passCodeChars.Length)]);
            }
            if (ExistsSamePassCodeUser(pscd.ToString())) return GetNewPassCode();
            return pscd.ToString();
        }

        private bool ExistsSamePassCodeUser(string pscd)
        {
            return _context.LoginUserEntities.Any(x => x.PassCode == pscd);
        }

        //// DELETE: api/LoginUsers/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteLoginUserEntity(long id)
        //{
        //    var loginUserEntity = await _context.LoginUserEntities.FindAsync(id);
        //    if (loginUserEntity == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.LoginUserEntities.Remove(loginUserEntity);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool LoginUserEntityExists(long id)
        {
            return _context.LoginUserEntities.Any(e => e.Id == id);
        }
    }
}
