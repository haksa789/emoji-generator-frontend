import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const kakaoKey = process.env.REACT_APP_KAKAO_API_KEY;
        console.log('Kakao API Key:', kakaoKey); // 확인용 로그

        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            console.log('Kakao initialized');
        } else if (window.Kakao && window.Kakao.isInitialized()) {
            console.log('Kakao SDK is already initialized');
        } else {
            console.error('Kakao SDK is not loaded');
        }
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert("텍스트를 입력해주세요...");
            return;
        }

        setLoading(true);
        setImageUrl(null);

        try {
            
            const backendUrl = process.env.REACT_APP_BACKEND_URL; // Backend URL from .env
            const response = await axios.post(`${backendUrl}/generate`, { prompt });

            if (response.data.image_url) {
                setImageUrl(response.data.image_url);
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("이미지를 생성하지 못했습니다. 다시 시도해 주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    const shareToKakao = () => {
        const frontendUrl = process.env.REACT_APP_FRONTEND_URL; // Frontend URL from .env
        if (window.Kakao) {
            if (!imageUrl) {
                alert('생성된 이미지가 없습니다. 먼저 이미지를 생성하세요.');
                return;
            }
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '만능 그림봇',
                    description: `"${prompt}"로 생성된 이미지입니다.`,
                    imageUrl: imageUrl,
                    link: {
                        mobileWebUrl: frontendUrl,
                        webUrl: frontendUrl
                    }
                }
            });
        } else {
            alert('Kakao SDK is not initialized');
        }
    };

    return (
        <div className="app-container">
            <h1 className="title">만능 그림봇</h1>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="아무 말이나 넣어보세요."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="input-box"
                />
                <button onClick={handleGenerate} className="generate-button" disabled={loading}>
                    {loading ? "생성 중..." : "생성!"}
                </button>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            )}

            {imageUrl && (
                <div className="image-container">
                    <h3>이미지가 생성되었습니다. 카카오톡으로 공유해서 친구들에게 전달하세요.</h3>
                    <img src={imageUrl} alt="Generated" className="generated-image" />
                    <div className="button-container">
                        {/* 카카오톡 공유 버튼 이미지 아래로 배치 */}
                        <button onClick={shareToKakao} className="kakao-button">
                            <div className="kakao-icon"></div>
                            카카오톡 공유하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
