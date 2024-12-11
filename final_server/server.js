const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'secret_key';

let userdata = [
    { id: 'test', pw: 'test', name: 'test', age: '23' },
];

app.use(express.json());
app.use(cors());

app.listen(8080, function () {
    console.log('Server port 8080');
});

// ID 중복 확인
app.get('/idcheck/:id', function (req, res) {
    const id = req.params.id;
    const idcheck = userdata.some(user => user.id === id);
    res.send({ ok: !idcheck });
});

// 회원가입
app.post('/signup', (req, res) => {
    const { id, pw, name, age } = req.body;

    // 콘솔에 요청 데이터 출력
    console.log('회원가입 요청 데이터:', { id, pw, name, age });

    if (!id || !pw || !name || !age) {
        return res.status(400).json({ ok: false, message: '모든 필드를 입력하세요.' });
    }

    const idcheck = userdata.some(user => user.id === id);
    if (idcheck) {
        console.log('회원가입 실패: 이미 사용 중인 아이디');
        return res.status(409).json({ ok: false, message: '이미 사용 중인 아이디입니다.' });
    }

    userdata.push({ id, pw, name, age });
    console.log('회원가입 성공: 새로운 사용자 추가됨', { id, pw, name, age });
    res.status(201).json({ ok: true, message: '회원가입이 완료되었습니다.' });
});

// 로그인
app.post('/login', function (req, res) {
    console.log('로그인 요청 데이터:', req.body);
    const { id, pw } = req.body;

    if (!id || !pw) {
        return res.status(400).json({ ok: false, message: 'ID와 비밀번호를 입력하세요.' });
    }

    const user = userdata.find(user => user.id === id && user.pw === pw);

    if (user) {
        const token = jwt.sign(
            { id: user.id, pw: user.pw },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.json({ ok: true, token, userId: user.id, userName: user.name });
    } else {
        res.status(401).json({ ok: false, message: '로그인 실패: 잘못된 ID 또는 비밀번호' });
    }
});

// 비밀번호 변경
app.patch('/user/:id/password', authenticateToken, (req, res) => {
    const { id } = req.params; // URL에서 사용자 ID 추출
    const { oldPassword, newPassword } = req.body; // 요청 본문에서 비밀번호 추출

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ ok: false, message: '현재 비밀번호와 새 비밀번호를 모두 입력하세요.' });
    }


    const user = userdata.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ ok: false, message: '사용자를 찾을 수 없습니다.' });
    }


    if (user.pw !== oldPassword) {
        return res.status(401).json({ ok: false, message: '현재 비밀번호가 일치하지 않습니다.' });
    }


    user.pw = newPassword;

    res.json({ ok: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
});


// JWT 검증 미들웨어
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ ok: false, message: '토큰이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('유효하지 않은 토큰:', err);
        res.status(403).json({ ok: false, message: '유효하지 않은 토큰입니다.' });
    }
}

// 사용자 정보 조회 (보호된 엔드포인트)
app.get('/profile', authenticateToken, (req, res) => {
    const user = userdata.find(u => u.id === req.user.id);
    if (user) {
        res.json({ ok: true, profile: user });
    } else {
        res.status(404).json({ ok: false, message: '사용자를 찾을 수 없습니다.' });
    }
});
