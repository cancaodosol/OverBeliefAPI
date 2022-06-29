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
    [Route("api/twitter/tweets")]
    [ApiController]
    public class TwitterTweetsController : ControllerBase
    {
        private readonly TwitterTweetContext _context;

        public TwitterTweetsController(TwitterTweetContext context)
        {
            _context = context;
        }

        // GET: api/TwitterTweets
        [EnableCors("All")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TwitterTweetEntity>>> GetTwitterTweetEntities()
        {
          if (_context.TwitterTweetEntities == null)
          {
              return NotFound();
          }
            return await _context.TwitterTweetEntities.ToListAsync();
        }

        // GET: api/TwitterTweets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TwitterTweetEntity>> GetTwitterTweetEntity(long id)
        {
          if (_context.TwitterTweetEntities == null)
          {
              return NotFound();
          }
            var twitterTweetEntity = await _context.TwitterTweetEntities.FindAsync(id);

            if (twitterTweetEntity == null)
            {
                return NotFound();
            }

            return twitterTweetEntity;
        }

        // PUT: api/TwitterTweets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTwitterTweetEntity(long id, TwitterTweetEntity twitterTweetEntity)
        {
            if (id != twitterTweetEntity.Id)
            {
                return BadRequest();
            }

            _context.Entry(twitterTweetEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TwitterTweetEntityExists(id))
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

        // POST: api/TwitterTweets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [EnableCors("All")]
        [HttpPost]
        public async Task<ActionResult<TwitterTweetEntity>> PostTwitterTweetEntity(TwitterTweetEntity twitterTweetEntity)
        {
          if (_context.TwitterTweetEntities == null)
          {
              return Problem("Entity set 'TwitterTweetContext.TwitterTweetEntities'  is null.");
          }
            _context.TwitterTweetEntities.Add(twitterTweetEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTwitterTweetEntity", new { id = twitterTweetEntity.Id }, twitterTweetEntity);
        }

        // DELETE: api/TwitterTweets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTwitterTweetEntity(long id)
        {
            if (_context.TwitterTweetEntities == null)
            {
                return NotFound();
            }
            var twitterTweetEntity = await _context.TwitterTweetEntities.FindAsync(id);
            if (twitterTweetEntity == null)
            {
                return NotFound();
            }

            _context.TwitterTweetEntities.Remove(twitterTweetEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TwitterTweetEntityExists(long id)
        {
            return (_context.TwitterTweetEntities?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
