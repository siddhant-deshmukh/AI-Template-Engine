import { PolotnoProvider } from "@/context/PolotnoContext";
import PromptChatInput from "./PromptChatInput";
import PromptPopup from "./PromptPopup";
import TemplatesPreviewGrid from "./TemplatesPreviewGrid";

export default function AddPrompt() {
  return (
    <div className="w-full mt-20 ">
      <PolotnoProvider>
        <PromptChatInput />
        <TemplatesPreviewGrid />
        <PromptPopup />
      </PolotnoProvider>
    </div>
  )
}