import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from 'next-themes'
// import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
// import { Toolbar } from 'polotno/toolbar/toolbar';
// import { PagesTimeline } from 'polotno/pages-timeline';
// import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
// import { SidePanel } from 'polotno/side-panel';
// import { Workspace } from 'polotno/canvas/workspace';
// import createStore from 'polotno/model/store'


// const store = createStore({
//   key: import.meta.env.VITE_POLOTNO_KEY,
//   showCredit: false,
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

// <div style={{ width: '100vw', height: '100vh' }}>
//       <PolotnoContainer>
//         <SidePanelWrap>
//           <SidePanel store={store} />
//         </SidePanelWrap>
//         <WorkspaceWrap>
//           <Toolbar store={store} downloadButtonEnabled />
//           <Workspace store={store} />
//           <ZoomButtons store={store} />
//           <PagesTimeline store={store} />
//         </WorkspaceWrap>
//       </PolotnoContainer>
//     </div>