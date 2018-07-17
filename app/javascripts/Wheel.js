var wheel = {
    config: {
        bet: 1000,
        pieceCount: 16,
        roundTime: 20 * 60//默认20分钟转一次
    },
    // 上一次转盘的结果
    lastRound: {
        winners: [],
        timestamp: (new Date()).valueOf(),
        betPool: 0,
        blockIdx: 0,
        roundIdx: -1
    },
    nextRound: {
        betPool: 0,
        startTimeStamp: (new Date()).valueOf() + 20 * 60 * 1000,
        playersNumberOfPiece: [],
        playersOfPiece: [],
        roundIdx: 0
    }
};
module.exports = wheel;