const myFavoriteTwitterUserIds = []; // {id:"", name:""}
let userLogined = false;

function addMyFavoriteUserIds(user={id:"", name:""}) {
    if(typeof(user.id) !== "string") return;
    if(typeof(user.name) !== "string") return;
    if(myFavoriteTwitterUserIds.find(x => x.id === user.id)) return;
    myFavoriteTwitterUserIds.push(user);
}

function refreshMyFavoriteTweetsBox() {
    const btnsGetTweets = document.getElementById('btns-get-tweets');
    btnsGetTweets.innerHTML = '';

    myFavoriteTwitterUserIds.forEach((x) => {
        $('<button>', {
            class: 'btn-get-tweets btn btn-sm btn-outline-secondary',
            'data-id': x.id,
            text: "@" + x.id
        }).appendTo("#btns-get-tweets");
    });

    $(".btn-get-tweets").on('click', async (e) => {
        const userNameAt = e.target.innerText;
        if(userNameAt.length === 0) return;
        const userName = userNameAt.slice(1);
        $("#twitter-user-name").val(userName);
        const tweets = await getTweetByUserName(userName);
        _displayTweets(tweets);
    });
}

// https://illbenet.jp/view/js-get_param
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

async function ini() {

    // ログインメニュー制御
    const pscd = getParam('pscd') || "";
    const retLoginUser = await getLoginUser(pscd);

    if(retLoginUser.hasLogined === true){
        userLogined = true;
        const id = retLoginUser.userId;
        const name = retLoginUser.userName;
        setLoginUser(id, name, userLogined);
        $("#login-user-text").text(`${name}さん、ようこそ。`);
        $("#login-memu").hide();
        $("#login-user-memu").children().show();
    } else {
        $("#login-memu").show();
        $("#login-user-memu").children().hide();
    }

    // 画面表示
    $('<div>', {
        id: 'btns-get-tweets'
    }).appendTo("#my-favorite-tweets-box");
    {
        if(userLogined){
            const users = await getMyFavoriteTwitterUsers();
            users.forEach(user => {
                addMyFavoriteUserIds({
                        id: user.screenName,
                        name: user.name
                    });
            });
            refreshMyFavoriteTweetsBox();
        }
    }

    if(userLogined){
        const tweets = await getMyFavoriteTwitterTweet();
        if(tweets.length > 0) _displayTweets(tweets);
    }

    // 画面イベント
    $("#btn-get-tweet-by-user-name").on('click', async () => {
        const userName = $("#twitter-user-name").val();
        const tweets = await getTweetByUserName(userName);
        _displayTweets(tweets);
    });
    
    $("#btn-show-favorite-tweet").on('click', async () => {
        const tweets = await getMyFavoriteTwitterTweet();
        _displayTweets(tweets);
    });
}

ini();