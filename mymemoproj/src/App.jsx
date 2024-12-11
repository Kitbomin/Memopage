import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login/Login.jsx'; // 로그인 컴포넌트
import Signin from './Signin/Signin.jsx'; // 회원가입 컴포넌트

import Memopage from './Memopage/Memopage.jsx'; // 메모 페이지 컴포넌트

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로: 로그인 페이지 */}
        <Route path="/" element={<Login />} />
        
        {/* 회원가입 페이지 */}
        <Route path="/Signin" element={<Signin />} />

        
        
        {/* 메모 페이지 */}
        <Route path="/Memopage" element={<Memopage />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
