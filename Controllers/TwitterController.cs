using CoreTweet;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OverBeliefApi.Common;
using OverBeliefApi.Models.LoginUser;
using OverBeliefApi.Models.Twitter;
using System.Text.Json;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TwitterController : ControllerBase
    {
        private readonly TwitterApplication _twitterApplication;
        private Config config = Config.Instance;

        public TwitterController()
        {
            _twitterApplication = new TwitterApplication();
        }

        /// <summary>
        /// 「Twitterでサインイン」を始める.
        /// </summary>
        /// <returns></returns>
        //https://github.com/204504bySE/twigaten/blob/61dcb94d4d0fb5d7d2d932ae0ee07021d2da26f2/Web/Controllers/AuthController.cs
        //http://nakaji.hatenablog.com/entry/2014/09/19/024341
        [EnableCors("All")]
        [HttpPost("login")]
        public ActionResult Login() 
        {

            //"{TwitterApiKey}", "{TwitterApiKeySecret}", "https://h1deblog.com/overbeliefapi/twitter/callback"
            var OAuthSession = OAuth.Authorize(config.token.ConsumerKey, config.token.ConsumerSecret, config.web.CallBackUrl);

            // セッション情報にOAuthSessionの内容を保存
            HttpContext.Session.Set(nameof(OAuthSession), JsonSerializer.SerializeToUtf8Bytes(OAuthSession));

            // レスポンスヘッダーのLocationへ、URLを指定することで、戻った先からリダイレクトしてもらう．
            //HttpContext.Response.Headers.Add("Location", OAuthSession.AuthorizeUri.OriginalString);
            //return StatusCode(StatusCodes.Status303SeeOther);
            return Ok(new { url=OAuthSession.AuthorizeUri.OriginalString });
        }

        public class TwitterCallbackParameters
        {
            [FromQuery]
            public string oauth_token { get; set; }
            [FromQuery]
            public string oauth_verifier { get; set; }

        }

        /// <summary>
        /// 「Twitterサインイン」の認証後のコールバックをここで受け取る．
        /// </summary>
        /// <param name="p"></param>
        /// <returns></returns>
        [EnableCors("All")]
        [HttpGet("callback")]
        public async Task<IActionResult> TwitterCallBack([FromQuery] string oauth_token, [FromQuery] string oauth_verifier) 
        {
            // 直リンクやTwitterの認証拒否はトップページへ飛ばす
            if (oauth_token == null || oauth_verifier == null) 
            {
                HttpContext.Response.Headers.Add("Location", "/");
                return StatusCode(StatusCodes.Status303SeeOther);
            }

            OAuth.OAuthSession OAuthSession;            
            var SessionUtf8 = HttpContext.Session.Get("OAuthSession");
            if (SessionUtf8 == null)
            {
                HttpContext.Response.Headers.Add("Location", "/");
                return StatusCode(StatusCodes.Status303SeeOther);
            }
            OAuthSession = JsonSerializer.Deserialize<OAuth.OAuthSession>(SessionUtf8);

            if (OAuthSession != null) 
            {
                var token = OAuthSession.GetTokens(oauth_verifier);
            }

            HttpContext.Response.Headers.Add("Location", "/");
            return StatusCode(StatusCodes.Status303SeeOther);
        }

        // GET: api/twitter/user_search/{searchKeyWord}
        [EnableCors("All")]
        [HttpGet("user_search/{searchKeyWord}")]
        public async Task<ActionResult<IEnumerable<TwitterUserApiDto>>> GetTwitterUsersBySearchKeyWord(string searchKeyWord)
        {
            var users = await Task.Run(() => _twitterApplication.GetProfileBannersBySearchKeyWord(searchKeyWord, 50));
            return Ok(users.Select(x => new TwitterUserApiDto(x)).ToArray());
        }

        // GET: api/twitter/tweet_best/{userName}
        [EnableCors("All")]
        [HttpGet("tweet_best/{userName}")]
        public async Task<ActionResult<IEnumerable<TwitterTweetApiDto>>> GetTweetsByUserName(string userName)
        {
            var tweets = await Task.Run(() => _twitterApplication.GetMostFavoritedTweets(userName, 150));
            return Ok(tweets.Select(x => new TwitterTweetApiDto(x)).ToArray());
        }
    }
}
