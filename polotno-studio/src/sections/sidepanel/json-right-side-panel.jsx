import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx';
import TagEditor from '@/components/MetaDataForm';

const JsonDisplayPanel = observer(({ store }) => {
  const [selectedJson, setSelectedJson] = useState(null);
  const [canvasJson, setCanvasJson] = useState(null);

  const updateSelectedJson = useCallback(() => {
    if (store.selectedElements.length > 0) {
      // Get JSON representation of selected elements
      const selectedData = store.selectedElements.map(element => ({
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        ...element.toJSON() // Get full element properties
      }));
      setSelectedJson(selectedData);
    } else {
      setSelectedJson(null);
    }
  }, [store, store.selectedElements]);

  const setMetaData = useCallback((data) => {
    if (store.selectedElements.length > 0) {
      // Get JSON representation of selected elements
      store.selectedElements[0].set({
        custom: {
          metaData: data
        }
      });
    }
  }, [store, store.selectedElements])

  // Update canvas JSON when store changes
  useEffect(() => {
    const updateCanvasJson = () => {
      setCanvasJson(store.toJSON());
    };

    store.on('change', () => {
      updateCanvasJson();
      updateSelectedJson();
    });

    updateCanvasJson();
    // Listen to store changes (MobX will automatically track)
  }, [store]);

  // Update selected element JSON when selection changes
  useEffect(() => {
    updateSelectedJson();
  }, [store.selectedElements]);

  return (
    <div
      style={{ height: 'calc(100vh - 99px)' }}
      className='h-full max-h-full overflow-auto w-72 border-l bg-gray-50 text-black'>
      <Accordion collapsible defaultValue="meta-data" className="border-b">
        <AccordionItem value="meta-data" className=''>
          <AccordionTrigger className='p-2'>Meta Data</AccordionTrigger>
          <AccordionContent className='px-2 py-4'>
            {(store.selectedElements && store.selectedElements.length > 0)
              ? <TagEditor selectedElement={store.selectedElements[0]} setMetaData={setMetaData} />
              : 'No element selected'
            }
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion
        type="single"
        collapsible
        className="w-full max-h-full over"
      >
        <AccordionItem value="item-1" className=''>
          <AccordionTrigger className='p-2'>Canvas JSON</AccordionTrigger>
          <AccordionContent>
            <pre className='text-xs bg-white p-2.5 border max-h-[30vh] overflow-auto'>
              {JSON.stringify(canvasJson, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className=''>
          <AccordionTrigger className='p-2'>Selected Element(s)</AccordionTrigger>
          <AccordionContent>
            <pre className='text-xs bg-white p-2.5 border max-h-[30vh] overflow-auto'>
              {selectedJson
                ? JSON.stringify(selectedJson, null, 2)
                : 'No element selected'
              }
            </pre>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <div className='border-t'>

      </div>
    </div>
  );
});

export default JsonDisplayPanel;
