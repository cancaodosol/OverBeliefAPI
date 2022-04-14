const twitterApiUri = 'https://localhost:7233/api/twitter';
const twitterOfficialUri = 'https://twitter.com';
let twitterUsers = [];
let twitterTweets = [];

function getTwitterUsersBySearchKeyWord() {
    const searchKeyWord = document.getElementById('twitter-search-keyword').value;
    fetch(`${twitterApiUri}/user_search/${searchKeyWord}`)
        .then(response => response.json())
        .then(data => _displayTwitterUsers(data))
        .catch(error => console.error('Unable to get items.', error));
}

function getTweetByUserName() {
    const userName = document.getElementById('twitter-user-name').value;
    fetch(`${twitterApiUri}/tweet_best/${userName}`)
        .then(response => response.json())
        .then(data => _displayTweets(data))
        .catch(error => console.error('Unable to get items.', error));
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

    let topbar = document.createElement('div');
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
    row.appendChild(profileName);

    let profileText = document.createElement('div');
    profileText.innerHTML = user.description + '<br/>';
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
            tweetInfo.innerHTML = '💬 ' + 'no-data' + ' ㌟ ' + tweet.retweetCount + ' ♡ ' + tweet.favoriteCount + ' (' + tweet.createdAt + ')';
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