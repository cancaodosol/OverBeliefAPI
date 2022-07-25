using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Database;
using OverBeliefApi.Entites;
using OverBeliefApi.Models;
using OverBeliefApi.Models.Twitter;

namespace OverBeliefApi.Controllers
{
    [Route("api/twitter/tweets")]
    [ApiController]
    public class TwitterTweetsController : ControllerBase
    {
        private readonly MyContext _context;

        public TwitterTweetsController(MyContext context)
        {
            _context = context;
        }

        // GET: api/TwitterTweets
        [EnableCors("All")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TwitterTweetEntity>>> GetTwitterTweetEntities()
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);
            if (!p.HasLogined) return NotFound();
            if (_context.TwitterTweetEntities == null)
            {
                return NotFound();
            }
            return await _context.TwitterTweetEntities.Where(x => x.OwnedUserId == p.UserID)
                .OrderByDescending(x => x.CreateOn).ToListAsync();
        }

        // GET: api/TwitterTweets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TwitterTweetEntity>> GetTwitterTweetEntity(long id)
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);
            if (!p.HasLogined) return NotFound();

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

        // GET: api/twitter/tweets/tags/{tagname},{tagname},{tagname}
        [HttpGet("tags/{strTagnames}")]
        public async Task<ActionResult<IEnumerable<TwitterTweetEntity>>> GetTwitterTweetEntityByTag(string strTagnames)
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);
            if (!p.HasLogined) return NotFound();

            if (_context.TwitterTweetEntities == null)
            {
                return NotFound();
            }

            var tagnames = strTagnames.Split(',').Select(x => x.Trim()).ToList();

            Func< TwitterTweetEntity, bool> Contains = (tweet) => 
            {
                var contains = false;
                if (tweet.Tag == null) return false;
                var dbtags = tweet.Tag.Split(',').Select(x => x.Trim()).ToList();
                dbtags.ForEach(x => 
                {
                    if (tagnames.Contains(x))
                    {
                        contains = true;
                    }
                });
                return contains;
            };
            var twitterTweetEntity = _context.TwitterTweetEntities
                .Where(x => x.OwnedUserId == p.UserID && !string.IsNullOrWhiteSpace(x.Tag)).ToList();

            var tweets = twitterTweetEntity.Where(x => Contains(x)).ToList();

            if (tweets == null)
            {
                return NotFound();
            }

            return tweets;
        }

        // PUT: api/TwitterTweets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTwitterTweetEntity(long id, TwitterTweetEntity twitterTweetEntity)
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);
            if (!p.HasLogined) return NotFound();
            if (p.UserID != twitterTweetEntity.OwnedUserId)
            {
                return BadRequest();
            }

            if (id != twitterTweetEntity.Id)
            {
                return BadRequest();
            }

            var dbEntity = _context.TwitterTweetEntities.Find(twitterTweetEntity.Id);
            if (dbEntity == null)
            {
                return NotFound();
            }

            var tagNames = twitterTweetEntity.Tag.Split(',').Select(x => x.Trim()).ToList();
            dbEntity.Text = twitterTweetEntity.Text;
            dbEntity.Tag = string.Join(',', tagNames);
            dbEntity.ModefiedOn = DateTime.Now;

            _context.Entry(dbEntity).State = EntityState.Modified;

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

            return CreatedAtAction("GetTwitterTweetEntity", new { id = twitterTweetEntity.Id }, twitterTweetEntity);
        }

        // POST: api/TwitterTweets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [EnableCors("All")]
        [HttpPost]
        public async Task<ActionResult<TwitterTweetEntity>> PostTwitterTweetEntity(TwitterTweetEntity twitterTweetEntity)
        {
            var p = new LoginParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);
            if (!p.HasLogined) return NotFound();
            if (p.UserID != twitterTweetEntity.OwnedUserId)
            {
                return BadRequest();
            }

            if (_context.TwitterTweetEntities == null)
            {
                return Problem("Entity set 'TwitterTweetContext.TwitterTweetEntities'  is null.");
            }

            twitterTweetEntity.CreateOn = DateTime.Now;
            twitterTweetEntity.ModefiedOn = DateTime.Now;

            _context.TwitterTweetEntities.Add(twitterTweetEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTwitterTweetEntity", new { id = twitterTweetEntity.Id }, twitterTweetEntity);
        }

        //// DELETE: api/TwitterTweets/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteTwitterTweetEntity(long id)
        //{
        //    if (_context.TwitterTweetEntities == null)
        //    {
        //        return NotFound();
        //    }
        //    var twitterTweetEntity = await _context.TwitterTweetEntities.FindAsync(id);
        //    if (twitterTweetEntity == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.TwitterTweetEntities.Remove(twitterTweetEntity);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool TwitterTweetEntityExists(long id)
        {
            return (_context.TwitterTweetEntities?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
