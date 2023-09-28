import ReactDOM from 'react-dom/client'
import Viewer from './react-components/Viewer.tsx'
import Sidebar from './react-components/Sidebar.tsx'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <>
    <Sidebar />
    <Viewer />
  </>
)
