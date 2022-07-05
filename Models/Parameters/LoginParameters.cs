using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Common;
using OverBeliefApi.Database;
using OverBeliefApi.Entites;
using OverBeliefApi.Models.LoginUser;

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

        string? _PSCD;
        public string? PSCD
        {
            get { return _PSCD; }
            set
            {
                _PSCD = value;
                if (value != null) { SetCookie(nameof(PSCD), value, true); }
                else { ClearCookie(nameof(PSCD)); } 
            }
        }

        string _userName;
        public string? UserName
        {
            get { return _userName; }
            set 
            {
                _userName = value;
                if (value != null) { SetCookie(nameof(UserName), value, true); } else { ClearCookie(nameof(UserName)); } 
            }
        }

        public bool HasLogined { get { return UserID != null; } }
        public virtual async Task InitValidate(HttpContext _Context, MyContext DbContext, string? pscd = "") 
        {
            Context = _Context;

            if (pscd == "")
            {
                // Cookie由来のパラーメ―ターを読み込む
                pscd = TryGetCookie(nameof(PSCD), out string __LoginTokenStr) ? __LoginTokenStr : null;
                _userID = TryGetCookie(nameof(UserID), out string UserIDStr) && long.TryParse(UserIDStr, out long __userID) ? __userID : null as long?;
            }

            // ログイン確認
            if (!string.IsNullOrWhiteSpace(pscd)) 
            {
                var dbUser = await DbContext.LoginUserEntities
                    .Where(x => x.PassCode == pscd).FirstOrDefaultAsync();
                if (dbUser != null)
                {
                    // キャッシュの有効期限を延期する
                    UserID = dbUser.Id;
                    PSCD = pscd;
                    UserName = dbUser.LastName + " " + dbUser.FirstName;
                }
                else 
                {
                    Logout();
                }
            }
        }

        /// <summary>
        /// サインアウト時に、Cookieを消す処理
        /// </summary>
        public void Logout(HttpContext context = null)
        {
            if(context != null) Context = context;
            Context.Session.Clear();
            PSCD = null;
            UserID = null;
            UserName = null;
        }

        /// <summary>
        /// ユーザー情報をCookieに保存する．主にログイン後に、これを使ってセットする．
        /// </summary>
        /// <param name="context"></param>
        /// <param name="user"></param>
        public void SetCookie(LoginUserEntity user, HttpContext context = null)
        {
            if (context != null) Context = context;
            PSCD = user.PassCode;
            UserID = user.Id;
            UserName = user.LastName + " " + user.FirstName;
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
