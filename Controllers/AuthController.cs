#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Contexts;
using OverBeliefApi.Models.LoginUser;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LoginUserContext _context;

        public AuthController(LoginUserContext context)
        {
            _context = context;
        }

        // GET: api/LoginUsers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LoginUserEntity>>> GetLoginUserEntities()
        {
            return await _context.LoginUserEntities.ToListAsync();
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

            //HttpContext.Response.Headers.Add("Location", "https://localhost:7233/index.html");
            //return StatusCode(StatusCodes.Status303SeeOther);
            return Ok(new { isError = false, url = "./index.html" });
        }

        // POST: api/auth/signup
        [HttpPost("signup")]
        public async Task<ActionResult<LoginUserEntity>> PostSignupUserEntity(LoginUserApiDto signupUser)
        {
            if (ExistsLoginUser(signupUser.EmailAddress)) return BadRequest();

            var user = new LoginUserEntity()
            {
                FirstName = signupUser.FirstName,
                LastName = signupUser.LastName,
                EmailAddress = signupUser.EmailAddress,
                LoginPassword = signupUser.Password,

                Id = this.getNewId(),
                CreateOn = DateTime.Now,
                ModefiedOn = DateTime.Now
            };

            _context.LoginUserEntities.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { isError = false, url = "./index.html" });
        }

        private long getNewId()
        {
            var newId = new System.Random().NextInt64(10000000, 99999999);
            if (!LoginUserEntityExists(newId)) return newId; 
            return getNewId();
        }
        private bool ExistsLoginUser(string emailAddress)
        {
            return _context.LoginUserEntities.Any(x => x.EmailAddress == emailAddress);
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
