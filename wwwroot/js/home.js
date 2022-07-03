const myFavoriteTwitterUserIds = []; // {id:"", name:""}

function addMyFavoriteUserIds(user = {id:"", name:""}) {
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
            class: 'btn-get-tweets btn btn-outline-secondary',
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

async function ini() {

    // 画面表示
    $('<div>', {
        id: 'btns-get-tweets'
    }).appendTo("#my-favorite-tweets-box");
    {
        const users = await getMyFavoriteTwitterUsers();
        users.forEach(user => {
            myFavoriteTwitterUserIds.push({
                    id: user.screenName,
                    name: user.name
                });
        });
        refreshMyFavoriteTweetsBox();
    }

    const tweets = await getMyFavoriteTwitterTweet();
    _displayTweets(tweets);

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