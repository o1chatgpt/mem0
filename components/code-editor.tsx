"use client"

import { useEffect, useState } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { markdown } from "@codemirror/lang-markdown"
import { basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: "html" | "css" | "javascript" | "markdown" | "text"
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)

  useEffect(() => {
    if (!element) return

    // Determine language extension
    const getLangExtension = () => {
      switch (language) {
        case "html":
          return html()
        case "css":
          return css()
        case "javascript":
          return javascript()
        case "markdown":
          return markdown()
        default:
          return []
      }
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        getLangExtension(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.editable.of(!readOnly),
      ],
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    setEditor(view)

    return () => {
      view.destroy()
    }
  }, [element, language, readOnly])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      })
    }
  }, [value, editor])

  return (
    <div className="border rounded-md overflow-hidden">
      <div ref={setElement} className="h-[500px] overflow-auto" />
    </div>
  )
}
