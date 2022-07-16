// const twitterApiUri = 'https://localhost:7233/api/twitter';
const twitterApiUri = 'https://h1deblog.com/overbeliefapi/api/twitter';
const twitterOfficialUri = 'https://twitter.com';
let twitterUsers = [];
let twitterTweets = [];
const loginUser = {
    hasLogined : false,
    id : -1,
    name : "",
}

function setLoginUser(id="", name="", haslogined=false) {
    loginUser.id = id;
    loginUser.name = name;
    loginUser.hasLogined = haslogined;
}

async function getMyFavoriteTwitterUsers() {
    return await fetch(`${twitterApiUri}/users`).then(response => response.json());
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
        .then(response => response.json())
        .then(data => {
            if(!data.id){window.alert(`【${twitterUserEntity.name}】の登録が失敗しました。`); return;}
            window.alert(`【${data.name}】の登録が完了しました。`);
            addMyFavoriteUserIds({id:data.screenName, name:data.name, iconUri:data.profileImageUrl});
            refreshMyFavoriteTweetsBox();
        })
        .catch(error => console.error('Unable to add twitterUserEntity.', error));
}

async function getMyFavoriteTwitterTweet() {
    return await fetch(`${twitterApiUri}/tweets`).then(response => response.json());
}

function addMyFavoriteTwitterTweet(tweetEntity) {
    fetch(`${twitterApiUri}/tweets`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetEntity)
    })
        .then(response => response.json())
        .then(data => {
            if(!data.id){window.alert(`ツイートの登録が失敗しました。`); return;}
            window.alert(`ツイートの登録が完了しました。`);
        })
        .catch(error => console.error('Unable to add twitterUserEntity.', error));
}

function editMyFavoriteTwitterTweet(tweetEntity) {
    fetch(`${twitterApiUri}/tweets/${tweetEntity.id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetEntity)
    })
        .then(response => response.json())
        .then(data => {
            if(!data.id){window.alert(`ツイートの更新が失敗しました。`); return;}
            window.alert(`ツイートの更新が完了しました。`);
        })
        .catch(error => console.error('Unable to add twitterUserEntity.', error));
}

function getTwitterUsersBySearchKeyWord() {
    const searchKeyWord = document.getElementById('twitter-search-keyword').value;
    fetch(`${twitterApiUri}/user_search/${searchKeyWord}`)
        .then(response => response.json())
        .then(data => _displayTwitterUsers(data))
        .catch(error => console.error('Unable to get items.', error));
}

async function getTweetByUserName(userName) {
    return await fetch(`${twitterApiUri}/tweet_best/${userName}`).then(response => response.json());
}

function loginAuthorizeTwitter() {
    fetch(`${twitterApiUri}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {if(data.url) window.location.assign(data.url);})
        .catch(error => console.error('Unable to get items.', error));
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
    row.style.width = "600px";
    row.style.marginBottom = "20px";

    let topbar = document.createElement('h4');
    topbar.innerHTML = user.name;
    row.appendChild(topbar);

    let profileBanner = document.createElement('img');
    profileBanner.src = user.profileBannerUrl;
    profileBanner.height = 200;
    profileBanner.width = 600;
    row.appendChild(profileBanner);

    let profileImage = document.createElement('img');
    profileImage.src = user.profileImageUrl;
    profileImage.height = 135;
    profileImage.width = 135;
    row.appendChild(profileImage);

    let profileName = document.createElement('div');
    {
        let name = document.createElement('div');
        name.innerHTML = user.name;
        profileName.appendChild(name);
        let screenName = document.createElement('a');
        screenName.href = twitterOfficialUri + '/' + user.screenName;
        screenName.innerHTML = '@' + user.screenName;
        profileName.appendChild(screenName);
    }
    profileName.style.marginBottom = "5px";
    row.appendChild(profileName);

    let profileText = document.createElement('div');
    profileText.innerHTML = user.description + '<br/>';
    profileText.style.marginBottom = "5px";
    row.appendChild(profileText);

    let followerInfo = document.createElement('div');
    followerInfo.innerHTML = user.friendsCount + 'フォロー中 ' + user.followersCount + 'フォロワー<br/>';
    row.appendChild(followerInfo);
    
    let btnbar = document.createElement('div');
    {
        let btnAddFavorite = document.createElement('button');
        btnAddFavorite.appendChild(_iconbase);
        btnAddFavorite.textContent = "お気に入り登録"
        btnAddFavorite.className = " btn btn-sm btn-outline-secondary";
        btnAddFavorite.onclick = () => {
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

function _displayTweets(tweets) {
    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    if(tweets.length === 0)
    {
        resultBox.innerHTML = '対象データは、ありません。';
        return;
    }

    const isUniUser = tweets[0].user != null;
    if(isUniUser) resultBox.appendChild(_createTwitterUserElement(tweets[0].user));

    let tweetResultDaysEle = document.createElement('div');
    {
        tweetResultDaysEle.id = "twitter_calendar";
        resultBox.appendChild(tweetResultDaysEle);
        drawChart(summaryTweetsForChatData(tweets), tweetResultDaysEle);
    }

    $('<div>', {
        id: 'btns-get-recently-tweets'
    }).appendTo($(resultBox));
    {
        $('<button>', {
            class: "btn btn-primary",
            onclick: "getRecentlyTweets(15)",
            text: "最近の15件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-primary",
            onclick: "getRecentlyTweets(30)",
            text: "最近の30件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-primary",
            onclick: "getRecentlyTweets(50)",
            text: "最近の50件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-primary",
            onclick: "getRecentlyTweets(80)",
            text: "最近の80件"
        }).appendTo("#btns-get-recently-tweets");
        $('<button>', {
            class: "btn btn-primary",
            onclick: "getRecentlyTweets()",
            text: "全件表示"
        }).appendTo("#btns-get-recently-tweets");
    }

    tweets.forEach(tweet => {
        let row = document.createElement('div');
        row.id = `tweet_id_${tweet.id}`;
        row.className = "tweet-card";

        let topbar = document.createElement('div');
        topbar.className = "tweet-card-header";
        if(!isUniUser) topbar.innerHTML =  `<strong>[ ${tweet.tweetedUserName}@${tweet.tweetedUserScreenName} ]</strong>`;
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
            btnAddFavorite.onclick = () => {
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
                addMyFavoriteTwitterTweet(tweetEntity);
            };
            btnbar.appendChild(btnAddFavorite);
        
            let btnToggleEditMode = document.createElement('button');
            btnToggleEditMode.textContent = "編集"
            btnToggleEditMode.className = " btn btn-sm btn-outline-secondary";
            btnToggleEditMode.onclick = () => {
                const thisTextEle = document.getElementById(`tweet-text-${tweet.id}`);
                const thisTagsEle = document.getElementById(`tweet-tag-${tweet.id}`);

                let isEditMode = false;
                if(thisTextEle.innerHTML.substring(0, 9) === "<textarea") isEditMode = true;

                if(!isEditMode){
                    thisTextEle.innerHTML = '<textarea rows="8" cols="60">' + thisTextEle.innerText + '</textarea>';
                    thisTagsEle.innerHTML = '<textarea rows="1" cols="60">' + (tweet.tag ? tweet.tag : '') + '</textarea>';
                    thisTagsEle.classList.add("input-mode");
                    btnToggleEditMode.textContent = "保存";
                }else{
                    tweet.text = thisTextEle.firstElementChild.value;
                    tweet.tag = thisTagsEle.firstElementChild.value;

                    let ret = editMyFavoriteTwitterTweet(tweet);

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
            btnbar.appendChild(btnToggleEditMode);
        
            if(!isUniUser)
            {
                let btnGetBestTweet = document.createElement('button');
                btnGetBestTweet.textContent = "BestTweet検索"
                btnGetBestTweet.className = " btn btn-sm btn-outline-secondary";
                btnGetBestTweet.onclick = async () => {
                    const screenName = tweet.tweetedUserScreenName;
                    const tweets = await getTweetByUserName(screenName);
                    _displayTweets(tweets);
                };
                btnbar.appendChild(btnGetBestTweet);
            }
        }
        row.appendChild(btnbar);

        resultBox.appendChild(row);
    });

    twitterTweets = tweets;
}

function getRecentlyTweets(tweetCount) {
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
    _displayTweets(recentlyTweets);
    twitterTweets = tmpTwitterTweets;
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

        // カレンダーの幅調整：https://stackoverflow.com/questions/61229240/how-to-make-google-calendar-chart-mobile-responsive
        var chartElement = document.getElementById('twitter_calendar');
        var cellSize = Math.max(1,((chartElement.offsetWidth*0.9)/52));
        var years = 2;
        var chartHeight = (cellSize*7*years) + (4*years*cellSize);
    
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