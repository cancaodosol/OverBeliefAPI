﻿const twitterApiUri = 'https://localhost:7233/api/twitter';
//const twitterApiUri = 'https://h1deblog.com/overbeliefapi/api/twitter';
const twitterOfficialUri = 'https://twitter.com';
let twitterUsers = [];
let twitterTweets = [];
const loginUser = {
    id : "",
    name : "",
    twitterPincode : "",
    twitterResearchUsers : [],
    twitterAuthorizeUri : ""
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

function getUserAuthorizeUri() {
    fetch(`${twitterApiUri}/user_authorize_uri`)
        .then(response => response.json())
        .then(data => loginUser.twitterAuthorizeUri = data.uri)
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
        .then(data => {if(data.url) window.open(data.url, '_blank');})
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

function openUserAuthorizePage() {
    const uri = getUserAuthorizeUri();
    if(!loginUser.twitterAuthorizeUri) return;
    window.open(loginUser.twitterAuthorizeUri, '_blank');
}

function authorizeTwitterUser() {
    loginUser.id = 123456;
    const pincode = document.getElementById('twitter-pincode').value;
    updateUserPincode(pincode);
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

    return row;
}

function _displayTweets(data) {
    const resultBox = document.getElementById('twitter-search-results');
    resultBox.innerHTML = '';

    resultBox.appendChild(_createTwitterUserElement(data[0].user));

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
        topbar.innerHTML = '<br/>';
        row.appendChild(topbar);

        let tweetText = document.createElement('div');
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