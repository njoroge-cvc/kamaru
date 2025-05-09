import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  $isRangeSelection,
} from "lexical";

// Optional: Customize class names
const theme = {
  paragraph: "py-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
};

const editorConfig = {
  theme,
  onError(error) {
    throw error;
  },
  namespace: "EventEditor",
  nodes: [],
};

// Plugin to set the initial content on first render
function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      if (initialContent) {
        initialContent.split(/\r?\n/).forEach(line => {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(line));
          root.append(paragraph);
        });
      } else {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      }
    });
  }, [editor, initialContent]);

  return null;
}

// Toolbar with simple formatting buttons
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyFormat = (format) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button
        type="button"
        onClick={() => applyFormat("bold")}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => applyFormat("italic")}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => applyFormat("underline")}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        Underline
      </button>
    </div>
  );
}

export default function LexicalEditor({ initialContent = "", onChange }) {
  const handleChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent(); // Or use $generateHtmlFromNodes if rich content is needed
      onChange(text);
    });
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="bg-white border rounded p-3 shadow-sm">
        <ToolbarPlugin />
        <div className="min-h-[150px] max-h-[400px] overflow-auto resize-y">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="w-full outline-none px-2 py-1 text-sm" />
            }
            placeholder={
              <div className="text-gray-400 px-2 py-1">Enter details...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitialContentPlugin initialContent={initialContent} />
        </div>
      </div>
    </LexicalComposer>
  );
}
