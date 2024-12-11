const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(cors());

let memoData = []; // { id: 1, userId: 'test', memo: '내용', date: 'YYYY-MM-DD' }

const SECRET_KEY = 'secret_key';

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ ok: false, message: '토큰이 필요합니다.' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // 디코딩된 사용자 정보 추가
        next();
    } catch (err) {
        res.status(403).json({ ok: false, message: '유효하지 않은 토큰입니다.' });
    }
};

// 메모 조회
app.get('/Memopage', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const userMemos = memoData.filter(memo => memo.userId === userId);
    res.json({ ok: true, memos: userMemos });
});

// 메모 추가
app.post('/Memopage', authenticateToken, (req, res) => {
    const { memo, date } = req.body;
    const userId = req.user.id;

    if (!memo || !date) {
        return res.status(400).json({ ok: false, message: '메모 내용과 날짜를 입력하세요.' });
    }

    const newMemo = { id: memoData.length + 1, userId, memo, date };
    memoData.push(newMemo);

    res.json({ ok: true, memos: memoData.filter(memo => memo.userId === userId) });
});

// 메모 삭제
app.delete('/Memopage', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { ids } = req.body;

    memoData = memoData.filter(memo => memo.userId !== userId || !ids.includes(memo.id));
    res.json({ ok: true, memos: memoData.filter(memo => memo.userId === userId) });
});

app.listen(8081, () => {
    console.log('Memo server port 8081');
});
