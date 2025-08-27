import { usePolotnoContext } from "@/context/PolotnoContext";
import { useAuth } from "@/hooks/useAuth"
import { get } from "@/lib/apiCall"
import type { Template } from "@/types/polotno";
import { useCallback, useEffect, useState } from "react"

export default function TemplatesPreviewGrid() {

  const { storeRef, polotnoMounted } = useAuth();

  const [templatesPreview, setTemplatesPreview] = useState<Template[]>([]);

  const { setSelectedPolotno } = usePolotnoContext()

  const getTemplatesData = useCallback(async () => {
    if (!storeRef.current)
      return;

    const res = await get<Template[]>('/template');
    if (!Array.isArray(res))
      return;

    const store = storeRef?.current;

    const theData = []

    for (const item of res) {
      store.loadJSON(item.canvasData);
      const img = await store.toDataURL();
      theData.push({
        ...item,
        imgUrl: img,
      });
    }

    setTemplatesPreview(theData);

    console.log(theData);
  }, [storeRef, polotnoMounted])

  useEffect(() => {
    if (polotnoMounted == 'mounted')
      getTemplatesData();
  }, [polotnoMounted])

  return (
    <div className="mx-auto max-w-7xl mt-10 flex flex-wrap gap-6 p-4">
      {templatesPreview.map((item, index) => (
        <button 
          key={index} 
          className="flex group hover:cursor-pointer bg-card hover:bg-primary/15 shadow border text-white flex-col overflow-hidden items-center justify-center rounded-lg transition-all duration-300"
          onClick={()=> {
            setSelectedPolotno(item)
          }}
          >
          <img
            src={item.imgUrl}
            alt={item.name}
            className="w-96 h-96 max-h-96 object-cover"
          />
          <p className="px-3 pt-3 w-96 text-left font-semibold">{item.name}</p>
          <p className="px-3 pb-3 pt-1 w-96 text-left text-xs">{item.description}</p>
        </button>
      ))}
    </div>
  )
}