#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Models.LoginUser;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginUsersController : ControllerBase
    {
        private readonly LoginUserContext _context;

        public LoginUsersController(LoginUserContext context)
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

        // POST: api/LoginUsers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<LoginUserEntity>> PostLoginUserEntity(LoginUserEntity loginUserEntity)
        {
            if (loginUserEntity.Id == 0)
            {
                loginUserEntity.Id = this.getNewId();
            }
            _context.LoginUserEntities.Add(loginUserEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLoginUserEntity", new { id = loginUserEntity.Id }, loginUserEntity);
        }

        private long getNewId() 
        {
            var newId = new System.Random().NextInt64(10000000, 99999999);
            if (!existsLoginUser(newId)) return newId; 
            return getNewId();
        }
        private bool existsLoginUser(long id)
        {
            var loginUserEntity = _context.LoginUserEntities.Find(id);
            return loginUserEntity != null;
        }

        // DELETE: api/LoginUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoginUserEntity(long id)
        {
            var loginUserEntity = await _context.LoginUserEntities.FindAsync(id);
            if (loginUserEntity == null)
            {
                return NotFound();
            }

            _context.LoginUserEntities.Remove(loginUserEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LoginUserEntityExists(long id)
        {
            return _context.LoginUserEntities.Any(e => e.Id == id);
        }
    }
}
