import { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import './Memopage.css';
import axios from 'axios';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Memopage() {
    const [mainMemo, setMainMemo] = useState('');
    const [memoList, setMemoList] = useState([]);
    const [memoDate, setMemoDate] = useState(null);
    const [selectedMemos, setSelectedMemos] = useState([]);
    const [showChangePW, setShowChangePW] = useState(false); // 비밀번호 변경 모달 표시 여부
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // 서버에서 메모 목록 가져오기
    const fetchMemos = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axios.get('http://localhost:8081/Memopage', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.ok) setMemoList(res.data.memos);
        } catch (err) {
            console.error('Failed to fetch memos:', err);
        }
    };

    // 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            fetchMemos();
        }
    }, [navigate]);

    // 로그아웃
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userid');
        navigate('/');
    };

    // 메모 추가
    const handleAddMemo = async () => {
        const token = localStorage.getItem('authToken');
        if (!memoDate || !mainMemo) {
            console.error('날짜 또는 메모 내용이 비어 있습니다.');
            return;
        }

        try {
            const res = await axios.post(
                'http://localhost:8081/Memopage',
                { memo: mainMemo, date: memoDate.format('YYYY-MM-DD') },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.ok) setMemoList(res.data.memos);
        } catch (err) {
            console.error('Error adding memo:', err);
        }
    };

    // 선택된 메모 삭제
    const handleDeleteSelectedMemos = async () => {
        const token = localStorage.getItem('authToken');
        if (selectedMemos.length === 0) {
            console.error('선택된 메모가 없습니다.');
            return;
        }

        try {
            const res = await axios.delete('http://localhost:8081/Memopage', {
                headers: { Authorization: `Bearer ${token}` },
                data: { ids: selectedMemos },
            });
            if (res.data.ok) setMemoList(res.data.memos);
        } catch (err) {
            console.error('Error deleting selected memos:', err);
        }
    };

    // 체크박스 선택 변경
    const handleCheckboxChange = (id) => {
        setSelectedMemos((prev) =>
            prev.includes(id) ? prev.filter((memoId) => memoId !== id) : [...prev, id]
        );
    };

    // 비밀번호 변경
    const handlePasswordChange = async () => {
        const token = localStorage.getItem('authToken');
        const userid = localStorage.getItem('userId');

        try {
            const res = await axios.patch(
                `http://localhost:8080/user/${userid}/password`,
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.ok) {
                setMessage('비밀번호가 성공적으로 변경되었습니다.');
                setShowChangePW(false); // 비밀번호 변경 창 닫기
            } else {
                setMessage(`실패: ${res.data.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="Memo">
            <div className="MemoHeader">
                <h2 className="MemoTitle">회원님의 메모장에 오신 것을 환영합니다!</h2>
            </div>

            <div className="MemoInputSection">
                <input
                    type="text"
                    className="MemoInput"
                    value={mainMemo}
                    onChange={(e) => setMainMemo(e.target.value)}
                    placeholder="메모 내용을 입력하세요"
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="마감일 선택"
                        value={memoDate}
                        onChange={(newDate) => setMemoDate(newDate)}
                        renderInput={(params) => <TextField {...params} className="MemoDatePicker" />}
                    />
                </LocalizationProvider>

                <button className="MemoAddButton" type="button" onClick={handleAddMemo}>
                    메모 등록하기
                </button>
            </div>

            <div className="ShowMemo">
                <h2 className="MemoListTitle">메모 목록</h2>
                {memoList.length === 0 ? (
                    <p className="NoMemoMessage">등록된 메모가 없습니다.</p>
                ) : (
                    <table className="MemoTable">
                        <thead>
                            <tr>
                                <th>선택</th>
                                <th>내용</th>
                                <th>마감일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memoList.map((memo) => (
                                <tr key={memo.id} className="MemoRow">
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="MemoCheckbox"
                                            checked={selectedMemos.includes(memo.id)}
                                            onChange={() => handleCheckboxChange(memo.id)}
                                        />
                                    </td>
                                    <td>{memo.memo}</td>
                                    <td>{memo.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="MemoActions">
                <button
                    className="DeleteSelectedButton"
                    type="button"
                    onClick={handleDeleteSelectedMemos}
                >
                    선택한 메모 삭제
                </button>

                <button
                    className="ChangePasswordButton"
                    onClick={() => setShowChangePW(!showChangePW)}
                >
                    비밀번호 변경
                </button>
            </div>

            {showChangePW && (
                <div className="ChangePWModal">
                    <h3 className="ModalTitle">비밀번호 변경</h3>
                    <input
                        type="password"
                        className="OldPasswordInput"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="현재 비밀번호"
                    />
                    <input
                        type="password"
                        className="NewPasswordInput"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호"
                    />
                    <button className="ConfirmChangeButton" onClick={handlePasswordChange}>
                        변경
                    </button>
                    <button className="CancelChangeButton" onClick={() => setShowChangePW(false)}>
                        취소
                    </button>
                    <p className="ChangePasswordMessage">{message}</p>
                </div>
            )}

            <button className="LogoutButton" type="button" onClick={handleLogout}>
                로그아웃
            </button>
        </div>
    );
}

export default Memopage;
