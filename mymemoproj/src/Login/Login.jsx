import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css';
import axios from 'axios';

function Login() {
  const [ID, setUserid] = useState('');
  const [PW, setUserpw] = useState('');
  const [Logintext, setLogintext] = useState('');
  const [loginCounts, setLoginCounts] = useState(0); // 로그인 실패 횟수
  const maxCounts = 3; // 최대 로그인 시도 횟수
  const navigate = useNavigate(); 

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  // 로그인 함수
  const login = async () => {
    if (!ID.trim() || !PW.trim()) {
      setLogintext('ID와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/login', { id: ID.trim(), pw: PW.trim() });

      if (res.data.ok) {
        // 로그인 성공
        localStorage.setItem('authToken', res.data.token); 
        localStorage.setItem('userId', res.data.userId); 
        setLogintext('로그인에 성공하셨습니다.');
        setTimeout(() => navigate('/Memopage'), 1000); // 1초 후 메모 페이지로 이동
      } else {
        // 로그인 실패
        setLoginCounts((prev) => prev + 1); // 실패 횟수 증가
        setLogintext('로그인 실패: 잘못된 ID 또는 비밀번호입니다.');
      }
    } catch (err) {
      console.error(err);
      setLoginCounts((prev) => prev + 1); // 실패 횟수 증가
      setLogintext('로그인 중 오류가 발생했습니다.');
    }
  };

  // 로그인 시도 제한
  useEffect(() => {
    if (loginCounts >= maxCounts) {
      setLogintext(`로그인 시도가 ${maxCounts}회를 초과했습니다. 나중에 다시 시도해주세요.`);
    }
  }, [loginCounts]);

  return (
    <div className="login-container">
      <h1 className="login-title">로그인</h1>

      <div className="login-input-group">
        <label className="login-label" htmlFor="login-id">ID</label>
        <input
          id="login-id"
          className="login-input"
          type="text"
          value={ID}
          onChange={handleInputChange(setUserid)}
          disabled={loginCounts >= maxCounts} // 시도 초과 시 입력 비활성화
        />
      </div>

      <div className="login-input-group">
        <label className="login-label" htmlFor="login-password">비밀번호</label>
        <input
          id="login-password"
          className="login-input"
          type="password"
          value={PW}
          onChange={handleInputChange(setUserpw)}
          disabled={loginCounts >= maxCounts} // 시도 초과 시 입력 비활성화
        />
      </div>

      <button
        className="login-button"
        type="button"
        disabled={loginCounts >= maxCounts} // 시도 초과 시 버튼 비활성화
        onClick={login}
      >
        로그인
      </button>

      <p className="login-text">{Logintext}</p>

      <button
        className="signin-button"
        type="button"
        onClick={() => navigate('/Signin')} 
      >
        회원가입
      </button>
    </div>
  );
}

export default Login;
