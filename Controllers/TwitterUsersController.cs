using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Contexts;
using OverBeliefApi.Models.Twitter;

namespace OverBeliefApi.Controllers
{
    [Route("api/twitter/users")]
    [ApiController]
    public class TwitterUsersController : ControllerBase
    {
        private readonly TwitterUserContext _context;

        public TwitterUsersController(TwitterUserContext context)
        {
            _context = context;
        }

        // GET: api/TwitterUsers
        [EnableCors("All")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TwitterUserEntity>>> GetTwitterUserEntities()
        {
          if (_context.TwitterUserEntities == null)
          {
              return NotFound();
          }
            return await _context.TwitterUserEntities.ToListAsync();
        }

        // GET: api/TwitterUsers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TwitterUserEntity>> GetTwitterUserEntity(long id)
        {
          if (_context.TwitterUserEntities == null)
          {
              return NotFound();
          }
            var twitterUserEntity = await _context.TwitterUserEntities.FindAsync(id);

            if (twitterUserEntity == null)
            {
                return NotFound();
            }

            return twitterUserEntity;
        }

        // PUT: api/TwitterUsers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTwitterUserEntity(long id, TwitterUserEntity twitterUserEntity)
        {
            if (id != twitterUserEntity.Id)
            {
                return BadRequest();
            }

            _context.Entry(twitterUserEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TwitterUserEntityExists(id))
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

        // POST: api/TwitterUsers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [EnableCors("All")]
        [HttpPost]
        public async Task<ActionResult<TwitterUserEntity>> PostTwitterUserEntity(TwitterUserEntity twitterUserEntity)
        {
          if (_context.TwitterUserEntities == null)
          {
              return Problem("Entity set 'TwitterUserContext.TwitterUserEntities'  is null.");
          }
            _context.TwitterUserEntities.Add(twitterUserEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTwitterUserEntity", new { id = twitterUserEntity.Id }, twitterUserEntity);
        }

        // DELETE: api/TwitterUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTwitterUserEntity(long id)
        {
            if (_context.TwitterUserEntities == null)
            {
                return NotFound();
            }
            var twitterUserEntity = await _context.TwitterUserEntities.FindAsync(id);
            if (twitterUserEntity == null)
            {
                return NotFound();
            }

            _context.TwitterUserEntities.Remove(twitterUserEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TwitterUserEntityExists(long id)
        {
            return (_context.TwitterUserEntities?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
