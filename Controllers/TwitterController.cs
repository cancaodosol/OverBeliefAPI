using CoreTweet;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OverBeliefApi.Common;
using OverBeliefApi.Database;
using OverBeliefApi.Dtos;
using OverBeliefApi.Models;
using OverBeliefApi.Models.Twitter;
using System.Text.Json;

namespace OverBeliefApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TwitterController : ControllerBase
    {
        private readonly TwitterApplication _twitterApplication;
        private readonly MyContext _context;
        private Config config = Config.Instance;

        public TwitterController(MyContext context)
        {
            _twitterApplication = new TwitterApplication();
            _context = context;
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

            var p = new LoginParameters();
            p.InitValidate(HttpContext, _context).ConfigureAwait(false); // ConfigureAwait(false)にすることで、await以降の処理も再度非同期で行われるらしい。
            Console.WriteLine("UserID ; {0}, p.UserName : {1}", p.UserID, p.UserName);

            // p.UserName = "twitter loginでセットされました。";

            // セッション情報にOAuthSessionの内容を保存
            HttpContext.Session.Set(nameof(OAuthSession), JsonSerializer.SerializeToUtf8Bytes(OAuthSession));

            // レスポンスヘッダーのLocationへ、URLを指定することで、戻った先からリダイレクトしてもらう．
            //HttpContext.Response.Headers.Add("Location", OAuthSession.AuthorizeUri.OriginalString);
            //return StatusCode(StatusCodes.Status303SeeOther);
            return Ok(new { url = OAuthSession.AuthorizeUri.OriginalString });
        }

        public class TwitterCallbackParameters : LoginParameters
        {
            [FromQuery(Name = "oauth_token")]
            public string? oauth_token { get; set; }
            [FromQuery(Name = "oauth_verifier")]
            public string? oauth_verifier { get; set; }
            //[FromQuery(Name = "denied")] 認証キャンセルのときはこの値でかえってくる。
            //public string denied { get; set; }

        }

        /// <summary>
        /// 「Twitterサインイン」の認証後のコールバックをここで受け取る．
        /// ・承認後：oauth_verifier、oauth_verifierを取得
        /// ・キャンセル：deniedを取得（これを設定しておかないと、ここの処理にはいらない．でも、使用はしない．）
        /// </summary>
        /// <param name="p"></param>
        /// <returns></returns>
        [EnableCors("All")]
        [HttpGet("callback")]
        public async Task<IActionResult> TwitterCallBack([FromQuery] string? oauth_verifier = null, [FromQuery] string? oauth_token = null, [FromQuery] string? denied = null)
        {
            var p = new TwitterCallbackParameters();
            await p.InitValidate(HttpContext, _context).ConfigureAwait(false);

            p.oauth_verifier = oauth_verifier;
            p.oauth_token = oauth_token;

            // 直リンクやTwitterの認証拒否はトップページへ飛ばす
            if (p.oauth_token == null || p.oauth_verifier == null)
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
                var token = OAuthSession.GetTokens(p.oauth_verifier);
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
            var tweets = await Task.Run(() => _twitterApplication.GetMostFavoritedTweets(userName.Trim(), 150));
            if (tweets == null || tweets.Count == 0)
            {
                var message = "検索結果が、0件でした。";
                var tip = "入力したTwitterユーザー名に問題がないか確認してください。\n";
                tip += "※Twitterのユーザー名は「@」を先頭に、英数字とアンダースコア「_」で構成された名前です。\n";
                tip += "\n";
                tip += "また、鍵垢などの場合は、正しくても0件となることがあります。";
                return NotFound(new ErrorMsgDto(message, tip));
            }
            return Ok(tweets.Select(x => new TwitterTweetApiDto(x)).ToArray());
        }

        // GET: api/twitter/timeline_user/{{userName},{userName},{userName}}
        [EnableCors("All")]
        [HttpGet("timeline_user/{userNames}")]
        public async Task<ActionResult<IEnumerable<TwitterTweetApiDto>>> GetTwtterTimeLineByUserNames(string userNames)
        {
            var targetUserNames = userNames.Split(',').Select(x => x.Trim()).ToArray();
            var tweets = await Task.Run(() => _twitterApplication.GetTimelines(targetUserNames, 50));
            return Ok(tweets.Select(x => new TwitterTweetApiDto(x)).ToArray());
        }
    }
}
