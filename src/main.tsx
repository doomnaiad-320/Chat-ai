import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// 导入测试工具，使其在浏览器控制台中可用
import './utils/testVercelAI'
import './utils/testSimilarity'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
