// const authApiUri = 'https://localhost:7233/api/auth';
const authApiUri = 'https://h1deblog.com/overbeliefapi/api/auth';

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

async function getLoginUser(pscd="") {
    let url="";
    if(!pscd || pscd.trim() === ""){
        url = `${authApiUri}`;
    }else{
        url = `${authApiUri}?pscd=${pscd}`;
    }
    const ret = await fetch(url).then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
    return ret;
}

async function tryLoginUser(user){
    const result = await fetch(`${authApiUri}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
    
    if(result.url){ window.location.assign(result.url); return true;}
    else{ return false;}
}

async function trySignUpUser(user){

    if(user.firstName.trim() === "" || user.lastName.trim() === "") return {"ok": false, "message": "名前を入力してください．"};

    if(user.emailAddress.trim() === "") return {"ok": false, "message": "メールアドレスを入力してください．"};
    const emailPattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
    if (!emailPattern.test(user.emailAddress)) return {"ok": false, "message": "メールアドレスが不適です．"};

    if(user.password.trim() === "") return {"ok": false, "message": "パスワードを入力してください．"};
    if (user.password.length < 8) return {"ok": false, "message": "パスワードが不適です．\nパスワードは、8桁以上にしてください．"};
    const passPattern = /^(?=.*?[a-z])(?=.*?\d)(?=.*?[!-\/:-@[-`{-~])[!-~]{8,100}$/i;
    if (!passPattern.test(user.password)) return {"ok": false, "message": "パスワードが不適です．\n半角英数字記号がそれぞれ含まれるようにしてください．"};

    const result = await fetch(`${authApiUri}/signup`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error(response.status + " : " + response.statusText);
        }
        return response.json();})
    .catch(error => toErrorObj(error));
    
    if(result.url){ return { "ok": true, "url" : result.url}; }
    else{ return { "ok": false, "message": "既に使用されているメールアドレスです。"};}
}

async function ini() {
    // ログイン画面は、こちらが使用される
    $("#btn-user-login").on('click', async () => {
        const userEmailAddress = $("#inputEmailAddress").val();
        const userPassword = $("#inputPassword").val();
        const loginUser = {
            "emailAddress" : userEmailAddress,
            "password" : userPassword
        }
        const ret = await tryLoginUser(loginUser);
        if(!ret)
        {
            alert("ログインに失敗しました。\nメールアドレス、パスワードをみなおしてください。");
        }
    });

    // サインアップ画面では、こちらが使用される
    $("#btn-user-signup").on('click', async () => {
        const userLastName = $("#inputLastName").val();
        const userFirstName = $("#inputFirstName").val();
        const userEmailAddress = $("#inputEmailAddress").val();
        const userPassword = $("#inputPassword").val();
        const loginUser = {
            "firstName" : userFirstName,
            "lastName" : userLastName,
            "emailAddress" : userEmailAddress,
            "password" : userPassword
        }
        const ret = await trySignUpUser(loginUser);
        if(!ret.ok)
        {
            alert(ret.message);
        }
        else
        {
            setTimeout(() => {
                window.location.assign(ret.url);
            }, 3000);
            alert("新規ユーザー登録が完了しました。\n3秒後にツール画面へ遷移します。");
        }
    });
}

ini();