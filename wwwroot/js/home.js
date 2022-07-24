const myFavoriteTwitterUserIds = []; // {id:"", name:"", iconUri:""}
let userLogined = false;

function showNowloading(text="") {
    let loading = document.getElementById("loading");
    let loadingText = document.getElementById("loading-text");
    loadingText.className = "text-dark";
    loading.style.display = "block";
    loadingText.style.display = "block";
    if(!text) text = "Now Loading...";
    loadingText.innerHTML = text;
}

function hideNowloading(isSuccess=true, text="") {
    let loading = document.getElementById("loading");
    let loadingText = document.getElementById("loading-text");
    if(!text) text = isSuccess ? "Success." : "Error.";
    setTimeout(() => {
        loading.style.display = "none";
        loadingText.className = isSuccess ? "text-primary" : "text-danger";
        loadingText.innerHTML = text;
        setTimeout(() => {
            loadingText.style.display = "none";
            loadingText.style.color = "";
        }, 500);
    }, 500);
}
const alertMessageEle = {
    // プロフィールバナー検索
    PBR : document.getElementById("profile-banner-alert"),
    // ベストツイート検索
    BTR : document.getElementById("best-tweet-alert")
}

function alertMessage(mode="", message="", tip="") {
    let messageHTML = "";
    messageHTML += '<h4 class="alert-heading">エラー</h4>';
    messageHTML += `<p>${message}</p>`;
    if(tip) messageHTML += `<hr><p class="mb-0">${tip.replaceAll('\n', '<br>')}</p>`;

    alertMessageEle[mode].innerHTML = messageHTML;
    alertMessageEle[mode].style.display = "block";
}

function closeAlertMessage(mode="") {
    alertMessageEle[mode].style.display = "none";
}

function addMyFavoriteUserIds(user={id:"", name:"", iconUri:""}) {
    if(typeof(user.id) !== "string") return;
    if(typeof(user.name) !== "string") return;
    if(myFavoriteTwitterUserIds.find(x => x.id === user.id)) return;
    myFavoriteTwitterUserIds.push(user);
}

function refreshMyFavoriteTweetsBox() {
    const btnsGetTweets = document.getElementById('btns-get-tweets');
    btnsGetTweets.innerHTML = '';

    myFavoriteTwitterUserIds.forEach((x) => {
        let btnGetTweets = document.createElement('button');
        btnGetTweets.className = 'btn-get-tweets btn btn-sm btn-outline-secondary';
        btnGetTweets.dataset.id = x.id;
        btnGetTweets.innerHTML = `<img src="${x.iconUri}">` + x.id;
        btnsGetTweets.appendChild(btnGetTweets);
    });

    $(".btn-get-tweets").on('click', async (e) => {
        showNowloading();
        closeAlertMessage("BTR");
        const userName = e.target.dataset.id;
        $("#twitter-user-name").val(userName);
        const tweets = await getTweetByUserName(userName);
        if(tweets.isError){
            alertMessage("BTR", tweets.message, tweets.tip);
            hideNowloading(false);
            return;
        }
        _displayTweets(tweets, _mode.BTR);
        hideNowloading();
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
    showNowloading();

    // ログインメニュー制御
    const pscd = getParam('pscd') || "";
    const retLoginUser = await getLoginUser(pscd);

    if(retLoginUser.hasLogined === true){
        userLogined = true;
        const id = retLoginUser.userId;
        const name = retLoginUser.userName;
        setLoginUser(id, name, userLogined);
        // $("#login-user-text").text(`${name}さん、ようこそ。`);
        $("#login-memu").hide();
        $("#login-user-memu").children().show();
    } else {
        $("#login-memu").show();
        $("#login-user-memu").children().hide();
    }

    $("#btn-twitter-auth").on('click', () => {
        loginAuthorizeTwitter();
    });

    // 画面表示
    $('<div>', {
        id: 'btns-get-tweets'
    }).appendTo("#my-favorite-tweets-box");
    {
        if(userLogined){
            const users = await getMyFavoriteTwitterUsers();
            if(users.isError){
                window.alert(users.message + "\n\n" + users.tip);
                hideNowloading(false);
                return;
            }
            users.forEach(user => {
                addMyFavoriteUserIds({
                        id: user.screenName,
                        name: user.name,
                        iconUri: user.profileImageUrl
                    });
            });
            refreshMyFavoriteTweetsBox();
        }
    }

    if(userLogined){
        const tweets = await getMyFavoriteTwitterTweet();
        if(tweets.length > 0) _displayTweets(tweets, _mode.MFT);
    }

    // 画面イベント
    $("#btn-get-tweet-by-user-name").on('click', async () => {
        showNowloading();
        closeAlertMessage("BTR");
        const userName = $("#twitter-user-name").val();
        const tweets = await getTweetByUserName(userName);
        if(tweets.isError){
            alertMessage("BTR", tweets.message, tweets.tip);
            hideNowloading(false);
            return;
        }
        _displayTweets(tweets, _mode.BTR);
        hideNowloading(true);
    });
    
    $("#btn-show-favorite-tweet").on('click', async () => {
        showNowloading();
        const tweets = await getMyFavoriteTwitterTweet();
        _displayTweets(tweets, _mode.MFT);
        hideNowloading(true);
    });

    $("#btn-show-favorite-timeline").on('click', async () => {
        showNowloading();
        let usernames = myFavoriteTwitterUserIds.map(x => x.id);
        const tweets = await getTweetByUsersTimeline(usernames);
        _displayTweets(tweets, _mode.MTL);
        hideNowloading(true);
    });

    hideNowloading(true);
}

ini();