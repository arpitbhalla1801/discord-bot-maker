type CodeViewerProps = {
  code: string;
  language: string;
}

export default function CodeViewer({ code, language }: CodeViewerProps) {
  return (
    <div className="bg-[#2b2b2b] rounded-lg overflow-hidden">
      <pre className="p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  )
}
