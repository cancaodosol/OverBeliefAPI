namespace OverBeliefApi.Models
{
    public class LoginParameters
    {
        protected HttpContext Context { get; private set; }

        long? _userID;
        public long? UserID 
        {
            get { return _userID; }
            set 
            { 
                _userID = value;
                if (value.HasValue) { SetCookie(nameof(UserID), value.Value.ToString(), false); }
                else { ClearCookie(nameof(UserID)); }
            }
        }

        string _LoginToken;
        public string LoginToken 
        {
            get { return _LoginToken; }
            set { if (value != null) { SetCookie(nameof(LoginToken), value, true); } else { ClearCookie(nameof(LoginToken)); } }
        }

        public string UserName
        {
            get { return TryGetCookie(nameof(UserName), out string ret) ? ret : null; }
            set { if (value != null) { SetCookie(nameof(UserName), value, true); } else { ClearCookie(nameof(UserName)); } }
        }
        public virtual async Task InitValidate(HttpContext _Context) 
        {
            Context = _Context;

            // Cookie由来のパラーメ―ターを読み込む
            _userID = TryGetCookie(nameof(UserID), out string UserIDStr) && long.TryParse(UserIDStr, out long __userID) ? __userID : null as long?;
            _LoginToken = TryGetCookie(nameof(LoginToken), out string __LoginTokenStr) ? __LoginTokenStr : null;

            // ログイン確認
            if (UserID != null) 
            {
            }
        }

        /// <summary>
        /// Cookieの読み込みをちょっと楽にする
        /// </summary>
        /// <param name="Name"></param>
        /// <returns></returns>
        protected bool TryGetCookie(string Name, out string Value) { return Context.Request.Cookies.TryGetValue(Name, out Value); }

        /// <summary>
        /// Cookieに所定のオプションを付けて書き込む
        /// </summary>
        /// <param name="Name"></param>
        /// <param name="Value"></param>
        /// <param name="Ephemeral">ブラウザ閉じたら消されるかどうか</param>
        protected void SetCookie(string Name, string Value, bool HttpOnly)
        {
            Context.Response.Cookies.Append(Name, Value, new CookieOptions()
            {
                HttpOnly = HttpOnly,
                SameSite = SameSiteMode.Lax,
                Secure = true,
                Expires = DateTimeOffset.UtcNow.AddYears(1)
            });
        }
        /// <summary>
        /// Cookieを消すだけ
        /// </summary>
        /// <param name="Name"></param>
        protected void ClearCookie(string Name)
        {
            Context.Response.Cookies.Append(Name, "", new CookieOptions()
            {
                HttpOnly = false,
                Secure = false,
                Expires = DateTimeOffset.FromUnixTimeSeconds(0)
            });
        }
    }
}
