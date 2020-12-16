// ------------------------------------------------------
//　 firebase
// ------------------------------------------------------

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "API-KEY",
    authDomain: "someone-wants-to-help-anyone.firebaseapp.com",
    databaseURL: "https://someone-wants-to-help-anyone-default-rtdb.firebaseio.com",
    projectId: "someone-wants-to-help-anyone",
    storageBucket: "someone-wants-to-help-anyone.appspot.com",
    messagingSenderId: "976539944152",
    appId: "1:976539944152:web:ab7d634a766c4cfef7c3ad"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

const newPostRef = firebase.database().ref();


// ------------------------------------------------------
//　 宣言定義
// ------------------------------------------------------

let infoboxTemplate;
let result = [];
let c;
let str ="";
let latlon = [];
let cltlatlon = [];
let username = document.getElementById('username');
let title =    document.getElementById('title');
let contents = document.getElementById('contents');
let age =      document.getElementById('age');
let address =  document.getElementById('address');


// ------------------------------------------------------
//　 受信表示関連
// ------------------------------------------------------

// 受信関数
newPostRef.on('child_added', function(data){
    const massage = data.val();
    const key = data.key;
    result.push({key,massage});
    for( let c = 0; c < result.length; c++ ){
        str = `<p><div class="customInfobox" id="customInfobox">
                <div class="testline">
                    <div>
                        <p class="csNumber" id="csNumber">${c+1}</p>
                    </div>
                    <div>
                        <div class="testline">
                            <p class="title csUsername" id="csUsername">${massage.username}</p>
                            <p class="title age" id="csAge">${massage.age}</p>
                        </div>
                        <div>
                            <p class="title" id="csTitle">${massage.title}</p>
                        </div>
                    </div>
                </div>
                </div>`;}
                $('#output').prepend(str);
                $('#output').scrollTop( $('#output')[0].scrollHeight );

}) 


// ------------------------------------------------------
//　 map取得 BingMap
// ------------------------------------------------------

function GetMap(){
    // 現在地を取得
    navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
    function mapsInit(position){
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        latlon.push({lat,lon});

        // 初期化お助けマン視点でマップ表示
        let map = new Microsoft.Maps.Map('#myMap',{
            center: new Microsoft.Maps.Location(lat, lon),
            mapTypeId: Microsoft.Maps.MapTypeId.load,
            zoom:15 //0=zoomUp[ 1~20 ]
        });

        let searchManager; //SearchObject用

        for(let c = 0; c < result.length; c++){
            //検索モジュール指定
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
                //searchManagerインスタンス化（Geocode,ReverseGeocodeが使用可能になる）
                searchManager = new Microsoft.Maps.Search.SearchManager(map);
                //Geocode：住所から検索
                geocodeQuery(result[c].massage.address);
            });
            /*--------------------------
                住所から緯度経度を取得
                query [住所文字列]
             --------------------------*/
            function geocodeQuery(query) {
                if(searchManager) {
                    //住所から緯度経度を検索
                    searchManager.geocode({
                        where: query, //検索文字列
                        callback: function (r) {  //検索結果を"( r )" の変数で取得
                            //最初の検索取得結果を取得
                            if (r && r.results && r.results.length > 0) {
                                cltlat = r.results[0].location.latitude;
                                cltlon = r.results[0].location.longitude;
                                cltlatlon.push({cltlat,cltlon});
                            }

                            // pins
                            let locaations = new Microsoft.Maps.Location(cltlat, cltlon);
                            let pin = new Microsoft.Maps.Pushpin(locaations,{
                                text:`${c+1}`,
                                title:`${result[c].massage.username}`,
                                color:"orange"
                            });

                            //マップにpinsをプッシュする
                            map.entities.push(pin);
                        },
                    });
                }
            } 
        }
    }
}


//  エラーの場合のイベント
function mapsError(error){
    let e = "";
    if(error.code == 1){
        e = '位置情報が許可されていません';
    }
    if(error.code == 2){
        e = '現在位置を特定できません';
    }
    if(error.code == 3){
        e = '位置情報が取得する前にタイムアウトになりました';
    }
    alert('エラー：' + e);
}
// 位置情報取得オプション
const set = {
    enableHighAccuracy: true,
    maximumAge: 20000,
    timeout: 10000
}



// ------------------------------------------------------
//　 送信関連
// ------------------------------------------------------

// 送信関数
function send(){
    newPostRef.push({
        // オブジェクト化して送信
        username : username.value,
        title : title.value,
        contents : contents.value,
        age : age.value,
        address : address .value
    });
}

    //ボタン押下フォーム送信
    document.getElementById('send').onclick = () => {
            send();
    }

  


// ------------------------------------------------------
//　 記入ボード
// ------------------------------------------------------

str = "";
for( let i = 10; i<101; i+=1 ){
    str += `<option class="form-parts">${i}歳</option>`
    document.getElementById('age').innerHTML = str;
}



// ------------------------------------------------------
//　 modal-window
// ------------------------------------------------------

$(document).on('click', '#customInfobox', function(){
    let thisnum = $('#csNumber',this).html();
    // console.log(thisnum-1);
    let number =  `${thisnum}`
    let username = `${result[thisnum-1].massage.username}`;
    let title = `${result[thisnum-1].massage.title}`;
    let contents = `${result[thisnum-1].massage.contents}`;
    let age = `${result[thisnum-1].massage.age}`;
    let infoboxTemplate =   `<div class="modal-content" id="modal-content">
                                <div class="title">${number}</div>
                                <div class="topline">
                                    <div class="username" id="username">${username}</div>
                                    <div class="age" id="age">${age}</div>
                                </div>
                                <div class="title" id="title">${title}</div>
                                <div class="contents" id="contents">${contents}</div>
                                <input type="button" class="videogo" id="videogo" value="ビデオ通話する">
                                <input type="button" class="modal-close" id="modal-close" value="閉じる">
                            </div>`;
    // console.log(infoboxTemplate);

    $('main').append(infoboxTemplate);

    
    $('#videogo').on('click',function(){

        window.location.href = "vdsk.html";

        // #modal-content,#modal-overlayをフェードアウトして
        $('#modal-content,#modal-overlay').fadeOut('solw', function(){
            
            // #modal-overlayを削除する
            $('#modal-content,#modal-overlay').remove(); 
        });
    })

    //キーボード操作などにより、オーバーレイが多重起動するのを防止
    $(this).blur();
    if($('#modal-overlay')[0]) return false; //新しくモーダルウィンドウを起動しない (防止策1)
    
    //オーバーレイを出現させる
    $('main').append( '<div class="modal-overlay" id="modal-overlay"</div>' );
    $('#modal-overlay').fadeIn('slow');

    centeringModalSyncers()

    //コンテンツをフェードインする
    $('#modal-content').fadeIn('slow');

    // #modal-content,#modal-overlayをクリックして
    $('#modal-close,#modal-overlay').unbind().click(function(){

        // #modal-content,#modal-overlayをフェードアウトして
        $('#modal-content,#modal-overlay').fadeOut('solw', function(){
            
            // #modal-overlayを削除する
            $('#modal-content,#modal-overlay').remove(); 
        });
    });
    


    //リサイズされたら、センタリングをする関数[centeringModalSyncer()]を実行する
    $(window).resize(centeringModalSyncers);

    // センタリングを実行する関数
    function centeringModalSyncers(){

        // 画面（ウィンドウ）の幅、高さを取得
        let w = $(window).width();
        let h = $(window).height();

        // コンテンツ(#modal-content)の幅、高さを取得
        let cw = $("#modal-content").outerWidth();
        let ch = $("#modal-content").outerHeight();

　　　　　// （ウィンドウ）から(#modal-content)を引いたあまりの余白を2で割りセンタリングを実行する
        $("#modal-content").css({ "left": ( (w - cw) /2 ) + "px", "top": ( ( h - ch ) /2 ) +"px" } );
    }
});


/**--------------------------------------------------
 *             自動音声認識入力
 ---------------------------------------------------*/
       
 // 音声認識処理
        const speech = new webkitSpeechRecognition();
        speech.lang = 'ja-jp';

        // 名前入力
        $("#username").focus(function(){
            let autotext;
            speech.start();
            speech.onresult = function(e){
                speech.stop();
                if(e.results[0].isFinal){
                    autotext = e.results[0][0].transcript;
                    // document.getElementById("username").inne = `${autotext}`;
                    $("#username").val(`${autotext}`);
                } 
            }  
        });

        // タイトル入力
        $("#title").focus(function(){
            let autotext;
            speech.start();
            speech.onresult = function(e){
                speech.stop();
                if(e.results[0].isFinal){
                    autotext = e.results[0][0].transcript;
                    // document.getElementById("title").value = `${autotext}`;
                    $("#title").val(`${autotext}`);
                } 
            } 
        });
        // 内容入力
        $("#contents").focus(function(){
            let autotext;
            speech.start();
            speech.onresult = function(e){
                speech.stop();
                if(e.results[0].isFinal){
                    autotext = e.results[0][0].transcript;
                    // document.getElementById("contents").value = `${autotext}`;
                    $("#contents").val(`${autotext}`);
                } 
            }  
        });

        // 住所入力
        $("#address").focus(function(){
            let autotext;
            speech.start();
            speech.onresult = function(e){
                speech.stop();
                if(e.results[0].isFinal){
                    autotext = e.results[0][0].transcript;
                    // document.getElementById("address").value = `${autotext}`;
                    $("#address").val(`${autotext}`);
                } 
            }  
        });


        // 音声自動文字起こし機能
        speech.onresult = function(e){
            speech.stop();
            if(e.results[0].isFinal){
                let autotext = e.results[0][0].transcript;
                console.log(e);
                console.log(autotext);
                $(this).innerHTML += '<div>' + autotext + '</div>';
            }
        }

        // speech.onend = () => {
        //     speech.start()
        // };





