const myFavoriteTwitterUserIds = [
    {id : "mintia_tweet"},
    {id : "annin_book"},
    {id : "yuki_99_s"},
    {id : "ottosan884"},
    {id : "wakki131313"},
    {id : "ziraiya01"},
    {id : "akki_contents"},
    {id : "0H1de"}
];

window.onload = () => {

    // 画面表示
    $('<div>', {
        id: 'btns-get-tweets'
    }).appendTo("#my-favorite-tweets-box");
    {
        getMyFavoriteTwitterUsers(refreshMyFavoriteTweetsBox);
    }

    getMyFavoriteTwitterTweet();

    // 画面イベント
    $("#btn-get-tweet-by-user-name").on('click', () => {
        const userName = $("#twitter-user-name").val();
        getTweetByUserName(userName);
    });
    
    $("#btn-show-favorite-tweet").on('click', () => {
        getMyFavoriteTwitterTweet();
    });
}
function addMyFavoriteUserIds(screenName) {
    if(typeof(screenName) !== "string") return;
    if(myFavoriteTwitterUserIds.find(x => x.id === screenName)) return;
    myFavoriteTwitterUserIds.push({id : screenName});
}

function refreshMyFavoriteTweetsBox() {
    const btnsGetTweets = document.getElementById('btns-get-tweets');
    btnsGetTweets.innerHTML = '';

    myFavoriteTwitterUserIds.forEach((x) => {
        $('<button>', {
            class: 'btn-get-tweets',
            'data-id': x.id,
            text: "@" + x.id
        }).appendTo("#btns-get-tweets");
    });

    $(".btn-get-tweets").on('click', (e) => {
        const userName = e.target.innerText;
        $("#twitter-user-name").val(userName);
        getTweetByUserName(userName);
    });
}