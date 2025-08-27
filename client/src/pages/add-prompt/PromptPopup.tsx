import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { usePolotnoContext } from '@/context/PolotnoContext';
import { XIcon } from 'lucide-react';

export default function PromptPopup() {

  const { storeRef, setPolonoMounted } = useAuth();
  const { selectedPolotno, setSelectedPolotno } = usePolotnoContext();

  const store = storeRef.current;

  useEffect(() => {
    if (store) {
      setPolonoMounted('mounted');
    }
  }, [store])

  useEffect(() => {
    if (selectedPolotno) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    if (!store || !selectedPolotno)
      return;

    store.loadJSON(selectedPolotno.canvasData);

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedPolotno, store])

  if (!store)
    return <div></div>

  return (
    <div
      style={{
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        zIndex: '100',
        visibility: selectedPolotno ? 'visible' : 'hidden',
        position: 'fixed',
        backgroundColor: 'black',
      }}
      className='bp5-dark top-0 left-0 w-screen h-screen bg-white/30 bg-blur-md p-10 z-50'
    >
      <button
        className='absolute top-2 right-2 hover:cursor-pointer'
        onClick={() => { setSelectedPolotno(null) }}>
        < XIcon />
      </button>
      <div style={{ position: 'relative', width: '100%', height: '100%' }} className='bg-background border bp5-dark rounded-4xl relative w-full h-full'>
        <PolotnoContainer className="polotno-app-container flex max-h-full">
          <SidePanelWrap>
            <SidePanel store={store} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} downloadButtonEnabled />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </div>
  )
}