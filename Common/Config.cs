using IniParser;
using IniParser.Model;

namespace OverBeliefApi.Common
{
    public class Config
    {
        private static readonly Config _config = new Config();
        private Config() { Reload(); }

        /// <summary>iniファイルの読み込み </summary>
        //https://baba-s.hatenablog.com/entry/2020/03/11/090000
        public void Reload() 
        {
            IniData data;
            try 
            {
                string? iniPath = Environment.GetEnvironmentVariable("OVERBELIEFAPI_CONFIG_PATH");
                if (string.IsNullOrWhiteSpace(iniPath)) 
                {
                    iniPath = "overbeliefapi.ini";
                }
                var ini = new FileIniDataParser();
                data = ini.ReadFile(iniPath);
            } 
            catch 
            {
                data = new IniData();
                Console.WriteLine("FAILED TO LOAD config file.");
            }
            token = new _token(data);
            web = new _web(data);
        }
        public static Config Instance
        {
            get { return _config; } 
        }
        public class _token 
        {
            public string ConsumerKey { get; }
            public string ConsumerSecret { get; }
            public _token(IniData data)
            {
                ConsumerKey = data["token"]["ConsumerKey"];
                ConsumerSecret = data["token"]["ConsumerSecret"];
            }
        }
        public _token token;

        public class _web
        {
            public string HomeUrl { get; }
            public string CallBackUrl { get; }
            public _web(IniData data)
            {
                // "https://localhost:7233" or "https://h1deblog.com/overbeliefapi"
                HomeUrl = data["web"]["HomeUrl"] ?? "";

                // "/api/twitter/callback"
                CallBackUrl = HomeUrl + data["web"][nameof(CallBackUrl)] ?? "";
            }
        }
        public _web web;
    }
}
