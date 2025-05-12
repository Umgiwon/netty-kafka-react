import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // SockJS 연결 생성
    const socket = new SockJS('http://localhost:8080/ws'); // Spring Boot WebSocket 주소
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('🟢 Connected to WebSocket');

        // 토픽 구독
        stompClient.subscribe('/topic/severance-comp-data', (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            console.log('📥 Received:', data);
            setMessages((prev) => [data, ...prev]); // 최신 데이터 먼저 표시
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📡 실시간 디바이스 데이터</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>📟 {msg.deviceId}</strong> | 🌡 Temp: {msg.temperature}°C | 🕒 {msg.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
