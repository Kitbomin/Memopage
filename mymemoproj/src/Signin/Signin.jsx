import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';
import axios from 'axios';

function Signin() {
  const [ID, setUserid] = useState('');
  const [Idresult, setIdresult] = useState('');
  const [password, setPassword] = useState('');
  const [PWresult, setPWresult] = useState('');
  const [Pwcheck, setPwcheck] = useState('');
  const [Namevalue, setNamevalue] = useState('');
  const [Nemetext, setNametext] = useState('');
  const [Agevalue, setAgevalue] = useState('');
  const [Agetext, setAgetext] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handlePasswordCheck = () => {
    if (password === Pwcheck) {
      setPWresult('비밀번호가 일치합니다.');
    } else {
      setPWresult('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleSignup = () => {
    if (!ID.trim() || !password.trim() || !Namevalue.trim() || !Agevalue.trim()) {
      setPWresult('모든 필드를 입력하세요.');
      return;
    }

    const age = parseInt(Agevalue);
    if (isNaN(age) || age < 20 || age > 130) {
      setPWresult('나이는 20살 이상 130살 미만으로 입력해주세요.');
      return;
    }

    axios
      .post('http://localhost:8080/signup', {
        id: ID.trim(),
        pw: password.trim(),
        name: Namevalue.trim(),
        age,
      })
      .then((res) => {
        const data = res.data;
        if (data.ok) {
          setPWresult('회원가입이 완료되었습니다.');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setPWresult(`회원가입 실패: ${data.message}`);
        }
      })
      .catch((err) => {
        setPWresult('회원가입 중 오류가 발생했습니다.');
        console.error(err);
      });
  };

  return (
    <div className="signin-container">
      <h1 className="signin-title">회원가입</h1>

      <div className="signin-field signin-id">
        <label>ID</label>
        <input
          type="text"
          value={ID}
          onChange={handleInputChange(setUserid)}
        />
        <button
          onClick={() => {
            if (!ID.trim()) {
              setIdresult('ID를 입력해주세요.');
              return;
            }
            axios.get(`http://localhost:8080/idcheck/${ID.trim()}`).then((res) => {
              setIdresult(res.data.ok ? '사용할 수 있는 아이디입니다.' : '사용할 수 없는 아이디입니다.');
            });
          }}
        >
          중복체크
        </button>
        <p className="signin-id-result">{Idresult}</p>
      </div>

      <div className="signin-field signin-password">
        <label>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
        />
      </div>

      <div className="signin-field signin-password-check">
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={Pwcheck}
          onChange={handleInputChange(setPwcheck)}
        />
        <button onClick={handlePasswordCheck}>비밀번호 확인</button>
        <p className="signin-password-result">{PWresult}</p>
      </div>

      <div className="signin-field signin-name">
        <label>이름</label>
        <input
          type="text"
          value={Namevalue}
          onChange={(event) => {
            const value = event.target.value;
            setNamevalue(value);
            setNametext(value.length < 3 ? '3글자 이상으로 입력해주세요.' : '3글자 이상입니다.');
          }}
        />
        <p className="signin-name-result">{Nemetext}</p>
      </div>

      <div className="signin-field signin-age">
        <label>나이</label>
        <input
          type="text"
          value={Agevalue}
          onChange={(event) => {
            const value = event.target.value;
            setAgevalue(value);
            const age = parseInt(value);
            setAgetext(age >= 20 && age <= 130 ? '적정 나이' : '20살 이상 130살 미만으로 입력해주세요.');
          }}
        />
        <p className="signin-age-result">{Agetext}</p>
      </div>

      <button className="signin-submit" onClick={handleSignup}>회원가입</button>
      <p className="signin-result-message">{PWresult}</p>

      <button className="signin-login-button" onClick={() => navigate('/')}>로그인 창</button>
    </div>
  );
}

export default Signin;
