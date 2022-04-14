using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OverBeliefApi.Models.Twitter;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TwitterController : ControllerBase
    {
        private readonly TwitterApplication _twitterApplication;

        public TwitterController()
        {
            _twitterApplication = new TwitterApplication();
        }

        // GET: api/TodoItems
        [EnableCors("All")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TwitterUserApiDto>>> GetTodoItems()
        {
            return NotFound();
        }

        // GET: api/twitter/user_search
        [EnableCors("All")]
        [HttpGet("user_search/{searchKeyWord}")]
        public async Task<ActionResult<IEnumerable<TwitterUserApiDto>>> GetTwitterUsersBySearchKeyWord(string searchKeyWord)
        {
            var users = _twitterApplication.GetProfileBannersBySearchKeyWord(searchKeyWord, 10);
            return Ok(users.Select(x => new TwitterUserApiDto(x)).ToArray());
        }

        // GET: api/twitter/user_search
        [EnableCors("All")]
        [HttpGet("tweet_best/{userName}")]
        public async Task<ActionResult<IEnumerable<CoreTweet.Status>>> GetTweetsByUserName(string userName)
        {
            var tweets = _twitterApplication.GetMostFavoritedTweets(userName, 50);
            return Ok(tweets);
        }
    }
}
