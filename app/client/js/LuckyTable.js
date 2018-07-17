var luckytable = document.getElementById('luckytable'),
    ctx = luckytable.getContext("2d"),
    r1 = 200,    //外圆半径
    r2 = 160,    //奖品文字距离圆心的位置
    r3 = 60,    //中心按钮半径
    centerX = luckytable.width / 2,    //中点
    centerY = luckytable.height / 2,
    PI = Math.PI,
    prizeList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],    //奖品列表
    colorList = ['#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3', '#ffffff', '#FDFAC3'],    //奖品对应的背景颜色
    lenPrize = prizeList.length,
    startAngle = 0,  //开始绘制时的起始角度
    lastAngle = 0,  //上次转动开始角度
    currentIdx = 11, //当前箭头所指
    piece = 2 * PI / lenPrize;    //根据奖品数量划分区域，单位为弧度

function draw() {
    ctx.clearRect(0, 0, luckytable.width, luckytable.height);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#AF4760';
    //绘制分区
    for (var i = 0; i < lenPrize; i++) {
        ctx.fillStyle = colorList[i];
        var angle = startAngle + piece * i;
        ctx.beginPath();
        //设置圆心为起点，方便closePath()自动闭合路径
        ctx.moveTo(centerX, centerY);
        //分块绘制，目的是方便填充颜色，如果以lineTo的形式绘制，在填充颜色时会很麻烦
        ctx.arc(centerX, centerY, r1, angle, angle + piece, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        //绘制奖品说明
        ctx.save();
        ctx.font = '30px Microsoft YaHei';
        ctx.fillStyle = '#d60000';
        ctx.translate(centerX + Math.cos(angle + piece / 2) * r2, centerY + Math.sin(angle + piece / 2) * r2);
        ctx.rotate(angle + piece / 2 + PI / 2);

        var s = prizeList[i];
        // for (var j = 0; j < s.length; j++) {
        // var text = s[j];
        ctx.fillText(s, -ctx.measureText(s).width / 2, 0);
        // }
        ctx.restore();
    }
    //绘制箭头
    ctx.strokeStyle = '#FF5722';
    ctx.fillStyle = '#FF5722';
    ctx.save();
    ctx.translate(centerX, centerY - 40);
    ctx.moveTo(- 10, 0);
    ctx.beginPath();
    ctx.lineTo(- 10, 0);
    ctx.lineTo(- 10, -30);
    ctx.lineTo(- 20, -30);
    ctx.lineTo(0, -50);
    ctx.lineTo(20, -30);
    ctx.lineTo(10, -30);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    //绘制中心圆
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(centerX, centerY, r3, 0, 2 * PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    //绘制抽奖文字
    ctx.font = '30px Microsoft YaHei';
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.translate(centerX, centerY);
    // ctx.fillText("", -ctx.measureText(text).width, 10);
    ctx.restore();
}
var currentTime = 0,  //表示动画开始到现在持续的时间
    totalTime = 4200,   //动画总时间
    finalValue = piece + 2 * PI,//动画总时间内期望的位移总量，越大转得越快，因为总时间一定，只有加快速度才能在规定时间内到达期望位移 

    t; //setTimeout Id

function rotation() {
    currentTime += 30;    //每帧增加30的运行时间
    if (currentTime >= totalTime) {//到达总时间后停止动画
        stopRotation();
        return;
    }
    //缓动
    var currentAngle = easeOut(currentTime, 0, finalValue, totalTime);

    //弧度随时间递增，但增速由快变慢
    startAngle = lastAngle + currentAngle;

    //根据startAngle的变化重新绘制转盘，以达到转动的效果
    draw();

    t = setTimeout(rotation, 17);
}

function stopRotation() {
    clearTimeout(t);
    //动画时间内转动的总弧度，因为是从三点钟方向开始绘制的，所以应当加上PI/2
    var arc = startAngle + PI / 2,
        //arc模2*PI以计算转动整圈以外不满一圈的零数
        //零数除以单位弧度，表示转动了几个单位，不满整数则向下取整(Math.floor)
        //奖品数量(以下标算，故先减1)减去转动过的单位得到当前指针所指奖品的索引
        index = lenPrize - 1 - ((arc % (2 * PI) / piece) >> 0);
    currentIdx = index;
    currentTime = 0;
    lastAngle = startAngle;
}

// 滚动到制定格子
function rotation(winIdx) {
    finalValue = (lenPrize - (lenPrize + winIdx - currentIdx) % lenPrize) * piece + ((Math.random() * 10) >> 0) * 2 * PI;
    if (startAngle == 0) {
        finalValue += piece / 2;
    }
}

draw();
var run = document.getElementById('run');
// run.onclick = function () {
//     currentTime = 0;
//     totalTime = Math.random() * 500 + 4000;
//     finalValue = Math.random() * 20 + 20;
//     rotation();
// };
function easeOut(t, b, c, d) {
    return - c * (t /= d) * (t - 2) + b;
}

function startCountDown(starttime) {
    var refreshInterval = setInterval(function () {
        var nowtime = new Date().valueOf();
        var time = starttime - nowtime;
        var day = parseInt(time / 1000 / 60 / 60 / 24);
        var hour = parseInt(time / 1000 / 60 / 60 % 24);
        var minute = parseInt(time / 1000 / 60 % 60);
        var seconds = parseInt(time / 1000 % 60);
        //$('.timespan').html("距离下一次开奖还有 "+day + "天" + hour + "小时" + minute + "分钟" + seconds + "秒");
        $('.timespan').html("距离下一次开奖还有 " + minute + "分钟" + seconds + "秒");
        if (time <= 0) {
            clearInterval(refreshInterval);
            // 轮询服务器中奖情况
            var resultInterval = setInterval(function () {
                $.ajax({
                    url: "/Wheel/getLastRoundInfo",
                    success: function (data) {
                        var lastRound = JSON.parse(data);
                        if (lastRound.roundIdx == roundIdx) {
                            if (lastRound.winners.indexOf(web3.eth.accounts[0]) != -1) {
                                alert('恭喜中奖了');
                            }
                            $("#lastTotal").text(lastRound.betPool);
                            $("#lastNumber").text(lastRound.winners.length);
                            $("#lastBlock").text(lastRound.blockIdx);
                            rotation(lastRound.blockIdx);
                            getNextRoundInfo();
                            clearInterval(resultInterval);
                        }
                    }
                });
            }, 1000);

        }
    }, 1000);
}

var betUnit; //每一注大小
var wheelOfFortune; //合约实例
var abi =
    [{ "constant": false, "inputs": [], "name": "withDrawTips", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "pieceIdx", "type": "uint256" }], "name": "finishRound", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "pieceIdx", "type": "uint256" }, { "name": "betCount", "type": "uint256" }, { "name": "tips", "type": "uint256" }], "name": "makeBet", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newPieceCount", "type": "uint256" }], "name": "increasePieceCount", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [{ "name": "initPieceCount", "type": "uint256" }], "payable": true, "stateMutability": "payable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "data", "type": "bytes" }], "name": "FallbackTrigged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "player", "type": "address" }, { "indexed": false, "name": "pieceIdx", "type": "uint256" }, { "indexed": false, "name": "totalBet", "type": "uint256" }, { "indexed": false, "name": "tips", "type": "uint256" }], "name": "MakeBetEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "winners", "type": "address[]" }, { "indexed": false, "name": "betPool", "type": "uint256" }, { "indexed": false, "name": "pieceIdx", "type": "uint256" }, { "indexed": false, "name": "nextPieceCount", "type": "uint256" }], "name": "FinishRoundEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "count", "type": "uint256" }], "name": "IncreasePieceCountEvent", "type": "event" }]
    ;
var contractAddress = "0x2B36fB696d4b41087A0D3B83588A318B549C81Df";
var roundIdx = 0;
var playersNumberOfPiece; //每个扇区对应的下注数

function getNextRoundInfo() {
    $.ajax({
        url: "/Wheel/getNextRoundInfo",
        success: function (data) {
            var nextRound = JSON.parse(data);
            startCountDown(nextRound.startTimeStamp);
            $("#currentTotal").text(nextRound.betPool.toLocaleString());
            playersNumberOfPiece = nextRound.playersNumberOfPiece;
            roundIdx = nextRound.roundIdx;
        }
    });
}

$(document).ready(function () {
    //鼠标移动事件
    var ps = $("canvas#luckytable").offset();//$('#canvas')[0].getContext('2d').position();
    var height = $("canvas#luckytable").height();
    var width = $("canvas#luckytable").width();
    var center_x = ps.left + width / 2;
    var center_y = ps.top + height / 2;
    var num = 0;
    $("canvas#luckytable").mouseenter(function () {

    }).mouseout(function () {
        $("div#show_person_num").text("");
    }).mousemove(function (e) {
        var arc = startAngle + PI / 2,
            index = lenPrize - 1 - ((arc % (2 * PI) / piece) >> 0);
        var xx = e.originalEvent.x || e.originalEvent.layerX || 0;
        var yy = e.originalEvent.y || e.originalEvent.layerY || 0;
        var angle = getAngle(center_x, center_y, xx, yy);
        var gap = 360 / lenPrize;
        // 加上上一次转盘的角度
        angle += gap - arc % piece / PI * 180;
        //    num = Math.ceil((angle+gap/2)/gap);
        num = (index + (angle / gap) >> 0) % lenPrize + 1;
        $("div#show_person_num").text("当前下注数字[" + num + "]的注数有:" + playersNumberOfPiece[num - 1] + "个");
    }).click(function (e) {
        var str = prompt("请输入您想在" + num + "号扇区下注的数目^^", "100");
        if (str) {
            // alert("您刚刚在" + num + "号扇区下了" + str + "注！")
            var betCount = parseInt(str);
            var tips = betUnit * betCount / 1000;
            wheelOfFortune.makeBet(num - 1, betCount, tips, { from: web3.eth.accounts[0], value: betUnit * betCount + tips }).then(function (result) {
                if (result.logs.length > 0) {
                    var eventobj = result.logs[0].args;
                    $.ajax({
                        url: '/Wheel/makeBet/' + eventobj.pieceIdx + '/' + betCount + '/' + tips + '/' + web3.eth.accounts[0],
                        success: function (data) {
                            var nextRound = JSON.parse(data);
                            $("#currentTotal").text(nextRound.betPool.toLocaleString());
                            playersNumberOfPiece = nextRound.playersNumberOfPiece;
                            alert('下注成功');
                        }
                    });
                }
            });
        }
    });

    getNextRoundInfo();

    $.ajax({
        url: "/Wheel/getLastRoundInfo",
        success: function (data) {
            var lastRound = JSON.parse(data);
            $("#lastTotal").text(lastRound.betPool.toLocaleString());
            $("#lastNumber").text(lastRound.winners.length);
            $("#lastBlock").text(lastRound.blockIdx);
        }
    });

    $.ajax({
        url: "/Wheel/getWheelConfig",
        success: function (data) {
            var config = JSON.parse(data);
            $("#currentBetUnit").text(config.bet.toLocaleString());
            betUnit = config.bet;
        }
    });
});

window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
        const WheelOfFortune = TruffleContract({
            abi: abi
        });
        WheelOfFortune.setProvider(web3.currentProvider);

        WheelOfFortune.at(contractAddress).then(function (instance) {
            wheelOfFortune = instance;
        });
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        // web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
});

//获得转盘中心和鼠标坐标连线，与y轴正半轴之间的夹角
function getAngle(px, py, mx, my) {
    var x = Math.abs(px - mx);
    var y = Math.abs(py - my);
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var cos = y / z;
    var radina = Math.acos(cos);//用反三角函数求弧度
    var angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度

    if (mx > px && my > py) {//鼠标在第四象限
        angle = 180 - angle;
    }

    if (mx == px && my > py) {//鼠标在y轴负方向上
        angle = 180;
    }

    if (mx > px && my == py) {//鼠标在x轴正方向上
        angle = 90;
    }

    if (mx < px && my > py) {//鼠标在第三象限
        angle = 180 + angle;
    }

    if (mx < px && my == py) {//鼠标在x轴负方向
        angle = 270;
    }

    if (mx < px && my < py) {//鼠标在第二象限
        angle = 360 - angle;
    }

    return angle;
}