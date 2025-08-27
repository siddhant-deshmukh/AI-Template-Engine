import Workspace from "polotno/canvas/workspace";
import Toolbar from "polotno/toolbar/toolbar";
import JsonDisplayPanel from "./sidepanel/json-right-side-panel";
import ZoomButtons from "polotno/toolbar/zoom-buttons";
import { PagesTimeline } from "polotno/pages-timeline";
import MediaPromptInput from "@/components/MediaPromptInput";

const EditorComponent = ({ store }) => {
  return (
    <div className="flex flex-col overflow-auto">
      <div className="min-h-screen flex items-center justify-center bg-gray-400">
        <MediaPromptInput />
      </div>
      <div className="relative" style={{ maxHeight: "calc(100vh - 50px)" }}>
        <div className='workspace wrap absolute'></div>
        <Toolbar store={store} />
        <div className='flex justify-between w-full h-full max-h-full' style={{ maxHeight: "calc(100vh - 100px)" }}>
          <Workspace store={store} />
          <JsonDisplayPanel store={store} />
        </div>
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </div>
    </div>
  );
};

export default EditorComponent;