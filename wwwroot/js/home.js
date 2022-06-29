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
        getMyFavoriteTwitterUsers();
        refreshMyFavoriteTweetsBox();
    }

    $('<div>', {
        id: 'btns-get-recently-tweets'
    }).appendTo("#my-favorite-tweets-box");
    {
        $('<button>', {
            onclick: "getRecentlyTweets(15)",
            text: "最近の15件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            onclick: "getRecentlyTweets(30)",
            text: "最近の30件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            onclick: "getRecentlyTweets(50)",
            text: "最近の50件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            onclick: "getRecentlyTweets()",
            text: "全件表示"
        }).appendTo("#btns-get-recently-tweets");
    }

    // 画面イベント
    $("#btn-get-tweet-by-user-name").on('click', () => {
        const userName = $("#twitter-user-name").val();
        getTweetByUserName(userName);

        if(myFavoriteTwitterUserIds.find(x => x.id === userName) === undefined)
        {
            myFavoriteTwitterUserIds.push({id: userName});
            $('<button>', {
                class: 'btn-get-tweets',
                'data-id': userName,
                text: "@" + userName
            }).appendTo("#btns-get-tweets");
        }
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