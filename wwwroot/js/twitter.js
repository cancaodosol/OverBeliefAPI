const twitterApiUri = 'https://localhost:7233/api/twitter';
// const twitterApiUri = 'https://h1deblog.com/overbeliefapi/api/twitter';
const twitterOfficialUri = 'https://twitter.com';
let twitterUsers = [];
let twitterTweets = [];
const loginUser = {
    hasLogined : false,
    id : -1,
    name : "",
}
const _mode = {
    // プロフィールバナー検索
    PBR : "PBR",
    // ベストツイート検索
    BTR : "BTR",
    // お気に入りツイート一覧
    MFT : "MFT",
    // マイタイムライン
    MTL : " MTL"
};

function toErrorObj(error=new Error(), id="", code="999") {
    console.error(error);
    let message = "システムの内部エラーが発生しました。";
    let tip = "申し訳ございませんが、開発者へお問い合わせください。";
    return { 
        isError : true,
        message : message,
        tip : tip,
        id : id,
        code : code,
    };
}

function setLoginUser(id="", name="", haslogined=false) {
    loginUser.id = id;
    loginUser.name = name;
    loginUser.hasLogined = haslogined;
}

async function getMyFavoriteTwitterUsers() {
    return await fetch(`${twitterApiUri}/users`)
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
}

function addMyFavoriteTwitterUsers(twitterUserEntity) {
    fetch(`${twitterApiUri}/users`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(twitterUserEntity)
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .then(data => {
        if(!data.id){window.alert(`【${twitterUserEntity.name}】の登録が失敗しました。`); return;}
        window.alert(`【${data.name}】の登録が完了しました。`);
        addMyFavoriteUserIds({id:data.screenName, name:data.name, iconUri:data.profileImageUrl});
        refreshMyFavoriteTweetsBox();
    })
    .catch(error => toErrorObj(error));
}

async function getMyFavoriteTwitterTweet() {
    return await fetch(`${twitterApiUri}/tweets`)
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
}

async function addMyFavoriteTwitterTweet(tweetEntity) {
    const ret = await fetch(`${twitterApiUri}/tweets`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetEntity)
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));

    if(ret.isError) return ret;
    return { isError : (!ret.id), message: ret.id ? "登録成功" : "登録失敗"};
}

async function editMyFavoriteTwitterTweet(tweetEntity) {
    const ret = await fetch(`${twitterApiUri}/tweets/${tweetEntity.id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetEntity)
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));

    if(ret.isError) return ret;
    return { isError : (!ret.id), message: ret.id ? "保存成功" : "保存失敗"};
}

async function getMyFavoriteTwitterTweetByTags(tagname="") {
    return await fetch(`${twitterApiUri}/tweets/tags/${tagname}`)
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
}

function getTwitterUsersBySearchKeyWord() {
    const searchKeyWord = document.getElementById('twitter-search-keyword').value;
    fetch(`${twitterApiUri}/user_search/${searchKeyWord}`)
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .then(data => _displayTwitterUsers(data))
    .catch(error => toErrorObj(error));
}

async function getTweetByUserName(userName) {
    return await fetch(`${twitterApiUri}/tweet_best/${userName}`)
        .then(response => response.json())
        .catch(error => toErrorObj(error));
}

async function getTweetByUsersTimeline(userNames = []) {
    joinedUserNames = userNames.join(",");
    return await fetch(`${twitterApiUri}/timeline_user/${joinedUserNames}`)
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
}

function loginAuthorizeTwitter() {
    fetch(`${twitterApiUri}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .then(data => {if(data.url) window.location.assign(data.url);})
    .catch(error => toErrorObj(error));
}

function downloadTweetsCSV(tweets) {
    const tweetsHeader = [
        // ["id" , "ツイートID"],
        ["favoriteCount" , "いいね数"],
        ["retweetCount" , "リツイート数"],
        ["text" , "テキスト"],
        ["fullText" , "フルテキスト"],
        ["source" , "ソース"],
        ["createdAt" , "投稿日"],
    ];

    let csvHeader = "";
    tweetsHeader.forEach(h => {
        csvHeader += ( h[1] + "," );
    });

    let csvBody = "";
    tweets.forEach(tweet => {
        tweetsHeader.forEach(h => {
            const value = tweet[h[0]] ? tweet[h[0]].toString().replaceAll("\n", "\\n") : "";
            csvBody += ( value + "," );
        });
        csvBody += "\n";
    });

    const csvdata = csvHeader + "\n"
        + csvBody;

    const filename = `${tweets[0].user.name}@${tweets[0].user.screenName}_ツイート一覧_by_OverBeliefTool.csv`;
    
    // 文字化け対策: https://ameblo.jp/hero-design/entry-12652005689.html
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    
    const csvbinarydata = new Blob([bom, csvdata], {type: "text/csv"});
    const url = URL.createObjectURL(csvbinarydata);

    const onceLink = document.createElement("a");
    onceLink.download = filename;
    onceLink.href = url;

    document.body.appendChild(onceLink);
    onceLink.click();

    document.body.removeChild(onceLink);
    delete onceLink;
}

const _iconbase = document.createElement("i");
_iconbase.className = "bi-alarm";
_iconbase.style.fontSize = "2rem";
_iconbase.style.width = "32";
_iconbase.style.height = "32";

function _displayTwitterUsers(users) {

    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    if(users.length === 0)
    {
        resultBox.innerHTML = '対象データは、ありません。';
        return;
    }

    users.forEach(user => {
        resultBox.appendChild(_createTwitterUserElement(user));
    });

    twitterUsers = users;
}

function _createTwitterUserElement(user)
{
    let row = document.createElement('div');
    row.className = "twitter-profile-card";
    
    if(!user) return row;

    let topbar = document.createElement('div');
    topbar.className = "twitter-profile-card-header";
    topbar.innerHTML = `[ ${user.name} ]`;
    row.appendChild(topbar);

    let profileBanner = document.createElement('img');
    profileBanner.className = "twitter-profilebar-img";
    profileBanner.src = user.profileBannerUrl;
    profileBanner.setAttribute("onerror", "this.src='./image/nodata-frofile.png';");
    row.appendChild(profileBanner);

    let profileImage = document.createElement('img');
    profileImage.className = "twitter-profileicon-img";
    profileImage.src = user.profileImageUrl;
    row.appendChild(profileImage);

    let profileName = document.createElement('div');
    profileName.className = "twitter-name";
    {
        let name = document.createElement('div');
        name.innerHTML = user.name;
        profileName.appendChild(name);
        let screenName = document.createElement('a');
        screenName.href = twitterOfficialUri + '/' + user.screenName;
        screenName.innerHTML = '@' + user.screenName;
        profileName.appendChild(screenName);
    }
    row.appendChild(profileName);

    let profileText = document.createElement('div');
    profileText.className = "profile-text";
    profileText.innerHTML = user.description;
    row.appendChild(profileText);

    let followerInfo = document.createElement('div');
    followerInfo.className = "twitter-profile-card-footer";
    followerInfo.innerHTML = `<span class="profile-count-text">${user.friendsCount.toLocaleString()}</span> フォロー中`
        + `<span class="profile-count-text">${user.followersCount.toLocaleString()}</span> フォロワー`;
    row.appendChild(followerInfo);
    
    let btnbar = document.createElement('div');
    {
        let btnAddFavorite = document.createElement('button');
        btnAddFavorite.appendChild(_iconbase);
        btnAddFavorite.textContent = "お気に入り登録"
        btnAddFavorite.className = " btn btn-sm btn-outline-secondary";
        btnAddFavorite.onclick = () => {
            showNowloading();
            const userEntity = {
                "ownedUserId": loginUser.id,
                "div": "F",
                "tag": "",
                "name": user.name,
                "screenName": user.screenName,
                "friendsCount": user.friendsCount,
                "followersCount": user.followersCount,
                "profileBannerUrl": user.profileBannerUrl,
                "profileImageUrl": user.profileImageUrl,
                "description": user.description
            }
            addMyFavoriteTwitterUsers(userEntity);
        };
        btnbar.appendChild(btnAddFavorite);
    }
    row.appendChild(btnbar);

    return row;
}

function _displayTweets(tweets, mode="") {
    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    if(tweets.length === 0)
    {
        resultBox.innerHTML = '対象データは、ありません。';
        return;
    }

    let userProfile = _createTwitterUserElement(tweets[0].user ?? null);
    resultBox.appendChild(userProfile);

    let tweetResultDaysEle = document.createElement('div');
    tweetResultDaysEle.id = "twitter_calendar";
    resultBox.appendChild(tweetResultDaysEle);
    drawChart(summaryTweetsForChatData(tweets), tweetResultDaysEle);

    $('<div>', {
        id: 'btns-get-recently-tweets'
    }).appendTo($(resultBox));
    {
        $('<button>', {
            class: "btn btn-sm btn-sm btn-primary",
            onclick: "getRecentlyTweets(15, '"+ mode +"')",
            text: "最近の15件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-sm btn-primary",
            onclick: "getRecentlyTweets(30, '"+ mode +"')",
            text: "最近の30件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-sm btn-primary",
            onclick: "getRecentlyTweets(50, '"+ mode +"')",
            text: "最近の50件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-sm btn-primary",
            onclick: "getRecentlyTweets(80, '"+ mode +"')",
            text: "最近の80件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-sm btn-primary",
            onclick: "getRecentlyTweets(, '"+ mode +"')",
            text: "全件表示"
        }).appendTo("#btns-get-recently-tweets");
    }

    let tweetMenu = document.createElement('div');
    tweetMenu.id = "twitter-menu";

    let btnSortCreateAt = document.createElement('button');
    btnSortCreateAt.textContent = "投稿順で表示"
    btnSortCreateAt.className = "btn btn-sm btn-outline-secondary";
    btnSortCreateAt.onclick = () => {
        const sortedTweets = getTweetsSortedByCreateAt();
        _displayTweets(sortedTweets, mode);
    };
    tweetMenu.appendChild(btnSortCreateAt);

    let btnDownloadCSV = document.createElement('button');
    btnDownloadCSV.textContent = "このツイート情報をCSVで出力する"
    btnDownloadCSV.className = "btn btn-sm btn-outline-secondary";
    btnDownloadCSV.onclick = () => {
        const ret = downloadTweetsCSV(twitterTweets);
    };
    tweetMenu.appendChild(btnDownloadCSV);

    resultBox.appendChild(tweetMenu);
    
    switch(mode){
        case _mode.BTR:
            break;
        case _mode.MFT:
            userProfile.style.display = "none";
            $("#btns-get-recently-tweets").hide();
            btnDownloadCSV.style.display = "none";
            break;
        case _mode.MTL:
            userProfile.style.display = "none";
            tweetResultDaysEle.style.display = "none";
            $("#btns-get-recently-tweets").hide();
            btnSortCreateAt.style.display = "none";
            btnDownloadCSV.style.display = "none";
            break;
        default:
            userProfile.style.display = "none";
            tweetResultDaysEle.style.display = "none";
            $("#btns-get-recently-tweets").hide();
            btnSortCreateAt.style.display = "none";
            btnDownloadCSV.style.display = "none";
            break;
    }

    const shouldShowUserName = ( mode === _mode.MFT || mode === _mode.MTL ); 
    tweets.forEach(tweet => {
        let row = document.createElement('div');
        row.id = `tweet_id_${tweet.id}`;
        row.className = "tweet-card";

        let topbar = document.createElement('div');
        topbar.className = "tweet-card-header";
        {
            if(shouldShowUserName === true)
            {
                let tweetedUserName = document.createElement('span');
                let userNameLabel = tweet.user ? `${tweet.user.name}@${tweet.user.screenName}` : `${tweet.tweetedUserName}@${tweet.tweetedUserScreenName}`;
                tweetedUserName.innerHTML = `<strong>[ ${userNameLabel} ]</strong>`;
                topbar.appendChild(tweetedUserName);
            }
        }
        row.appendChild(topbar);

        let tweetText = document.createElement('div');
        tweetText.id = `tweet-text-${tweet.id}`;
        tweetText.className = "tweet-text";
        tweetText.innerHTML = tweet.text;
        row.appendChild(tweetText);

        let tweetTags = document.createElement('div');
        tweetTags.id = `tweet-tag-${tweet.id}`;
        tweetTags.className = "tweet-tag-box";
        let tagNames = tweet.tag ? tweet.tag.split(',') : [];
        tagNames.forEach(tagName => {
            let tagNameEle = document.createElement('a');
            tagNameEle.className = "tweet-tag-name";
            tagNameEle.href = "#" + tagName;
            tagNameEle.innerHTML = "#" + tagName;
            tagNameEle.onclick = async () => {
                showNowloading();
                const tagtweets = await getMyFavoriteTwitterTweetByTags(tagName);
                let message = !tagtweets.isError ? "取得完了" : "取得失敗";
                if(!tagtweets.isError) _displayTweets(tagtweets, mode);
                hideNowloading(!tagtweets.isError, message);
            }
            tweetTags.appendChild(tagNameEle);
        });
        row.appendChild(tweetTags);

        let tweetInfo = document.createElement('div');
        tweetInfo.className = "tweet-card-footer";
        {
            tweetInfo.innerHTML = '<img src="./image/heart.svg" alt="hart" width="15" height="15"><span class="tweet-count-text">' + tweet.favoriteCount + '</span>' + 
                '<img src="./image/retweet.svg" alt="hart" width="15" height="15"><span class="tweet-count-text">' + tweet.retweetCount + '</span>' + 
                ' (' + tweet.createdAt + ') ' + tweet.source;
            /*
            let linkToOriginalTweet = document.createElement('a');
            linkToOriginalTweet.href = tweet.entities.urls[0].url;
            linkToOriginalTweet.innerHTML = ' >> Twitterでみる';
            tweetInfo.appendChild(linkToOriginalTweet);
            */
        }
        row.appendChild(tweetInfo);

        let btnbar = document.createElement('div');
        {
            let btnAddFavorite = document.createElement('button');
            btnAddFavorite.appendChild(_iconbase);
            btnAddFavorite.textContent = "お気に入り登録"
            btnAddFavorite.className = " btn btn-sm btn-outline-secondary";
            btnAddFavorite.onclick = async () => {
                showNowloading();
                const tweetEntity = {
                    "ownedUserId": loginUser.id,
                    "div": "F",
                    "tag": "",
                    "TweetId": tweet.id,
                    "text": tweet.text,
                    "fullText": tweet.fullText ?? "",
                    "retweetCount": tweet.retweetCount,
                    "favoriteCount": tweet.favoriteCount,
                    "source": tweet.source,
                    "createdAt": tweet.createdAt,
                    "tweetedUserId": tweet.user.id,
                    "tweetedUserName": tweet.user.name,
                    "tweetedUserScreenName": tweet.user.screenName
                }
                let ret = addMyFavoriteTwitterTweet(tweetEntity);
                let message = !ret.isError ? "登録完了" : "登録失敗";
                hideNowloading(!ret.isError, message);
            };
        
            let btnToggleEditMode = document.createElement('button');
            btnToggleEditMode.textContent = "編集"
            btnToggleEditMode.className = " btn btn-sm btn-outline-secondary";
            btnToggleEditMode.onclick = async () => {
                const thisTextEle = document.getElementById(`tweet-text-${tweet.id}`);
                const thisTagsEle = document.getElementById(`tweet-tag-${tweet.id}`);

                let isEditMode = false;
                if(thisTextEle.innerHTML.substring(0, 9) === "<textarea") isEditMode = true;

                if(!isEditMode){
                    thisTextEle.innerHTML = '<textarea rows="8">' + thisTextEle.innerText + '</textarea>';
                    thisTagsEle.innerHTML = '<textarea rows="1">' + (tweet.tag ? tweet.tag : '') + '</textarea>';
                    thisTagsEle.classList.add("input-mode");
                    btnToggleEditMode.textContent = "保存";
                }else{
                    let isChangedValue = false;
                    if(tweet.text !== thisTextEle.firstElementChild.value)isChangedValue = true;
                    if(tweet.tag !== thisTagsEle.firstElementChild.value)isChangedValue = true;

                    if(isChangedValue === true){
                        showNowloading();
                        tweet.text = thisTextEle.firstElementChild.value;
                        tweet.tag = thisTagsEle.firstElementChild.value;
                        let ret = await editMyFavoriteTwitterTweet(tweet);
                        let message = !ret.isError ? "保存完了" : "保存失敗";
                        hideNowloading(!ret.isError, message);
                    }

                    thisTextEle.innerHTML = tweet.text;
                    thisTagsEle.classList.remove("input-mode");

                    thisTagsEle.innerHTML = "";
                    let tagNames = tweet.tag ? tweet.tag.split(',') : [];
                    tagNames.forEach(tagName => {
                        let tagNameEle = document.createElement('a');
                        tagNameEle.className = "tweet-tag-name";
                        tagNameEle.href = "#" + tagName;
                        tagNameEle.innerHTML = "#" + tagName;
                        thisTagsEle.appendChild(tagNameEle);
                    });
                    btnToggleEditMode.textContent = "編集";
                }
            };

            let btnGetBestTweet = document.createElement('button');
            btnGetBestTweet.textContent = "BestTweet検索"
            btnGetBestTweet.className = " btn btn-sm btn-outline-secondary";
            btnGetBestTweet.onclick = async () => {
                showNowloading();
                const screenName = tweet.user ? tweet.user.screenName : tweet.tweetedUserScreenName;
                const tweets = await getTweetByUserName(screenName);
                _displayTweets(tweets, _mode.BTR);
                hideNowloading(true);
            };

            switch(mode){
                case _mode.BTR:
                    btnbar.appendChild(btnAddFavorite);
                    break;
                case _mode.MFT:
                    btnbar.appendChild(btnToggleEditMode);
                    btnbar.appendChild(btnGetBestTweet);
                    break;
                case _mode.MTL:
                    btnbar.appendChild(btnAddFavorite);
                    btnbar.appendChild(btnGetBestTweet);
                    break;
                default:
                    break;
            }
        }
        row.appendChild(btnbar);

        resultBox.appendChild(row);
    });

    twitterTweets = tweets;
}

function getRecentlyTweets(tweetCount, mode) {
    let tmpTwitterTweets = twitterTweets.slice(0, twitterTweets.length);
    tmpTwitterTweets.sort((a, b) => {
        if(a.createdAt < b.createdAt) return 1;
        return -1;
    });
    let recentlyTweets = tmpTwitterTweets.slice(0, tweetCount);
    recentlyTweets.sort((a, b) => {
        if(a.favoriteCount < b.favoriteCount) return 1;
        return -1;
    });
    _displayTweets(recentlyTweets, mode);
    twitterTweets = tmpTwitterTweets;
}

function getTweetsSortedByCreateAt(isupper=true) {
    let tmpTwitterTweets = twitterTweets.slice(0, twitterTweets.length);
    tmpTwitterTweets.sort((a, b) => {
        if(a.createdAt < b.createdAt) return 1;
        return -1;
    });
    if(!isupper) tmpTwitterTweets = tmpTwitterTweets.reverse();
    return tmpTwitterTweets; 
}

function summaryTweetsForChatData(tweets){
    const countTweets = new Map();
    countTweets.has = (key) => {
        return typeof countTweets.get(key) !== "undefined";
    };
    tweets.forEach((tweet) => {
        const createdAt = tweet.createdAt.substring(0, 10);
        if(!countTweets.has(createdAt))
        {
            countTweets.set(createdAt, 1);
            return;
        }
        countTweets.set(createdAt, countTweets.get(createdAt) - 0 + 1);
    });

    const result = [];
    countTweets.forEach((value, key) => {
        let chartData = [];
        chartData.push(new Date(key));
        chartData.push(value);
        result.push(chartData);
    });
    return result;
}

function drawChart(data, chartTargetEle) {
    const __drawChart = () => {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'date', id: 'Date' });
        dataTable.addColumn({ type: 'number', id: 'Count' });
        dataTable.addRows(data);
        let maxyear = Math.max(...data.map(p => new Date(p[0]).getFullYear()));
        let minyear = Math.min(...data.map(p => new Date(p[0]).getFullYear()));

        // カレンダーの幅調整：https://stackoverflow.com/questions/61229240/how-to-make-google-calendar-chart-mobile-responsive
        var chartElement = document.getElementById('twitter_calendar');
        var cellSize = Math.max(1,((chartElement.offsetWidth*0.9)/52));
        var years = maxyear - minyear + 1;
        var chartHeight = (cellSize*7*years) + (3*years*cellSize) + (3*cellSize);
    
        var chart = new google.visualization.Calendar(chartTargetEle);
    
        var options = {
            title: "Tweet Count",
            height: chartHeight,
            calendar: {
                cellSize: cellSize
            },
            noDataPattern: {
                backgroundColor: '#f0f0f0',
                color: '#fff'
            },
            colorAxis: {
            minValue: 0,
            colors: ['#FFFFFF', '#14c4a5']
            }
        };
    
        chart.draw(dataTable, options);
    }

    if(!google.visualization || !google.visualization.DataTable || !google.visualization.Calendar)
    {
        // https://groups.google.com/g/google-visualization-api/c/yzBtf7xl0dE?pli=1
        google.charts.load("current", {packages:["calendar"]});
        google.charts.setOnLoadCallback(function() { __drawChart(); });
        return;
    }
    __drawChart();
}