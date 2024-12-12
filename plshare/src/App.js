import React, { useState } from 'react';
import axios from 'axios';
import SignUp from './SignUp';
import PLView from './PLView';
import './GlobalCSS.css';

function App() {
    const [userID, setUserID] = useState('');
    const [userPW, setUserPW] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignUpPhase, setIsSignUpPhase] = useState(false);
    const [checkLoginMessage, setCheckLoginMessage] = useState('');

    const handleLogin = () => { 
        if (!userID || !userPW) {
            setCheckLoginMessage('입력 창이 비어 있습니다');
            return;
        }
        axios.get(`http://localhost:8080/login/${userID}/${userPW}`)
            .then(res => {
                if (res.data.ok) {
                    setIsLoggedIn(true);
                    setIsSignUpPhase(false);
                    setCheckLoginMessage('');
                } else {
                    setCheckLoginMessage('로그인에 실패하셨습니다');
                }
            })
            .catch(() => setCheckLoginMessage('서버 오류가 발생했습니다'));
    };

    const handleSignUp = () => setIsSignUpPhase(true);
    const handleLogout = () => setIsLoggedIn(false);
    const handleGoBack = () => setIsSignUpPhase(false);

    return (
        <div className="container">
            <h2>플레이리스트 공유 커뮤니티</h2>

            {!isLoggedIn && !isSignUpPhase && (
                <div>
                    <label>ID</label>
                    <input className="input-url" value={userID} onChange={e => setUserID(e.target.value)} />

                    <label>PW</label>
                    <input className="input-url" type="password" value={userPW} onChange={e => setUserPW(e.target.value)} />

                    <button className="add-button" onClick={handleLogin}>로그인</button>
                    <button className="cancel-button" onClick={handleSignUp}>가입</button>

                    {checkLoginMessage && <label>{checkLoginMessage}</label>}
                </div>
            )}

            {isLoggedIn && (
                <div>
                    <PLView currentUserID={userID} />
                    <div className="action-buttons">
                        <button className="cancel-button" onClick={handleLogout}>로그아웃</button>
                    </div>
                </div>
            )}

            {isSignUpPhase && !isLoggedIn && (
                <SignUp onSignUpComplete={() => setIsSignUpPhase(false)} onBack={handleGoBack} />
            )}
        </div>
    );
}

export default App;
