import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // WebSocket 연결 생성
    const socket = new SockJS('http://localhost:8080/ws/device');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        console.log('🟢 Connected to WebSocket');

        // 메시지 구독
        stompClient.subscribe('/sub/severance-data', (message) => {
          if (message.body) {
            try {
              // 단순 JSON 객체 파싱 (한 번만 파싱하면 됨)
              const deviceData = JSON.parse(message.body);
              console.log('📥 Received device data:', deviceData);

              setMessages((prev) => [deviceData, ...prev]);
            } catch (error) {
              console.error('❌ JSON 파싱 오류:', error);
            }
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📡 실시간 디바이스 데이터</h2>
      <ul>
        {messages.map((msg, index) => (
          <li
            key={index}
            style={{
              marginBottom: '10px',
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
            }}
          >
            <div><strong>📟 디바이스 ID:</strong> {msg.deviceId}</div>
            <div><strong>🌡 온도:</strong> {msg.temperature} °C</div>
            <div><strong>⚙️ 압력:</strong> {msg.pressure} bar</div>
            <div><strong>⏱ 작동 시간:</strong> {msg.workingTime} 시간</div>
            <div><strong>🟢 상태:</strong> {msg.deviceStatus}</div>
            <div><strong>🕒 타임스탬프:</strong> {msg.timeStamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
