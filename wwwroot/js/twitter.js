const twitterApiUri = 'https://localhost:7233/api/twitter';
//const twitterApiUri = 'https://h1deblog.com/overbeliefapi/api/twitter';
const twitterOfficialUri = 'https://twitter.com';
let twitterUsers = [];
let twitterTweets = [];
const loginUser = {
    id : 44117452,
    name : "",
    twitterPincode : "",
    twitterResearchUsers : [],
    twitterAuthorizeUri : ""
}

function getMyFavoriteTwitterUsers() {
    fetch(`${twitterApiUri}/users`)
        .then(response => response.json())
        .then(data => data.forEach(user => addMyFavoriteUserIds(user.screenName)))
        .catch(error => console.error('Unable to get items.', error));
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
            if(!data.id){window.alert(`${twitterUserEntity.name}の登録が失敗しました。`); return;}
            window.alert(`${data.name}の登録が完了しました。`);
            addMyFavoriteUserIds(data.screenName);
            refreshMyFavoriteTweetsBox();
        })
        .catch(error => console.error('Unable to add twitterUserEntity.', error));
}

function getMyFavoriteTwitterTweet() {
    fetch(`${twitterApiUri}/tweets`)
        .then(response => response.json())
        .then(data => _displayTweets(data, false))
        .catch(error => console.error('Unable to get items.', error));
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
            if(!data.id){window.alert(`${tweetEntity.name}の登録が失敗しました。`); return;}
            window.alert(`${data.name}の登録が完了しました。`);
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

function getTweetByUserName(userName) {
    fetch(`${twitterApiUri}/tweet_best/${userName}`)
        .then(response => response.json())
        .then(data => _displayTweets(data))
        .catch(error => console.error('Unable to get items.', error));
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

function updateUserPincode(pincode) {
    const loginUserDto = {
        id: loginUser.id,
        twitterApiPincode: pincode
    };

    fetch(`${twitterApiUri}/user_authorize`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginUserDto)
    })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch(error => console.error('Unable to add item.', error));
}

function _displayTwitterUsers(data) {
    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    data.forEach(user => {
        resultBox.appendChild(_createTwitterUserElement(user));
    });

    twitterUsers = data;
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
        btnAddFavorite.textContent = "お気に入り登録"
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

function _displayTweets(data, isUniUser = true) {
    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    if(isUniUser === true) resultBox.appendChild(_createTwitterUserElement(data[0].user));

    let tweetResultDaysEle = document.createElement('div');
    tweetResultDaysEle.id = "calendar_basic";
    tweetResultDaysEle.style.width = "1000px";
    tweetResultDaysEle.style.height = "350px";
    resultBox.appendChild(tweetResultDaysEle);
    drawChart(transformChartData(data), tweetResultDaysEle);

    data.forEach(tweet => {
        let row = document.createElement('div');
        row.style.width = "600px";
        row.style.marginLeft = "20px";

        let topbar = document.createElement('div');
        if(!isUniUser) topbar.innerHTML =  `<strong>[ ${tweet.tweetedUserName}@${tweet.tweetedUserScreenName} ]</strong>`;
        topbar.innerHTML += '<br/>';
        row.appendChild(topbar);

        let tweetText = document.createElement('div');
        tweetText.id = `text_${tweet.id}`;
        tweetText.innerHTML = tweet.text + '<br/>';
        row.appendChild(tweetText);

        let tweetInfo = document.createElement('div');
        {
            tweetInfo.innerHTML = '💬 ' + 'no-data' + ' ㌟ ' + tweet.retweetCount + ' ♡ ' + tweet.favoriteCount + ' (' + tweet.createdAt + ') ' + tweet.source;
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
            btnAddFavorite.textContent = "お気に入り登録"
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
            btnToggleEditMode.textContent = "編集/参照"
            btnToggleEditMode.onclick = () => {
                const textEle = document.getElementById(`text_${tweet.id}`);
                let isEditMode = false;
                if(textEle.innerHTML.substring(0, 9) === "<textarea") isEditMode = true;
                textEle.innerHTML = isEditMode ? textEle.textContent : ('<textarea rows="5" cols="80">' + textEle.innerText + '</textarea>');
            };
            btnbar.appendChild(btnToggleEditMode);
        }
        row.appendChild(btnbar);

        resultBox.appendChild(row);
    });

    twitterTweets = data;
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

google.charts.load("current", {packages:["calendar"]});
google.charts.setOnLoadCallback(drawChart);

function transformChartData(tweets){
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
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'date', id: 'Date' });
    dataTable.addColumn({ type: 'number', id: 'Count' });
    dataTable.addRows(data);

    var chart = new google.visualization.Calendar(chartTargetEle);

    var options = {
      title: "Tweet Count",
      height: 350,
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